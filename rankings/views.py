from geopy import distance, Point
import json

from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response
from django.conf import settings

from rankings.models import PlacesAccess, GooglePlaces
from rankings.models import YelpAccess, Yelp
from rankings.models import FoursquareAccess, Foursquare
from rankings.models import UserRating

from rankings import ridemixapi
from ridemix.util import json_response

###############################################################################
#                               View Functions                                #
###############################################################################

# Retrieves a json list of places based on the user's location
@login_required
@json_response
def Rankings(request):
    location = request.GET.__getitem__('location')
    types = request.GET.__getitem__('types')

    lat, lng = [n.strip() for n in location.split(',')]
    lat = float(lat)
    lng = float(lng)

    places = ridemixapi.Places(settings.GOOGLE_API_KEY)
    yelp = ridemixapi.Yelp(settings.YELP_TOKEN, settings.YELP_TOKEN_SECRET, settings.YELP_CONSUMER_KEY, settings.YELP_CONSUMER_SECRET)
    foursquare = ridemixapi.Foursquare(settings.FOURSQUARE_ID, settings.FOURSQUARE_SECRET)

    # Note, this is not very accurate, or correct, but we're testing in close area's...
    order_by_str = 'abs('+str(lat)+'-lat)+abs('+str(lng)+'-lng)'
    places_closest = PlacesAccess.objects.all().extra(select={'diff': order_by_str}).order_by('diff')[:1]
    yelp_closest = YelpAccess.objects.all().extra(select={'diff': order_by_str}).order_by('diff')[:1]
    foursquare_closest = FoursquareAccess.objects.all().extra(select={'diff': order_by_str}).order_by('diff')[:1]

    # Search if we haven't run search within 100m or point is expired
    if len(places_closest) == 0 or distance.distance(Point(location), Point(places_closest[0].lat, places_closest[0].lng)).kilometers > 0.1 or not places_closest[0].is_valid():
        if len(places_closest) != 0 and not places_closest[0].is_valid():
            places_closest[0].delete()

        search_results = places.search(location)
        #TODO check error code!!
        while True:
            for place in search_results['results']:
                insert_place_if(places,place)
            if places.pagetoken == None:
                break
            else:
                search_results = places.nextPage()
                #TODO check error code!!

        new_search_loc = PlacesAccess(lat=lat, lng=lng)
        new_search_loc.save()
    print "Done with Google Places search"

    if len(yelp_closest) == 0 or distance.distance(Point(location), Point(yelp_closest[0].lat, yelp_closest[0].lng)).kilometers > 0.1 or not yelp_closest[0].is_valid():
        if len(yelp_closest) != 0 and not yelp_closest[0].is_valid():
            yelp_closest[0].delete()

        search_results = yelp.search(location)
        for business in search_results['businesses']:
            insert_business_if(yelp, business)

        search_results = yelp.search(location, offset=20)
        for business in search_results['businesses']:
            insert_business_if(yelp, business)

        new_search_loc = YelpAccess(lat=lat, lng=lng)
        new_search_loc.save()
    print "Done with Yelp search"

    if len(foursquare_closest) == 0 or distance.distance(Point(location), Point(foursquare_closest[0].lat, foursquare_closest[0].lng)).kilometers > 0.1 or not foursquare_closest[0].is_valid():
        if len(foursquare_closest) != 0 and not foursquare_closest[0].is_valid():
            foursquare_closest[0].delete()

        search_results = foursquare.search(location, limit=50)
        for venue in search_results['venues']:
            insert_venue_if(foursquare, venue)

        new_search_loc = FoursquareAccess(lat=lat, lng=lng)
        new_search_loc.save()
    print "Done with Foursquare search"

    results = GooglePlaces.objects.all().extra(select={'diff': order_by_str}).order_by('diff')[:25]

    json_data = []
    for obj in results:
        dic = combine_all_information(obj)
        json_data.append(dic)

    return json_data

# Function to send a place rating as users click to up or downvote a venue
@login_required
@json_response
def RatePlace(request):
    fail = False

    place_id = request.GET.get('place_id')
    user_rating = request.GET.get('user_rating')

    # Check that all values were provided
    if not place_id or not user_rating:
        return fail 

    # Check that all ratings are in the target rating range
    user_rating = int(user_rating)
    if user_rating < -5 or user_rating > 5:
        return fail 

    # Make sure that a place with the given place_id exists
    try:
      google_place = GooglePlaces.objects.get(gp_id=place_id)
    except ObjectDoesNotExist:
      return fail 
    
    # Add the rating for this place 
    google_place.user_rating += user_rating;
    google_place.save()

    new_rating = UserRating()
    new_rating.place = google_place
    new_rating.user = request.user
    new_rating.rating = user_rating
    new_rating.save()

    return True 

@login_required
@json_response
def GetTrending(request):
    location = request.GET.get('location')

    places = GooglePlaces.objects.all().order_by('-user_rating')[:25]

    result = []
    for place in places:
        result.append(place.get_dic())

    return result

@login_required
@json_response
def GetDetails(request):
    g_id = request.GET.get('gp_id')

    place = GooglePlaces.objects.all().filter(gp_id=g_id)

    if len(place) != 1:
        return {}
    else:
        place = place[0]

    if not place.phone:
        places = ridemixapi.Places(settings.GOOGLE_API_KEY)
        place_details = places.details(place.reference)
        if place_details['status'] == 'OK':
            place.address = place_details['result']['formatted_address']
            if 'formatted_phone_number' in place_details['result'].keys():
                place.phone = place_details['result']['formatted_phone_number']
            if 'opening_hours' in place_details['result'].keys():
                hours = places.parseHours(place_details['result']['opening_hours']['periods'])
                place.open_hours = ','.join(hours['open'])
                place.close_hours = ','.join(hours['close'])
            if 'website' in place_details['result'].keys():
                place.website = place_details['result']['website']
            place.save()
        else:
            print 'reference: ', place.reference
            print 'status: ', place_details['status']

    return place.get_details()

###############################################################################
#                             Helper Functions                                #
###############################################################################

# Uses the connected foursquare or yelp objects to add info to the place
# information
def combine_all_information(obj):
    dic = obj.get_dic()

    # Retrieves yelp info
    if obj.yelp:
        dic.update(obj.yelp.get_dic())
    else:
        yelp_obj = Yelp.objects.filter(name=obj.name)
        if len(yelp_obj) != 0:
            obj.yelp = yelp_obj[0]
            obj.save()
            dic.update(yelp_obj[0].get_dic())
            
    # Retrieves foursquare info
    if obj.foursquare:
        dic.update(obj.foursquare.get_dic())
    else:
        foursquare_obj = Foursquare.objects.filter(name=obj.name)
        if len(foursquare_obj) != 0:
            obj.foursquare = foursquare_obj[0]
            obj.save()
            dic.update(foursquare_obj[0].get_dic())

    return dic

def insert_place_if(places, place):
    """
    Inserts a place into the DB if it does not exist or if it is old data

    places: a ridemixapi.places object
    place: place object from serch result
    """
    obj, created = GooglePlaces.objects.get_or_create(gp_id=place['id'])
    if created or (not created and not obj.is_valid()):
        #update or insert new values
        obj.lat = place['geometry']['location']['lat']
        obj.lng = place['geometry']['location']['lng']
        obj.name = place['name']
        obj.icon = place['icon']
        obj.reference = place['reference'] or ""
        if 'rating' in place.keys():
            obj.rating = place['rating']


        obj.save()
    
def insert_business_if(yelp, business):
    """
    Inserts a business into the DB if it does not exist or if it is old data

    yelp: a ridemixapi.yelp object
    business: business object from search result
    """
    #re.sub(r'\D', '', phone)
    obj, created = Yelp.objects.get_or_create(y_id=business['id'])
    if created or (not created and not obj.is_valid()):
        #update or insert new values
        obj.lat = business['location']['coordinate']['latitude']
        obj.lng = business['location']['coordinate']['longitude']
        obj.name = business['name']
        obj.review_count = business['review_count']
        obj.rating = business['rating']
        if 'phone' in business.keys():
            obj.phone = business['phone']

        obj.save()
    
def insert_venue_if(foursquare, venue):
    """
    Inserts a venue into the DB if it does not exist or if it is old data

    foursquare: a ridemixapi.foursquare object
    venue: venue object from a search result
    """
    obj, created = Foursquare.objects.get_or_create(f_id=venue['id'])
    if created or (not created and not obj.is_valid()):
        #update or insert new values
        obj.lat = venue['location']['lat']
        obj.lng = venue['location']['lng']
        obj.name = venue['name']
        obj.likes = venue['likes']['count']
        obj.tip_count = venue['stats']['tipCount']
        obj.checkin_count = venue['stats']['checkinsCount']
        obj.users_count = venue['stats']['usersCount']
        if 'phone' in venue.keys():
            obj.phone = venue['contact']['phone']

        obj.save()

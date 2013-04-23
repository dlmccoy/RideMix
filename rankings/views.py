from geopy import distance, Point
import json

from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response
from django.conf import settings

from rankings.models import PlacesAccess, GooglePlaces
from rankings.models import YelpAccess, Yelp
from rankings.models import FoursquareAccess, Foursquare

from rankings import ridemixapi

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

    if len(foursquare_closest) == 0 or distance.distance(Point(location), Point(foursquare_closest[0].lat, foursquare_closest[0].lng)).kilometers > 0.1 or not foursquare_closest[0].is_valid():
        if len(foursquare_closest) != 0 and not foursquare_closest[0].is_valid():
            foursquare_closest[0].delete()

        search_results = foursquare.search(location, limit=50)
        for venue in search_results['venues']:
            insert_venue_if(foursquare, venue)

        new_search_loc = FoursquareAccess(lat=lat, lng=lng)
        new_search_loc.save()

    results = GooglePlaces.objects.all().extra(select={'diff': order_by_str}).order_by('diff')[:25]

    json_data = []
    for obj in results:
        dic = obj.get_dic()

        yelp_obj = Yelp.objects.filter(name=obj.name)
        if len(yelp_obj) != 0:
            dic.update(yelp_obj[0].get_dic())

        foursquare_obj = Foursquare.objects.filter(name=obj.name)
        if len(foursquare_obj) != 0:
            dic.update(foursquare_obj[0].get_dic())

        json_data.append(dic)
    return HttpResponse(json.dumps(json_data), mimetype="application/json")

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
        obj.reference = place['reference']
        if 'rating' in place.keys():
            obj.rating = place['rating']

        place_details = places.details(obj.reference)
        if place_details['status'] == 'OK':
            obj.address = place_details['result']['formatted_address']
            if 'formatted_phone_number' in place_details['result'].keys():
                obj.phone = place_details['result']['formatted_phone_number']
            if 'opening_hours' in place_details['result'].keys():
                hours = places.parseHours(place_details['result']['opening_hours']['periods'])
                obj.open_hours = ','.join(hours['open'])
                obj.close_hours = ','.join(hours['close'])
            if 'website' in place_details['result'].keys():
                obj.website = place_details['result']['website']
        else:
            print 'reference: ', obj.reference
            print 'status: ', place_details['status']

        obj.save()
    
def insert_business_if(yelp, business):
    """
    Inserts a business into the DB if it does not exist or if it is old data

    yelp: a ridemixapi.yelp object
    business: business object from search result
    """
    obj, created = Yelp.objects.get_or_create(y_id=business['id'])
    if created or (not created and not obj.is_valid()):
        #update or insert new values
        obj.lat = business['location']['coordinate']['latitude']
        obj.lng = business['location']['coordinate']['longitude']
        obj.name = business['name']
        obj.review_count = business['review_count']
        obj.rating = business['rating']

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

        obj.save()

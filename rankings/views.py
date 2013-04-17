from geopy import distance, Point
import json

from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response
from django.conf import settings

from rankings.models import PlacesAccess, GooglePlaces

from rankings import ridemixapi

def Rankings(request):
    location = request.GET.__getitem__('location')
    types = request.GET.__getitem__('types')

    lat, lng = [n.strip() for n in location.split(',')]
    lat = float(lat)
    lng = float(lng)

    places = ridemixapi.places(settings.GOOGLE_API_KEY)

    # Note, this is not very accurate, or correct, but we're testing in close area's...
    order_by_str = 'abs('+str(lat)+'-lat)+abs('+str(lng)+'-lng)'
    closest = PlacesAccess.objects.all().extra(select={'diff': order_by_str}).order_by('diff')[:1]

    # Search if we haven't run search within 100m or point is expired
    if len(closest) == 0 or distance.distance(Point(location), Point(closest[0].lat, closest[0].lng)).kilometers > 0.1 or not closest[0].is_valid():
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
    if len(closest) > 0 and not closest[0].is_valid():
        closest[0].delete()

    results = GooglePlaces.objects.filter(lat__lte=lat+0.02,lat__gte=lat-0.02, lng__lte=lng+0.02, lng__gte=lng-0.02) #[:20]

    json_data = []
    for obj in results:
        json_data.append(obj.get_dic())
    return HttpResponse(json.dumps(json_data), mimetype="application/json")

def insert_place_if(places, place):
    """
    Inserts a place into the DB if it does not exist or if it is old data

    places: a ridemixapi.places object
    place: place object from serch result
    """
    #print place
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
    

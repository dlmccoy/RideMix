# Create your views here.

import foursquare
import json

from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import render, render_to_response
from django.contrib.auth import logout
from django.conf import settings

def FoursquareHome(request):
    print("home")
    return render(request, 'foursquare_query.html')

def FoursquareQuery(request):
    client = foursquare.Foursquare(client_id=settings.FOURSQUARE_ID, client_secret=settings.FOURSQUARE_SECRET)

    query = request.GET.get('query')
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')
    
    ll = latitude + ',' + longitude
        
    object = client.venues.search(params={
                         'query': query,
                         'll': ll,
                         'limit': '20',
                         })

    return HttpResponse(json.dumps(object))
    

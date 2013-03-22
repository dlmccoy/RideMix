# Create your views here.

import json
import random
import string
import simplejson, urllib

from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response
from django.conf import settings

def NewHome(request):
  return render(request, 'new_home.html')

def Privacy(request):
  return render_to_response('privacy.html')

def LogOut(request):
  logout(request)
  return redirect('/')

def Jo(request):
  return render(request, 'jo.html')

def GetFriends(request):
  args = []
  for i in range(500):
    args.append(''.join(random.choice(string.lowercase) for j in range(10))) 
  return HttpResponse(json.dumps(args), mimetype="application/json")

def GetPlaces(request):
  PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
  pl_args = {'sensor':'true','key':settings.GOOGLE_API_KEY,'rankby':'distance'}

  pl_args.update({'location':request.GET.__getitem__('location')})
  pl_args.update({'types':request.GET.__getitem__('types')})

  url = PLACES_BASE_URL + '?' + urllib.urlencode(pl_args)

  result = simplejson.load(urllib.urlopen(url))
  return HttpResponse(json.dumps(result), mimetype="application/json")

def Splash(request):
  if request.user.is_authenticated():
    return render(request, 'splash.html')
  return render(request, 'home.html')

# Create your views here.

import json
import random
import string
import simplejson, urllib

from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from django.http import HttpResponse 
from django.shortcuts import redirect, render, render_to_response
from django.conf import settings

from home.models import Log
from ridemix.util import json_response

@login_required
def NewHome(request):
  new_log = Log();
  new_log.user = request.user;
  new_log.log = "Returned main page"
  new_log.save()
  return render(request, 'new_home.html')

def Privacy(request):
  return render_to_response('privacy.html')

def LogOut(request):
  logout(request)
  return redirect('/')

def Jo(request):
  return render(request, 'jo.html')

@login_required
@json_response
def GetFriends(request):
  args = []
  for i in range(500):
    args.append(''.join(random.choice(string.lowercase) for j in range(10))) 
  return args

@login_required
@json_response
def GetPlaces(request):
  PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
  pl_args = {'sensor':'true','key':settings.GOOGLE_API_KEY,'rankby':'distance'}

  pl_args.update({'location':request.GET.__getitem__('location')})
  pl_args.update({'types':request.GET.__getitem__('types')})

  url = PLACES_BASE_URL + '?' + urllib.urlencode(pl_args)

  result = simplejson.load(urllib.urlopen(url))
  return result

def Splash(request):
  if request.user.is_authenticated():
    return render(request, 'splash.html')
  return render(request, 'home.html')

@login_required
def AddLog(request):
  info = request.GET.get('log')
 
  log = Log()
  log.user = request.user
  log.log = info 
  log.save()
  return HttpResponse('')

@login_required
def Dashboard(request):
  user_count = User.objects.all().count()
  friend_page_count = Log.objects.filter(log="Accessed friends page").count()
  news_tab_count = Log.objects.filter(log="Accessed news tab").count()
  map_tab_count = Log.objects.filter(log="Accessed map tab").count()
  places_tab_count = Log.objects.filter(log="Accessed places tab").count()
  my_ride_count = Log.objects.filter(log="Clicked My Ride button").count()
  trending_now_count = Log.objects.filter(log="Clicked Trending Now button").count()
  if request.user.is_staff:
    args = {
      'total_users': user_count,
      'friend_page_count': friend_page_count,
      'news_tab_count': news_tab_count,
      'map_tab_count': map_tab_count,
      'places_tab_count': places_tab_count,
      'my_ride_count': my_ride_count,
      'trending_now_count': trending_now_count,
    }
    return render(request, 'dashboard.html', args)
  else:
    return redirect('/') 

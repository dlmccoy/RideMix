import facebook
import json
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response
from django.http import HttpResponse
from django.contrib.auth import logout
from django.conf import settings
from social_auth.models import UserSocialAuth

@login_required(redirect_field_name="login/facebook")
def FacebookFriends(request):
    myUser = request.user 
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser) 
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    print(token)
    if(token):
      graph = facebook.GraphAPI(token)
      user_profile = graph.get_object("me")
      name = user_profile["name"]
      friends = graph.get_connections("me", "friends")["data"]
      return HttpResponse(json.dumps(friends), mimetype="application/json")
    else:
      args=["Mike", "Dillon", "Alejandro", "Victoria"]
      return HttpResponse(json.dumps(args), mimetype="application/json")

def FacebookFriendsCheckins(request, friend_id):
  user = facebook.get_user_from_cookie(request.COOKIES, settings.FACEBOOK_APP_ID, settings.FACEBOOK_API_SECRET)
  if(user):
    graph = facebook.GraphApi(user["access_token"])
    friend = graph.get_object(friend_id)
    user_profile = graph.get_object("me")
    checkins = graph.get_connections(friend_id, "checkins")
    context = {'checkins': checkins, 'user':friend['name']}
    return render(request, 'fb_checkins.html', context)

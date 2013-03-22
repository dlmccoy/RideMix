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

@login_required(redirect_field_name="login/facebook")
def FacebookFriendsCheckins(request):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    if(token):
        graph = facebook.GraphAPI(token)
        friends = graph.get_connections("me", "friends")["data"]
        user_profile = graph.get_object("me")
	checkinList = []
	for i in range(0, 5):
	    checkins = graph.get_connections("friends", "checkins")["data"]
            for checkIn in checkins:
                checkinList.append(checkIn)
	return HttpResponse(json.dumps(checkinList), mimetype="application/json")

def FacebookUsersGroups(request):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    if(token):
        graph = facebook.GraphAPI(token)
	user_groups = graph.get_connections("me", "groups")["data"]
        return HttpResponse(json.dumps(user_groups), mimetype="application/json")

def FacebookUserLikes(request): 
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    if(token):
        graph = facebook.GraphAPI(token)
        user_likes = graph.get_connections("me", "likes")["data"]
        return HttpResponse(json.dumps(user_likes), mimetype="application/json")

def ParseLocations(possibleLocations, locations):
    result = []
    for location in locations:
	if(location["name"] in possibleLocations["name"]):
	    result.append(location)
    return result




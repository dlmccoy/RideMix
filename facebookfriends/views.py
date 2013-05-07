import facebook
import json
import random
from itertools import groupby
import time
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response
from django.http import HttpResponse
from django.contrib.auth import logout
from django.conf import settings
from social_auth.models import UserSocialAuth
from collections import Counter

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
        PLACE_TYPE = "RESTAURANT/CAFE"
	queries = {"q1":"select author_uid, coords, target_id, message, timestamp from checkin WHERE author_uid in(SELECT uid2 FROM friend WHERE uid1 = me() limit 200) ORDER BY timestamp",
"q2":"select page_id, type, description, talking_about_count, were_here_count from page where type='RESTAURANT/CAFE' and page_id in (select target_id from #q1)",
"q3":"select uid, first_name, last_name from user where uid in (select author_uid from #q1)"}
        data = graph.fql(queries)
	return HttpResponse(json.dumps(data), mimetype="application/json")


@login_required(redirect_field_name="login/facebook")
def FacebookStatusByLikes(request):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    if(token):
        graph = facebook.GraphAPI(token)
        query = "select object_id from like where object_id in (select status_id from status WHERE uid in(SELECT uid2 FROM friend WHERE uid1 = me() limit 200))"
        data = graph.fql(query)
        countLikes = Counter()
	for obj in data:
	   countLikes.update({obj["object_id"]: 1})
        return HttpResponse(json.dumps(countLikes.most_common(50)), mimetype="application/json")

@login_required(redirect_field_name="login/facebook")
def FacebookFriendStatus(request):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    if(token):
        graph = facebook.GraphAPI(token)
        query = "select description, actor_id from stream where source_id in (SELECT uid2 FROM friend WHERE uid1 = me() limit 200);"
        data = graph.fql(query)
        return HttpResponse(json.dumps(data), mimetype="application/json")



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

def FacebookLikesByUser(request, userID=''):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    if (userID == string.empty):
         userID = request.GET.get('userID', '')
    if (token) and (len(userID) > 0):
         graph = facebook.GraphAPI(token)
         query = "select music, books, tv, games from user where uid = " + userID
         data = graph.fql(query)
         return HttpResponse(json.dumps(data), mimetype="application/json")

def NewsTopics(request):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    users = request.GET.get('users', '')
    likes = list()
    if (token):
         graph = facebook.GraphAPI(token)
         query = "select music, books, tv, games from user where uid in (" + users + ")"
         data = graph.fql(query)
         for user in data:
             music = user['music'].split(", ")
             likes = likes + music
             books = user['books'].split(", ")
             likes = likes + books
             tv = user['tv'].split(", ")
             likes = likes + tv
             games = user['games'].split(", ")
             likes = likes + games
         likes.sort()
	 grouped = [(topic, sum(1 for i in g)) for topic, g in groupby(likes)]
#	 sorted_results = grouped.sort(key=lambda tup:tup[1]) 
         return HttpResponse(json.dumps(grouped), mimetype="application/json")

def Share(request):
    myUser = request.user
    instance = UserSocialAuth.objects.filter(provider='facebook').filter(user=myUser)
    tokens = [x.tokens for x in instance]
    token = tokens[0]["access_token"]
    graph = facebook.GraphAPI(token)
    graph.put_object("me", "feed", message="Testing wall posts.")
    return redirect("home.views.NewHome")

def SharePopup(request):
    url = "https://www.facebook.com/dialog/feed?app_id="
    url += settings.FACEBOOK_APP_ID
    url += "&link=https://ridemix.com"
    url += "&picture=http://static.ridemix.com/prod/media/logo.jpg"
    url += "&name=Ridemix"
    url += "&caption=Discover new places around you"
    url += "&description=Introducing a new, fun way for you and your friends to find new places you like, right from any mobile device!"
    url += "&redirect_uri=http://ridemix.com/new_home/"
    return redirect(url) 

def ParseLocations(possibleLocations, locations):
    result = []
    for location in locations:
	if(location["name"] in possibleLocations["name"]):
	    result.append(location)
    return result




import facebook
import json
import random
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
    if (len(userID) == 0):
         userID = request.GET.get('userID', '')
    if (token) and (len(userID) > 0):
         graph = facebook.GraphAPI(token)
         query = "select music, books, tv, games from user where uid = " + userID
         data = graph.fql(query)
         return HttpResponse(json.dumps(data), mimetype="application/json")

def NewsTopics(request):
    users = request.GET.get('users', '').split(",")
    likes = list()
    if (token) and (len(userID) > 0):
        for u in users:
            user_likes = FacebookLikesByUser(request, u)
            music = user_likes['music'].split(", ")
            books = user_likes['books'].split(", ")
            tv = user_likes['tv'].split(", ")
            games = user_likes['games'].split(", ")
            likes = likes + music + books + tv + games
        likes.sort()
        return HttpResponse(likes, mimetype="application/json")

def ParseLocations(possibleLocations, locations):
    result = []
    for location in locations:
	if(location["name"] in possibleLocations["name"]):
	    result.append(location)
    return result




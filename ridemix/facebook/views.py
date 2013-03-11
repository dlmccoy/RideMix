import facebook
from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response

def FacebookFriends(request):
    user = facebook.get_user_from_cookie(request.COOKIES, key, secret)
    if(user):
        graph = facebook.GraphApi(user["access_token"])
        user_profile = graph.get_object("me")
        name = user_profile["name"]
        friends = graph.get_connections("me", "friends")
        context = {'friends_list':friends, 'user':name}
        return render(request, 'fb_friends.html', context)


def FacebookFriendsCheckins(request, friend_id):
    user = facebook.get_user_from_cookie(request.COOKIES, key, secret)
    if(user):
        graph = facebook.GraphApi(user["access_token"])
        friend = graph.get_object(friend_id)
        user_profile = graph.get_object("me")
        checkins = graph.get_connections(friend_id, "checkins")
        context = {'checkins': checkins, 'user':friend['name']}
        return render(request, 'fb_checkins.html', context)

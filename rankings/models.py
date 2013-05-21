import datetime

from django.conf import settings
from django.contrib import auth
from django.db import models
from django.utils import timezone

class PlacesAccess(models.Model):
    lat = models.FloatField()
    lng = models.FloatField()
    access_date = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return self.access_date >= timezone.now() - datetime.timedelta(days=settings.GOOGLE_INVALIDATION_PERIOD)

class GooglePlaces(models.Model):
    gp_id = models.CharField(max_length=200, unique=True) #id from Google Places
    lat = models.FloatField(null=True)
    lng = models.FloatField(null=True)
    pull_date = models.DateTimeField(auto_now=True,auto_now_add=True)
    name = models.CharField(max_length=200, null=True)
    icon = models.CharField(max_length=200, null=True)
    reference = models.CharField(max_length=250, null=True)
    rating = models.FloatField(null=True)
    address = models.CharField(max_length=200, null=True)
    phone = models.CharField(max_length=200, null=True)
    open_hours = models.CommaSeparatedIntegerField(max_length=200, null=True)
    close_hours = models.CommaSeparatedIntegerField(max_length=200, null=True)
    website = models.CharField(max_length=200, null=True)
    foursquare = models.ForeignKey('Foursquare', null=True)
    yelp = models.ForeignKey('Yelp', null=True)
    user_rating = models.FloatField(default=0)

    def is_valid(self):
        return self.pull_date >= timezone.now() - datetime.timedelta(days=settings.GOOGLE_INVALIDATION_PERIOD)

    def get_dic(self):
        toReturn = {}
        toReturn['id'] = self.gp_id
        toReturn['lat'] = self.lat
        toReturn['lng'] = self.lng
        toReturn['name'] = self.name
        toReturn['icon'] = self.icon
        toReturn['user_rating'] = self.user_rating
        toReturn['reference'] = self.reference
        if (self.rating):
            toReturn['gp_rating'] = self.rating
        if (self.address):
            toReturn['address'] = self.address
        if (self.phone):
            toReturn['phone'] = self.phone
        if (self.open_hours):
            toReturn['open_hours'] = self.open_hours
        if (self.close_hours):
            toReturn['close_hours'] = self.close_hours
        if (self.website):
            toReturn['website'] = self.website
        return toReturn

    def get_details(self):
        toReturn = {}
        toReturn['id'] = self.gp_id
        if (self.address):
            toReturn['address'] = self.address
        if (self.phone):
            toReturn['phone'] = self.phone
        if (self.open_hours):
            toReturn['open_hours'] = self.open_hours
        if (self.close_hours):
            toReturn['close_hours'] = self.close_hours
        if (self.website):
            toReturn['website'] = self.website
        return toReturn

class YelpAccess(models.Model):
    lat = models.FloatField() #where accessed from
    lng = models.FloatField()
    access_date = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return self.access_date >= timezone.now() - datetime.timedelta(days=settings.YELP_INVALIDATION_PERIOD)

class Yelp(models.Model):
    y_id = models.CharField(max_length=200, unique=True) #id from Yelp
    lat = models.FloatField(null=True)
    lng = models.FloatField(null=True)
    pull_date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200, null=True)
    phone = models.CharField(max_length=200, null=True)
    review_count = models.IntegerField(null=True)
    rating = models.FloatField(null=True)

    def is_valid(self):
        return self.pull_date >= timezone.now() - datetime.timedelta(days=settings.YELP_INVALIDATION_PERIOD)

    def get_dic(self):
        toReturn = {}
        toReturn['yelp_id'] = self.y_id
        #toReturn['lat'] = self.lat
        #toReturn['lng'] = self.lng
        #toReturn['name'] = self.name
        toReturn['yelp_review_count'] = self.review_count
        toReturn['yelp_rating'] = self.rating
        return toReturn

class FoursquareAccess(models.Model):
    lat = models.FloatField() #where accessed from
    lng = models.FloatField()
    access_date = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return self.access_date >= timezone.now() - datetime.timedelta(days=settings.FOURSQUARE_INVALIDATION_PERIOD)

class Foursquare(models.Model):
    f_id = models.CharField(max_length=200,unique=True) #id from Foursquare
    lat = models.FloatField(null=True)
    lng = models.FloatField(null=True)
    pull_date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200,null=True)
    phone = models.CharField(max_length=200, null=True)
    likes = models.IntegerField(null=True) # ['likes']['count']
    tip_count = models.IntegerField(null=True) # ['stats']['tipCount']
    checkin_count = models.IntegerField(null=True) # ['stats']['checkinsCount']
    users_count = models.IntegerField(null=True) # ['stats']['usersCount']

    def is_valid(self):
        return self.pull_date >= timezone.now() - datetime.timedelta(days=settings.FOURSQUARE_INVALIDATION_PERIOD)

    def get_dic(self):
        toReturn = {}
        toReturn['foursquare_id'] = self.f_id
        #toReturn['lat'] = self.lat
        #toReturn['lng'] = self.lng
        #toReturn['name'] = self.name
        toReturn['foursquare_likes'] = self.likes
        toReturn['foursquare_tip_count'] = self.tip_count
        toReturn['foursquare_checkin_count'] = self.checkin_count
        toReturn['foursquare_users_count'] = self.users_count
        return toReturn

class UserRating(models.Model):
    user = models.ForeignKey('auth.User') 
    place = models.ForeignKey('GooglePlaces')
    rating = models.IntegerField() 
    added = models.DateTimeField(auto_now_add=True)

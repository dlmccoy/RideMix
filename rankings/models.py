import datetime

from django.utils import timezone
from django.conf import settings
from django.db import models

# Create your models here.

class PlacesAccess(models.Model):
    lat = models.FloatField()
    lng = models.FloatField()
    access_date = models.DateTimeField(default=timezone.now)

    def is_valid(self):
        return self.access_date >= timezone.now() - datetime.timedelta(days=settings.GOOGLE_INVALIDATION_PERIOD)

class GooglePlaces(models.Model):
    gp_id = models.CharField(max_length=200, unique=True) #id from Google Places
    lat = models.FloatField(null=True)
    lng = models.FloatField(null=True)
    pull_date = models.DateTimeField(default=timezone.now)
    name = models.CharField(max_length=200,null=True)
    icon = models.CharField(max_length=200,null=True)
    reference = models.CharField(max_length=250,null=True)
    rating = models.FloatField(null=True)
    address = models.CharField(max_length=200,null=True)
    phone = models.CharField(max_length=200,null=True)
    open_hours = models.CommaSeparatedIntegerField(max_length=200,null=True)
    close_hours = models.CommaSeparatedIntegerField(max_length=200,null=True)
    website = models.CharField(max_length=200,null=True)

    def is_valid(self):
        return self.pull_date >= timezone.now() - datetime.timedelta(days=settings.GOOGLE_INVALIDATION_PERIOD)

    def get_dic(self):
        toReturn = {}
        toReturn['lat'] = self.lat
        toReturn['lng'] = self.lng
        toReturn['name'] = self.name
        toReturn['icon'] = self.icon
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

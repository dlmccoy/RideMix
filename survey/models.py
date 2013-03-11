from django.db import models

class SurveyResponse(models.Model):
  yelp_use = models.IntegerField()
  yelp_trust = models.IntegerField()
  facebook_use = models.IntegerField()
  facebook_trust = models.IntegerField()
  email = models.CharField(max_length=200, null=True)

class RecommendationSources(models.Model):
  survey_responses = models.ManyToManyField(SurveyResponse)
  source = models.CharField(max_length=200, null=True)
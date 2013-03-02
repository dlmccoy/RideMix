# Create your views here.
import json

from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import render, render_to_response

from survey.models import SurveyResponse, RecommendationSources

USE_MAPPING = {
  'mult': 0,
  'daily': 1,
  'weekly': 2,
  'monthly': 3,
  'never': 4,
}

TRUST_MAPPING = {
  'trust_use': 0,
  'trust_dont_use': 1,
  'dont_trust': 2,
  'dont_use': 3,
}

def RecommendationSurvey(request):
  # For a get request, send the actual survey.
  if request.method == 'GET':
    return render(request, 'survey.html')

  # Upon a post request, add the results to the database.
  else:
    yelp_use = request.POST.get('yelp_use')
    yelp_trust = request.POST.get('yelp_trust')
    facebook_use = request.POST.get('facebook_use')
    facebook_trust = request.POST.get('facebook_trust')
    recommendation_sources = request.POST.getlist('recommendation_sources')
    recommendation_other = request.POST.get('recommendation_other')
    email = request.POST.get('email')

    # Build the SurveyResponse object
    survey_response = SurveyResponse()
    survey_response.yelp_use = USE_MAPPING[yelp_use]
    survey_response.yelp_trust = TRUST_MAPPING[yelp_trust]
    survey_response.facebook_use = USE_MAPPING[facebook_use]
    survey_response.facebook_trust = TRUST_MAPPING[facebook_trust]
    survey_response.email = email
    survey_response.save() 
    
    # Iterate through the checkbox list of possible recommendation sources
    for source in recommendation_sources:
      try: 
        s = RecommendationSources.objects.get(source=source)
      except ObjectDoesNotExist:
        s = RecommendationSources(source=source)
 	s.save()
      s.survey_responses.add(survey_response)

    # If something was entered into other recommendation sources, save it.
    if recommendation_other != "":
      s = RecommendationSources(source=recommendation_other)
      s.save()
      s.survey_responses.add(survey_response)

    # Thank you page
    return render(request, 'survey_response.html')

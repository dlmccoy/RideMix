# Create your views here.
from django.shortcuts import render_to_response

def RecommendationSurvey(request):
  return render_to_response('survey.html')


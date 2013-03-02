# Create your views here.

from django.http import HttpResponse
from django.shortcuts import render_to_response

def Home(request):
  return render_to_response('home.html')

def Privacy(request):
  return render_to_response('privacy.html')

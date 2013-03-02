# Create your views here.

from django.http import HttpResponse
from django.shortcuts import render_to_response

def Home(request):
  cool = "COOOOOL"
  args = {
    'cool': cool
  }
  return render_to_response('home.html', args)


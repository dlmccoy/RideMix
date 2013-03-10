# Create your views here.

from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import redirect, render, render_to_response

def NewHome(request):
  return render_to_response('new_home.html')

def Home(request):
  if request.user.is_authenticated():
    args = {
      'places': [{
        'name': 'Chipotle',
        'distance': 3.0,
      }, {
        'name': 'The Counter',
        'distance': 5.0,
      }, {
        'name': 'Spalti',
        'distance': 5.0,
      }, {
        'name': 'Verde Cafe',
        'distance': 10.0,
      }], 
      'friends': ['Victoria Kwong', 'Dillon McCoy', 'Alejandro Rodriguez Lopez',
                  'Michael Garland', 'James Fosco'],
    }
    return render(request, 'home_loggedin.html', args)
  return render(request, 'home.html')

def Privacy(request):
  return render_to_response('privacy.html')

def LogOut(request):
  logout(request)
  return redirect('/')

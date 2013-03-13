# Create your views here.
import json
import oauth2 as oauth
import time
import urllib
import urllib2

from string import replace

from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import render, render_to_response
from django.contrib.auth import logout
from django.conf import settings

def YelpHome(request):
  return render(request, 'yelp_query.html')

def YelpQuery(request):
# All possible search parameters:
# term
# limit
# offset
# sort (0-best match, 1-distance, 2-highest rated
# category_filter
# radius_filter (in meters)
# deals_filter (bool)
  latitude = request.GET.get('latitude')
  longitude = request.GET.get('longitude')
  term = request.GET.get('term')
  sort = request.GET.get('sort')
  ll_string = latitude + "," + longitude
  
  url = 'http://api.yelp.com/v2/search'
  params = {
    'oauth_version': "1.0",
    'oauth_nonce': oauth.generate_nonce(),
    'oauth_timestamp': int(time.time()),
    #'oauth_consumer_key': '',
    'll': ll_string,
    'term': term,
    'limit': 20,
    'sort': sort,
  }

  token = oauth.Token(key=settings.YELP_TOKEN, secret=settings.YELP_TOKEN_SECRET)
  consumer = oauth.Consumer(key=settings.YELP_CONSUMER_KEY,
    secret=settings.YELP_CONSUMER_SECRET)

  params['oauth_token'] = token.key
  params['oauth_consumer_key'] = consumer.key

  client = oauth.Client(consumer, token)
  client.set_signature_method(oauth.SignatureMethod_HMAC_SHA1()) 
  resp, content = client.request(url, method="GET",
   parameters=params)
  return HttpResponse(content, mimetype="application/json")
  
  #req = oauth.Request(method="GET", url=url, parameters=params)
  #signature_method = oauth.SignatureMethod_HMAC_SHA1()
  #req.sign_request(signature_method, consumer, token)
  
  request = urllib2.Request(url, params, req.to_header())
  response = urllib2.urlopen(request) 
  response = response.read()
  return HttpResponse(json.dumps(response))

  #client = oauth.Client(consumer, token)
  #resp, content = client.request(
	#url
	#method="GET"
	#)
  #return content 


# location = replace(location, " ", "+")
# onsumerKey = 'edw-GDK1v9b7Sx-AJWmRHw'
# token = 'xnvy30x8a4AxDexSMTLnU3S7NCwy5543'
# signatureMethod = 'HMAC-SHA1' 
# tokenSecret = 'lzxoWB4zknCIZO_5itfd0R9MHCM'
# values = { 'term' : 'food',
#   'limit' : "25",
#   'sort' : "0",
#   'location' : location }
# signature = _get_signature(consumerKey, _get_base_string(url, values))
# oauthValues = { 'term' : 'food',
#   'limit' : "25",
#   'sort' : "0",
#   'location' : location,
#   'oauth_consumer_key' : consumerKey,
#   'oauth_token' : token,
#   'oauth_signature_method' : signatureMethod,
#   'oauth_signature' : signature,
#   'oauth_timestamp' : int(time.time()),
#   'oauth_nonce' : str(_get_nonce()) }
# data = urllib.urlencode(oauthValues)
# return HttpResponse(data)
# #data = data.encode('utf-8')
# req = urllib2.Request(url, data)
# try:
#   response = urllib2.urlopen(req)
#   html = response.read()	  
# except Exception as e:
#   return HttpResponse(e.reason)
# # Prints out results of yelp request 
# return HttpResponse(html)

def YelpLogout(request):
  logout(request)
  return redirect('/')

def _get_signature(signingKey, stringToHash):
  hmacAlg = hmac.HMAC(signingKey, stringToHash, hashlib.sha1)
  return base64.b64encode(hmacAlg.digest())

def _get_base_string(resourceUrl, values, method="POST"):
  baseString = method + "&" + url_encode(resourceUrl) + "&"
  sortedKeys = sorted(values.keys())
  for i in range(len(sortedKeys)):
    baseString = baseString + url_encode(sortedKeys[i] + "=") + url_encode(values[sortedKeys[i]])
  if i < len(sortedKeys) - 1:
    baseString = baseString + url_encode("&")
  return baseString

def _get_nonce():
  r = random.randint(1, 999999999)
  return r

def _build_oauth_headers(parameters):
  header = "OAuth"
  sortedKeys = sorted(parameters.keys())
  for i in range(len(sortedKeys)):
    header = header + url_encode(sortedKeys[i]) + "=\"" + url_encode(parameters[sortedKeys[i]]) + "\""
    if i < len(sortedKeys) - 1:
      header = header + ","
  return header

def url_encode(data):
  return urllib.quote(data, "") 

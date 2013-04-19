import simplejson as json
import urllib
import foursquare
import time
import oauth2 as oauth

class Places:
    PLACES_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/'
    PLACES_DETAIL_URL = 'https://maps.googleapis.com/maps/api/place/details/'

    pagetoken = None
    key = None

    def __init__(self, key, output='json'):
        self.key = key
        self.PLACES_SEARCH_URL += output
        self.PLACES_DETAIL_URL += output

    def search(self, location, types=['restaurant'], sensor='true'):
        #TODO check existance of key, throw error otherwise
        pl_args = {'sensor':sensor,'key':self.key,'rankby':'distance'}
        pl_args.update({'types':'|'.join(types)})
        pl_args.update({'location':location})

        url = self.PLACES_SEARCH_URL + '?' + urllib.urlencode(pl_args)
        result = json.load(urllib.urlopen(url))
        #set pagetoken
        if 'next_page_token' in result.keys():
            self.pagetoken = result['next_page_token']
        else:
            self.pagetoken = None
        return result

    def nextPage(self, sensor='true'):
        if self.pagetoken:
            pl_args = {'sensor':sensor, 'pagetoken':self.pagetoken, 'key':self.key}

            url = self.PLACES_SEARCH_URL + '?' + urllib.urlencode(pl_args)
            result = json.load(urllib.urlopen(url))
            #set pagetoken
            if 'next_page_token' in result.keys():
                self.pagetoken = result['next_page_token']
            else:
                self.pagetoken = None
            return result
        else:
            return {}

    def details(self, reference, sensor='true'):
        pl_args = {'sensor':sensor, 'reference':reference, 'key':self.key}

        url = self.PLACES_DETAIL_URL + '?' + urllib.urlencode(pl_args)
        result = json.load(urllib.urlopen(url))

        return result

    @staticmethod
    def parseHours(periods):
        # parse out two arrays of open and close times from periods
        # array of google JSON
        times = {'open':['-1']*7, 'close':['-1']*7}

        for day in periods:
            index = day['open']['day']
            if index == 0 and not 'close' in day.keys(): # open on sunday an don't close = 24/7
                times['open'] = ['0']*7
                break
            else:
                times['open'][index] = day['open']['time']
                times['close'][index] = day['close']['time']
        return times

class Foursquare:
    client_id=None
    client_secret=None

    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret

    def search(self, location, **args):
        if not args.has_key('query'):
            args['query'] = 'restaurant'
        if not args.has_key('limit'):
            args['limit'] = '20'
        client = foursquare.Foursquare(self.client_id, self.client_secret)
        object = client.venues.search(params={
            'query': args['query'],
            'll': location,
            'limit': args['limit'],
        })
        return object

class Yelp:
    YELP_SEARCH_URL = 'http://api.yelp.com/v2/search' 

    token = None
    token_secret = None
    consumer_key = None
    consumer_secret = None

    def __init__(self, token, token_secret, consumer_key, consumer_secret):
        self.token = token
        self.token_secret = token_secret
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret

    def search(self, location, **args): # term='restaurant', sort='1', limit=20):
        if not args.has_key('term'):
            args['term'] = 'restaurant'
        if not args.has_key('limit') or int(args['limit']) > 20 :
            args['limit'] = 20
        if not args.has_key('sort') or int(args['sort']) not in [0,1,2]:
            args['sort'] = '1'

        params = {
            'oauth_version': '1.0',
            'oauth_nonce': oauth.generate_nonce(),
            'oauth_timestamp': int(time.time()),
            #'oauth_consumer_key': '',
            'll': location,
            'term': args['term'],
            'limit': args['limit'], 
            'sort': args['sort']
        }

        if args.has_key('offset'):
            params['offset'] = args['offset']

        token = oauth.Token(key=self.token, secret=self.token_secret)
        consumer = oauth.Consumer(key=self.consumer_key, secret=self.consumer_secret)

        params['oauth_token'] = token.key
        params['oauth_consumer_key'] = consumer.key

        client = oauth.Client(consumer, token)
        client.set_signature_method(oauth.SignatureMethod_HMAC_SHA1())
        resp, content = client.request(self.YELP_SEARCH_URL, method="GET",
            parameters=params)

        return json.loads(content)

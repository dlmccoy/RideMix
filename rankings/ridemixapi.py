import simplejson
import urllib

class places:
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
        result = simplejson.load(urllib.urlopen(url))
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
            result = simplejson.load(urllib.urlopen(url))
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
        result = simplejson.load(urllib.urlopen(url))

        return result

    @staticmethod
    def parseHours(periods):
        # parse out two arrays of open and close times from periods
        # array of google JSON
        print periods
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

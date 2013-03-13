from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'home.views.NewHome'),
    url(r'^new_home', 'home.views.NewHome'),
    url(r'^privacy', 'home.views.Privacy'),
    url(r'^recommendation_survey', 'survey.views.RecommendationSurvey'),
    url(r'^yelpsearch', 'yelp.views.YelpHome'),
    url(r'^yelp_query', 'yelp.views.YelpQuery'),
    url(r'^yelpsearch', 'yelp.views.YelpQuery'),
    url(r'^fbfriends', 'facebook.views.GetFacebookFriends'),
    url(r'^fbfriends/(?P<friend_id>\d+)/$', 'facebook.views.GetFriendsCheckins'),


    url(r'', include('social_auth.urls')),
    url(r'^logout', 'home.views.LogOut'),
    url(r'^accounts/', include('allaccess.urls')),

    url(r'^foursquare_query', 'foursq.views.FoursquareQuery'),
    url(r'^foursquare', 'foursq.views.FoursquareHome'),


    url(r'', include('social_auth.urls')),
    url(r'^logout', 'home.views.LogOut'),

    url(r'^jo', 'home.views.Jo'),
    url(r'^splash', 'home.views.Splash'),

    url(r'^get/friends', 'home.views.GetFriends'),
    url(r'^get/places', 'home.views.GetPlaces'),
    # url(r'^ridemix/', include('ridemix.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

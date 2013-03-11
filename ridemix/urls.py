from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'home.views.Home'),
    url(r'^new_home', 'home.views.NewHome'),
    url(r'^privacy', 'home.views.Privacy'),
    url(r'^recommendation_survey', 'survey.views.RecommendationSurvey'),
    url(r'^yelpsearch', 'yelp.views.YelpQuery'),

    url(r'', include('social_auth.urls')),
    url(r'^logout', 'home.views.LogOut'),
    url(r'^get/friends', 'home.views.GetFriends'),
    url(r'^get/places', 'home.views.GetPlaces'),
    # url(r'^ridemix/', include('ridemix.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

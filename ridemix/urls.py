from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'home.views.Splash'),
    url(r'^new_home', 'home.views.NewHome'),
    url(r'^ridemix_log', 'home.views.AddLog'),
    url(r'^privacy', 'home.views.Privacy'),
    #url(r'^recommendation_survey', 'survey.views.RecommendationSurvey'),
    url(r'^yelpsearch', 'yelp.views.YelpHome'),
    url(r'^yelp_query', 'yelp.views.YelpQuery'),
    url(r'^yelpsearch', 'yelp.views.YelpQuery'),
    #url(r'^fbfriends', 'facebookfriends.views.FacebookFriends'),
    url(r'^fbcheckins', 'facebookfriends.views.FacebookFriendsCheckins'),
    url(r'^fbstatus', 'facebookfriends.views.FacebookStatusByLikes'),
    url(r'^intersect', 'facebookfriends.views.FacebookFriendsCheckinsIntersected'),
    #url(r'^fblikes', 'facebookfriends.views.FacebookUserLikes'),
    #url(r'^fbfriendlikes', 'facebookfriends.views.FacebookLikesByUser'),
    #url(r'^share', 'facebookfriends.views.Share'),
    url(r'^share_popup', 'facebookfriends.views.SharePopup'),

    url(r'', include('social_auth.urls')),
    url(r'^logout', 'home.views.LogOut'),
    url(r'^accounts/', include('allaccess.urls')),

    url(r'^foursquare_query', 'foursq.views.FoursquareQuery'),
    url(r'^foursquare', 'foursq.views.FoursquareHome'),

    url(r'^jo', 'home.views.Jo'),
    url(r'^splash', 'home.views.Splash'),

    url(r'^get/friends', 'facebookfriends.views.FacebookFriends'),
    url(r'^get/places', 'home.views.GetPlaces'),
    url(r'^get/rankings', 'rankings.views.Rankings'),
    url(r'^get/trending', 'rankings.views.GetTrending'),
    url(r'^get/news', 'facebookfriends.views.NewsTopics'),
    url(r'^get/blekko', 'facebookfriends.views.Blekko'),
    url(r'^get/details', 'rankings.views.GetDetails'),
    url(r'^get/token', 'home.views.GetToken'),
    url(r'^rate_place/', 'rankings.views.RatePlace'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

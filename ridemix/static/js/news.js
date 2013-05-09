$(function() {
    window.NEWS = [];
    url = '/get/news?users=';
    for (int i = 0; i < SELECTED_FRIENDS.length; i++) {
        url += SELECTED_FRIENDS[i] + ',';

    window.news_ajax = $.ajax({
        'url' : '/get/news',
        'datatype' : 'text/json',
    }).done(function(data

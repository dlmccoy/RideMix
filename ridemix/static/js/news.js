$(function() {
    fetchNewsTopics();    
});

function addToNewsList(container, index) {
    var topic = window.NEWS[index][0];
    var news_id = index + "_topic";
    var anchor = $("<a>");
    anchor.attr('id', news_id + "_div");
    anchor.attr('data-role', "button");
    anchor.attr('href', "https://blekko.com/ws/?q=" + encodeURIComponent(topic) + "+%2Fnews");
    anchor.text(topic);
    container.append(anchor);
}    

function fetchNewsTopics() {
    window.NEWS = [];
    var url = '/get/news?users=';
    for (var i in SELECTED_FRIENDS) {
        var index = window.SELECTED_FRIENDS[i];
        var id = window.FRIEND_LIST[index].id;
        url += id + ',';
    }
    if (SELECTED_FRIENDS.length > 0) url = url.substring(0, url.length - 1);
    window.news_ajax = $.ajax({
        'url' : url,
        'datatype' : 'text/json',
    }).done(function(data) {
        window.NEWS = data;
	var container = $('#news_list');
        container.html("");
	for (var i in window.NEWS) {
	    addToNewsList(container, i);
        }
        container.trigger('create');
    });
}

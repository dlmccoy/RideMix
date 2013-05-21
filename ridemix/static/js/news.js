$(function() {
    fetchNewsTopics(); 
});

function addToNewsList(container, index) {
    var topic = window.NEWS[index][0];
    var news_id = index + "_topic";
    var collapsible = $("<div>");
    collapsible.attr('data-role', "collapsible");
    collapsible.attr('id', news_id + "_collapsible");
//    collapsible.attr('data-mini', "true");
    var title = $("<h3>");
    title.text(topic);
    title.attr('class', "ui-collapsible-heading");
    title.attr('onclick', "expandNews(" + index + ")");
    var list = $("<ul>");
    list.attr('id', news_id + "_list");
    list.attr('data-role', "listview");
//    list.attr('data-theme', "d");
//    var anchor = $("<a>");
//    anchor.attr('id', news_id + "_anchor");
//    anchor.attr('data-role', "button");
//    anchor.attr('href', "https://blekko.com/ws/?q=" + encodeURIComponent(topic) + "+%2Fnews-magazine");
//    anchor.attr('href', "#");
//    anchor.attr('onclick', "expandNews(" + index + ")");
//    anchor.attr('target', "_blank");
//    anchor.text(topic);
//    div.append(anchor);
    collapsible.append(title);
    collapsible.append(list);
    container.append(collapsible);
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

function expandNews(index) {
    var container = $('#' + index + "_topic_list");
    var alreadyThere = container.innerHTML;
    if (typeof alreadyThere === 'undefined' || alreadyThere == "") {
        var topic = window.NEWS[index][0];
        var url = '/get/bingnews?topic=' + encodeURIComponent(topic);
        $.mobile.loading();
        window.bing_ajax = $.ajax({
            'url' : url,
            'datatype' : 'text/json',
        }).done(function(data) {
            for (var i = 0; i < data.d.results[0].News.length; i++) {
                var url = data.d.results[0].News[i].Url;
                var title = data.d.results[0].News[i].Title;
                var source = data.d.results[0].News[i].Source;
                var description = data.d.results[0].News[i].Description;
                var list_item = $("<li>");
                //list_item.attr('data-theme', "d");
                var anchor = $("<a>");
                //anchor.attr('data-role', "button");
                anchor.attr('href', url);
                //anchor.text(title);
                anchor.attr('target', "_blank");
                var title_text = $("<h3>");
                title_text.text(title + " --- (" + source + ")");
                title_text.attr('class', "ui-li-heading");
                //var source_text = $("<p>");
                //source_text.text(source);
                //source_text.attr('class', "ui-li-aside"); 
                anchor.append(title_text);
                list_item.append(anchor);
                //list_item.append(source_text);
                container.append(list_item);
            }
            container.trigger('create');
            $.mobile.loading();
        });
    }
}

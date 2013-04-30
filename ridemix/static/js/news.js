$(function() {
  window.SELECTED_FRIENDS_NEWS = [];
  window.friend_ajax_news = $.ajax({
                              'url': '/get/friends',
                              'datatype': 'text/json',
                              }).done(function(data) {
                                      window.FRIEND_LIST_NEWS = data;
                                      var container = $("#friend_add_list_news").controlgroup("container");
                                      for(var i in data) {
                                      addToFriendListNews(container, i);
                                      }
                                      container.trigger('create');
                                      $.mobile.loading("hide");
                                      });
  
  $("#friend_add_select_news").live('change', function() {
                               //debugger;
                               cool = 5;
                               });
  });

function addToSelectedNews(id) {
    var container = $("#selected_list_news");
    var friend = window.FRIEND_LIST_NEWS[id];
    var html_id = id + "_selected_news";
    var div = $("<div>");
    div.attr('id', html_id + "_div_news");
    var input = $("<input>");
    input.attr('type', 'checkbox');
    input.attr('id', html_id);
    input.change(function(e) {
                 $("#" + e.target.id + "_div_news").remove();
                 var friend_id = parseInt(e.target.id);
                 var friend_div_name = "#" + friend_id + "_friend_div_news";
                 $(friend_div_name).show();
                 //$("#friend_add_list fieldset").trigger('refresh');
                 });
    var label = $("<label>");
    label.attr('for', html_id);
    label.text(friend['name']);
    
    
    div.append(input);
    div.append(label);
    
    container.append(div);
    container.trigger('create');
    window.SELECTED_FRIENDS_NEWS.push(id);
}

function addToFriendListNews(container, id) {
    var friend = window.FRIEND_LIST_NEWS[id];
    var id =  id + "_friend_news";
    var anchor = $("<a>");
    anchor.attr('id', id + "_div_news");
    anchor.attr('data-role', 'button');
    anchor.click(function(e) {
                 var this_id = e.currentTarget.id;
                 $("#" + this_id).hide();
                 var friend_id = parseInt(this_id); 
                 addToSelected(friend_id);
                 return false;
                 });
    anchor.text(friend['name']);
    container.append(anchor);
}
$(function() {
  window.SELECTED_FRIENDS = [];
  window.friend_ajax = $.ajax({
    'url': '/get/friends',
    'datatype': 'text/json',
  }).done(function(data) {
      window.FRIEND_LIST = data;
      var container = $("#friend_add_list").controlgroup("container");
      for(var i in data) {
        addToFriendList(container, i);
      }
        container.trigger('create');
      $.mobile.loading("hide");
    });

  $("#friend_add_select").live('change', function() {
    //debugger;
    cool = 5;
  });
});

function addToSelected(id) {
  var container = $("#selected_list");
  var friend = window.FRIEND_LIST[id];
  var html_id = id + "_selected";
  var div = $("<div>");
  div.attr('id', html_id + "_div");
  var input = $("<input>");
  input.attr('type', 'checkbox');
  input.attr('id', html_id);
  input.change(function(e) {
    $("#" + e.target.id + "_div").remove();
    var friend_id = parseInt(e.target.id); 
    var friend_div_name = "#" + friend_id + "_friend_div";
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
  window.SELECTED_FRIENDS.push(id);
}

function addToFriendList(container, id) {
  var friend = window.FRIEND_LIST[id];
  var id =  id + "_friend";
  var anchor = $("<a>");
  anchor.attr('id', id + "_div");
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

function loadFriends() {
  console.log("Should show load screen now");
  $.mobile.loading("show", {
    text: "Loading Friend List",
    textVisible: true,
    theme: "a",
  });
}

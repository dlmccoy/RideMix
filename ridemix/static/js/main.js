$(function() {
window.SELECTED_FRIENDS = [];
  window.friend_ajax = $.ajax({
    'url': '/get/friends',
    'datatype': 'text/json',
  }).done(function(data) {
      window.FRIEND_LIST = data;
      var container = $("#friend_add_list fieldset");
      debugger;
      for(var i in data) {
        addToFriendList(i);
      }
        container.trigger('create');
      $.mobile.loading("hide");
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
    addToFriendList(friend_id);
    $("#friend_add_list fieldset").trigger('create');
    debugger;
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

function addToFriendList(id) {
  var friend = window.FRIEND_LIST[id];
  var container = $("#friend_add_list fieldset");
  var id =  id + "friend_";
  var div = $("<div>");
  div.attr('id', id + "_div");
  var checkbox = $("<input>");
  checkbox.change(function(e) {
    $("#" + e.target.id + "_div").remove();
    var friend_id = parseInt(e.target.id); 
    addToSelected(friend_id);
    debugger;
  });
  checkbox.attr("type", "checkbox");
  checkbox.attr("id", id);
  var label = $("<label>");
  label.attr("for", id);
  label.text(friend['name']);
  div.append(checkbox);
  div.append(label);
  container.append(div);
}

function loadFriends() {
  console.log("Should show load screen now");
  $.mobile.loading("show", {
    text: "Loading Friend List",
    textVisible: true,
    theme: "a",
  });
}

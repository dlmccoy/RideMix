$(function() {
  window.friend_ajax = $.ajax({
    'url': '/get/friends',
    'datatype': 'text/json',
  });

  $("#friend_page").on('pagebeforecreate', function(event) {
    $.mobile.loading("show", {
      text: "Loading Friend List",
      textVisible: true,
      theme: "a",
    });
    window.friend_ajax.done(function(data) {
      var container = $("#friend_add_list fieldset");

      for(var i in data) {
        var id = "friend_" + i;
        var checkbox = $("<input>");
        checkbox.attr("type", "checkbox");
        checkbox.attr("id", id);
        var label = $("<label>");
        label.attr("for", id);
        label.text(data[i]["name"]);
        container.append(checkbox);
        container.append(label);
      }
      try{
	container.trigger('create');
      } catch(err){
	console.log("ERROR HERE");
      }
	$.mobile.loading("hide");
    }, function(err) {
      debugger;
    });

  });
});

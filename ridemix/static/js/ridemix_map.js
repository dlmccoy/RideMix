$("#map_button").click(function(e) {
    $("#navbar .cell").removeClass('selected');
    $(e.target).addClass('selected');
    $("#map_canvas").show();
    $("#location_list").hide();
    $("#friend_list").hide();
});

$("#list_button").click(function(e) {
    $("#navbar .cell").removeClass('selected');
    $(e.target).addClass('selected');
    $("#map_canvas").hide();
    $("#friend_list").hide();
    $("#location_list").show();
});

$("#friend_button").click(function(e) {
    $("#navbar .cell").removeClass('selected');
    $(e.target).addClass('selected');
    $("#map_canvas").hide();
    $("#location_list").hide();
    $("#friend_list").show();
});

function nav_callback(arg1) {
    console.log(arg1);
    var position = new google.maps.LatLng(arg1.coords.latitude, arg1.coords.longitude);
    var mapOptions = {
      center: position,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    var markerOptions = {
      map: map,
      position: position,
      title: "You are here!",
    }

    var marker = new google.maps.Marker(markerOptions);
    marker.setClickable(true);
    
}

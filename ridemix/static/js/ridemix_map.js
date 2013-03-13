var map;
var marker;

function ridemix_init() {
    $("#map_button").click(function(e) {
        $("#navbar .cell").removeClass('selected');
        $(e.target).addClass('selected');
        $("#map_canvas").show();
        $("#location_list").hide();
        $("#friend_list").hide();
    });
    $("#map_button").click()

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

    if (initialize_map()) {
        window.watchID = navigator.geolocation.watchPosition(nav_callback);
    }
}

function initialize_map() {
    //console.log(arg1);
    var mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
         mapOptions);
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);
            var image = 'http://static.ridemix.com/prod/media/minibug.jpg';
            marker = new google.maps.Marker({
                map: map,
                position: pos,
                animation: google.maps.Animation.DROP,
                title: 'You are here!',
                icon: image
            });

            map.setCenter(pos);
            update_results_list();
        }, function() {
            handleNoGeolocation(true);
            return false;
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
        return false;
    }
    return true;
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}


function update_results_list() { 
    url = 'get/places?location=';
    var latitude = marker.position.lat();
    var longitude = marker.position.lng();
    var ll_string = latitude + "," + longitude;
    url += ll_string;
    url += '&types=restaurant';
    $.getJSON(url, function(json_data) { 
        table = $("#loc_results");

        var result_string = "<li data-role=\"list-divider\" role=\"heading\">Google Places</li>";
        json_data.results.forEach(function(place) {
            result_string += "<li data-theme=\"c\">";
            result_string += "<a href=\"#\" data-transition=\"slide\">"
            result_string += "<div style=\"display:inline-block;\">" + place.name + "</div>"
            
            var open_now;
            if(place.opening_hours) open_now = place.opening_hours.open_now ? "Open": "Closed";
            else open_now = "No Info";
            result_string += "<div style=\"float:right;\">" + open_now +"</div><br />";
            result_string += "<div style=\"float:right;\">5.0 Miles</div>";
            result_string += "</a></li>";
        });
        $("#places_list").append(result_string).listview('refresh');
    });

    $.ajax({
      url: '/yelp_query',
      type: 'GET',
      dataType: 'json',
      data: {
        latitude: latitude,
        longitude: longitude,
      },
    }).done(function(data) {
      var businesses = data['businesses']
      var result_string = "<li data-role=\"list-divider\" role=\"heading\">Yelp Results</li>";
      for(var i in businesses) {
          var place = businesses[i];
            result_string += "<li data-theme=\"c\">";
            result_string += "<a href=\"#\" data-transition=\"slide\">"
            result_string += "<div style=\"display:inline-block;\">" + place.name + "</div>"
            
            var open_now = place.is_closed?  "Closed" :"Open";
            result_string += "<div style=\"float:right;\">" + open_now +"</div><br />";
            result_string += "<div style=\"float:right;\">5.0 Miles</div>";
            result_string += "</a></li>";
        
      }
      $("#places_list").append(result_string).listview('refresh');
    });
}

function success_fn(data) {
  debugger;
}

function nav_callback(loc) {
    console.log(loc);
    var pos = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
    marker.setPosition(pos);
}

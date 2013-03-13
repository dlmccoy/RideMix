var map;
var marker;
var places_results = []; //just google places right now
var yelp_results = [];
var done = { p:1, y:1 };
var all_results = {};
var all_places = [];
var foursquare_results = [];

/* locs is an array containing all destinations you want to find the distance to*/
function latlng_dist(destinations) {
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix({
        origins: [marker.position],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    }, dist_callback);
}

function dist_callback(response, status) {
    if (status == google.maps.DistanceMatrixStatus.OK) {

    for (var i = 0; i < response.originAddresses.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var distance = results[j].distance.text;
        $("#dist_"+j).html(distance);
        places_results[j]["distance"] = distance;
      }
    }
    places_results.sort(compare_loc_dist);
    done.p++;
    console.log("Google Places done");
  }
}

function compare_loc_dist(a,b) {
    // compare ft vs. mi
    a_ft = a.distance.search("ft") != -1;
    b_ft = b.distance.search("ft") != -1;
    if (a_ft && !b_ft) { return -1; }
    if (!a_ft && b_ft) { return 1; }

    // compare numeric distance (both now one of ft or mi)
    a_num = parseFloat(a.distance);
    b_num = parseFloat(b.distance);
    if (a_num < b_num) { return -1; }
    if (a_num > b_num) { return 1; }

    return 0;
}

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

function write_places_results_list() {
    var result_string = "<li data-role=\"list-divider\" role=\"heading\">Google Places</li>";
    for (i=0;i<places_results.length;i++) {
        place = places_results[i];
        result_string += "<li data-theme=\"c\">";
        result_string += "<a href=\"#\" data-transition=\"slide\">";
        result_string += "<div style=\"display:inline-block;\">" + place.name + "</div>";

        result_string += "<div style=\"float:right;\">" + place.open_now + "</div><br />";
        result_string += "<div style=\"float:right;\">" + place.distance + "</div>";
        result_string += "</a></li>";
    }
    //$("#places_list").append(result_string).listview('refresh');
}

function update_results_list() { 
    url = 'get/places?location=';
    var latitude = marker.position.lat();
    var longitude = marker.position.lng();
    var ll_string = latitude + "," + longitude;
    url += ll_string;
    url += '&types=restaurant';
    $.getJSON(url, function(json_data) { 
        var dests = [];
        for (i=0;i<json_data.results.length;i++) {
            place = json_data.results[i];
            place_info = {};

            place_info["name"] = place.name;
            
            var open_now;
            if(place.opening_hours) open_now = place.opening_hours.open_now ? "Open": "Closed";
            else open_now = "No Info";
            place_info["open_now"] = open_now;

            var place_lat = place.geometry.location.lat;
            var place_lng = place.geometry.location.lng;
            place_info["location"] = new google.maps.LatLng(place_lat,place_lng);
            place_info["address"] = place.vicinity;

            dests.push(new google.maps.LatLng(place_lat,place_lng));
            places_results.push(place_info);
        }
        latlng_dist(dests);
    });

    done.watch("p", function(id, oldval, newval) {
        write_places_results_list();
        done.unwatch("p");
    });

    $.ajax({
      url: '/yelp_query',
      type: 'GET',
      dataType: 'json',
      data: {
        latitude: latitude,
        longitude: longitude,
        sort: 2,
        term: 'restaurant'
      },
    }).done(function(data) {
      yelp_results = data['businesses'];
      var result_string = "<li data-role=\"list-divider\" role=\"heading\">Yelp Results</li>";
      for(var i in yelp_results) {
          var place = yelp_results[i];
            result_string += "<li data-theme=\"c\">";
            result_string += "<a href=\"#\" data-transition=\"slide\">"
            result_string += "<div style=\"display:inline-block;\">" + place.name + "</div>"
            
            var open_now = place.is_closed?  "Closed" :"Open";
            result_string += "<div style=\"float:right;\">" + open_now +"</div><br />";
            result_string += "<div style=\"float:right;\">" + place.rating + "</div>";
            result_string += "</a></li>";
        
      }
      //$("#places_list").append(result_string).listview('refresh');
      console.log("Yelp done");
      done.y++;
    });

    $.ajax({
        url: '/foursquare_query',
        type: 'GET',
        dataType: 'json',
        data: {
           latitude: latitude,
           longitude: longitude,
           query: 'restaurant'
        },
    }).done(function(data) {
        foursquare_results = data['venues'];
        var result_string = "<li data-role=\"list-divider\" role=\"heading\">Foursquare Results</li>";
        for(var i in foursquare_results) {
            var place = foursquare_results[i];
            result_string += "<li data-theme=\"c\">";
            result_string += "<a href=\"#\" data-transition=\"slide\">"
            result_string += "<div style=\"display:inline-block;\">" + place.name + "</div>"
            result_string += "<div style=\"float:right;\">" + "&nbsp;" +"</div><br />";
            result_string += "<div style=\"float:right;\">" + "&nbsp;" + "</div>";
            result_string += "</a></li>";
        }
        //$("#places_list").append(result_string).listview('refresh');
    });

    done.watch("y", function(id, oldval, newval) {
        setTimeout(function(){ 
            combine_results();
        },500);
        done.unwatch("y");
    });

}

function combine_results() {
    //all_results
    for(i=0;i<places_results.length;i++) {
        name = places_results[i]["name"];
        all_results[name] = places_results[i];
        all_results[name]["places_rank"] = i;
        all_results[name]["yelp_rank"] = 0;
    }
    for(j=0;j<yelp_results.length;j++) {
        name = yelp_results[j]["name"];
        if (all_results[name] == undefined) {
            // yelp result not in places result
            all_results[name] = yelp_results[j];
            all_results[name]["places_rank"] = 0;
            all_results[name]["yelp_rank"] = j;
        } else {
            // yelp result in places result
            all_results[name]["yelp_rank"] = j;
        }
    }
    for (var key in all_results) { all_places.push(all_results[key]); }
    all_places.sort(my_compare);
    write_comb_results_list();
}

function my_compare(a,b) {
    a_total = a["places_rank"] + a["yelp_rank"];
    b_total = b["places_rank"] + b["yelp_rank"];

    if (a_total < b_total) {
        return -1;
    } else if (a_total > b_total) {
        return 1;
    } else {
        return 0;
    }
}

function write_comb_results_list() {
    var result_string = "<li data-role=\"list-divider\" role=\"heading\">Combined Results</li>";
    for (i=0;i<all_places.length;i++) {
        place = all_places[i];
        result_string += "<li data-theme=\"c\">";
        result_string += "<a href=\"#\" data-transition=\"slide\">";
        result_string += "<div style=\"display:inline-block;\">" + place.name + "</div>";
        
        if (place.open_now) {
            result_string += "<div style=\"float:right;\">" + place.open_now + "</div><br />";
        } else {
            open_now = place.is_closed ? "Closed" : "Open";
            result_string += "<div style=\"float:right;\">" + open_now + "</div><br />";
        }
        if (typeof(place.distance) == "string") {
            result_string += "<div style=\"float:right;\">" + place.distance + "</div>";
        } else {
            distance = place.distance * 0.000621371192;
            result_string += "<div style=\"float:right;\">" + distance.toFixed(2) + " mi</div>";
        }
        result_string += "</a></li>";
    }
    $("#places_list").append(result_string).listview('refresh');
}

function success_fn(data) {
  debugger;
}

function nav_callback(loc) {
    console.log(loc);
    var pos = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
    marker.setPosition(pos);
    map.setCenter(marker.position);
}

/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
          enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop, handler) {
            var
              oldval = this[prop]
            , newval = oldval
            , getter = function () {
                return newval;
            }
            , setter = function (val) {
                oldval = newval;
                return newval = handler.call(this, prop, oldval, val);
            }
            ;
            
            if (delete this[prop]) { // can't watch constants
                Object.defineProperty(this, prop, {
                      get: getter
                    , set: setter
                    , enumerable: true
                    , configurable: true
                });
            }
        }
    });
}

// object.unwatch
if (!Object.prototype.unwatch) {
    Object.defineProperty(Object.prototype, "unwatch", {
          enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        }
    });
}
/* End Object Watch Code */

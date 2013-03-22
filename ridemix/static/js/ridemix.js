/*
 This function represents the RideMix application in Javascript
 controlling the function of all parts of the application, which
 currently include the map, the search results, and the friends page
 */
function RideMix(map_div_id, results_div_id, friends_div_id) {
    this.map = null;				// - Google Maps map
    this.cur_loc_marker = null;		// - Google Maps marker for user's position
    this.search_results = null;		// - list of dics that represent search results
    								//   must be sorted by user
    this.types = 'restaurant';		// - TODO let user select eventually...
    this.map_div_id = map_div_id;
    this.results_div_id = results_div_id;
    //this.friends_div_id = friends_div_id;	// - I'm not touching friends right now,
    									 	//   Mike you can do that
}

RideMix.prototype.init = function() {
	console.log("init called");
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

    this.initialize_map();
	//TODO window.watchID = navigator.geolocation.watchPosition(this.watch_pos_callback);
}

RideMix.prototype.watch_pos_callback = function(location) {
	console.log(location);
    var pos = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    this.cur_loc_marker.setPosition(pos);
    this.map.setCenter(marker.position);
    //TODO this.search_results = get search results
}

RideMix.prototype.initialize_map = function() {
	console.log("initialize_map called");
	var mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(document.getElementById(this.map_div_id),
         mapOptions);
    if(navigator.geolocation) {
    	var obj = this;
        navigator.geolocation.getCurrentPosition(function(position) {
        	obj.get_pos_callback(position);
        }, function() {
        	// Geolocation Error
            obj.handle_no_geolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        this.handle_no_geolocation(false);
    }
}

RideMix.prototype.get_pos_callback = function(position) {
	console.log("get_pos_callback called");
	var pos = new google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);
    var image = 'http://static.ridemix.com/prod/media/minibug.jpg';
    this.cur_loc_marker = new google.maps.Marker({
        map: this.map,
        position: pos,
        animation: google.maps.Animation.DROP,
        title: 'You are here!',
        icon: image
    });

    this.map.setCenter(pos);
    this.update_results_list();
}

RideMix.prototype.handle_no_geolocation = function(error_flag) {
	if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
    	var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: this.map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    this.map.setCenter(options.position);
}

RideMix.prototype.update_results_list = function() {
	console.log("update_results_list called");
	var url = 'get/rankings?location=';
    var latitude = this.cur_loc_marker.position.lat();
    var longitude = this.cur_loc_marker.position.lng();
    var ll_string = latitude + "," + longitude;
    url += ll_string;
    url += '&types=' + this.types;
    console.log(url);
    
    var obj = this;
    $.getJSON(url, function(json_data) {
    	obj.search_results = json_data;
        obj.calc_latlng_dists();
        //obj.combine_results(); // should be obj.sort results
        //obj.write_places_results_list();
    });


    /*$.ajax({
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
    }); */
}

RideMix.prototype.calc_latlng_dists = function() {
	console.log("calc_latlng_dists called");

  // Cut results off at 25 because that's the max for google maps distance
  // calculations
  r.search_results = r.search_results.slice(0,25);

	var destinations = new Array();
	for (i=0; i < r.search_results.length; i++) {
		destinations.push(new google.maps.LatLng(this.search_results[i].lat, this.search_results[i].lng));
	}
  console.log(destinations);

	var service = new google.maps.DistanceMatrixService();

	var obj = this;
    service.getDistanceMatrix({
        origins: [this.cur_loc_marker.position],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,	//TODO user choice
        unitSystem: google.maps.UnitSystem.IMPERIAL	//TODO user choice
    }, function(response, status) { obj.dist_callback(response, status); });
}

RideMix.prototype.dist_callback = function(response, status) {
	console.log("dist_callback called");
	if (status == google.maps.DistanceMatrixStatus.OK) {
    	for (var i = 0; i < response.originAddresses.length; i++) {
      		var results = response.rows[i].elements;
      		for (var j = 0; j < results.length; j++) {
        		var distance = results[j].distance.text;
        		this.search_results[j]["distance"] = distance;
      		}
    	}
    	var obj = this;
    	this.search_results.sort(function(a,b) {
    		return obj.ridemix_compare(a,b);
    	});
    	this.write_search_results()
	} else {
		console.log(status);
	}
}

RideMix.prototype.write_search_results = function() {
	console.log("write_search_results called");
    var result_string = "<li data-role=\"list-divider\" role=\"heading\">Combined Results</li>";
    for (i=0;i<this.search_results.length;i++) {
        var randNumber = Math.floor(Math.random()*6);
        var rand2 = Math.floor(Math.random()*21);
        place = this.search_results[i];
        result_string += "<li data-theme=\"c\">";
        result_string += "<a href=\"#\" data-transition=\"slide\">";
        result_string += "<div style=\"display:block;\">" + place.name + "</div>";

        // Begin random friend stats 
        if (randNumber == 2)
          result_string += "<div class=\"friends_insert\">" + rand2 + " of your friends like this!</div>";
        else if (randNumber == 3) {
          var selected_size = window.SELECTED_FRIENDS.length;
          if (selected_size != 0) {
            var rand_friend = Math.floor(Math.random()*selected_size);
             var friend_name = window.FRIEND_LIST[rand_friend]['name']
             result_string += "<div class=\"friend_insert\">" + friend_name + " likes this!</div>";
          }
          
        }
        // End random friend stats
        
        /*if (place.open_now) {
            result_string += "<div style=\"float:right;\">" + place.open_now + "</div><br />";
        } else {
            open_now = place.is_closed ? "Closed" : "Open";
            result_string += "<div style=\"float:right;\">" + open_now + "</div><br />";
        }*/
        result_string += "<div style=\"float:right;\">" + place.distance + "</div>";
        
        result_string += "</a></li>";
    }
    $("#"+this.results_div_id).html(result_string).listview('refresh');
}

RideMix.prototype.ridemix_compare = function(a,b) {
	// ideas: slider to make distance more important
	// track how user values distance over rating and friends
	
	// what contributes to rating:
	// 1. distance, 2.5 miles per star
	// 2. gp_rating
	
	a_score = 0; // higher score is better
	b_score = 0;
	
	a_dist = parseFloat(a.distance);
    b_dist = parseFloat(b.distance);
    
    if (a.distance.search("ft") != -1) {
    	a_dist *= 0.000189393939; // Google calculator, 1 ft = 0.000189393939 mi
    }
    if (b.distance.search("ft") != -1) {
    	b_dist *= 0.000189393939;
    }
    
    a_score += (-2.5 * a_dist);
    b_score += (-2.5 * b_dist);
    
    if (a.gp_rating) {
    	a_score += a.gp_rating;
    }
	if (b.gp_rating) {
		b_score += b.gp_rating;
	}

    if (a_score > b_score) { return -1; }
    else if (a_score < b_score) { return 1; }
	else { return 0; }
}

/*var map;
var marker;
var places_results = []; //just google places right now
var yelp_results = [];
var done = { p:1, y:1 };
var all_results = {};
var all_places = [];
var foursquare_results = [];

// locs is an array containing all destinations you want to find the distance to
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
} */

$(function() {
  $("#location_page").on('pagebeforeshow', function(e) {
    r.write_search_results();
  });
});

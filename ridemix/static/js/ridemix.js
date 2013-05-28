/*
 This function represents the RideMix application in Javascript
 controlling the function of all parts of the application, which
 currently include the map, the search results, and the friends page
 */
function RideMix(map_div_id, results_div_id, friends_div_id, news_div_id) {
    this.map = null;				// - Google Maps map
    this.cur_loc_marker = null;		// - Google Maps marker for user's position
    this.search_results = [];		// - list of dics that represent search results
    								//   must be sorted by user
    this.search_markers = [];
    this.types = 'restaurant';		// - TODO let user select eventually...
    this.map_div_id = map_div_id;
    this.results_div_id = results_div_id;
    this.news_div_id = news_div_id;
}

RideMix.prototype.init = function() {
	console.log("init called");

    this.initialize_map();
	window.watchID = navigator.geolocation.watchPosition(this.watch_pos_callback);
}

RideMix.prototype.watch_pos_callback = function(location) {
	console.log(location);
    if (this.map) {
        var pos = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
        this.cur_loc_marker.setPosition(pos);
        this.map.setCenter(marker.position);
        this.update_results_list();
    }
}

RideMix.prototype.initialize_map = function() {
	console.log("initialize_map called");
	var mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(document.getElementById(this.map_div_id),
         mapOptions);
    setTimeout(function() {
        google.maps.event.trigger(this.map,'resize');
    }, 500);
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
    var regular_request = $.getJSON(url, function(json_data) {
    	obj.search_results = json_data;
        obj.get_facebook_checkins();
    });

    url = "/get/trending?location=" + ll_string
    var trending_request = $.getJSON(url, function(json_data) {
      obj.trending_results = json_data;
      obj.calc_latlng_dists(obj.trending_results);
    });
}

RideMix.prototype.get_facebook_checkins = function() {
  console.log("get_facebook_checkins called");
  if (window.SELECTED_FRIENDS.length > 0) {
    var url = 'intersect?friends=';
    for (var i in window.SELECTED_FRIENDS) {
        id = window.FRIEND_LIST[window.SELECTED_FRIENDS[i]].id;
        url += id + ',';
    }
    url = url.slice(0,-1);

    var obj = this;
    var intersect_request = $.getJSON(url, function(json_data) {
      console.log('FB data found', json_data);    
      for (var i in json_data) {
        index = obj.fb_index_of(json_data[i],obj.search_results);
        if (index != -1) {
          obj.search_results[index]['fb_checkins'] = json_data[i].count;
        }
      }
    });
  }
  this.calc_latlng_dists(this.search_results);
}

RideMix.prototype.fb_index_of = function(obj,array) {
  for (var i in array) {
    result = array[i];
    if (result.name == obj.name) {
      return i;
    } else if (result.number.replace(/\d/g,'') == obj.phone) {
      return i;
    }
    else {
      return -1;
    }
  }
}

RideMix.prototype.calc_latlng_dists = function(results_list) {
	console.log("calc_latlng_dists called");

    // sliced in backend now

	var destinations = new Array();
	for (i=0; i < results_list.length; i++) {
		destinations.push(new google.maps.LatLng(results_list[i].lat, results_list[i].lng));
	}
    console.log(destinations);

	var service = new google.maps.DistanceMatrixService();

	var obj = this;
    service.getDistanceMatrix({
        origins: [this.cur_loc_marker.position],
         destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,	//TODO user choice
        unitSystem: google.maps.UnitSystem.IMPERIAL	//TODO user choice
    }, function(response, status) { obj.dist_callback(response, status, results_list); });
}

RideMix.prototype.dist_callback = function(response, status, results_list) {
	console.log("dist_callback called");
	if (status == google.maps.DistanceMatrixStatus.OK) {
    	for (var i = 0; i < response.originAddresses.length; i++) {
      		var results = response.rows[i].elements;
      		for (var j = 0; j < results.length; j++) {
            var distance;
            if(results[j].distance)
              distance = results[j].distance.text;
            else distance = "0ft";
        		results_list[j]["distance"] = distance;
      		}
    	}
    	var obj = this;
    	results_list.sort(function(a,b) {
    		return obj.ridemix_compare(a,b);
    	});
    	this.write_search_results()
	} else {
		console.log(status);
	}
}

RideMix.prototype.write_trending_results = function() {
  this.trending_results.sort(sort_fn);
  this.write_results(this.trending_results);
};

RideMix.prototype.write_search_results = function() {
  this.write_results(this.search_results);
};

RideMix.prototype.write_results = function(results_list) {
	console.log("write_search_results called");
    var result_string = "";  
    var place_pages_string = "";
    if (results_list != null) {
        for (i=0;i<results_list.length;i++) {
            var randNumber = Math.floor(Math.random()*6);
            var rand2 = Math.floor(Math.random()*21);
            place = results_list[i];
            //console.log(place);

            result_string += "<a href=\"#" + place.id + "\" data-role=\"button\"";
            result_string += " onclick=\"changePage('" + place.id + "')\">";
            result_string +=  place.name +" (" + place.distance + ")</a>";

            place_pages_string += "<div id=\"" + place.id + "\"";
            place_pages_string += "data-role=\"page\">";
            place_pages_string += "<div data-role=\"header\">";
            place_pages_string += "<h3>RideMix</h3>";
            place_pages_string += "<a href=\"#location_page\" data-rel=\"back\"";
            place_pages_string += " class=\"ui-btn-left\">Back</a>";
            place_pages_string += "</div>";
            place_pages_string += "<div data-role=\"content\">";
            place_pages_string += "<h3>" + place.name + " (" + place.distance + ")</h3>";
            place_pages_string += "<p><a data-role='button' href=\"http://maps.google.com?q=";
            place_pages_string += place.lat + "," + place.lng + "\">Map</a>";
            if(place.gp_rating)
              place_pages_string += "<br />Google Rating: " + place.gp_rating;
            if(place.yelp_id) {
              place_pages_string += "<br />Yelp Rating: " + place.yelp_rating;
              place_pages_string += "<br />Number of Yelp Reviews: " + place.yelp_review_count;
            }
            if(place.foursquare_id) {
              place_pages_string += "<br />Foursquare Tip Count: " + place.foursquare_tip_count;
              place_pages_string += "<br />Foursquare Checkin Count: " + place.foursquare_checkin_count;
              place_pages_string += "<br />Foursquare Users Count: " + place.foursquare_users_count;
            }
            if(place.fb_checkins) {
              place_pages_string += "<br />Number of Facebook Checkins: " + place.fb_checkins;
            }
            if(place.phone)
              place_pages_string += "<br /><a href=\"tel://" + place.phone + "\">Phone</a>";
            place_pages_string += "<br /><button onclick=\"submit_rating('";
            place_pages_string += place.id+ "',5)\" >I like this place!</button>";
            place_pages_string += "</p>";

            place_pages_string += "</div>";
            place_pages_string += "</div>";
            
            /*if (place.open_now) {
                result_string += "<div style=\"float:right;\">" + place.open_now + "</div><br />";
            } else {
                open_now = place.is_closed ? "Closed" : "Open";
                result_string += "<div style=\"float:right;\">" + open_now + "</div><br />";
            }*/
        }
    }
    $("#"+this.results_div_id).html(result_string).trigger("create");
    $("#place_pages").html(place_pages_string);
    this.generate_markers();
}

RideMix.prototype.generate_markers = function() {
    for (var i = 0; i < this.search_markers.length; i++) {
        this.search_markers[i].setMap(null);
    }
    this.search_markers = [];
    for (var i = 0; i < this.search_results.length; i++) {
        place = this.search_results[i];
        pos = new google.maps.LatLng(place['lat'],place['lng']);
        temp_loc_marker = new MarkerWithLabel({map: this.map,position: pos,animation: google.maps.Animation.DROP, labelContent: place.name, labelClass: "labels", labelAnchor: new google.maps.Point(50, 0),});
        this.search_markers.push(temp_loc_marker)
    }
}

RideMix.prototype.ridemix_compare = function(a,b) {
	// ideas: slider to make distance more important
	// track how user values distance over rating and friends
	
	// what contributes to rating:
	// 1. distance, -2.5 per mile
	// 2. gp_rating, 1 per star
    // 3. fb_checkins, 5 per checkin
    // 4. yelp, 0.01 * review_count * rating
    // 5. 4square, 1 per tip + 0.01 * checkin * user_count
	
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
    
    if (a.gp_rating) { a_score += a.gp_rating; }
	if (b.gp_rating) { b_score += b.gp_rating; }

    if (a.fb_checkins) { a_score += (5 * a.fb_checkins); }
    if (b.fb_checkins) { b_score += (5 * b.fb_checkins); }

    if (a.yelp_id) { a_score += (a.yelp_rating * a.yelp_review_count * 0.01); }
    if (b.yelp_id) { b_score += (b.yelp_rating * b.yelp_review_count * 0.01); }

    if (a.foursquare_id) { a_score += (a.foursquare_tip_count + (a.foursquare_checkin_count * a.foursquare_users_count * 0.01)); }
    if (b.foursquare_id) { b_score += (b.foursquare_tip_count + (b.foursquare_checkin_count * b.foursquare_users_count * 0.01)); }

    if (a_score > b_score) { return -1; }
    else if (a_score < b_score) { return 1; }
	else { return 0; }
}

function submit_rating(id, rating) {
  var args = {
    'place_id': id,
    'user_rating': rating,
  }
  
 $.ajax({
    'url': '/rate_place',
    'data': args,
  });
  var obj = r.trending_results;
  for(var i in obj) {
    if(obj[i].id == id) {
      obj[i].user_rating += 5;
      return;
    }
  }
}

function log(message) {
  $.ajax({
    'url': '/ridemix_log',
    'data': {
      'log': message,
    }
  });
}

function changePage(page_id) {
  $.mobile.changePage($("#" + page_id));
  //console.log($("#" + page_id));
}

function sort_fn(a, b) {
  return b.user_rating - a.user_rating;
}

$(function() {
  r = new RideMix('map_canvas','places_list','');
  r.init();

  $("#location_page").on('pagebeforeshow', function(e) {
    log("Accessed places tab");
    r.write_search_results();
    _gaq.push(['_trackPageview', '/#location_page']);
  });
  $("#friend_page").on('pagebeforeshow', function(e) {
    log("Accessed friends page");
    _gaq.push(['_trackPageview', '/#friend_page']);
  });
  $("#news_page").on('pagebeforeshow', function(e) {
    log("Accessed news tab");
    _gaq.push(['_trackPageview', '/#news_page']);
  });
  $("#home_page").on('pagebeforeshow', function(e) {
    log("Accessed map tab");
    _gaq.push(['_trackPageview', '/#home_page']);
  });

  $("#home_page").on('pageshow', function(e) {
    google.maps.event.trigger(r.map, 'resize');
    r.map.setCenter(r.cur_loc_marker.position);
  });
  
  $("#trending_now_button").click(function() {
    log("Clicked Trending Now button");
    r.write_trending_results();
    _gaq.push(['_trackEvent', 'Place Buttons', 'Trending']);
  });
  $("#general_places_button").click(function() {
    log("Clicked My Ride button");
    _gaq.push(['_trackEvent', 'Place Buttons', 'My Ride']);
    r.write_search_results();
  });
});

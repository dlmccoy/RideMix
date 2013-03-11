var App = function() {
    var deviceScreen;
    var mainContainer;
    var mainNavBar;
    var mainMenu;
    var cardStack;
    var menuCard;
    var mapContainer;
    var friendContainer;
    var listContainer;
    var mapHtml;
    var map;
    var marker;
    var view;

    


    var init = function() {
	mainContainer = new joContainer([
	    mainNavBar = new joNavbar("RideMix"),
	    cardStack = new joStackScroller(),
	]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"});

	deviceScreen = new joScreen(mainContainer);
	mainNavBar.setStack(cardStack);



	
	
	

	menuCard = new joCard([
	    //mapContainer = new joContainer("<img id='places_map' src='https://maps.googleapis.com/maps/api/staticmap?center=Madison, WI&amp;zoom=14&amp;size=288x200&amp;markers=Madison, WI&amp;sensor=false' width='288' height='200' />"),
	    mapContainer = new joContainer("<div id='map_canvas' style='height:300px;'></div>"), 
	    listContainer = new joContainer("<div id='location_list' style='height:300px; display:none;'><table id='loc_results'></table></div>"),
	    friendContainer = new joContainer("<div id='friend_list' style='height:300px; display:none;'></div>"),
	    view = new joOption([{title: "Map", id: "map"}, {title: "List", id: "list"}, {title:  "Friends", id: "friends"}])
	]);
	
	view.selectEvent.subscribe(function(id) {
	    console.log(id);
	    switch(id) {
	    case "map":
		 $("#map_canvas").show();
        $("#location_list").hide();
        $("#friend_list").hide();
		break;
	    case "list":
		 $("#map_canvas").hide();
        $("#friend_list").hide();
        $("#location_list").show();
		break;
	    case "friends":
		 $("#map_canvas").hide();
        $("#location_list").hide();
        $("#friend_list").show();
		break;
	    }
	});

	cardStack.push(menuCard);

	if(initialize_map()) {
	    window.watchID = navigator.geolocation.watchPosition(nav_callback);
	}

	
	
    };



    return {
	init: init
    };


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
    url += marker.position.lat()+','+marker.position.lng();
    url += '&types=restaurant';
    $.getJSON(url, function(json_data) { 
        table = $("#loc_results");

        json_data.results.forEach(function(place) {
            name_col = document.createElement("td");
            name_col.setAttribute("class", "col1");
            cont=document.createTextNode(place.name);
            name_col.appendChild(cont);

            open_col = document.createElement("td");
            open_col.setAttribute("class", "col2");
            if (place.opening_hours != undefined) {
                cont=document.createTextNode(place.opening_hours.open_now ? "Open":"Closed");
            } else {
                cont=document.createTextNode("No Info");
            }
            open_col.appendChild(cont);
            
            dist_col = document.createElement("td");
            dist_col.setAttribute("class", "col3");
            cont=document.createTextNode("5.0 Miles");
            dist_col.appendChild(cont);

            row = document.createElement("tr");
            row.appendChild(name_col);
            row.appendChild(open_col);
            row.appendChild(dist_col);

            table.append(row);
        });
    });
}

function nav_callback(loc) {
    console.log(loc);
    var pos = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
    marker.setPosition(pos);
}

}();
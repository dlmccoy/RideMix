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
            var image = 'static/media/minibug.jpg';
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

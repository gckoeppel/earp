function directionsFromHere() {
	$('.contextmenu').remove();
	start = clickedLatLng;
	calcRoute();
}

function directionsToHere() {
	$('.contextmenu').remove();
	end = clickedLatLng;
	calcRoute();
}

function directionsAddrTo() {
	if (geocoder) {
		addr = document.getElementById("end").value;
		geocoder.geocode({address: addr},function(point) {
			end = new google.maps.LatLng(point[0].geometry.location.lat(),point[0].geometry.location.lng());
			calcRoute();
		});
	}
}


function directionsAddrFrom() {
	if (geocoder) {
		addr = document.getElementById("start").value;
		geocoder.geocode({address: addr},function(point) {
			start = new google.maps.LatLng(point[0].geometry.location.lat(),point[0].geometry.location.lng());
			calcRoute();
		});
	}
}


function calculateDrivingInstructions(nr)
{
	dir[nr].drivingInstructions = '<table class="table table-hover">';
	for(x in dir[nr].directionsDisplay.directions.routes[0].legs[0].steps)
	{
		dir[nr].drivingInstructions += '<tr><td>';
		dir[nr].drivingInstructions += dir[nr].directionsDisplay.directions.routes[0].legs[0].steps[x].instructions;
		dir[nr].drivingInstructions += '</td></tr>';
	}
	dir[nr].drivingInstructions += '<\/table>';
	showDrivingInstructions(1);
}

function showDrivingInstructions(nr)
{
	dIdiv = document.getElementById("drivingInstructions");
	dIdiv.innerHTML = dir[nr].drivingInstructions;
}

function calcRoute() {
	var selectedMode = document.getElementById("mode").value;
	var aTolls = document.getElementById("tolls").checked;
	var aHighways = document.getElementById("highways").checked;
	var secondRouteBox = document.getElementById("route2").checked;
	var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode[selectedMode],
		avoidHighways: aTolls,
		avoidTolls: aHighways
	};
	dir[1].directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			dir[1].directionsDisplay.setDirections(result);
			sDirection.className = "success";
			calculateDrivingInstructions(1);
		}
		else
		{
			sDirection.className = "error";
		}
		document.getElementById("statusDir").innerHTML = status;
	});
	if(secondRouteBox)
	{
		dir[2].directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				dir[2].directionsDisplay.setDirections(result);
				sDirection.className = "success";
				calculateDrivingInstructions(2);
			}
			else
			{
				sDirection.className = "error";
			}
			document.getElementById("statusDir").innerHTML = status;
		});
	}
}

function updateRoute() {
	console.log(dir[1]);
	dir[1].route = dir[1].directionsDisplay.getDirections();
	//dir[1].waypoints = dir[1].route.ub.waypoints;
	
	dir[1].waypoints = dir[1].route.routes.overview_path;
	
	if(null != dir[2].directionsDisplay.directions)
	{
		dir[2].route=dir[2].directionsDisplay.getDirections();
		//ir[2].waypoints=dir[2].route.ub.waypoints;
		dir[2].waypoints=dir[2].route.routes.overview_path;
	}
	
	var selectedMode = document.getElementById("mode").value;
	var aTolls = document.getElementById("tolls").checked;
	var aHighways = document.getElementById("highways").checked;
	var request = {
		origin:start,
		destination:end,
		travelMode:google.maps.TravelMode[selectedMode],
		waypoints:dir[1].waypoints,
		avoidHighways: aTolls,
		avoidTolls: aHighways
	};
	dir[1].directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			dir[1].directionsDisplay.setDirections(result);
			sDirection.className = "success";
			calculateDrivingInstructions(1);
		}
		else
		{
			sDirection.className = "error";
		}
		document.getElementById("statusDir").innerHTML = status;
	});
	if(document.getElementById("route2").checked)
	{
		var request = {
			origin:start,
			destination:end,
			travelMode:google.maps.TravelMode[selectedMode],
			waypoints:dir[2].waypoints,
			avoidHighways: aTolls,
			avoidTolls: aHighways
		};
		dir[2].directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				dir[2].directionsDisplay.setDirections(result);
				sDirection.className = "success";
				calculateDrivingInstructions(2);
			}
			else
			{
				sDirection.className = "error";
			}
			document.getElementById("statusDir").innerHTML = status;
		});
	}
}

function secondRoute() {
	if(document.getElementById("route2").checked)
	{
		updateRoute();
		dir[2].directionsDisplay.setMap(map);
	}
	else
	{
		dir[2].directionsDisplay.setMap(null);
	}
}

function computeTotalDistance(index) {
	dir[index].total=0;
	for(i=0;i<dir[index].directionsDisplay.directions.routes[0].legs.length; i++)
	{
		dir[index].total += dir[index].directionsDisplay.directions.routes[0].legs[i].distance.value;
	}
	dir[index].total = dir[index].total/1000.
	document.getElementById("total"+index).innerHTML = dir[index].total + " km";
}


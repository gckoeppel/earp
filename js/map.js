dirs = function(){
	this.directionsService = new google.maps.DirectionsService();
	route = 0;
	total = 0;
	marker;
	drivingInstructions = "No Route";
}

var map;
var chart;
var clickedLatLng;
var marker = [];
var dir = [];
var sMap = 0;
var sDirection = 0;
var sElevation = 0;
var geocode;

google.load("visualization", "1", {packages:["corechart"]});

$(window).resize(function() {
	$('#mapcanvas').first().height(window.innerHeight * 0.75)
	$('#graph').first().height(window.innerHeight * 0.2)
});


function initialize() {
	//Set div height

	$('#mapcanvas').first().height(window.innerHeight * 0.75)
	$('#graph').first().height(window.innerHeight * 0.2)
	
	//Set default state
	sMap = document.getElementById("sMap");
	sMap.className = "success";
	sDirection = document.getElementById("sDirection");
	sDirection.className = "success";
	sElevation = document.getElementById("sElevation");
	sElevation.className = "success";

	
	geocoder = new google.maps.Geocoder();

	document.getElementById("statusMap").innerHTML = "Ready";
	document.getElementById("statusDir").innerHTML = "Ready";
	document.getElementById("statusElev").innerHTML = "Ready";
	//Init Map
	var home = new google.maps.LatLng(40.69847032728747, -73.9514422416687);
	var myOptions = {
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: home
	};
	map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
	// Locate if geolocation is active
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var loc = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			map.setCenter(loc);
		}, function() {
    });
	}

	for(i=1;i<=2;i++)
	{
		dir[i] = new dirs();
		if(i==1)
		{
			dir[i].directionsDisplay = new google.maps.DirectionsRenderer({draggable: true});
		}
		else
		{
			dir[i].directionsDisplay = new google.maps.DirectionsRenderer({draggable: true, polylineOptions: {strokeColor: '#FF0000'}});
		}
		dir[i].directionsDisplay.setMap(map);
		dir[i].directionsDisplay.setPanel(document.getElementById("c"));	
	}
	
	

	//Init Elevation
	elevator = new google.maps.ElevationService();

	//Init Google Maps listener
	google.maps.event.addListener(map, "rightclick",function(event){
		clickedLatLng = event.latLng;
		showContextMenu(event.latLng);});
	google.maps.event.addListener(map, "click",function(event){removeContextMenu();});
	
	google.maps.event.addListener(dir[1].directionsDisplay, 'directions_changed', function() {
		computeTotalDistance(1);
		calculateDrivingInstructions(1);
		if(null != dir[2].directionsDisplay.directions)
		{
			checkIfMoved(dir[1].directionsDisplay.directions.ub, dir[2].directionsDisplay.directions.ub);
		}
	});
	google.maps.event.addListener(dir[2].directionsDisplay, 'directions_changed', function() {
		computeTotalDistance(2);
		calculateDrivingInstructions(2);
		if(null != dir[1].directionsDisplay.directions)
		{
			checkIfMoved(dir[2].directionsDisplay.directions.ub, dir[1].directionsDisplay.directions.ub);
		}
	});
}

function checkIfMoved(changedDir, oldDir)
{
	if((changedDir.destination.lat() != oldDir.destination.lat()) || (changedDir.destination.lng() != oldDir.destination.lng()))
	{
		end = new google.maps.LatLng(changedDir.destination.lat(), changedDir.destination.lng());
		updateRoute();
	}
	if((changedDir.origin.lat() != oldDir.origin.lat()) || (changedDir.origin.lng() != oldDir.origin.lng()))
	{
		start = new google.maps.LatLng(changedDir.origin.lat(), changedDir.origin.lng());
		updateRoute();
	}
	
}

//Zoom controls
function zoomIn(){
	var currentZoom = map.getZoom();
	map.setZoom(currentZoom+1);
	removeContextMenu();
}
function zoomOut(){
	var currentZoom = map.getZoom();
	map.setZoom(currentZoom-1);
	removeContextMenu();
}
function setCenter(){
	map.setCenter(clickedLatLng);
	removeContextMenu();
}

//Context Menu
function getCanvasXY(caurrentLatLng){
	var scale = Math.pow(2, map.getZoom());
	var nw = new google.maps.LatLng(
		map.getBounds().getNorthEast().lat(),
		map.getBounds().getSouthWest().lng()
	);
	var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
	var worldCoordinate = map.getProjection().fromLatLngToPoint(caurrentLatLng);
	var caurrentLatLngOffset = new google.maps.Point(
		Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
		Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
	);
	return caurrentLatLngOffset;
}

function setMenuXY(caurrentLatLng){
	var mapWidth = $('#mapcanvas').width();
	var mapHeight = $('#mapcanvas').height();
	var menuWidth = $('.contextmenu').width();
	var menuHeight = $('.contextmenu').height();
	var clickedPosition = getCanvasXY(caurrentLatLng);
	var x = clickedPosition.x ;
	var y = clickedPosition.y ;
	if((mapWidth - x ) < menuWidth)
	x = x - menuWidth;
	if((mapHeight - y ) < menuHeight)
	y = y - menuHeight;

	$('.contextmenu').css('left',x  );
	$('.contextmenu').css('top',y );
};

function showContextMenu(caurrentLatLng  ) {
	var projection;
	var contextmenuDir;
	projection = map.getProjection() ;
	$('.contextmenu').remove();
	contextmenuDir = document.createElement("div");
	contextmenuDir.className  = 'contextmenu';
	contextmenuDir.innerHTML = '<table class="table table-hover">'
								+'<tr><td><a href="javascript:directionsFromHere()"><i class="icon-map-marker"></i>Directions from here<\/a><\/td><\/tr>'
								+'<tr><td><a href="javascript:directionsToHere()"><i class="icon-map-marker"></i>Directions to here<\/a><\/td><\/tr>'
								+'<tr><td><a href="javascript:zoomIn()"><i class="icon-plus"></i>Zoom In<\/a><\/td><\/tr>'
								+'<tr><td><a href="javascript:zoomOut()"><i class="icon-minus"></i>Zoom Out<\/a><\/td><\/tr>'
								+'<tr><td><a href="javascript:setCenter()"><i class="icon-screenshot"></i>Center<\/a><\/td><\/tr>'
								+'<\/table>';
	$(map.getDiv()).append(contextmenuDir);
	setMenuXY(caurrentLatLng);

	contextmenuDir.style.visibility = "visible";
}

function removeContextMenu() {
	$('.contextmenu').remove();
}
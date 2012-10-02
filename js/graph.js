function drawComplete() {
	var elevChange;
	var chartdata = new google.visualization.DataTable();
	chartdata.addColumn('number', 'distance');
	chartdata.addRows(2*512);
	for(i=1;i<=2;i++)
	{
		if((i==1) || ((document.getElementById("route2").checked) &&(i=2)))
		{
			chartdata.addColumn('number', 'elevation');
			var row=0;
			dir[i].mUp = 0;
			dir[i].mDown = 0;
			dir[i].mPeak = 0;
			dir[i].mDip = 20000;
			for(j=0;j<=511;j++)
			{
				row = j + 512*(i-1);
				chartdata.setValue(row,0,Math.round(dir[i].total/512*j*1000)/1000);
				chartdata.setValue(row,i,Math.round(dir[i].route[j].elevation));
				//Calculate meters up, down, peak and lowest point
				if(j > 0) {
					elevChange = dir[i].route[j].elevation - dir[i].route[j-1].elevation;
				}
				if(elevChange > 0) {
					dir[i].mUp += elevChange;
				}
				else if(elevChange < 0) {
					dir[i].mDown -= elevChange;			
				}
				if(dir[i].route[j].elevation > dir[i].mPeak)
				{
					dir[i].mPeak = dir[i].route[j].elevation;
				}
				
				if(dir[i].route[j].elevation < dir[i].mDip)
				{
					dir[i].mDip = dir[i].route[j].elevation;
				}
			}
			document.getElementById("mUp"+i).innerHTML = Math.round(dir[i].mUp) + " m";
			document.getElementById("mDown"+i).innerHTML = Math.round(dir[i].mDown) + " m";
			document.getElementById("mPeak"+i).innerHTML = Math.round(dir[i].mPeak) + " m";
			document.getElementById("mDip"+i).innerHTML = Math.round(dir[i].mDip) + " m";
		}
	}
	var options = {
		//title: 'Elevation',
		hAxis: {title: 'km'},
		vAxis: {title: 'm'},
		legend: {position: 'none'}
	};
	chart = new google.visualization.AreaChart(document.getElementById(graphcanvas));
	chart.draw(chartdata, options);
	google.visualization.events.addListener(chart, 'onmouseover', onmouseoverChart );
	google.visualization.events.addListener(chart, 'onmouseout', onmouseoutChart );
}



function drawChart() {
	for(i=1;i<=2;i++)
	{
		if(i==1 || (document.getElementById("route2").checked)) {
			dir[i].route = dir[i].directionsDisplay.getDirections();
			dir[i].pointsArray = dir[i].route.routes[0].overview_path;
		}
	}
	
	elevator.getElevationAlongPath({path: dir[1].pointsArray, samples: 512}, function(result, status) {
		dir[1].route = result;
		
		if (status == google.maps.ElevationStatus.OK) {
			sElevation.className = "success";
		}
		else
		{
			sElevation.className = "error";
		}
		document.getElementById("statusElev").innerHTML = status;

		if(document.getElementById("route2").checked)
		{
			elevator.getElevationAlongPath({path: dir[2].pointsArray, samples: 512}, function(result, status) {
				dir[2].route = result;	
				if (status == google.maps.ElevationStatus.OK) {
					sElevation.className = "success";
					drawComplete();
				}
				else
				{
					sElevation.className = "error";
				}
				document.getElementById("statusElev").innerHTML = status;
			});
		}
		else
		{
			drawComplete();
		}
	});
}

function onmouseoverChart(data) {
	var markerLatLng;
	var dirNr;
	for(i=1;i<=2;i++)
	{
		if(dir[i].marker) {
			dir[i].marker.setMap(null);
		}
	}
	dirNr = Math.round((data.row/512)/2)+1;
	markerLatLng = new google.maps.LatLng(dir[dirNr].route[(data.row)-(dirNr-1)*512].location.lat(),dir[dirNr].route[(data.row)-(dirNr-1)*512].location.lng());
	dir[dirNr].marker = new google.maps.Marker({
		position: markerLatLng,
		map: map
	});
}

function onmouseoutChart() {
	for(i=1;i<=2;i++)
	{
		if(dir[i].marker) {
			dir[i].marker.setMap(null);
		}
	}
}
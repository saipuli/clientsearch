$(function(){
  $("#search-string").change(function() {
        markersData = [whereami];
        $.getJSON('https://abclients.search.windows.net/indexes/clients/docs?api-version=2016-09-01&search='+$(this).val()+'&api-key=F59E2669524D8C8DF68FC6833A2384A1', function(data){
          if(data.value && data.value.length > 0){
            $.each(data.value, function(id, item){
            	if(item.geolocation && item.geolocation.coordinates){
                    markersData.push({
                        location: [item.geolocation.coordinates[1], item.geolocation.coordinates[0]],
                        tooltip:{
                            text: item.tlegalname +"<br/>"+ item.tphysicaladdress2 +', '+ item.tphysicalcity + '<br/> ' + item.tphysicalstate + ' ' + item.tphysicalzipcode5
                        }
                    });
            	}
                else{
                    markersData.push({
                        location: item.tphysicalcity + ', ' + item.tphysicalstate,
                        tooltip:{
                            text: item.tlegalname +"<br/>"+ item.tphysicaladdress2 +', '+ item.tphysicalcity + '<br/> ' + item.tphysicalstate + ' ' + item.tphysicalzipcode5
                        }
                    });
                }
            });
            dataGrid.option("dataSource", data.value);
          }
          else{
              dataGrid.option("dataSource", [])
          }
            mapWidget.option("markers", markersData);
            mapWidget.option("autoAdjust", true);

        });
      }
  );
    
    var markerUrl = "https://js.devexpress.com/Demos/RealtorApp/images/map-marker.png";
    var whereami = {location: "Louisville, KY", iconSrc:markerUrl, tooltip: {text: "You are here!!"}};
    var markersData = [whereami];
    if ("geolocation" in navigator){ //check geolocation available 
        //try to get user current location using getCurrentPosition() method
        navigator.geolocation.getCurrentPosition(function(position){
            whereami = {location: [position.coords.latitude, position.coords.longitude], iconSrc:markerUrl, tooltip: {text: "You are here!!"}};
                markersData = [
                    whereami
                ];
                mapWidget.option("markers", markersData);
                mapWidget.option("center", [position.coords.latitude, position.coords.longitude]);
                DevExpress.ui.notify("Found your location ["+position.coords.latitude+", "+ position.coords.longitude + "]", "success", "600");
            }, show_error);
    }else{
        DevExpress.ui.notify("Browser doesn't support location", "error", "600");
    }
    var mapWidget = $("#map").dxMap({
        zoom: 14,
        provider: "bing",
        height: 440,
        width: "100%",
        controls: true,
        //markerIconSrc: markerUrl,
        markers: markersData,
        autoAdjust: false,
        center: "Louisville, KY"
    }).dxMap("instance");

    function show_error(error){
        switch(error.code) {
            case error.PERMISSION_DENIED:
                DevExpress.ui.notify("Location Permission denied by user.", "error", "600");
                break;
            case error.POSITION_UNAVAILABLE:
                DevExpress.ui.notify("Location position unavailable.", "error", "600");
                break;
            case error.TIMEOUT:
                DevExpress.ui.notify("Location Request timeout.", "error", "600");
                break;
            case error.UNKNOWN_ERROR:
                DevExpress.ui.notify("Location: Unknown error.", "error", "600");
                break;
        }
    }

    $("#gridContainer").dxDataGrid({
        dataSource: [],
        selection: {
        mode: "single"
        },
        columns: [{
            dataField: "tname",
            caption: "Business"
        }, {
            dataField: "tcontactperson",
            caption: "Contact",
        }, {
            dataField: "tphysicaladdress2",
            caption: "Address",
        }, {
            dataField: "tphysicalcity",
            caption: "City",
        }, {
            dataField: "naicname",
            caption: "NAIC Category"
        }],
        onSelectionChanged: function (selectedItems) {
            var data = selectedItems.selectedRowsData[0];
            if(data) {
                markersData = $.map(markersData, function(item){
                if(data.geolocation){
                    return $.extend(true, {}, item,
                    { 
                    tooltip: { 
                        isShown: (item.location[0] === data.geolocation.coordinates[1] 
                                    && item.location[1] === data.geolocation.coordinates[0]
                                    && item.tooltip.text.startsWith(data.tlegalname)) 
                    }
                    });
                }
                return $.extend(true, {}, item,
                    { 
                    tooltip: { 
                        isShown: (item.tooltip.text === data.tlegalname +"<br/>"+ data.tphysicaladdress2 +', '+ data.tphysicalcity + '<br/> ' + data.tphysicalstate + ' ' + data.tphysicalzipcode5) 
                    }
                    });
                });
                if(!data.geolocation){
                DevExpress.ui.notify("Geocode not available for location.", "error", 1000);
                }
                else{
                mapWidget.option({center: [data.geolocation.coordinates[1], data.geolocation.coordinates[0]], zoom: 18});
                mapWidget.option("autoAdjust", false);
                mapWidget.option("zoom", 18);
                }
                mapWidget.option("markers", markersData);
            }
        }
    });
    var dataGrid = $('#gridContainer').dxDataGrid('instance');
});
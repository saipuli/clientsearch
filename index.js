$(function(){
  $("#search-string").dxTextBox({
      value: "",
      showClearButton: true,
      placeholder: "Search for a Business",
      valueChangeEvent: "keyup",
      onValueChanged: function(data) {
        $.getJSON('https://abclients.search.windows.net/indexes/clients/docs?api-version=2016-09-01&search='+data.value+'&api-key=F59E2669524D8C8DF68FC6833A2384A1', function(data){
          console.log(data.value);
          console.log(data.value && data.value.count > 0);
          if(data.value && data.value.length > 0){
            markersData = [];
            $.each(data.value, function(id, item){
            	if(item.geolocation && item.geolocation.coordinates){
                markersData.push({
                  location: [item.geolocation.coordinates[1], item.geolocation.coordinates[0]],
                  tooltip:{
                    text: item.tlegalname
                  }
            	  });
            	}
            });
            mapWidget.option("markers", markersData);
            mapWidget.option("autoAdjust", true);
            $("#gridContainer").dxDataGrid({
              dataSource: data.value,
              selection: {
                mode: "single"
              },
              columns: [{
                    dataField: "tname",
                    caption: "Business"
                }, {
                    dataField: "tcontactperson",
                    caption: "Contact",
                    width: 70
                }, {
                    dataField: "tphysicaladdress2",
                    caption: "Address",
                    width: 70
                }, {
                    dataField: "tphysicalcity",
                    caption: "City",
                    width: 70
                }, "naicname"],
              onSelectionChanged: function (selectedItems) {
                var data = selectedItems.selectedRowsData[0];
                if(data) {
                  markersData = $.map(markersData, function(item){
                    return $.extend(true, {}, item,
                    { 
                      tooltip: { 
                        isShown: (item.location[0] === data.geolocation.coordinates[1] && item.location[1] === data.geolocation.coordinates[0]) 
                      }
                    });
                  });
                  mapWidget.option({center: [data.geolocation.coordinates[1], data.geolocation.coordinates[0]], zoom: 18});
                  mapWidget.option("autoAdjust", false);
                  mapWidget.option("markers", markersData);
                  mapWidget.option("zoom", 18);
                }
              }
            });
          }
        });
      }
  });
    
    //var markerUrl = "https://js.devexpress.com/Demos/RealtorApp/images/map-marker.png",
    var markersData = [{
                location: [40.755833, -73.986389],
                tooltip: {
                    text: "Times Square"
                }
            }, {
                location: "40.7825, -73.966111",
                tooltip: {
                    text: "Central Park"
                }
            }, {
                location: { lat: 40.753889, lng: -73.981389},
                tooltip: {
                    text: "Fifth Avenue"
                }
            }, {
                location: "Brooklyn Bridge,New York,NY",
                tooltip: {
                    text: "Brooklyn Bridge"
                }
            }
        ];
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
});
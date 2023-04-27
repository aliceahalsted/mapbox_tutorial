import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import './main.css';

// TO MAKE THE MAP APPEAR YOU MUST ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com 
mapboxgl.accessToken = 'XXXX-XXXX-XXXX';
const map = new mapboxgl.Map({
    container: 'map', // container ID to match the html
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-83.5, 35.5], // starting position [lng, lat]
    zoom: 9, // starting zoom, higher is more zoomed in
    customAttribution: 'Alicea Halsted, Data from National Park Service' //Attribute your work and your data
});

let hoveredStateId = null; //For use on styling hover

//Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

//Create a custom marker icon for all points in trailhead file
const createMarker = (featuresList) => {
for (const feature of featuresList.features) {
    // create a HTML element for each feature
    const el = document.createElement('div');
    el.className = 'marker';
     
    // make a marker for each feature with a popup and add it to the map
    new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(
            `<h3>${feature.properties.LOC_NAME}</h3>`
            )
        )
        .addTo(map);
    }
}

//Using turf JS get the midpoint of the line
const getMidPointOfLine = (lineCoordinates) => {
    const trailLine = turf.lineString(lineCoordinates);
    const lengthTrailLine = turf.length(trailLine)
    const midpointCoord = turf.along(trailLine, lengthTrailLine/2);
    return midpointCoord.geometry.coordinates;
}

//Load files to map
map.on('load', () =>{
//Add GeoJSON point with simple circles
    // map.addSource('trailheads',{
    //     type: 'geojson',
    //     data:'../data/GRSM_TRAILHEADS.geojson'
    // }), 
    // map.addLayer({
    //     id: 'trailheads',
    //     type: 'circle',
    //     source: 'trailheads',
    //     paint: {
    //         'circle-radius': 5,
    //         'circle-color': 'blue'
    //     }
    // })
//Add GeoJSON lines with simple lines
    map.addSource('trails',{
        type: 'geojson',
        data:'../data/GRSM_TRAILS.geojson',
        generateId: true //Add ids to each feature
    })
    map.addLayer({
        id: 'trails',
        type: 'line',
        source: 'trails',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
            },
        paint: {
            'line-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], //Ajust color based on hover state
                '#fbb03b','#7e9480',
            ],
            'line-width': 4
            },
        
    })
    map.addLayer({
        id: 'trails_click',
        type: 'line',
        source: 'trails',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
            },
        paint: {
            'line-color': '#264a2a',
            'line-width': 4
            },
        filter: ['==', ['get','TRAILNAME'],''] //Only show matching filtered objects, '' means display none
    })
});


//Use fetch to get local or third-party API GeoJSONs
//Especially when you need to make adjusts to them, like add custom markers
fetch('data/GRSM_TRAILHEADS.geojson')
    .then(response => response.json())
    .then(data => createMarker(data))
    .catch(error => console.log(error));

//Event listener for clicks on trails layer
map.on('click', 'trails', (e)=>{
        // Get details of the clicked feature
        const coordinates = e.features[0].geometry.coordinates[0];
        const description = e.features[0].properties.TRAILNAME;
        const objectIdentifier = e.features[0].properties.OBJECTID;
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        //Set the filter on the hidden trails layer to show
        map.setFilter('trails_click',['==', ['get','TRAILNAME'], description])

        //Find the midpoint of the line to show the popup from
        let midpoint = getMidPointOfLine(e.features[0].geometry.coordinates);
        
        //Add a popup
        new mapboxgl.Popup()
        .setLngLat(midpoint)
        .setHTML(description)
        .addTo(map);
})

// Create a popup for hover state, but don't add it to the map yet.
const hoverpopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: true,
});

// Listen for the mouse move over trails layer
// Change the cursor to a pointer
// Update the feature state for hover effect and add popup
map.on('mousemove', 'trails', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    if (e.features.length > 0) {
        if (hoveredStateId !== null) {
            map.setFeatureState(
            { source: 'trails', id: hoveredStateId },
            { hover: false }
            );
        }
        hoveredStateId = e.features[0].id;
        map.setFeatureState(
            { source: 'trails', id: hoveredStateId },
            { hover: true }
        );
        let midpoint = getMidPointOfLine(e.features[0].geometry.coordinates);
        const description = e.features[0].properties.TRAILNAME;
        hoverpopup
            .setLngLat(midpoint)
            .setHTML(description)
            .addTo(map);
        }
    });
     
// Change it back to a pointer when it leaves
// Update hover state to false and remove popup
map.on('mouseleave', 'trails', () => {
    map.getCanvas().style.cursor = '';
    if (hoveredStateId !== null) {
            map.setFeatureState(
            { source: 'trails', id: hoveredStateId },
            { hover: false }
            );
        }
    hoveredStateId = null;
    hoverpopup.remove
});
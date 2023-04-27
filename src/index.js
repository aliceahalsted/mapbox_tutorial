import mapboxgl from 'mapbox-gl';
import './main.css';

// TO MAKE THE MAP APPEAR YOU MUST ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com 
mapboxgl.accessToken = 'pk.eyJ1IjoiYXplbGVzbnkiLCJhIjoiY2lnd2ZseDM3MHM5Nnd3bTByNHM5ZnJuciJ9.hDxZyIRHVpCtLWgMFbeBPA';
const map = new mapboxgl.Map({
    container: 'map', // container ID to match the html
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-83.5, 35.5], // starting position [lng, lat]
    zoom: 9, // starting zoom, higher is more zoomed in
    customAttribution: 'Alicea Halsted' //Attribute your work and your data
});


//Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
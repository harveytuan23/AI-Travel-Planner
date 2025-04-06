import React, { useEffect, useRef } from 'react';
import { loadGoogleMapsApi } from '../utils/loadGoogleMapsApi';
import { parseLatLngLocationString } from '../utils/locationParser';

const Map = ({ locationString, mapInstance }) => {  
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => {
        if (!mapRef.current) return;
  
        // ✅ use the ref passed in
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 44.5645, lng: -123.2757050 },
          zoom: 12,
        });
  
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(mapInstance.current);
      })
      .catch((err) => {
        console.error('⚠️ Google Maps load failed:', err);
      });
  }, []);
  

  useEffect(() => {
    if (!locationString || !mapInstance.current) {
      console.log("❌ map is not ready", locationString, mapInstance.current);
      return;
    }
  
    const { google } = window;
  
    // remove the previous route or Marker
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
  
    // parse the location string
    const parts = locationString.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length === 1) {
      // only one place, show the Marker
      const [name, coord] = parts[0].split(':');
      const [lat, lng] = coord.split(',').map(Number);
  
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: name,
      });
  
      // move the center to the place
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(14);
  
      return; // not run the following to draw the line
    }
  
    try {
      // more than one place, draw the line
      const { origin, destination, waypoints } = parseLatLngLocationString(locationString);
  
      const directionsService = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer();
      directionsRendererRef.current = renderer;
      renderer.setMap(mapInstance.current);
  
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            renderer.setDirections(result);
          } else {
            console.error("❌ Google Directions failed:", status);
          }
        }
      );
    } catch (err) {
      console.warn("⚠️ parseLatLngLocationString failed:", err.message);
    }
  }, [locationString]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;
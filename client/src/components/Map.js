import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import './Map.css';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 44.5646, // Corvallis, OR, USA 
  lng: -123.2620
};

function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_API_KEY"  // api key need to change
  });

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // get current location
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Cannot get your location: ${error.message}`);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationError("Your browser does not support location features");
      setIsLocating(false);
    }
  }, []);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // when click on the map, add a marker
  const handleMapClick = (event) => {
    const newMarker = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      time: new Date()
    };
    setMarkers([...markers, newMarker]);
    setSelectedLocation(newMarker);
  };
  

  const relocateUser = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newCenter);
         
          if (map) {
            map.panTo(newCenter);
          }
          setIsLocating(false);
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Cannot get your location: ${error.message}`);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  return isLoaded ? (
    <div className="map-container">
      {isLocating && <div className="location-status">Locating your position...</div>}
      {locationError && (
        <div className="location-error">
          {locationError}
          <button onClick={relocateUser}>Retry</button>
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* user current location marker - fix google object reference */}
        <Marker
          position={center}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
          title="Your location"
        />
        
        {/* show all markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelectedLocation(marker)}
          />
        ))}
      </GoogleMap>
      
      <button className="my-location-button" onClick={relocateUser} disabled={isLocating}>
        {isLocating ? 'Locating...' : 'Back to my location'}
      </button>
      
      {selectedLocation && (
        <div className="location-info">
          <h3>Selected location</h3>
          <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
          <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
          <button onClick={() => {
            alert('Location added to trip plan!');
          }}>
            Add to trip plan
          </button>
        </div>
      )}
    </div>
  ) : <div>Loading...</div>;
}

export default Map; 
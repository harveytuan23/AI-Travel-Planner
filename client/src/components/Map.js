import React, { useEffect, useState, useRef } from 'react';

function Map() {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // 首先确保组件已挂载，然后再检查 Google Maps API
  useEffect(() => {
    // 等待DOM元素完全挂载
    const timer = setTimeout(() => {
      checkIfMapsLoaded();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const checkIfMapsLoaded = () => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
    } else {
     
      setTimeout(checkIfMapsLoaded, 100);
    }
  };
  
  // 在地图API加载完成并且DOM元素存在时初始化地图
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInitialized) {
      try {
        // Corvallis, OR, USA 的坐标
        const corvallisCoordinates = { 
          lat: 44.5646, 
          lng: -123.2620 
        };
        
        const map = new window.google.maps.Map(mapRef.current, {
          center: corvallisCoordinates, 
          zoom: 12,
          mapTypeControl: true,
          fullscreenControl: true,
          language: 'en',
          controlsNames: {
            mapTypeControl: true,
            streetViewControl: true
          }
        });
        new window.google.maps.Marker({
            position: corvallisCoordinates,
            map: map,
            title: 'Corvallis, OR, USA'
          });
       
        mapRef.current.mapInstance = map;
        setMapInitialized(true);
      } catch (error) {
        console.error("地图初始化错误:", error);
      }
    }
  }, [mapLoaded, mapInitialized]);
  
  useEffect(() => {
    console.log("Use Google Maps API Key:Success");
  }, []);
  
  return (
    <div className="map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!mapLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5'
        }}>
          Loading map...
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: mapLoaded ? 'visible' : 'hidden'
        }}
      ></div>
    </div>
  );
}

export default Map;

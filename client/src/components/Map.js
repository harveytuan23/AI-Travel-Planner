import React, { useEffect, useRef } from 'react';
import { loadGoogleMapsApi } from '../utils/loadGoogleMapsApi';
import { parseLocationString } from '../utils/locationParser';

const Map = ({ locationString, mapInstance }) => {  
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => {
        if (!mapRef.current) return;
  
        // ✅ 使用傳進來的 ref
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 44.5645, lng: -123.2757050 },
          zoom: 12,
        });
  
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(mapInstance.current);
      })
      .catch((err) => {
        console.error('Google Maps 載入失敗:', err);
      });
  }, []);
  

  useEffect(() => {
    if (!locationString || !directionsRendererRef.current) {
      console.log("❌ 尚未準備好畫線", locationString, directionsRendererRef.current);
      return;
    }
  
    console.log("📍 準備畫線，locationString =", locationString);
  
    try {
      const { origin, destination, waypoints } = parseLocationString(locationString);
      console.log("✅ 解析後：", { origin, destination, waypoints });
  
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            console.log("✅ 成功取得路線結果");
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error("❌ Google Directions 取得失敗:", status);
          }
        }
      );
    } catch (err) {
      console.warn("⚠️ parseLocationString 發生錯誤:", err.message);
    }
  }, [locationString]);
  

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;
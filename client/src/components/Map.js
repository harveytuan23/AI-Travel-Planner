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
    if (!locationString || !mapInstance.current) {
      console.log("❌ 尚未準備好地圖", locationString, mapInstance.current);
      return;
    }
  
    const { google } = window;
  
    // 移除先前的路線或 Marker
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
  
    // 解析點的字串格式
    const parts = locationString.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length === 1) {
      // 只有一個地點，顯示 Marker
      const [name, coord] = parts[0].split(':');
      const [lat, lng] = coord.split(',').map(Number);
  
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: name,
      });
  
      // 中心移到該地點
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(14);
  
      return; // ✅ 不跑下面畫線
    }
  
    try {
      // 多於一個點才畫路線
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
            console.error("❌ Google Directions 取得失敗:", status);
          }
        }
      );
    } catch (err) {
      console.warn("⚠️ parseLatLngLocationString 發生錯誤:", err.message);
    }
  }, [locationString]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;
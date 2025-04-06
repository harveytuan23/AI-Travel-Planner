import React, { useEffect, useRef } from "react";

const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // 確保 Google Maps SDK 已載入
    if (!window.google || !window.google.maps) {
      console.error("Google Maps SDK 未載入");
      return;
    }

    // 初始化地圖
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 25.033964, lng: 121.564472 }, // 台北101
      zoom: 13,
    });

    // 路線服務 & 畫線控制器
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // 規劃一條從台北101 → 中正紀念堂 → 士林夜市 的路線
    const request = {
      origin: "台北101",
      destination: "士林夜市",
      waypoints: [{ location: "中正紀念堂", stopover: true }],
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
      } else {
        console.error("路線繪製失敗：" + status);
      }
    });
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Map;

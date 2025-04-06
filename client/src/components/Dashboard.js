import React, { useState, useEffect, useRef } from 'react';
import Map from './Map';
import ChatInterface from './ChatInterface';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import PlaceCard from './PlaceCard';

function Dashboard() {
  const [dividerPosition1, setDividerPosition1] = useState(25);
  const [dividerPosition2, setDividerPosition2] = useState(65); 
  const [rawLocations, setRawLocations] = useState('');
  const divider1Ref = useRef(null);
  const divider2Ref = useRef(null);
  const dashboardRef = useRef(null);
  const username = localStorage.getItem('username') || 'User';
  const navigate = useNavigate();
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--divider1-position', `${dividerPosition1}%`);
    document.documentElement.style.setProperty('--divider2-position', `${dividerPosition2}%`);
  }, [dividerPosition1, dividerPosition2]);
  
  // 动态加载 Google Maps API
  useEffect(() => {
    // 检查是否已加载
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    
    const loadMapsAPI = () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setMapsLoaded(true);
        console.log('Google Maps API loaded successfully');
      };
      
      script.onerror = () => {
        console.error('Google Maps API loading failed');
      };
      
      document.head.appendChild(script);
    };
    
    loadMapsAPI();
    
    return () => {
    
    };
  }, []);

  const handleDivider1MouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleDivider1MouseMove);
    document.addEventListener('mouseup', handleDivider1MouseUp);
  };

  const handleDivider1MouseMove = (e) => {
    if (dashboardRef.current) {
      const dashboardRect = dashboardRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - dashboardRect.left) / dashboardRect.width) * 100;
      
      if (newPosition > 10 && newPosition < dividerPosition2 - 10) {
        setDividerPosition1(newPosition);
        document.documentElement.style.setProperty('--divider1-position', `${newPosition}%`);
      }
    }
  };

  const handleDivider1MouseUp = () => {
    document.removeEventListener('mousemove', handleDivider1MouseMove);
    document.removeEventListener('mouseup', handleDivider1MouseUp);
  };
  

  const handleDivider2MouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleDivider2MouseMove);
    document.addEventListener('mouseup', handleDivider2MouseUp);
  };

  const handleDivider2MouseMove = (e) => {
    if (dashboardRef.current) {
      const dashboardRect = dashboardRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - dashboardRect.left) / dashboardRect.width) * 100;
 
      if (newPosition > dividerPosition1 + 10 && newPosition < 90) {
        setDividerPosition2(newPosition);
        document.documentElement.style.setProperty('--divider2-position', `${newPosition}%`);
      }
    }
  };

  const handleDivider2MouseUp = () => {
    document.removeEventListener('mousemove', handleDivider2MouseMove);
    document.removeEventListener('mouseup', handleDivider2MouseUp);
  };

  const handleLogout = () => {
    // Implement the logout functionality
    console.log('Logging out');
    navigate('/login');
  };

  return (
    <div className="dashboard-container" ref={dashboardRef}>
      <div className="dashboard-header">
        <h1>Travel Plan</h1>
        <div style={{ flexGrow: 1 }}></div>
        <div className="user-section">
          <span className="username-display">{username}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="dashboard-body">
        {/* 地图部分 - 左侧 */}
        <div 
          className="map-section"
          style={{ 
            width: `${dividerPosition1}%` 
          }}
        >
          <Map locationString={rawLocations} />
        </div>
        
        {/* 第一个分隔线 */}
        <div 
          className="resize-divider"
          ref={divider1Ref}
          onMouseDown={handleDivider1MouseDown}
          style={{ left: `${dividerPosition1}%` }}
        >
          <div className="divider-handle"></div>
        </div>
        
        {/* 行程部分 - 中间 */}
        <div 
          className="itinerary-section"
          style={{ 
            width: `${dividerPosition2 - dividerPosition1 - 1}%`,
            left: `${dividerPosition1 + 1}%` 
          }}
        >
          <div className="itinerary-header">
            <h2>行程</h2>
          </div>
          
          <div className="itinerary-content">
            <div className="itinerary-tabs">
              <button className="tab-button active">总览</button>
            </div>
            
            <div className="day-container">
              <div className="day-header">
                <span className="day-label">第1天</span>
                <span className="day-date">4/5 (星期六)</span>
              </div>
              
              {rawLocations && rawLocations.split(';').map((item, idx) => {
              const [name, city] = item.trim().split('@');
              if (!name || !city) return null;
              return <PlaceCard key={idx} name={name.trim()} city={city.trim()} />;
            })}

            </div>
          </div>
        </div>
        
        {/* 第二个分隔线 */}
        <div 
          className="resize-divider"
          ref={divider2Ref}
          onMouseDown={handleDivider2MouseDown}
          style={{ left: `${dividerPosition2}%` }}
        >
          <div className="divider-handle"></div>
        </div>
        
        {/* 聊天部分 - 右侧 */}
        <div 
          className="chat-wrapper"
          style={{ 
            width: `${100 - dividerPosition2 - 1}%`,
            left: `${dividerPosition2 + 1}%` 
          }}
        >
          <ChatInterface onLocationsExtracted={setRawLocations} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 
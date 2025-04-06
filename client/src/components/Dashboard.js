import React, { useState, useEffect, useRef } from 'react';
import Map from './Map';
import ChatInterface from './ChatInterface';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import PlaceCard from './PlaceCard';
import DatePicker from 'react-datepicker';
import { fetchAllPlaceDetailsFromRawString } from '../utils/googlePlaceHelper';
import 'react-datepicker/dist/react-datepicker.css';

function Dashboard() {
  const [dividerPosition1, setDividerPosition1] = useState(25);
  const [dividerPosition2, setDividerPosition2] = useState(65); 
  const [rawLocations, setRawLocations] = useState('');
  const [locations, setLocations] = useState([]);
  const mapInstance = useRef(null);
  const divider1Ref = useRef(null);
  const divider2Ref = useRef(null);
  const dashboardRef = useRef(null);
  const username = localStorage.getItem('username') || 'User';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [days, setDays] = useState(3);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--divider1-position', `${dividerPosition1}%`);
    document.documentElement.style.setProperty('--divider2-position', `${dividerPosition2}%`);
  }, [dividerPosition1, dividerPosition2]);
  

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
  // need to change from api
  const recommendedPlaces = [
    { id: 1, name: "太平洋海岸公路", city: "加州" },
    { id: 2, name: "红杉国家公园", city: "加州" },
    { id: 3, name: "优胜美地国家公园", city: "加州" },
    { id: 4, name: "金门大桥", city: "旧金山" }
  ];

  const handleLocationsExtracted = async (locationStr) => {
    console.log('📥 收到 Groq 回傳：', locationStr);
  
    // ✅ 先儲存原始字串，給地圖畫線用
    setRawLocations(locationStr);
  
    // ✅ 再查詢詳細地點資訊
    if (!mapInstance.current) {
      console.error("❌ 地圖尚未準備好");
      return;
    }
  
    try {
      const details = await fetchAllPlaceDetailsFromRawString(locationStr, mapInstance.current);
      console.log('✅ 查詢結果：', details);
      setLocations(details); // 顯示卡片用
    } catch (err) {
      console.error('❌ 查詢失敗：', err);
    }
  };  

  const handleAddDay = () => {
    setDays(prev => prev + 1);
    setSelectedDay(days + 1);
  };

  const handleDecreaseDay = () => {
    if (days > 1) {
      setDays(prev => prev - 1);
      if (selectedDay > days - 1) {
        setSelectedDay(days - 1);
      }
    }
  };

  const handleDayChange = (e) => {
    const value = e.target.value;
    if (value === 'add') {
      handleAddDay();
    } else if (value === 'decrease') {
      handleDecreaseDay();
    } else {
      setSelectedDay(parseInt(value));
    }
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    setIsCalendarOpen(false);
  };

  const formatDate = (date, dayOffset = 0) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + dayOffset);
    
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[newDate.getDay()];
    
    return `${month}/${day} (${weekday})`;
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
           <Map locationString={rawLocations} mapInstance={mapInstance} />
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
        
        <div 
          className="itinerary-section"
          style={{ 
            width: `${dividerPosition2 - dividerPosition1 - 1}%`,
            left: `${dividerPosition1 + 1}%` 
          }}
        >
          
          <div className="itinerary-content">
            <div className="itinerary-tabs">
              <button 
                className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                SCHEDULE
              </button>
              <button 
                className={`tab-button ${activeTab === 'recommend' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommend')}
              >
                RECOMMENDED
              </button>
            </div>
            
            {activeTab === 'schedule' && (
              <div className="day-container">
                <div className="day-header">
                  <div className="day-selector">
                    <select 
                      value={selectedDay} 
                      onChange={handleDayChange}
                      className="day-select"
                    >
                      {Array.from({ length: days }, (_, i) => (
                        <option key={i+1} value={i+1}>Day {i+1}</option>
                      ))}
                      <option value="add">+ Add day</option>
                    </select>
                  </div>
                  
                  <div 
                    className="calendar-icon" 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    title="Choose First Day"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    
                    {isCalendarOpen && (
                      <div className="date-picker-container">
                        <DatePicker
                          selected={startDate}
                          onChange={handleDateChange}
                          inline
                          calendarClassName="custom-calendar"
                        />
                      </div>
                    )}
                  </div>
                  
                  <span className="day-date">
                    {formatDate(startDate, selectedDay - 1)}
                  </span>
                </div>
                
                <div className="day-content">
                  {rawLocations && rawLocations.split(';').map((item, idx) => {
                    const [name, city] = item.trim().split('@');
                    if (!name || !city) return null;
                    return <PlaceCard key={idx} name={name.trim()} city={city.trim()} />;
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'recommend' && (
              <div className="recommend-container">
                <div className="recommendations">
                {rawLocations && rawLocations.split(';').map((item, idx) => {
                const [name, city] = item.trim().split('@');
                if (!name || !city) return null;
                return <PlaceCard key={idx} name={name.trim()} city={city.trim()} />;
              })}
                </div>
              </div>
            )}
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
          <ChatInterface onLocationsExtracted={handleLocationsExtracted} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 
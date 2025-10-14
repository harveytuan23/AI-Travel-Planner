import React, { useState, useEffect, useRef } from 'react';
import Map from './Map';
import ChatInterface from './ChatInterface';
import './Dashboard.css';
import PlaceCard from './PlaceCard';
import DatePicker from 'react-datepicker';
import { fetchAllPlaceDetailsFromRawString } from '../utils/googlePlaceHelper';
import 'react-datepicker/dist/react-datepicker.css';

function Dashboard() {
  const [dividerPosition1, setDividerPosition1] = useState(25);
  const [dividerPosition2, setDividerPosition2] = useState(65); 

  const [locations, setLocations] = useState([]);
  const [driveInfo, setDriveInfo] = useState([]);
  const mapInstance = useRef(null);
  const divider1Ref = useRef(null);
  const divider2Ref = useRef(null);
  const dashboardRef = useRef(null);
  const username = 'User';
  const [activeTab, setActiveTab] = useState('schedule');
  const [days, setDays] = useState(3);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [currentDayLocationString, setCurrentDayLocationString] = useState('');

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

  // Logout functionality removed


  const handleLocationsExtracted = async (locationStr) => {
    console.log('📥 received from Groq:', locationStr);
  

    if (!mapInstance.current) {
      console.error("❌ map is not ready");
      return;
    }
  
    try {
      const details = await fetchAllPlaceDetailsFromRawString(locationStr, mapInstance.current);
      console.log('✅ query result:', details);
      setLocations(details);
    } catch (err) {
      console.error('❌ query failed:', err);
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

  const handleAddToSchedule = (place) => {
    console.log("try to add place to schedule:", place);
    
    // check if the place is already in the schedule
    const alreadyAdded = scheduleItems.some(item => 
      item.name === place.name && item.address === place.address && item.day === selectedDay
    );
    
    if (!alreadyAdded) {
      // add the new place to the current selected day schedule
      const newScheduleItems = [...scheduleItems, {
        ...place,
        day: selectedDay  // add the place to the current selected day
      }];
      
      setScheduleItems(newScheduleItems);
      updateMapLocations(newScheduleItems);

      // add this!
    fetchDurationsForSchedule(newScheduleItems).then((results) => {
      setDriveInfo(results);
      console.log("🚗 driving time for each segment:", results);
      // you can setState to store this information to display in the UI
    });
    
      console.log(`successfully add ${place.name} to the schedule of day ${selectedDay}`, place);
    } else {
      // the place is already in the schedule
      alert(`"${place.name}" already exists in the schedule!`);
    }
  };

  const fetchDurationsForSchedule = async (items) => {
    const currentDayItems = items.filter(item => item.day === selectedDay);
    const directionsService = new window.google.maps.DirectionsService();
    const results = [];
  
    for (let i = 0; i < currentDayItems.length - 1; i++) {
      const from = currentDayItems[i];
      const to = currentDayItems[i + 1];
  
      if (!from.location || !to.location) continue;
  
      const request = {
        origin: from.location,
        destination: to.location,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };
  
      try {
        const result = await new Promise((resolve, reject) => {
          directionsService.route(request, (res, status) => {
            if (status === 'OK') {
              resolve(res);
            } else {
              reject(status);
            }
          });
        });
  
        const leg = result.routes[0].legs[0];
        results.push({
          from: from.name,
          to: to.name,
          duration: leg.duration.text,
          distance: leg.distance.text,
        });
      } catch (err) {
        console.warn(`query ${from.name} → ${to.name} failed:`, err);
      }
    }
  
    return results;
  };  

  const updateMapLocations = (items) => {
    // filter the places of the current selected day
    const currentDayItems = items.filter(item => item.day === selectedDay);
    
    if (currentDayItems.length === 0) {
      setCurrentDayLocationString('');
      return;
    }
    
    const locationString = currentDayItems
      .map(item => {
        if (item.location) {
          return `${item.name}:${item.location.lat},${item.location.lng}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('|');
    
    console.log("update the location string immediately:", locationString);
    setTimeout(() => {
      setCurrentDayLocationString(locationString);
    }, 100); // delay 100ms to ensure the map is ready
  };

  const handleRemoveFromSchedule = (placeToRemove) => {
    setScheduleItems(prevItems => {
      const newItems = prevItems.filter(item => 
        !(item.name === placeToRemove.name && item.address === placeToRemove.address)
      );
      updateMapLocations(newItems);
      
      
      return newItems;
    });
  };


  useEffect(() => {
    updateMapLocations(scheduleItems);
  }, []);

  useEffect(() => {
    updateMapLocations(scheduleItems);
  }, [selectedDay, scheduleItems]);

  return (
    <div className="dashboard-container" ref={dashboardRef}>
      <div className="dashboard-header">
        <h1>AI Travel Planner</h1>
        <div style={{ flexGrow: 1 }}></div>
        <div className="user-section">
          <span className="username-display">{username}</span>
        </div>
      </div>
      
      <div className="dashboard-body">
        {/* map section - left */}
        <div 
          className="map-section"
          style={{ 
            width: `${dividerPosition1}%` 
          }}
        >
           <Map 
             key={`map-${scheduleItems.length}-${selectedDay}`}
             locationString={currentDayLocationString} 
             mapInstance={mapInstance} 
             scheduleItems={scheduleItems}
             selectedDay={selectedDay}
           />
        </div>
        
        {/* first divider */}
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
                      {days > 1 && <option value="decrease">- Remove day</option>}
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
                  {scheduleItems
                    .filter(item => item.day === selectedDay)
                    .reduce((acc, item, idx, arr) => {
                      acc.push(
                        <PlaceCard 
                          key={`place-${idx}`}
                          name={item.name} 
                          address={item.address}
                          rating={item.rating}
                          phone={item.phone}
                          url={item.url}
                          location={item.location}
                          onRemoveFromSchedule={handleRemoveFromSchedule}
                          isInSchedule={true}
                          index={String.fromCharCode(65 + idx)} // A, B, C...
                          viewType="schedule"
                        />
                      );

                      // insert driving time (except the last point)
                      if (idx < arr.length - 1) {
                        acc.push(
                          <div className="drive-info" key={`drive-${idx}`}>
                            🚗 Driving time: {
                              driveInfo[idx] 
                                ? `${driveInfo[idx].duration}（${driveInfo[idx].distance}）` 
                                : 'Loading...'
                            }
                          </div>
                        );
                      }

                      return acc;
                    }, [])
                  }
                </div>
              </div>
            )}
            
            {activeTab === 'recommend' && (
              <div className="recommend-container">
                <div className="recommendations">
                  {locations.map((place, idx) => {  
                    const isInSchedule = scheduleItems.some(item => 
                      item.name === place.name && item.address === place.address
                    );
                    
                    return (
                      <PlaceCard 
                        key={idx} 
                        name={place.name} 
                        address={place.address}
                        rating={place.rating}
                        phone={place.phone}
                        url={place.url}
                        location={place.location}
                        onAddToSchedule={handleAddToSchedule}
                        isInSchedule={isInSchedule}
                        viewType="recommend"
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* second divider */}
        <div 
          className="resize-divider"
          ref={divider2Ref}
          onMouseDown={handleDivider2MouseDown}
          style={{ left: `${dividerPosition2}%` }}
        >
          <div className="divider-handle"></div>
        </div>
        
        {/* chat section - right */}
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
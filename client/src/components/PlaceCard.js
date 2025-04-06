// src/components/PlaceCard.js
import React from 'react';
import './PlaceCard.css';

function PlaceCard({ name, city, address, rating, phone, url, location, onAddToSchedule, onRemoveFromSchedule, isInSchedule, index, viewType }) {
  // viewType 可以是 'schedule' 或 'recommend'
  const cardClassName = `place-card ${viewType === 'schedule' ? 'schedule-card' : 'recommend-card'}`;
  
  return (
    <div className={cardClassName}>
      {/* 根据是否在行程中显示不同的按钮 */}
      {onAddToSchedule && !isInSchedule && (
        <button 
          className="add-to-schedule-btn" 
          onClick={() => onAddToSchedule({ name, city, address, rating, phone, url, location })}
          title="Add to schedule"
        >
          +
        </button>
      )}
      
      {onRemoveFromSchedule && isInSchedule && (
        <button 
          className="remove-from-schedule-btn" 
          onClick={() => onRemoveFromSchedule({ name, address })}
          title="Delete from schedule"
        >
          -
        </button>
      )}
      
      <h3 className="place-name">
        {index && (
            <span className="place-index">
            {index}. {/* 直接顯示 A / B / C */}
            </span>
        )}
        {name}
      </h3>

      
      {city && <p className="place-city">{city}</p>}
      
      {address && <p className="place-address">
        <span className="info-label">Address：</span>{address}
      </p>}
      
      {rating && <p className="place-rating">
        <span className="info-label">Rating：</span>{rating} ⭐
      </p>}
      
      {phone && <p className="place-phone">
        <span className="info-label">Phone：</span>{phone}
      </p>}
      
      {url && <p className="place-url">
        <a href={url} target="_blank" rel="noopener noreferrer">View Details</a>
      </p>}
    </div>
  );
}

export default PlaceCard;

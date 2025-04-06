// src/components/PlaceCard.js
import React from 'react';
import './PlaceCard.css';

function PlaceCard({ name, city }) {
  return (
    <div className="place-card">
      <h3 className="place-name">📍 {name}</h3>
      <p className="place-city">🏙️ {city}</p>
    </div>
  );
}

export default PlaceCard;

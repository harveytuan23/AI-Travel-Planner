import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

require('dotenv').config({ path: '../.env' });

App.get('/', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  res.render('index.html', { 
    googleMapsApiKey: apiKey 
  });
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

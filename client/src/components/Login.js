import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
import './Login.css';
import axios from 'axios';

require('dotenv').config({ path: '../.env' });

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const server_port = process.env.SERVER_PORT;
      console.log('Sending login request to:', 'http://localhost:'+server_port+'/api/auth/login');
      
      const response = await axios.post('http://localhost:'+server_port+'/api/auth/login', {
        username,
        password
      });
      
      console.log('Response received:', {
        status: response.status,
        data: response.data
      });
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Successful response status:', response.status);
        console.log('Response data:', response.data);
        
        // Store username or any other data if available
        if (response.data.username) {
          localStorage.setItem('username', response.data.username);
          console.log('Username stored in localStorage:', response.data.username);
        }
        
        // Display success message if available
        const message = response.data.message || 'Login successful';
        console.log('Success message:', message);
        alert(message);
        
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.warn('Unexpected status code:', response.status);
        setError(`Request returned a non-success status code: ${response.status}`);
      }
    } catch (error) {
      console.error('Login request error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
        setError(error.response.data.message || `Request failed (${error.response.status})`);
      } else if (error.request) {
        console.error('No response received. Request details:', error.request);
        setError('Server did not respond, please check network or server status');
      } else {
        console.error('Request configuration error:', error.message);
        setError('Request error: ' + error.message);
      }
    } finally {
      console.log('Request handling completed, loading state set to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Travel Planer</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Login/Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 
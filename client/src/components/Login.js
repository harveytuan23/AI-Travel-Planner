import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const server_port = process.env.REACT_APP_SERVER_PORT || '3001';

  const handleSubmit = async (action) => {

    setError('');
    setSuccess('');
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = action === 'register' 
        ? '/api/auth/register' 
        : '/api/auth/login';
      
      const response = await axios.post(
        `http://localhost:${server_port}${endpoint}`, 
        { username, password }
      );

      if (action === 'register' && response.data.message === 'Register success') {
        setSuccess('Registration successful ! You can now log in.');
        setPassword('');
        setLoading(false);
        return;
      }
      localStorage.setItem('username', username);
      console.log('response', response);
      
      navigate('/dashboard');

    } catch (err) {
      let errorMessage;
      errorMessage = err.response?.data?.error;
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Travel Planner</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="buttons-container">
          <button 
            className="register-btn"
            onClick={() => handleSubmit('register')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
          <button 
            className="login-btn"
            onClick={() => handleSubmit('login')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Login'}
          </button>
          
          
        </div>
      </div>
    </div>
  );
}

export default Login; 
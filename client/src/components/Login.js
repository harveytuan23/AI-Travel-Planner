import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // 不验证用户名和密码，直接设置一个假的token并跳转
    localStorage.setItem('token', 'dummy-token');
    
    // 短暂延迟模拟加载
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };
  //   try {
  //     const response = await fetch('/api/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(credentials),
  //     });
      
  //     const data = await response.json();
      
  //     if (response.ok) {
  //       // Login successful, save token and redirect
  //       localStorage.setItem('token', data.token);
  //       window.location.href = '/dashboard';
  //     } else {
  //       setError(data.message || 'Login failed');
  //     }
  //   } catch (err) {
  //     setError('Server error, please try again later');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 
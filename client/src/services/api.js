import axios from 'axios';
//require('dotenv').config({ path: '../.env' });

const server_port = process.env.REACT_APP_SERVER_PORT;

const api = axios.create({
  baseURL: 'http://localhost:'+server_port+'/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 
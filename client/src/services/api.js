import axios from 'axios';

// 檢測是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';
const server_port = process.env.REACT_APP_SERVER_PORT || 3001;

// 根據環境設定API基礎URL
const getBaseURL = () => {
  if (isProduction) {
    // 生產環境使用相對路徑，由Nginx代理處理
    return '/api';
  } else {
    // 開發環境直接連接到後端服務器
    return `http://localhost:${server_port}/api`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
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
// PM2 配置檔案 - AI Travel Planner
module.exports = {
  apps: [{
    name: 'ai-travel-planner-backend',
    script: './index.js',
    cwd: '/opt/ai-travel-planner/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    env: {
      NODE_ENV: 'production',
      SERVER_PORT: 3001,
      CLIENT_PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      SERVER_PORT: 3001,
      CLIENT_PORT: 3000
    },
    error_file: '/var/log/ai-travel-planner/error.log',
    out_file: '/var/log/ai-travel-planner/out.log',
    log_file: '/var/log/ai-travel-planner/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // 健康檢查
    health_check_grace_period: 3000,
    // 進程監控
    monitoring: true,
    // 自動重啟設定
    autorestart: true,
    // 忽略監聽的檔案
    ignore_watch: [
      'node_modules',
      'logs',
      '*.log',
      '.git'
    ]
  }]
};

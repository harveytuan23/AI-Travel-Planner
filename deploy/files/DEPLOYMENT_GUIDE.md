# AWS 部署指南

## 部署步驟

### 1. 上傳檔案到EC2
```bash
scp -r deploy/files/* ec2-user@your-ec2-ip:/opt/ai-travel-planner/
```

### 2. 在EC2上設定環境
```bash
# 連接到EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 進入應用程式目錄
cd /opt/ai-travel-planner/backend

# 安裝依賴
npm install --production

# 設定環境變數（如果需要修改）
sudo nano .env
```

### 3. 啟動應用程式
```bash
# 使用PM2啟動（推薦）
./start-pm2.sh

# 或使用簡單啟動
./start.sh
```

### 4. 設定Nginx
```bash
# 複製Nginx配置
sudo cp nginx.conf /etc/nginx/conf.d/ai-travel-planner.conf

# 測試配置
sudo nginx -t

# 重載Nginx
sudo systemctl reload nginx
```

### 5. 檢查狀態
```bash
# 檢查PM2狀態
pm2 status

# 檢查應用程式日誌
pm2 logs ai-travel-planner-backend

# 檢查Nginx狀態
sudo systemctl status nginx
```

## 故障排除

### 應用程式無法啟動
```bash
# 檢查日誌
pm2 logs ai-travel-planner-backend

# 重啟應用程式
./restart.sh
```

### Nginx錯誤
```bash
# 檢查Nginx配置
sudo nginx -t

# 檢查錯誤日誌
sudo tail -f /var/log/nginx/error.log
```

### 端口衝突
```bash
# 檢查端口使用情況
sudo netstat -tlnp | grep :3001
```

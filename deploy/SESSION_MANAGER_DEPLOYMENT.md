# 🔗 使用 Session Manager 部署指南

## 📋 概述

如果你已經使用 AWS Session Manager 連接到 EC2 實例，我們可以跳過 SSH 金鑰的設定，直接進行部署。

## 🎯 快速開始

### 1. 準備環境變數

在專案根目錄創建 `.env` 檔案：

```bash
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Groq API Key  
GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
SERVER_PORT=3001
CLIENT_PORT=3000
NODE_ENV=production
```

### 2. 準備部署檔案

```bash
# 執行部署準備腳本
./deploy/aws-deploy.sh
```

### 3. 連接到 EC2

```bash
# 使用 Session Manager 連接到 EC2
aws ssm start-session --target your-instance-id
```

## 🛠️ 部署步驟

### 步驟 1: 初始化 EC2 實例

在 Session Manager 終端中執行：

```bash
# 更新系統
sudo yum update -y

# 安裝 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 安裝 PM2
npm install -g pm2

# 安裝 Nginx
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 創建應用程式目錄
sudo mkdir -p /opt/ai-travel-planner
sudo chown -R ec2-user:ec2-user /opt/ai-travel-planner

# 設定防火牆
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步驟 2: 上傳應用程式檔案

#### 方法一：使用 SCP 隧道（推薦）

1. **建立隧道**（在新的終端中）：
```bash
aws ssm start-session \
    --target your-instance-id \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters '{"host":["localhost"],"portNumber":["22"],"localPortNumber":["2222"]}'
```

2. **上傳檔案**（在另一個終端中）：
```bash
# 設定 SSH 配置
echo "Host ec2-tunnel
    HostName localhost
    Port 2222
    User ec2-user
    StrictHostKeyChecking no" >> ~/.ssh/config

# 上傳檔案
scp -r deploy/files/* ec2-tunnel:/opt/ai-travel-planner/
```

#### 方法二：手動複製檔案

1. **複製環境變數**：
```bash
# 在本地終端中
cat .env
```

2. **在 Session Manager 中創建環境變數檔案**：
```bash
# 在 EC2 上
cd /opt/ai-travel-planner/backend
nano .env
# 貼上環境變數內容並保存
```

3. **複製其他檔案**：
   - 將 `deploy/files/frontend/` 內容複製到 `/opt/ai-travel-planner/frontend/`
   - 將 `deploy/files/backend/` 內容複製到 `/opt/ai-travel-planner/backend/`

### 步驟 3: 安裝依賴並啟動

```bash
# 進入後端目錄
cd /opt/ai-travel-planner/backend

# 安裝依賴
npm install --production

# 設定檔案權限
chmod +x *.sh

# 啟動應用程式
./start-pm2.sh
```

### 步驟 4: 設定 Nginx

```bash
# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/conf.d/ai-travel-planner.conf

# 測試配置
sudo nginx -t

# 重載 Nginx
sudo systemctl reload nginx
```

### 步驟 5: 驗證部署

```bash
# 檢查 PM2 狀態
pm2 status

# 檢查 Nginx 狀態
sudo systemctl status nginx

# 測試後端 API
curl http://localhost:3001/

# 測試前端
curl http://localhost/
```

## 🔧 管理命令

### 連接到 EC2
```bash
aws ssm start-session --target your-instance-id
```

### 檢查應用程式狀態
```bash
pm2 status
pm2 logs ai-travel-planner-backend
```

### 重啟應用程式
```bash
./restart.sh
```

### 停止應用程式
```bash
./stop.sh
```

## 🌐 訪問應用程式

在瀏覽器中訪問：
```
http://your-ec2-public-ip
```

## 🔍 故障排除

### 常見問題

1. **應用程式無法啟動**
   ```bash
   # 檢查日誌
   pm2 logs ai-travel-planner-backend
   
   # 檢查環境變數
   cat /opt/ai-travel-planner/backend/.env
   ```

2. **Nginx 錯誤**
   ```bash
   # 檢查配置
   sudo nginx -t
   
   # 檢查錯誤日誌
   sudo tail -f /var/log/nginx/error.log
   ```

3. **端口無法訪問**
   ```bash
   # 檢查安全群組設定
   # 確保開放 HTTP (80) 端口
   
   # 檢查防火牆
   sudo firewall-cmd --list-all
   ```

### 日誌位置

| 服務 | 日誌位置 |
|------|----------|
| PM2 | `/var/log/ai-travel-planner/` |
| Nginx | `/var/log/nginx/` |
| 應用程式 | `pm2 logs ai-travel-planner-backend` |

## 📞 支援

- **詳細文檔**: `deploy/README.md`
- **Session Manager 文檔**: [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)

## ✅ 檢查清單

- [ ] 環境變數檔案已創建
- [ ] 部署檔案已準備
- [ ] EC2 實例已初始化
- [ ] 應用程式檔案已上傳
- [ ] 依賴已安裝
- [ ] 應用程式已啟動
- [ ] Nginx 已配置
- [ ] 安全群組已開放 HTTP 端口
- [ ] 應用程式可正常訪問

---

**🎉 恭喜！你的 AI Travel Planner 現在已經通過 Session Manager 成功部署了！**

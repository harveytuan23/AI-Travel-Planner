# 🚀 AI Travel Planner - AWS 部署完整指南

## 📋 部署架構

```
Internet → EC2 (Nginx) → 前端 (React Build) + 後端 (Node.js + PM2)
```

## 🎯 快速開始

### 前置需求

- AWS 帳戶
- 已安裝的 AWS CLI (可選)
- Google Maps API Key
- Groq API Key
- SSH 金鑰對

### 環境變數準備

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

## 🛠️ 詳細部署步驟

### 第一步：AWS 資源準備

#### 1.1 創建 EC2 實例

1. **登入 AWS Console**
   - 前往 EC2 服務
   - 點擊 "Launch Instance"

2. **選擇 AMI**
   - 選擇 "Amazon Linux 2 AMI (HVM), SSD Volume Type"
   - 64-bit (x86)

3. **選擇實例類型**
   - 免費層：t2.micro (1 vCPU, 1 GB RAM)
   - 建議：t3.small (2 vCPU, 2 GB RAM)

4. **配置實例詳情**
   - 實例數量：1
   - 網路：選擇預設 VPC
   - 子網路：選擇預設子網路
   - 自動分配公有 IP：啟用

5. **添加儲存**
   - 根卷：8 GB (免費層) 或 20 GB (建議)
   - 卷類型：gp3

6. **配置安全群組**
   ```
   規則 1: SSH (22) - 來源: 你的 IP 地址
   規則 2: HTTP (80) - 來源: 0.0.0.0/0
   規則 3: HTTPS (443) - 來源: 0.0.0.0/0 (可選)
   ```

7. **選擇金鑰對**
   - 選擇現有金鑰對或創建新的
   - 下載 .pem 檔案並妥善保存

#### 1.2 獲取 EC2 資訊

```bash
# 記錄以下資訊：
EC2_PUBLIC_IP=你的EC2公網IP
EC2_KEY_PATH=你的金鑰檔案路徑
EC2_USERNAME=ec2-user
```

### 第二步：本地準備

#### 2.1 執行部署腳本

```bash
# 進入專案目錄
cd /path/to/AI-Travel-Planner

# 給腳本執行權限
chmod +x deploy/aws-deploy.sh

# 執行部署腳本
./deploy/aws-deploy.sh
```

腳本會自動：
- 檢查環境變數
- 建置前端應用程式
- 準備後端檔案
- 創建部署檔案包
- 生成部署說明

#### 2.2 檢查生成的檔案

```bash
# 檢查部署檔案
ls -la deploy/files/
```

應該包含：
- `frontend/` - React 建置檔案
- `backend/` - Node.js 後端檔案
- `nginx.conf` - Nginx 配置
- `pm2.config.js` - PM2 配置
- `start.sh`, `start-pm2.sh` - 啟動腳本
- `stop.sh`, `restart.sh` - 管理腳本
- `DEPLOYMENT_GUIDE.md` - 部署說明

### 第三步：EC2 初始化

#### 3.1 連接到 EC2

```bash
# 設定金鑰檔案權限
chmod 400 your-key.pem

# 連接到 EC2
ssh -i your-key.pem ec2-user@your-ec2-ip
```

#### 3.2 執行 EC2 設定腳本

```bash
# 上傳設定腳本到 EC2
scp -i your-key.pem deploy/ec2-setup.sh ec2-user@your-ec2-ip:~/

# 在 EC2 上執行設定腳本
ssh -i your-key.pem ec2-user@your-ec2-ip
chmod +x ec2-setup.sh
./ec2-setup.sh
```

腳本會自動安裝：
- Node.js 20 (透過 NVM)
- PM2 進程管理器
- Nginx 網頁服務器
- 必要工具 (git, unzip)
- 設定防火牆規則
- 創建應用程式目錄

### 第四步：部署應用程式

#### 4.1 上傳應用程式檔案

```bash
# 上傳所有部署檔案
scp -i your-key.pem -r deploy/files/* ec2-user@your-ec2-ip:/opt/ai-travel-planner/
```

#### 4.2 在 EC2 上設定應用程式

```bash
# 連接到 EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 進入應用程式目錄
cd /opt/ai-travel-planner/backend

# 安裝後端依賴
npm install --production

# 檢查環境變數
cat .env
```

#### 4.3 啟動應用程式

```bash
# 使用 PM2 啟動（推薦）
./start-pm2.sh

# 或使用簡單啟動
./start.sh
```

#### 4.4 設定 Nginx

```bash
# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/conf.d/ai-travel-planner.conf

# 測試 Nginx 配置
sudo nginx -t

# 重載 Nginx
sudo systemctl reload nginx
```

### 第五步：驗證部署

#### 5.1 檢查服務狀態

```bash
# 檢查 PM2 狀態
pm2 status

# 檢查應用程式日誌
pm2 logs ai-travel-planner-backend

# 檢查 Nginx 狀態
sudo systemctl status nginx

# 檢查端口監聽
sudo netstat -tlnp | grep :3001
```

#### 5.2 測試應用程式

```bash
# 測試後端 API
curl http://localhost:3001/

# 測試前端
curl http://localhost/
```

在瀏覽器中訪問 `http://your-ec2-ip` 應該能看到應用程式。

## 🔧 環境變數說明

### 必要變數

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Google Maps API 金鑰 | `AIzaSyBvOkBw...` |
| `GROQ_API_KEY` | Groq API 金鑰 | `gsk_...` |
| `SERVER_PORT` | 後端服務端口 | `3001` |
| `CLIENT_PORT` | 前端服務端口 | `3000` |
| `NODE_ENV` | 執行環境 | `production` |

### API 金鑰獲取

#### Google Maps API Key
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. 創建 API 金鑰
5. 設定應用程式限制（可選）

#### Groq API Key
1. 前往 [Groq Console](https://console.groq.com/)
2. 註冊帳戶
3. 創建 API 金鑰
4. 記錄金鑰供使用

## 💰 成本估算

### 免費層 (12個月)
- **EC2 t2.micro**: 免費
- **EBS 儲存 (8GB)**: 免費
- **資料傳輸**: 前 1GB 免費
- **總計**: $0/月

### 付費方案 (t3.small)
- **EC2 t3.small**: ~$15/月
- **EBS 儲存 (20GB)**: ~$2/月
- **資料傳輸**: ~$0.09/GB
- **總計**: ~$17-20/月

## 🔍 故障排除

### 常見問題

#### 1. 應用程式無法啟動

```bash
# 檢查 PM2 狀態
pm2 status

# 查看詳細日誌
pm2 logs ai-travel-planner-backend --lines 100

# 重啟應用程式
./restart.sh

# 檢查端口衝突
sudo netstat -tlnp | grep :3001
```

#### 2. Nginx 錯誤

```bash
# 檢查 Nginx 配置
sudo nginx -t

# 查看 Nginx 錯誤日誌
sudo tail -f /var/log/nginx/error.log

# 檢查 Nginx 狀態
sudo systemctl status nginx

# 重啟 Nginx
sudo systemctl restart nginx
```

#### 3. API 連接問題

```bash
# 檢查環境變數
cat /opt/ai-travel-planner/backend/.env

# 測試 API 金鑰
curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models

# 檢查 CORS 設定
# 查看 server/index.js 中的 CORS 配置
```

#### 4. 前端無法載入

```bash
# 檢查前端檔案
ls -la /opt/ai-travel-planner/frontend/

# 檢查 Nginx 配置
sudo nginx -t

# 查看 Nginx 訪問日誌
sudo tail -f /var/log/nginx/access.log
```

### 日誌位置

| 服務 | 日誌位置 |
|------|----------|
| PM2 | `/var/log/ai-travel-planner/` |
| Nginx 訪問 | `/var/log/nginx/access.log` |
| Nginx 錯誤 | `/var/log/nginx/error.log` |
| 應用程式 | `pm2 logs ai-travel-planner-backend` |

## 🚀 進階設定

### 1. 設定自訂域名

#### 使用 Route 53
1. 在 Route 53 創建託管區域
2. 添加 A 記錄指向 EC2 IP
3. 更新 Nginx 配置中的 `server_name`

#### 更新 Nginx 配置
```bash
sudo nano /etc/nginx/conf.d/ai-travel-planner.conf
# 修改 server_name 為你的域名
server_name your-domain.com www.your-domain.com;
```

### 2. SSL 證書設定

#### 使用 Let's Encrypt
```bash
# 安裝 Certbot
sudo yum install certbot python3-certbot-nginx -y

# 獲取證書
sudo certbot --nginx -d your-domain.com

# 設定自動續期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. 監控設定

#### 使用 PM2 監控
```bash
# 安裝 PM2 監控
pm2 install pm2-server-monit

# 查看監控面板
pm2 monit
```

#### 使用 CloudWatch (可選)
1. 在 EC2 上安裝 CloudWatch Agent
2. 設定自訂指標監控
3. 設定警報

### 4. 備份策略

#### 資料庫備份
```bash
# 創建備份腳本
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /opt/ai-travel-planner/backend/data.sqlite /opt/ai-travel-planner/backups/data_$DATE.sqlite
# 保留最近 7 天的備份
find /opt/ai-travel-planner/backups -name "data_*.sqlite" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# 設定定時備份
crontab -e
# 添加：0 2 * * * /opt/ai-travel-planner/backend/backup-db.sh
```

## 📞 支援與維護

### 日常維護

```bash
# 檢查系統狀態
pm2 status
sudo systemctl status nginx

# 更新系統
sudo yum update -y

# 清理日誌
pm2 flush
sudo journalctl --vacuum-time=7d
```

### 應用程式更新

```bash
# 停止應用程式
./stop.sh

# 上傳新版本
scp -i your-key.pem -r deploy/files/* ec2-user@your-ec2-ip:/opt/ai-travel-planner/

# 重新安裝依賴
cd /opt/ai-travel-planner/backend
npm install --production

# 啟動應用程式
./start-pm2.sh
```

### 效能優化

1. **啟用 Gzip 壓縮**
2. **設定適當的快取標頭**
3. **使用 CDN (CloudFront)**
4. **優化圖片和靜態資源**

## 🎉 完成！

恭喜！你已經成功將 AI Travel Planner 部署到 AWS。應用程式現在應該可以通過 `http://your-ec2-ip` 訪問。

### 下一步建議

1. **設定監控警報**
2. **實施備份策略**
3. **設定 SSL 證書**
4. **配置自訂域名**
5. **實施 CI/CD 流程**

如有任何問題，請檢查日誌檔案或參考故障排除章節。

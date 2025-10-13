# 🚀 AI Travel Planner - AWS 部署總結

## 📁 部署檔案結構

```
deploy/
├── README.md                 # 詳細部署指南
├── aws-deploy.sh            # 本地部署準備腳本
├── ec2-setup.sh             # EC2 初始化腳本
├── quick-deploy.sh          # 一鍵部署腳本
├── test-deployment.sh       # 部署配置測試腳本
├── pm2.config.js           # PM2 進程管理器配置
├── nginx.conf              # Nginx 網頁服務器配置
└── files/                  # 部署檔案目錄（執行腳本後生成）
    ├── frontend/           # React 建置檔案
    ├── backend/            # Node.js 後端檔案
    ├── start.sh            # 簡單啟動腳本
    ├── start-pm2.sh        # PM2 啟動腳本
    ├── stop.sh             # 停止腳本
    ├── restart.sh          # 重啟腳本
    ├── nginx.conf          # Nginx 配置
    ├── pm2.config.js       # PM2 配置
    └── DEPLOYMENT_GUIDE.md # 部署說明
```

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

### 2. 測試配置

```bash
# 測試部署配置
./deploy/test-deployment.sh
```

### 3. 選擇部署方式

#### 方式一：一鍵部署（推薦新手）

```bash
# 執行一鍵部署腳本
./deploy/quick-deploy.sh
```

腳本會引導你完成：
- 收集 EC2 資訊
- 準備部署檔案
- 初始化 EC2
- 部署應用程式
- 驗證部署

#### 方式二：手動部署（推薦進階用戶）

```bash
# 1. 準備部署檔案
./deploy/aws-deploy.sh

# 2. 初始化 EC2
scp -i your-key.pem deploy/ec2-setup.sh ec2-user@your-ec2-ip:~/
ssh -i your-key.pem ec2-user@your-ec2-ip "chmod +x ec2-setup.sh && ./ec2-setup.sh"

# 3. 上傳應用程式
scp -i your-key.pem -r deploy/files/* ec2-user@your-ec2-ip:/opt/ai-travel-planner/

# 4. 啟動應用程式
ssh -i your-key.pem ec2-user@your-ec2-ip
cd /opt/ai-travel-planner/backend
npm install --production
./start-pm2.sh
sudo cp nginx.conf /etc/nginx/conf.d/ai-travel-planner.conf
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 腳本說明

### 主要腳本

| 腳本名稱 | 用途 | 執行位置 |
|----------|------|----------|
| `test-deployment.sh` | 測試部署配置 | 本地 |
| `aws-deploy.sh` | 準備部署檔案 | 本地 |
| `ec2-setup.sh` | 初始化 EC2 | EC2 |
| `quick-deploy.sh` | 一鍵部署 | 本地 |

### 管理腳本（部署後在 EC2 上）

| 腳本名稱 | 用途 |
|----------|------|
| `start.sh` | 簡單啟動應用程式 |
| `start-pm2.sh` | 使用 PM2 啟動應用程式 |
| `stop.sh` | 停止應用程式 |
| `restart.sh` | 重啟應用程式 |

## 🌐 服務配置

### Nginx 配置

- **端口**: 80 (HTTP)
- **前端**: 靜態檔案服務
- **後端**: API 代理到 3001 端口
- **快取**: 靜態資源 1 年快取

### PM2 配置

- **進程管理**: 自動重啟
- **日誌**: 輪轉和壓縮
- **監控**: 記憶體和 CPU 監控
- **日誌位置**: `/var/log/ai-travel-planner/`

## 📊 部署架構

```
Internet
    ↓
EC2 Instance (Amazon Linux 2)
    ├── Nginx (Port 80) → 前端靜態檔案
    └── Node.js (Port 3001) → 後端 API
        ├── Express Server
        ├── SQLite Database
        └── Groq API Integration
```

## 🔍 故障排除

### 常見問題

1. **環境變數未設定**
   ```bash
   # 檢查 .env 檔案
   cat .env
   ```

2. **API 金鑰無效**
   ```bash
   # 測試 Groq API
   curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
   ```

3. **應用程式無法啟動**
   ```bash
   # 檢查 PM2 狀態
   pm2 status
   pm2 logs ai-travel-planner-backend
   ```

4. **Nginx 錯誤**
   ```bash
   # 檢查 Nginx 配置
   sudo nginx -t
   sudo systemctl status nginx
   ```

### 日誌位置

| 服務 | 日誌位置 |
|------|----------|
| PM2 | `/var/log/ai-travel-planner/` |
| Nginx | `/var/log/nginx/` |
| 系統 | `journalctl -u nginx` |

## 💰 成本估算

### 免費層 (12個月)
- **EC2 t2.micro**: 免費
- **EBS 儲存**: 免費
- **總計**: $0/月

### 付費方案
- **EC2 t3.small**: ~$15/月
- **EBS 儲存**: ~$2/月
- **總計**: ~$17/月

## 🚀 進階功能

### SSL 證書
```bash
# 安裝 Certbot
sudo yum install certbot python3-certbot-nginx -y

# 獲取證書
sudo certbot --nginx -d your-domain.com
```

### 域名設定
1. 在 Route 53 創建託管區域
2. 添加 A 記錄指向 EC2 IP
3. 更新 Nginx 配置

### 監控設定
```bash
# PM2 監控
pm2 install pm2-server-monit
pm2 monit
```

## 📞 支援

- **詳細文檔**: `deploy/README.md`
- **測試報告**: `deploy/deployment-test-report.txt`
- **故障排除**: 參考 `deploy/README.md` 故障排除章節

## ✅ 部署檢查清單

- [ ] 創建 `.env` 檔案並設定 API 金鑰
- [ ] 執行 `test-deployment.sh` 通過所有測試
- [ ] 準備 AWS EC2 實例
- [ ] 執行部署腳本
- [ ] 驗證應用程式正常運行
- [ ] 設定監控和備份（可選）
- [ ] 設定 SSL 證書（可選）

---

**🎉 恭喜！你的 AI Travel Planner 現在已經準備好在 AWS 上運行了！**

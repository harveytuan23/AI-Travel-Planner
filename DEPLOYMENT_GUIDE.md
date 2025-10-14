# 🚀 AI Travel Planner - 部署和使用指南

## 📋 系統要求

### 必要軟體
- **Node.js** (版本 16 或更高)
- **npm** (通常隨 Node.js 一起安裝)
- **Git** (用於克隆代碼)

### API Keys (必需)
- **Google Maps API Key** - 用於地圖和地點服務
- **Groq API Key** - 用於 AI 聊天功能

## 🔧 安裝步驟

### 1. 安裝 Node.js
```bash
# 檢查 Node.js 版本
node --version

# 如果沒有安裝，請到官網下載：
# https://nodejs.org/
```

### 2. 克隆專案
```bash
git clone <your-repository-url>
cd AI-Travel-Planner
```

### 3. 安裝依賴
```bash
# 安裝根目錄依賴
npm install

# 安裝客戶端依賴
cd client
npm install

# 安裝服務器依賴
cd ../server
npm install

# 回到根目錄
cd ..
```

### 4. 環境配置
創建 `.env` 文件在專案根目錄：

```env
# Google Maps API Key
# 獲取地址：https://developers.google.com/maps/documentation/javascript/get-api-key
REACT_APP_GOOGLE_MAPS_API_KEY=你的Google_Maps_API_Key

# Groq API Key
# 獲取地址：https://console.groq.com/
GROQ_API_KEY=你的Groq_API_Key

# Server Configuration
SERVER_PORT=3001
CLIENT_PORT=3000
REACT_APP_SERVER_PORT=3001
```

### 5. 獲取 API Keys

#### Google Maps API Key
1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. 創建 API Key 並設置限制

#### Groq API Key
1. 訪問 [Groq Console](https://console.groq.com/)
2. 註冊帳號
3. 創建新的 API Key
4. 複製 API Key 到 `.env` 文件

## 🚀 啟動應用

### 開發模式
```bash
# 同時啟動前端和後端
npm run start:dev

# 或者分別啟動
npm run start:server  # 啟動後端 (端口 3001)
npm run start:client  # 啟動前端 (端口 3000)
```

### 生產模式
```bash
# 構建前端
npm run build:client

# 啟動生產服務器
npm run build:prod
```

## 🌐 訪問應用

- **前端界面**: http://localhost:3000
- **後端 API**: http://localhost:3001

## 📱 使用指南

### 基本功能
1. **AI 聊天** - 在聊天框中輸入旅行需求
2. **地圖顯示** - 查看推薦的路線和景點
3. **行程管理** - 拖拽調整景點順序
4. **日期選擇** - 設置出發日期

### 使用範例
```
"I want to go to San Jose,CA from Los Angeles,CA"
"I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery."
```

## 🔧 故障排除

### 常見問題

#### 1. 端口被佔用
```bash
# 查看端口使用情況
lsof -i :3000
lsof -i :3001

# 關閉佔用端口的進程
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

#### 2. 依賴安裝失敗
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json

npm install
cd client && npm install
cd ../server && npm install
```

#### 3. API 請求失敗
- 檢查 API Keys 是否正確設置
- 確認 API Keys 有足夠的配額
- 檢查網路連接

#### 4. 地圖不顯示
- 確認 Google Maps API Key 正確
- 檢查瀏覽器控制台是否有錯誤
- 確認 API Key 已啟用必要的服務

## 📦 部署到生產環境

### 使用 PM2 (推薦)
```bash
# 安裝 PM2
npm install -g pm2

# 構建前端
npm run build:client

# 啟動服務器
pm2 start server/index.js --name "ai-travel-planner"

# 設置開機自啟
pm2 startup
pm2 save
```

### 使用 Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:client

EXPOSE 3001
CMD ["npm", "run", "start:server"]
```

## 🔒 安全注意事項

1. **不要提交 API Keys** - `.env` 文件已在 `.gitignore` 中
2. **設置 API 限制** - 在 Google Cloud Console 中設置 API Key 限制
3. **使用 HTTPS** - 生產環境必須使用 HTTPS
4. **定期更新依賴** - 運行 `npm audit` 檢查安全漏洞

## 📞 支援

如果遇到問題，請：
1. 檢查本指南的故障排除部分
2. 查看終端錯誤信息
3. 檢查瀏覽器開發者工具的控制台
4. 聯繫開發者

## 🎯 功能特色

- ✅ **無需登入** - 直接使用，無需註冊
- ✅ **AI 驅動** - 智能旅行規劃
- ✅ **實時地圖** - Google Maps 整合
- ✅ **拖拽編輯** - 直觀的行程調整
- ✅ **多日行程** - 支援多天旅行規劃
- ✅ **響應式設計** - 支援各種設備

---

**AI Travel Planner** - 讓 AI 為你的旅行增添智慧 ✈️🗺️

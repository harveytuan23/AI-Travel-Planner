# 🚀 AI Travel Planner - 快速開始

## ⚡ 5分鐘快速設置

### 1. 安裝 Node.js
- 下載並安裝 [Node.js](https://nodejs.org/) (版本 16+)
- 驗證安裝：`node --version`

### 2. 獲取 API Keys
**Google Maps API Key:**
- 訪問 [Google Cloud Console](https://console.cloud.google.com/)
- 啟用：Maps JavaScript API, Places API, Directions API
- 創建 API Key

**Groq API Key:**
- 訪問 [Groq Console](https://console.groq.com/)
- 註冊並創建 API Key

### 3. 設置專案
```bash
# 克隆專案
git clone <your-repo-url>
cd AI-Travel-Planner

# 創建環境文件
cp .env.example .env
# 編輯 .env 文件，添加你的 API Keys
```

### 4. 安裝並啟動
```bash
# 安裝依賴
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 啟動應用
npm run start:dev
```

### 5. 開始使用
- 打開瀏覽器訪問：http://localhost:3000
- 在聊天框輸入：`"I want to go to San Jose,CA from Los Angeles,CA"`
- 享受 AI 旅行規劃！

## 🔧 環境變數設置

在 `.env` 文件中設置：
```env
REACT_APP_GOOGLE_MAPS_API_KEY=你的Google_Maps_API_Key
GROQ_API_KEY=你的Groq_API_Key
SERVER_PORT=3001
CLIENT_PORT=3000
REACT_APP_SERVER_PORT=3001
```

## ❗ 常見問題

**端口被佔用？**
```bash
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

**依賴安裝失敗？**
```bash
rm -rf node_modules package-lock.json
npm install
```

**地圖不顯示？**
- 檢查 Google Maps API Key
- 確認 API 已啟用必要服務

## 📱 使用範例

```
"I want to go to San Jose,CA from Los Angeles,CA"
"I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery."
"Plan a 3-day trip from New York to Boston"
```

---
**需要幫助？** 查看完整的 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

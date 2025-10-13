# 📤 上傳檔案到 EC2 的步驟

## 方法一：使用 SCP (如果有本地終端)

```bash
# 從本地電腦上傳檔案
scp -r deploy/files/* ec2-user@your-ec2-ip:/opt/ai-travel-planner/
```

## 方法二：使用瀏覽器終端 (推薦)

### 1. 創建後端 package.json

在 EC2 終端中執行：

```bash
cat > /opt/ai-travel-planner/backend/package.json << 'EOF'
{
    "scripts": {
        "start": "nodemon index.js",
        "dev": "nodemon index.js"
    },
    "dependencies": {
        "axios": "^1.8.4",
        "better-sqlite3": "^11.9.1",
        "cors": "^2.8.5",
        "dotenv": "^16.4.7",
        "express": "^4.21.2"
    },
    "devDependencies": {
        "nodemon": "^3.1.0"
    }
}
EOF
```

### 2. 創建環境變數檔案

```bash
cat > /opt/ai-travel-planner/backend/.env << 'EOF'
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Groq API Key
GROQ_API_KEY=your_groq_api_key

# Server Configuration
SERVER_PORT=3001
CLIENT_PORT=3000
NODE_ENV=production
EOF
```

### 3. 安裝後端依賴

```bash
cd /opt/ai-travel-planner/backend
npm install
```

## 方法三：使用 Git (最簡單)

```bash
# 在 EC2 中克隆你的 GitHub 倉庫
cd /opt/ai-travel-planner
git clone https://github.com/harveytuan23/AI-Travel-Planner.git .

# 安裝依賴
cd backend
npm install --production

cd ../client
npm install
npm run build
```

### 4. 設定環境變數

```bash
# 編輯環境變數
nano /opt/ai-travel-planner/backend/.env
```

將以下內容填入：
```
REACT_APP_GOOGLE_MAPS_API_KEY=你的Google_Maps_API_金鑰
GROQ_API_KEY=你的Groq_API_金鑰
SERVER_PORT=3001
CLIENT_PORT=3000
NODE_ENV=production
```

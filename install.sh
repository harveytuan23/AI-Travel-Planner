#!/bin/bash

# AI Travel Planner - 自動安裝腳本
echo "🚀 AI Travel Planner - 自動安裝腳本"
echo "=================================="

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝"
    echo "請先安裝 Node.js: https://nodejs.org/"
    exit 1
fi

# 檢查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 版本過低 (需要 16+)"
    echo "當前版本: $(node --version)"
    exit 1
fi

echo "✅ Node.js 版本檢查通過: $(node --version)"

# 檢查是否存在 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件"
    echo "請創建 .env 文件並添加你的 API Keys:"
    echo ""
    echo "REACT_APP_GOOGLE_MAPS_API_KEY=你的Google_Maps_API_Key"
    echo "GROQ_API_KEY=你的Groq_API_Key"
    echo "SERVER_PORT=3001"
    echo "CLIENT_PORT=3000"
    echo "REACT_APP_SERVER_PORT=3001"
    echo ""
    read -p "按 Enter 繼續安裝依賴..."
fi

# 安裝根目錄依賴
echo "📦 安裝根目錄依賴..."
npm install

# 安裝客戶端依賴
echo "📦 安裝客戶端依賴..."
cd client
npm install
cd ..

# 安裝服務器依賴
echo "📦 安裝服務器依賴..."
cd server
npm install
cd ..

echo "✅ 所有依賴安裝完成！"
echo ""
echo "🚀 啟動應用:"
echo "npm run start:dev"
echo ""
echo "🌐 訪問地址:"
echo "前端: http://localhost:3000"
echo "後端: http://localhost:3001"
echo ""
echo "📖 詳細說明請查看:"
echo "- README.md"
echo "- QUICK_START.md"
echo "- DEPLOYMENT_GUIDE.md"

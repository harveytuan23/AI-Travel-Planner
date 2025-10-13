#!/bin/bash

# AWS AI Travel Planner 部署腳本
echo "🚀 開始部署 AI Travel Planner 到 AWS..."

# 設定變數
PROJECT_NAME="ai-travel-planner"
REGION="us-west-2"  # 可根據需要修改

# 顏色輸出函數
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[34m📦 $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

# 檢查必要的環境變數
check_env_vars() {
    print_info "檢查環境變數..."
    
    if [ ! -f ".env" ]; then
        print_error "找不到 .env 檔案！請先創建 .env 檔案並設定 API 金鑰"
        echo "範例 .env 檔案內容："
        echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key"
        echo "GROQ_API_KEY=your_groq_api_key"
        echo "SERVER_PORT=3001"
        echo "CLIENT_PORT=3000"
        echo "NODE_ENV=production"
        exit 1
    fi
    
    # 檢查必要的API金鑰
    source .env
    if [ -z "$REACT_APP_GOOGLE_MAPS_API_KEY" ] || [ -z "$GROQ_API_KEY" ]; then
        print_error "請在 .env 檔案中設定 REACT_APP_GOOGLE_MAPS_API_KEY 和 GROQ_API_KEY"
        exit 1
    fi
    
    print_success "環境變數檢查完成"
}

# 準備前端建置
build_frontend() {
    print_info "準備前端建置..."
    
    cd client
    
    # 檢查是否已安裝依賴
    if [ ! -d "node_modules" ]; then
        print_info "安裝前端依賴..."
        npm install
    fi
    
    # 建置前端
    print_info "建置前端應用程式..."
    npm run build
    
    if [ ! -d "build" ]; then
        print_error "前端建置失敗！"
        exit 1
    fi
    
    print_success "前端建置完成"
    cd ..
}

# 準備後端
prepare_backend() {
    print_info "準備後端..."
    
    cd server
    
    # 檢查是否已安裝依賴
    if [ ! -d "node_modules" ]; then
        print_info "安裝後端依賴..."
        npm install --production
    fi
    
    print_success "後端準備完成"
    cd ..
}

# 創建部署檔案
create_deployment_files() {
    print_info "創建部署檔案..."
    
    # 創建部署目錄
    rm -rf deploy/files
    mkdir -p deploy/files
    
    # 複製前端建置檔案
    print_info "複製前端建置檔案..."
    cp -r client/build deploy/files/frontend
    
    # 複製後端檔案
    print_info "複製後端檔案..."
    cp -r server deploy/files/backend
    
    # 複製環境變數檔案
    print_info "複製環境變數檔案..."
    cp .env deploy/files/backend/.env
    
    # 創建生產環境啟動腳本
    print_info "創建啟動腳本..."
    cat > deploy/files/start.sh << 'EOF'
#!/bin/bash
cd /opt/ai-travel-planner/backend
export NODE_ENV=production
npm start
EOF
    
    chmod +x deploy/files/start.sh
    
    # 創建PM2啟動腳本
    cat > deploy/files/start-pm2.sh << 'EOF'
#!/bin/bash
cd /opt/ai-travel-planner/backend
export NODE_ENV=production
pm2 start pm2.config.js
pm2 save
pm2 startup
EOF
    
    chmod +x deploy/files/start-pm2.sh
    
    # 創建停止腳本
    cat > deploy/files/stop.sh << 'EOF'
#!/bin/bash
pm2 stop ai-travel-planner-backend
pm2 delete ai-travel-planner-backend
EOF
    
    chmod +x deploy/files/stop.sh
    
    # 創建重啟腳本
    cat > deploy/files/restart.sh << 'EOF'
#!/bin/bash
cd /opt/ai-travel-planner/backend
pm2 restart ai-travel-planner-backend
EOF
    
    chmod +x deploy/files/restart.sh
    
    # 複製PM2配置檔案
    cp deploy/pm2.config.js deploy/files/
    
    # 複製Nginx配置檔案
    cp deploy/nginx.conf deploy/files/
    
    print_success "部署檔案準備完成"
}

# 創建部署說明檔案
create_deployment_guide() {
    print_info "創建部署說明檔案..."
    
    cat > deploy/files/DEPLOYMENT_GUIDE.md << 'EOF'
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
EOF
    
    print_success "部署說明檔案創建完成"
}

# 主執行流程
main() {
    echo "🎯 開始AWS部署準備..."
    echo ""
    
    check_env_vars
    build_frontend
    prepare_backend
    create_deployment_files
    create_deployment_guide
    
    echo ""
    print_success "所有部署檔案準備完成！"
    echo ""
    echo "📁 部署檔案位於: deploy/files/"
    echo ""
    echo "📋 下一步操作："
    echo "1. 將 deploy/files/ 目錄上傳到你的EC2實例"
    echo "2. 在EC2上執行 ec2-setup.sh 腳本"
    echo "3. 按照 DEPLOYMENT_GUIDE.md 的說明完成部署"
    echo ""
    echo "🔧 快速上傳命令："
    echo "scp -r deploy/files/* ec2-user@your-ec2-ip:/opt/ai-travel-planner/"
    echo ""
    echo "📖 詳細說明請參考 deploy/files/DEPLOYMENT_GUIDE.md"
}

# 執行主函數
main "$@"

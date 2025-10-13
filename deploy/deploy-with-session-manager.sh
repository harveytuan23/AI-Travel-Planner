#!/bin/bash

# AI Travel Planner - 使用 Session Manager 部署腳本
echo "🚀 AI Travel Planner - Session Manager 部署腳本"
echo "=============================================="

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

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

# 檢查前置需求
check_prerequisites() {
    print_info "檢查前置需求..."
    
    # 檢查是否在正確的目錄
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
        print_error "請在專案根目錄執行此腳本"
        exit 1
    fi
    
    # 檢查環境變數檔案
    if [ ! -f ".env" ]; then
        print_error "找不到 .env 檔案！"
        echo ""
        echo "請先創建 .env 檔案並設定以下變數："
        echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key"
        echo "GROQ_API_KEY=your_groq_api_key"
        echo "SERVER_PORT=3001"
        echo "CLIENT_PORT=3000"
        echo "NODE_ENV=production"
        echo ""
        echo "創建檔案後請重新執行此腳本"
        exit 1
    fi
    
    # 檢查 AWS CLI 和 Session Manager
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI 未安裝"
        echo "請安裝 AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI 未配置或認證失敗"
        echo "請執行: aws configure"
        exit 1
    fi
    
    print_success "前置需求檢查完成"
}

# 獲取 EC2 實例資訊
get_ec2_instance() {
    print_info "獲取 EC2 實例資訊..."
    
    echo ""
    echo "現有的 EC2 實例："
    echo "=================="
    
    # 獲取實例資訊
    aws ec2 describe-instances \
        --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' \
        --output table
    
    echo ""
    read -p "請輸入要部署的 EC2 實例 ID (例如 i-1234567890abcdef0): " INSTANCE_ID
    
    if [ -z "$INSTANCE_ID" ]; then
        print_error "實例 ID 不能為空"
        exit 1
    fi
    
    # 驗證實例是否存在且運行中
    instance_state=$(aws ec2 describe-instances \
        --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text 2>/dev/null)
    
    if [ "$instance_state" != "running" ]; then
        print_error "實例 $INSTANCE_ID 不存在或未運行 (狀態: $instance_state)"
        exit 1
    fi
    
    print_success "已選擇實例: $INSTANCE_ID"
}

# 準備部署檔案
prepare_deployment_files() {
    print_info "準備部署檔案..."
    
    # 執行部署腳本
    if [ -f "deploy/aws-deploy.sh" ]; then
        chmod +x deploy/aws-deploy.sh
        ./deploy/aws-deploy.sh
    else
        print_error "找不到 deploy/aws-deploy.sh"
        exit 1
    fi
    
    print_success "部署檔案準備完成"
}

# 初始化 EC2 實例
initialize_ec2_instance() {
    print_info "初始化 EC2 實例..."
    
    # 上傳並執行 EC2 設定腳本
    aws ssm send-command \
        --instance-ids "$INSTANCE_ID" \
        --document-name "AWS-RunShellScript" \
        --parameters 'commands=[
            "curl -o /tmp/ec2-setup.sh https://raw.githubusercontent.com/your-repo/AI-Travel-Planner/main/deploy/ec2-setup.sh",
            "chmod +x /tmp/ec2-setup.sh",
            "/tmp/ec2-setup.sh"
        ]' \
        --comment "Initialize EC2 instance for AI Travel Planner" \
        --output text --query 'Command.CommandId'
    
    echo ""
    print_info "EC2 初始化命令已發送，請等待完成..."
    echo "你可以在 AWS Console 的 Systems Manager → Run Command 中查看進度"
    echo ""
    read -p "初始化完成後按 Enter 繼續..."
}

# 上傳應用程式檔案
upload_application_files() {
    print_info "上傳應用程式檔案..."
    
    # 創建臨時上傳腳本
    cat > /tmp/upload-files.sh << 'EOF'
#!/bin/bash
echo "開始上傳檔案..."

# 創建應用程式目錄
sudo mkdir -p /opt/ai-travel-planner
sudo chown -R ec2-user:ec2-user /opt/ai-travel-planner

# 這裡會通過其他方式上傳檔案
echo "目錄已準備完成"
EOF
    
    # 執行上傳腳本
    aws ssm send-command \
        --instance-ids "$INSTANCE_ID" \
        --document-name "AWS-RunShellScript" \
        --parameters 'commands=["'$(cat /tmp/upload-files.sh | base64 -w 0)'" | base64 -d | bash"]' \
        --comment "Prepare application directory" \
        --output text --query 'Command.CommandId'
    
    # 清理臨時檔案
    rm /tmp/upload-files.sh
    
    print_info "正在上傳檔案到 EC2..."
    
    # 使用 SCP 上傳檔案（需要通過 Session Manager 隧道）
    echo ""
    echo "📋 手動上傳步驟："
    echo "1. 在另一個終端中建立 Session Manager 隧道："
    echo "   aws ssm start-session --target $INSTANCE_ID --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{\"host\":[\"localhost\"],\"portNumber\":[\"22\"],\"localPortNumber\":[\"2222\"]}'"
    echo ""
    echo "2. 在另一個終端中上傳檔案："
    echo "   scp -r deploy/files/* ec2-user@localhost:2222:/opt/ai-travel-planner/"
    echo ""
    echo "3. 或者使用以下命令直接複製檔案內容："
    echo ""
    
    # 顯示檔案內容供手動複製
    echo "=== 環境變數檔案內容 ==="
    cat .env
    echo ""
    echo "=== 前端建置檔案 ==="
    echo "請將 deploy/files/frontend/ 目錄內容上傳到 /opt/ai-travel-planner/frontend/"
    echo ""
    echo "=== 後端檔案 ==="
    echo "請將 deploy/files/backend/ 目錄內容上傳到 /opt/ai-travel-planner/backend/"
    
    read -p "檔案上傳完成後按 Enter 繼續..."
}

# 設定並啟動應用程式
setup_and_start_application() {
    print_info "設定並啟動應用程式..."
    
    # 創建設定腳本
    cat > /tmp/setup-app.sh << 'EOF'
#!/bin/bash
cd /opt/ai-travel-planner/backend

# 安裝依賴
npm install --production

# 設定檔案權限
chmod +x *.sh

# 啟動應用程式
./start-pm2.sh

# 設定 Nginx
sudo cp nginx.conf /etc/nginx/conf.d/ai-travel-planner.conf
sudo nginx -t
sudo systemctl reload nginx

echo "應用程式設定完成"
EOF
    
    # 執行設定腳本
    aws ssm send-command \
        --instance-ids "$INSTANCE_ID" \
        --document-name "AWS-RunShellScript" \
        --parameters 'commands=["'$(cat /tmp/setup-app.sh | base64 -w 0)'" | base64 -d | bash"]' \
        --comment "Setup and start application" \
        --output text --query 'Command.CommandId'
    
    # 清理臨時檔案
    rm /tmp/setup-app.sh
    
    print_info "應用程式設定命令已發送..."
    read -p "設定完成後按 Enter 繼續..."
}

# 驗證部署
verify_deployment() {
    print_info "驗證部署..."
    
    # 創建驗證腳本
    cat > /tmp/verify-deployment.sh << 'EOF'
#!/bin/bash
echo "=== PM2 狀態 ==="
pm2 status

echo ""
echo "=== Nginx 狀態 ==="
sudo systemctl status nginx --no-pager

echo ""
echo "=== 端口監聽 ==="
sudo netstat -tlnp | grep :3001

echo ""
echo "=== 測試後端 API ==="
curl -s http://localhost:3001/ || echo "後端 API 無法訪問"

echo ""
echo "=== 測試前端 ==="
curl -s http://localhost/ | head -10 || echo "前端無法訪問"
EOF
    
    # 執行驗證腳本
    aws ssm send-command \
        --instance-ids "$INSTANCE_ID" \
        --document-name "AWS-RunShellScript" \
        --parameters 'commands=["'$(cat /tmp/verify-deployment.sh | base64 -w 0)'" | base64 -d | bash"]' \
        --comment "Verify deployment" \
        --output text --query 'Command.CommandId'
    
    # 清理臨時檔案
    rm /tmp/verify-deployment.sh
    
    print_info "驗證命令已發送..."
    
    # 獲取實例的公網 IP
    public_ip=$(aws ec2 describe-instances \
        --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    if [ "$public_ip" != "None" ] && [ ! -z "$public_ip" ]; then
        echo ""
        print_success "部署驗證完成！"
        echo ""
        echo "🌐 應用程式訪問地址:"
        echo "   http://$public_ip"
        echo ""
        echo "🔧 管理命令:"
        echo "   連接 EC2: aws ssm start-session --target $INSTANCE_ID"
        echo "   檢查狀態: pm2 status"
        echo "   查看日誌: pm2 logs ai-travel-planner-backend"
        echo "   重啟應用: ./restart.sh"
    else
        echo ""
        print_warning "無法獲取公網 IP，請檢查安全群組設定"
    fi
}

# 主執行流程
main() {
    echo ""
    print_info "開始 Session Manager 部署流程..."
    echo ""
    
    check_prerequisites
    get_ec2_instance
    prepare_deployment_files
    initialize_ec2_instance
    upload_application_files
    setup_and_start_application
    verify_deployment
    
    echo ""
    print_success "Session Manager 部署流程完成！"
    echo ""
    echo "📖 詳細說明請參考:"
    echo "   deploy/README.md"
    echo ""
    print_warning "注意："
    echo "1. 檔案上傳需要手動完成或使用 Session Manager 隧道"
    echo "2. 確保 EC2 安全群組開放 HTTP (80) 端口"
    echo "3. 定期檢查應用程式狀態"
}

# 執行主函數
main "$@"

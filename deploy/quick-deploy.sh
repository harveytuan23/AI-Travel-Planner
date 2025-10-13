#!/bin/bash

# AI Travel Planner - 快速部署腳本
# 這個腳本會引導你完成整個AWS部署過程

echo "🚀 AI Travel Planner - AWS 快速部署腳本"
echo "================================================"

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

# 檢查必要的檔案
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
    
    print_success "前置需求檢查完成"
}

# 收集EC2資訊
collect_ec2_info() {
    print_info "收集EC2部署資訊..."
    
    echo ""
    echo "請提供以下資訊："
    echo ""
    
    # EC2 IP地址
    read -p "EC2 公網 IP 地址: " EC2_IP
    if [ -z "$EC2_IP" ]; then
        print_error "EC2 IP 地址不能為空"
        exit 1
    fi
    
    # SSH金鑰檔案路徑 - 改進版本
    echo ""
    echo "🔑 SSH 金鑰檔案設定："
    echo "1. 如果你已有 .pem 檔案，請輸入完整路徑"
    echo "2. 如果沒有，請選擇 'n' 來獲取創建金鑰的指引"
    echo ""
    
    read -p "你是否已有 .pem 金鑰檔案？(y/n): " has_key
    
    if [ "$has_key" = "y" ] || [ "$has_key" = "Y" ]; then
        # 嘗試自動找到金鑰檔案
        print_info "嘗試自動找到 .pem 檔案..."
        found_keys=$(find ~ -name "*.pem" 2>/dev/null | head -5)
        
        if [ ! -z "$found_keys" ]; then
            echo ""
            echo "找到以下 .pem 檔案："
            echo "$found_keys" | nl -w2 -s': '
            echo ""
            read -p "請輸入檔案編號或完整路徑: " key_input
            
            # 檢查是否是數字（選擇編號）
            if [[ "$key_input" =~ ^[0-9]+$ ]]; then
                KEY_PATH=$(echo "$found_keys" | sed -n "${key_input}p")
            else
                KEY_PATH="$key_input"
            fi
        else
            read -p "請輸入 .pem 檔案的完整路徑: " KEY_PATH
        fi
        
        # 驗證金鑰檔案
        if [ ! -f "$KEY_PATH" ]; then
            print_error "找不到 SSH 金鑰檔案: $KEY_PATH"
            echo ""
            echo "請檢查檔案路徑，或選擇 'n' 來獲取創建金鑰的指引"
            exit 1
        fi
        
        # 設定金鑰檔案權限
        chmod 400 "$KEY_PATH"
        print_success "SSH 金鑰檔案設定完成: $KEY_PATH"
        
    else
        # 提供創建金鑰的指引
        echo ""
        print_warning "你需要先創建 SSH 金鑰對"
        echo ""
        echo "📋 創建步驟："
        echo "1. 登入 AWS Console → EC2 → Key Pairs"
        echo "2. 點擊 'Create key pair'"
        echo "3. 名稱：ai-travel-planner-key"
        echo "4. 類型：RSA，格式：.pem"
        echo "5. 點擊 'Create key pair' 下載檔案"
        echo "6. 下載後重新執行此腳本"
        echo ""
        echo "或者，如果你想要我們幫你檢查常見位置："
        read -p "是否搜尋常見位置的 .pem 檔案？(y/n): " search_keys
        
        if [ "$search_keys" = "y" ] || [ "$search_keys" = "Y" ]; then
            print_info "搜尋 .pem 檔案..."
            found_keys=$(find ~/Downloads ~/Desktop ~ -name "*.pem" 2>/dev/null)
            
            if [ ! -z "$found_keys" ]; then
                echo ""
                echo "找到以下 .pem 檔案："
                echo "$found_keys"
                echo ""
                read -p "請輸入你要使用的檔案完整路徑: " KEY_PATH
                
                if [ ! -f "$KEY_PATH" ]; then
                    print_error "檔案不存在: $KEY_PATH"
                    exit 1
                fi
                
                chmod 400 "$KEY_PATH"
                print_success "使用金鑰檔案: $KEY_PATH"
            else
                print_error "未找到任何 .pem 檔案"
                echo "請按照上述步驟創建新的金鑰對"
                exit 1
            fi
        else
            exit 1
        fi
    fi
    
    print_success "EC2 資訊收集完成"
}

# 準備部署檔案
prepare_deployment() {
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

# 初始化EC2
initialize_ec2() {
    print_info "初始化 EC2 實例..."
    
    # 上傳EC2設定腳本
    scp -i "$KEY_PATH" deploy/ec2-setup.sh ec2-user@$EC2_IP:~/
    
    # 執行EC2設定
    ssh -i "$KEY_PATH" ec2-user@$EC2_IP "chmod +x ec2-setup.sh && ./ec2-setup.sh"
    
    print_success "EC2 初始化完成"
}

# 部署應用程式
deploy_application() {
    print_info "部署應用程式..."
    
    # 上傳應用程式檔案
    scp -i "$KEY_PATH" -r deploy/files/* ec2-user@$EC2_IP:/opt/ai-travel-planner/
    
    # 在EC2上設定應用程式
    ssh -i "$KEY_PATH" ec2-user@$EC2_IP << 'EOF'
        cd /opt/ai-travel-planner/backend
        npm install --production
        
        # 設定檔案權限
        chmod +x *.sh
        
        # 啟動應用程式
        ./start-pm2.sh
        
        # 設定Nginx
        sudo cp nginx.conf /etc/nginx/conf.d/ai-travel-planner.conf
        sudo nginx -t
        sudo systemctl reload nginx
EOF
    
    print_success "應用程式部署完成"
}

# 驗證部署
verify_deployment() {
    print_info "驗證部署..."
    
    # 檢查服務狀態
    ssh -i "$KEY_PATH" ec2-user@$EC2_IP << 'EOF'
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
EOF
    
    print_success "部署驗證完成"
}

# 顯示完成資訊
show_completion_info() {
    echo ""
    echo "🎉 部署完成！"
    echo "================"
    echo ""
    print_success "AI Travel Planner 已成功部署到 AWS"
    echo ""
    echo "📱 應用程式訪問地址:"
    echo "   http://$EC2_IP"
    echo ""
    echo "🔧 管理命令:"
    echo "   連接 EC2: ssh -i $KEY_PATH ec2-user@$EC2_IP"
    echo "   檢查狀態: pm2 status"
    echo "   查看日誌: pm2 logs ai-travel-planner-backend"
    echo "   重啟應用: ./restart.sh"
    echo ""
    echo "📖 詳細說明請參考:"
    echo "   deploy/README.md"
    echo ""
    print_warning "請記住："
    echo "1. 定期檢查應用程式狀態"
    echo "2. 監控系統資源使用情況"
    echo "3. 設定備份策略"
    echo "4. 考慮設定 SSL 證書"
}

# 主執行流程
main() {
    echo ""
    print_info "開始快速部署流程..."
    echo ""
    
    check_prerequisites
    collect_ec2_info
    prepare_deployment
    initialize_ec2
    deploy_application
    verify_deployment
    show_completion_info
}

# 執行主函數
main "$@"

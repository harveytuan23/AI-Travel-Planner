#!/bin/bash

# EC2 實例設定腳本 - AI Travel Planner
echo "🔧 開始設定 EC2 實例..."

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

# 檢查是否為root用戶
check_user() {
    if [ "$EUID" -eq 0 ]; then
        print_error "請不要使用root用戶執行此腳本，請使用ec2-user"
        exit 1
    fi
}

# 更新系統
update_system() {
    print_info "更新系統套件..."
    sudo yum update -y
    print_success "系統更新完成"
}

# 安裝Node.js
install_nodejs() {
    print_info "安裝 Node.js..."
    
    # 檢查是否已安裝Node.js
    if command -v node &> /dev/null; then
        print_info "Node.js 已安裝，版本: $(node --version)"
        return 0
    fi
    
    # 安裝NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # 載入NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # 安裝Node.js 20
    nvm install 20
    nvm use 20
    nvm alias default 20
    
    print_success "Node.js 安裝完成，版本: $(node --version)"
}

# 安裝PM2
install_pm2() {
    print_info "安裝 PM2 進程管理器..."
    
    if command -v pm2 &> /dev/null; then
        print_info "PM2 已安裝，版本: $(pm2 --version)"
        return 0
    fi
    
    npm install -g pm2
    print_success "PM2 安裝完成"
}

# 安裝Nginx
install_nginx() {
    print_info "安裝 Nginx..."
    
    if systemctl is-active --quiet nginx; then
        print_info "Nginx 已安裝並運行"
        return 0
    fi
    
    sudo yum install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx 安裝並啟動完成"
}

# 創建應用程式目錄
create_app_directory() {
    print_info "創建應用程式目錄..."
    
    sudo mkdir -p /opt/ai-travel-planner
    sudo chown -R ec2-user:ec2-user /opt/ai-travel-planner
    
    # 創建日誌目錄
    sudo mkdir -p /var/log/ai-travel-planner
    sudo chown -R ec2-user:ec2-user /var/log/ai-travel-planner
    
    print_success "應用程式目錄創建完成"
}

# 設定防火牆
configure_firewall() {
    print_info "設定防火牆..."
    
    # 檢查防火牆狀態
    if systemctl is-active --quiet firewalld; then
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --reload
        print_success "防火牆設定完成"
    else
        print_info "防火牆未運行，跳過設定"
    fi
}

# 安裝必要工具
install_tools() {
    print_info "安裝必要工具..."
    
    # 安裝git（如果沒有）
    if ! command -v git &> /dev/null; then
        sudo yum install git -y
    fi
    
    # 安裝unzip（用於解壓縮檔案）
    if ! command -v unzip &> /dev/null; then
        sudo yum install unzip -y
    fi
    
    print_success "必要工具安裝完成"
}

# 設定環境變數
setup_environment() {
    print_info "設定環境變數..."
    
    # 將NVM設定加入bashrc
    if ! grep -q "NVM_DIR" ~/.bashrc; then
        cat >> ~/.bashrc << 'EOF'

# NVM設定
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
    fi
    
    print_success "環境變數設定完成"
}

# 創建PM2日誌輪轉配置
setup_pm2_logrotate() {
    print_info "設定PM2日誌輪轉..."
    
    cat > ~/.pm2/module_conf.json << 'EOF'
{
  "module-db": {
    "pm2-logrotate": {
      "max_size": "10M",
      "retain": "30",
      "compress": false,
      "dateFormat": "YYYY-MM-DD_HH-mm-ss",
      "workerInterval": "30",
      "rotateInterval": "0 0 * * *",
      "rotateModule": true
    }
  }
}
EOF
    
    pm2 install pm2-logrotate
    print_success "PM2日誌輪轉設定完成"
}

# 主執行流程
main() {
    echo "🎯 開始EC2實例初始化..."
    echo ""
    
    check_user
    update_system
    install_nodejs
    install_pm2
    install_nginx
    install_tools
    create_app_directory
    configure_firewall
    setup_environment
    setup_pm2_logrotate
    
    echo ""
    print_success "EC2 實例設定完成！"
    echo ""
    echo "📋 已安裝的軟體："
    echo "- Node.js $(node --version)"
    echo "- PM2 $(pm2 --version)"
    echo "- Nginx $(nginx -v 2>&1 | head -n1)"
    echo ""
    echo "📁 應用程式目錄: /opt/ai-travel-planner/"
    echo "📝 日誌目錄: /var/log/ai-travel-planner/"
    echo ""
    echo "🔧 下一步操作："
    echo "1. 上傳應用程式檔案到 /opt/ai-travel-planner/"
    echo "2. 設定環境變數 (.env 檔案)"
    echo "3. 啟動應用程式"
    echo ""
    echo "📖 詳細部署說明請參考 DEPLOYMENT_GUIDE.md"
}

# 執行主函數
main "$@"

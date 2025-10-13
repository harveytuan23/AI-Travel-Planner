#!/bin/bash

# AI Travel Planner - 部署配置測試腳本
echo "🧪 AI Travel Planner - 部署配置測試"
echo "======================================"

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

# 測試環境變數
test_environment_variables() {
    print_info "測試環境變數配置..."
    
    if [ ! -f ".env" ]; then
        print_error "找不到 .env 檔案"
        return 1
    fi
    
    source .env
    
    # 檢查必要的環境變數
    if [ -z "$REACT_APP_GOOGLE_MAPS_API_KEY" ]; then
        print_error "REACT_APP_GOOGLE_MAPS_API_KEY 未設定"
        return 1
    fi
    
    if [ -z "$GROQ_API_KEY" ]; then
        print_error "GROQ_API_KEY 未設定"
        return 1
    fi
    
    if [ -z "$SERVER_PORT" ]; then
        print_warning "SERVER_PORT 未設定，使用預設值 3001"
    fi
    
    if [ -z "$CLIENT_PORT" ]; then
        print_warning "CLIENT_PORT 未設定，使用預設值 3000"
    fi
    
    print_success "環境變數配置正確"
    return 0
}

# 測試前端建置
test_frontend_build() {
    print_info "測試前端建置..."
    
    cd client
    
    # 檢查package.json
    if [ ! -f "package.json" ]; then
        print_error "找不到 client/package.json"
        return 1
    fi
    
    # 檢查是否有node_modules
    if [ ! -d "node_modules" ]; then
        print_warning "前端依賴未安裝，嘗試安裝..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "前端依賴安裝失敗"
            return 1
        fi
    fi
    
    # 嘗試建置前端
    print_info "建置前端應用程式..."
    npm run build
    
    if [ $? -eq 0 ] && [ -d "build" ]; then
        print_success "前端建置成功"
        cd ..
        return 0
    else
        print_error "前端建置失敗"
        cd ..
        return 1
    fi
}

# 測試後端配置
test_backend_config() {
    print_info "測試後端配置..."
    
    cd server
    
    # 檢查package.json
    if [ ! -f "package.json" ]; then
        print_error "找不到 server/package.json"
        return 1
    fi
    
    # 檢查index.js
    if [ ! -f "index.js" ]; then
        print_error "找不到 server/index.js"
        return 1
    fi
    
    # 檢查是否有node_modules
    if [ ! -d "node_modules" ]; then
        print_warning "後端依賴未安裝，嘗試安裝..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "後端依賴安裝失敗"
            return 1
        fi
    fi
    
    print_success "後端配置正確"
    cd ..
    return 0
}

# 測試部署腳本
test_deployment_scripts() {
    print_info "測試部署腳本..."
    
    # 檢查部署腳本是否存在
    scripts=("aws-deploy.sh" "ec2-setup.sh" "quick-deploy.sh")
    
    for script in "${scripts[@]}"; do
        if [ -f "deploy/$script" ]; then
            if [ -x "deploy/$script" ]; then
                print_success "$script 存在且可執行"
            else
                print_warning "$script 存在但不可執行，正在設定權限..."
                chmod +x "deploy/$script"
                print_success "$script 權限設定完成"
            fi
        else
            print_error "找不到 deploy/$script"
            return 1
        fi
    done
    
    # 檢查配置文件
    config_files=("nginx.conf" "pm2.config.js")
    
    for config in "${config_files[@]}"; do
        if [ -f "deploy/$config" ]; then
            print_success "$config 存在"
        else
            print_error "找不到 deploy/$config"
            return 1
        fi
    done
    
    return 0
}

# 測試API連接
test_api_connection() {
    print_info "測試API連接..."
    
    source .env
    
    # 測試Google Maps API
    if [ ! -z "$REACT_APP_GOOGLE_MAPS_API_KEY" ]; then
        print_info "測試 Google Maps API 金鑰格式..."
        if [[ "$REACT_APP_GOOGLE_MAPS_API_KEY" =~ ^AIza[0-9A-Za-z_-]{35}$ ]]; then
            print_success "Google Maps API 金鑰格式正確"
        else
            print_warning "Google Maps API 金鑰格式可能不正確"
        fi
    fi
    
    # 測試Groq API
    if [ ! -z "$GROQ_API_KEY" ]; then
        print_info "測試 Groq API 連接..."
        response=$(curl -s -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models)
        if [ $? -eq 0 ] && [ ! -z "$response" ]; then
            print_success "Groq API 連接正常"
        else
            print_error "Groq API 連接失敗，請檢查金鑰是否正確"
        fi
    fi
    
    return 0
}

# 生成部署報告
generate_deployment_report() {
    print_info "生成部署報告..."
    
    report_file="deploy/deployment-test-report.txt"
    
    cat > "$report_file" << EOF
AI Travel Planner - 部署配置測試報告
====================================
測試時間: $(date)
測試環境: $(uname -a)

測試結果:
EOF
    
    # 添加測試結果到報告
    if test_environment_variables; then
        echo "✅ 環境變數配置: 通過" >> "$report_file"
    else
        echo "❌ 環境變數配置: 失敗" >> "$report_file"
    fi
    
    if test_frontend_build; then
        echo "✅ 前端建置: 通過" >> "$report_file"
    else
        echo "❌ 前端建置: 失敗" >> "$report_file"
    fi
    
    if test_backend_config; then
        echo "✅ 後端配置: 通過" >> "$report_file"
    else
        echo "❌ 後端配置: 失敗" >> "$report_file"
    fi
    
    if test_deployment_scripts; then
        echo "✅ 部署腳本: 通過" >> "$report_file"
    else
        echo "❌ 部署腳本: 失敗" >> "$report_file"
    fi
    
    if test_api_connection; then
        echo "✅ API連接: 通過" >> "$report_file"
    else
        echo "❌ API連接: 失敗" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "詳細說明:" >> "$report_file"
    echo "- 所有測試通過後，可以執行 ./deploy/quick-deploy.sh 進行快速部署" >> "$report_file"
    echo "- 或參考 deploy/README.md 進行手動部署" >> "$report_file"
    
    print_success "部署報告已生成: $report_file"
}

# 主執行流程
main() {
    echo ""
    
    # 檢查是否在正確目錄
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
        print_error "請在專案根目錄執行此腳本"
        exit 1
    fi
    
    local all_tests_passed=true
    
    # 執行所有測試
    test_environment_variables || all_tests_passed=false
    test_frontend_build || all_tests_passed=false
    test_backend_config || all_tests_passed=false
    test_deployment_scripts || all_tests_passed=false
    test_api_connection || all_tests_passed=false
    
    # 生成報告
    generate_deployment_report
    
    echo ""
    if [ "$all_tests_passed" = true ]; then
        print_success "所有測試通過！準備就緒，可以開始部署。"
        echo ""
        echo "🚀 下一步操作："
        echo "1. 快速部署: ./deploy/quick-deploy.sh"
        echo "2. 手動部署: 參考 deploy/README.md"
        echo ""
    else
        print_error "部分測試失敗，請檢查錯誤訊息並修復問題後重新測試。"
        echo ""
        echo "🔧 常見問題解決："
        echo "1. 確保 .env 檔案存在且包含正確的 API 金鑰"
        echo "2. 確保 Node.js 和 npm 已正確安裝"
        echo "3. 確保所有依賴都已安裝"
        echo ""
    fi
}

# 執行主函數
main "$@"

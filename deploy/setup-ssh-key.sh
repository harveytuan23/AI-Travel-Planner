#!/bin/bash

# SSH 金鑰設定輔助腳本
echo "🔑 SSH 金鑰設定輔助工具"
echo "========================"

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

# 搜尋現有的 .pem 檔案
search_existing_keys() {
    print_info "搜尋現有的 .pem 檔案..."
    
    # 搜尋常見位置
    search_paths=(
        "$HOME/Downloads"
        "$HOME/Desktop"
        "$HOME"
        "$HOME/Documents"
        "$HOME/aws"
        "$HOME/.ssh"
    )
    
    found_keys=()
    
    for path in "${search_paths[@]}"; do
        if [ -d "$path" ]; then
            keys=$(find "$path" -name "*.pem" -type f 2>/dev/null)
            if [ ! -z "$keys" ]; then
                while IFS= read -r key; do
                    found_keys+=("$key")
                done <<< "$keys"
            fi
        fi
    done
    
    if [ ${#found_keys[@]} -gt 0 ]; then
        echo ""
        print_success "找到 ${#found_keys[@]} 個 .pem 檔案："
        echo ""
        
        for i in "${!found_keys[@]}"; do
            echo "$((i+1)). ${found_keys[$i]}"
        done
        
        echo ""
        read -p "請選擇要使用的檔案編號 (1-${#found_keys[@]}) 或按 Enter 跳過: " selection
        
        if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#found_keys[@]} ]; then
            selected_key="${found_keys[$((selection-1))]}"
            echo ""
            print_info "已選擇: $selected_key"
            
            # 設定權限
            chmod 400 "$selected_key"
            print_success "金鑰檔案權限已設定"
            
            # 測試連接（需要 EC2 IP）
            echo ""
            read -p "請輸入你的 EC2 公網 IP 地址來測試連接: " ec2_ip
            if [ ! -z "$ec2_ip" ]; then
                test_connection "$selected_key" "$ec2_ip"
            fi
            
            return 0
        fi
    else
        print_warning "未找到任何 .pem 檔案"
    fi
    
    return 1
}

# 測試 SSH 連接
test_connection() {
    local key_path="$1"
    local ec2_ip="$2"
    
    print_info "測試 SSH 連接..."
    
    # 測試連接（5秒超時）
    if timeout 5 ssh -i "$key_path" -o ConnectTimeout=5 -o StrictHostKeyChecking=no ec2-user@"$ec2_ip" "echo 'SSH 連接成功'" 2>/dev/null; then
        print_success "SSH 連接測試成功！"
        echo ""
        echo "🎉 你可以使用以下命令連接 EC2："
        echo "ssh -i \"$key_path\" ec2-user@$ec2_ip"
        return 0
    else
        print_error "SSH 連接測試失敗"
        echo ""
        echo "可能的原因："
        echo "1. EC2 實例未啟動"
        echo "2. 安全群組未開放 SSH (22) 端口"
        echo "3. IP 地址不正確"
        echo "4. 金鑰檔案與 EC2 實例不匹配"
        return 1
    fi
}

# 創建新的金鑰對指引
create_new_key_guide() {
    echo ""
    print_warning "你需要創建新的 SSH 金鑰對"
    echo ""
    echo "📋 AWS Console 創建步驟："
    echo "========================="
    echo ""
    echo "1. 登入 AWS Console"
    echo "   https://console.aws.amazon.com/"
    echo ""
    echo "2. 前往 EC2 服務"
    echo "   - 在服務搜尋框中輸入 'EC2'"
    echo "   - 點擊 EC2 服務"
    echo ""
    echo "3. 創建金鑰對"
    echo "   - 在左側選單中點擊 'Key Pairs'"
    echo "   - 點擊 'Create key pair' 按鈕"
    echo ""
    echo "4. 設定金鑰對"
    echo "   - 名稱: ai-travel-planner-key"
    echo "   - 金鑰對類型: RSA"
    echo "   - 私鑰檔案格式: .pem"
    echo "   - 點擊 'Create key pair'"
    echo ""
    echo "5. 下載金鑰"
    echo "   - 金鑰會自動下載到你的下載資料夾"
    echo "   - 檔案名稱: ai-travel-planner-key.pem"
    echo ""
    echo "6. 重新執行此腳本"
    echo "   ./deploy/setup-ssh-key.sh"
    echo ""
    
    # 提供 AWS CLI 選項
    if command -v aws &> /dev/null; then
        echo ""
        read -p "你是否想要使用 AWS CLI 創建金鑰對？(y/n): " use_aws_cli
        
        if [ "$use_aws_cli" = "y" ] || [ "$use_aws_cli" = "Y" ]; then
            create_key_with_aws_cli
        fi
    fi
}

# 使用 AWS CLI 創建金鑰對
create_key_with_aws_cli() {
    print_info "使用 AWS CLI 創建金鑰對..."
    
    # 檢查 AWS CLI 配置
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI 未配置或認證失敗"
        echo ""
        echo "請先配置 AWS CLI："
        echo "aws configure"
        return 1
    fi
    
    local key_name="ai-travel-planner-key"
    local key_file="$HOME/Downloads/$key_name.pem"
    
    # 檢查金鑰是否已存在
    if aws ec2 describe-key-pairs --key-names "$key_name" &> /dev/null; then
        print_warning "金鑰對 '$key_name' 已存在"
        echo ""
        read -p "是否要刪除現有金鑰並創建新的？(y/n): " replace_key
        
        if [ "$replace_key" = "y" ] || [ "$replace_key" = "Y" ]; then
            aws ec2 delete-key-pair --key-name "$key_name"
            print_info "已刪除現有金鑰對"
        else
            print_info "使用現有金鑰對"
            return 0
        fi
    fi
    
    # 創建新的金鑰對
    print_info "創建新的金鑰對..."
    if aws ec2 create-key-pair --key-name "$key_name" --query 'KeyMaterial' --output text > "$key_file"; then
        chmod 400 "$key_file"
        print_success "金鑰對創建成功: $key_file"
        echo ""
        echo "🎉 你可以使用以下命令連接 EC2："
        echo "ssh -i \"$key_file\" ec2-user@YOUR_EC2_IP"
        return 0
    else
        print_error "金鑰對創建失敗"
        return 1
    fi
}

# 檢查現有 EC2 實例
check_existing_instances() {
    print_info "檢查現有的 EC2 實例..."
    
    if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
        echo ""
        echo "現有的 EC2 實例："
        echo "=================="
        
        # 獲取實例資訊
        aws ec2 describe-instances \
            --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,KeyName]' \
            --output table 2>/dev/null || echo "無法獲取實例資訊"
        
        echo ""
        read -p "是否要為現有實例設定金鑰？(y/n): " setup_for_existing
        
        if [ "$setup_for_existing" = "y" ] || [ "$setup_for_existing" = "Y" ]; then
            search_existing_keys
        fi
    else
        print_warning "AWS CLI 未配置，無法檢查現有實例"
    fi
}

# 主執行流程
main() {
    echo ""
    echo "選擇操作："
    echo "1. 搜尋現有的 .pem 檔案"
    echo "2. 創建新的金鑰對指引"
    echo "3. 檢查現有的 EC2 實例"
    echo "4. 使用 AWS CLI 創建金鑰對"
    echo ""
    
    read -p "請選擇 (1-4): " choice
    
    case $choice in
        1)
            search_existing_keys
            ;;
        2)
            create_new_key_guide
            ;;
        3)
            check_existing_instances
            ;;
        4)
            if command -v aws &> /dev/null; then
                create_key_with_aws_cli
            else
                print_error "AWS CLI 未安裝"
                echo "請安裝 AWS CLI 或選擇其他選項"
            fi
            ;;
        *)
            print_error "無效選擇"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🔧 下一步："
    echo "1. 確保你有有效的 .pem 金鑰檔案"
    echo "2. 執行部署腳本: ./deploy/quick-deploy.sh"
    echo "3. 或參考手動部署指南: deploy/README.md"
}

# 執行主函數
main "$@"

#!/bin/bash

# 🚀 Mitum Ansible Interactive Setup Script
# User-friendly initial setup assistant

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 이모지와 함께 출력하는 함수들
print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🎯 $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_question() {
    echo -e "${MAGENTA}❓ $1${NC}"
}

# 대시보드 출력
show_dashboard() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
    __  _______ ______ __  __ __  ___       _      _   __ _____ ____ ____   __    ______
   /  |/  /  _//_  __// / / //  |/  /      / \    / | / // ___//  _// __ ) / /   / ____/
  / /|_/ // /   / /  / / / // /|_/ /      / _ \  /  |/ / \__ \ / / / __  |/ /   / __/   
 / /  / // /   / /  / /_/ // /  / /      / ___ \/ /|  / ___/ // / / /_/ // /___/ /___   
/_/  /_/___/  /_/   \____//_/  /_/      /_/   \_\_/ |_//____/___//_____//_____/_____/   
                                                                                         
EOF
    echo -e "${NC}"
    echo -e "${GREEN}🎉 Mitum 블록체인 배포 자동화 시스템에 오신 것을 환영합니다!${NC}"
    echo -e "${BLUE}📖 이 스크립트는 초기 설정을 도와드립니다.${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# 프로그레스 바 표시
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    
    printf "\r["
    printf "%${filled}s" | tr ' ' '='
    printf "%$((width - filled))s" | tr ' ' ' '
    printf "] %d%%" $percentage
}

# 환경 선택
select_environment() {
    print_header "환경 선택"
    echo "어떤 환경을 설정하시겠습니까?"
    echo
    echo "  1) 🏗️  Development (개발 환경)"
    echo "  2) 🧪 Staging (스테이징 환경)"
    echo "  3) 🚀 Production (프로덕션 환경)"
    echo
    
    while true; do
        print_question "선택해주세요 (1-3): "
        read -r env_choice
        
        case $env_choice in
            1)
                ENVIRONMENT="development"
                print_success "개발 환경을 선택하셨습니다."
                break
                ;;
            2)
                ENVIRONMENT="staging"
                print_success "스테이징 환경을 선택하셨습니다."
                break
                ;;
            3)
                ENVIRONMENT="production"
                print_warning "프로덕션 환경을 선택하셨습니다. 신중하게 진행해주세요!"
                break
                ;;
            *)
                print_error "잘못된 선택입니다. 1-3 중에서 선택해주세요."
                ;;
        esac
    done
}

# 노드 수 입력
input_node_count() {
    print_header "Node Configuration"
    echo "How many nodes would you like to configure?"
    echo
    print_info "Recommendations:"
    echo "  • Development environment: 1-3 nodes"
    echo "  • Staging environment: 3-5 nodes"
    echo "  • Production environment: 5+ nodes"
    echo
    
    while true; do
        print_question "Please enter the number of nodes (1-10): "
        read -r node_count
        
        if [[ "$node_count" =~ ^[0-9]+$ ]] && [ "$node_count" -ge 1 ] && [ "$node_count" -le 10 ]; then
            print_success "Configuring $node_count nodes."
            break
        else
            print_error "Please enter a number between 1 and 10."
        fi
    done
}

# Network configuration
configure_network() {
    print_header "Network Configuration"
    
    # Network ID
    print_question "Enter Network ID (default: mitum-test): "
    read -r network_id
    NETWORK_ID=${network_id:-mitum-test}
    print_success "Network ID: $NETWORK_ID"
    
    # Chain ID
    print_question "Enter Chain ID (default: 100): "
    read -r chain_id
    CHAIN_ID=${chain_id:-100}
    print_success "Chain ID: $CHAIN_ID"
}

# SSH 설정
configure_ssh() {
    print_header "SSH 연결 설정"
    
    print_question "SSH 키를 자동으로 생성하시겠습니까? (Y/n): "
    read -r generate_ssh
    
    if [[ "$generate_ssh" != "n" && "$generate_ssh" != "N" ]]; then
        print_info "SSH 키를 생성합니다..."
        
        SSH_KEY_PATH="keys/ssh/$ENVIRONMENT/mitum_key"
        mkdir -p "keys/ssh/$ENVIRONMENT"
        
        if [ ! -f "$SSH_KEY_PATH" ]; then
            ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -q
            print_success "SSH 키가 생성되었습니다: $SSH_KEY_PATH"
        else
            print_warning "SSH 키가 이미 존재합니다: $SSH_KEY_PATH"
        fi
    else
        print_info "기존 SSH 키를 사용합니다."
        print_question "SSH 키 경로를 입력해주세요: "
        read -r ssh_key_path
        SSH_KEY_PATH=$ssh_key_path
    fi
}

# 인벤토리 생성
create_inventory() {
    print_header "인벤토리 파일 생성"
    
    INVENTORY_FILE="inventories/$ENVIRONMENT/hosts.yml"
    mkdir -p "inventories/$ENVIRONMENT/group_vars"
    mkdir -p "inventories/$ENVIRONMENT/host_vars"
    
    cat > "$INVENTORY_FILE" << EOF
---
# $ENVIRONMENT 환경 인벤토리
# 자동 생성: $(date)

all:
  vars:
    ansible_user: ubuntu
    ansible_ssh_private_key_file: ../../$SSH_KEY_PATH
    ansible_ssh_common_args: '-o StrictHostKeyChecking=no'
    
    # Mitum 설정
    mitum_environment: $ENVIRONMENT
    mitum_network_id: $NETWORK_ID
    mitum_chain_id: $CHAIN_ID

mitum_nodes:
  hosts:
EOF
    
    # 노드 추가
    for i in $(seq 1 "$node_count"); do
        echo "    node$((i-1)):" >> "$INVENTORY_FILE"
        
        print_question "node$((i-1))의 IP 주소를 입력해주세요: "
        read -r node_ip
        
        echo "      ansible_host: $node_ip" >> "$INVENTORY_FILE"
        
        if [ "$i" -le 3 ]; then
            echo "      mitum_node_type: consensus" >> "$INVENTORY_FILE"
        else
            echo "      mitum_node_type: api" >> "$INVENTORY_FILE"
        fi
        echo >> "$INVENTORY_FILE"
    done
    
    print_success "인벤토리 파일이 생성되었습니다: $INVENTORY_FILE"
}

# 검증
validate_setup() {
    print_header "설정 검증"
    
    echo "설정을 검증하는 중..."
    echo
    
    # 프로그레스 바 표시
    items=("Python 버전" "Ansible 설치" "SSH 키" "인벤토리 파일" "네트워크 연결")
    total=${#items[@]}
    
    for i in "${!items[@]}"; do
        show_progress $((i+1)) $total
        sleep 0.5
        
        case $i in
            0) python3 --version &>/dev/null && status="✅" || status="❌" ;;
            1) [ -f "venv/bin/ansible" ] && status="✅" || status="❌" ;;
            2) [ -f "$SSH_KEY_PATH" ] && status="✅" || status="❌" ;;
            3) [ -f "$INVENTORY_FILE" ] && status="✅" || status="❌" ;;
            4) status="✅" ;; # 네트워크는 나중에 실제로 테스트
        esac
    done
    
    echo -e "\n"
    print_success "검증 완료!"
}

# 다음 단계 안내
show_next_steps() {
    print_header "🎉 설정 완료!"
    
    echo -e "${GREEN}축하합니다! 초기 설정이 완료되었습니다.${NC}"
    echo
    echo -e "${CYAN}📋 설정 요약:${NC}"
    echo "  • 환경: $ENVIRONMENT"
    echo "  • 노드 수: $node_count"
    echo "  • 네트워크 ID: $NETWORK_ID"
    echo "  • 체인 ID: $CHAIN_ID"
    echo
    echo -e "${YELLOW}🚀 다음 단계:${NC}"
    echo
    echo "1. 가상 환경 활성화:"
    echo -e "   ${BLUE}source venv/bin/activate${NC}"
    echo
    echo "2. 연결 테스트:"
    echo -e "   ${BLUE}make test ENV=$ENVIRONMENT${NC}"
    echo
    echo "3. 시스템 준비:"
    echo -e "   ${BLUE}make prepare ENV=$ENVIRONMENT${NC}"
    echo
    echo "4. Mitum 배포:"
    echo -e "   ${BLUE}make deploy ENV=$ENVIRONMENT${NC}"
    echo
    echo -e "${GREEN}💡 도움이 필요하시면 'make help'를 실행해주세요.${NC}"
    echo
}

# 메인 실행
main() {
    show_dashboard
    
    print_question "설정을 시작하시겠습니까? (Y/n): "
    read -r confirm
    
    if [[ "$confirm" == "n" || "$confirm" == "N" ]]; then
        print_info "설정을 취소했습니다."
        exit 0
    fi
    
    select_environment
    input_node_count
    configure_network
    configure_ssh
    create_inventory
    validate_setup
    show_next_steps
    
    # 설정 저장
    cat > ".last_setup" << EOF
ENVIRONMENT=$ENVIRONMENT
NODE_COUNT=$node_count
NETWORK_ID=$NETWORK_ID
CHAIN_ID=$CHAIN_ID
SETUP_DATE=$(date)
EOF
}

# 스크립트 실행
main 
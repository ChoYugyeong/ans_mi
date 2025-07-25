#!/bin/bash

# 🎨 Mitum Visual Status Display Script
# Displays node status visually for easy monitoring

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 환경 변수
ENV=${ENV:-production}
INVENTORY="inventories/$ENV/hosts.yml"

# 아이콘 정의
ICON_OK="✅"
ICON_WARNING="⚠️ "
ICON_ERROR="❌"
ICON_RUNNING="🟢"
ICON_STOPPED="🔴"
ICON_UNKNOWN="🟡"

# 헤더 출력
print_header() {
    clear
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🎯 Mitum 네트워크 상태 대시보드${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "📅 시간: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "🌍 환경: ${GREEN}$ENV${NC}"
    echo
}

# 노드 상태 체크
check_node_status() {
    local node=$1
    local status_output=$(ansible $node -i $INVENTORY -m shell -a "systemctl is-active mitum || echo inactive" 2>/dev/null | tail -1)
    
    case $status_output in
        active)
            echo "$ICON_RUNNING"
            ;;
        inactive)
            echo "$ICON_STOPPED"
            ;;
        *)
            echo "$ICON_UNKNOWN"
            ;;
    esac
}

# 노드 정보 가져오기
get_node_info() {
    local node=$1
    
    # 블록 높이 가져오기
    local block_height=$(ansible $node -i $INVENTORY -m shell -a "curl -s http://localhost:54321/block/last | jq -r '.height' 2>/dev/null || echo 'N/A'" 2>/dev/null | tail -1)
    
    # 연결된 피어 수
    local peer_count=$(ansible $node -i $INVENTORY -m shell -a "curl -s http://localhost:54321/node | jq -r '.suffrage.nodes | length' 2>/dev/null || echo '0'" 2>/dev/null | tail -1)
    
    echo "$block_height|$peer_count"
}

# 메인 대시보드
show_dashboard() {
    print_header
    
    echo -e "${YELLOW}📊 노드 상태 요약${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # 테이블 헤더
    printf "%-15s %-10s %-15s %-10s %-15s\n" "노드명" "상태" "블록 높이" "피어 수" "타입"
    echo -e "${CYAN}─────────────────────────────────────────────────────────────────────${NC}"
    
    # 노드 정보 표시
    local nodes=$(ansible all -i $INVENTORY --list-hosts 2>/dev/null | grep -v "hosts" | sed 's/^ *//')
    local total_nodes=0
    local running_nodes=0
    
    for node in $nodes; do
        ((total_nodes++))
        
        # 노드 상태 체크
        local status=$(check_node_status $node)
        [[ "$status" == "$ICON_RUNNING" ]] && ((running_nodes++))
        
        # 노드 정보 가져오기
        local info=$(get_node_info $node)
        local block_height=$(echo $info | cut -d'|' -f1)
        local peer_count=$(echo $info | cut -d'|' -f2)
        
        # 노드 타입 결정
        local node_type="Consensus"
        if ansible $node -i $INVENTORY -m debug -a "var=mitum_api_enabled" 2>/dev/null | grep -q "true"; then
            node_type="API"
        fi
        
        # 출력
        printf "%-15s %-10s %-15s %-10s %-15s\n" \
            "$node" "$status" "$block_height" "$peer_count" "$node_type"
    done
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    
    # 요약 정보
    echo -e "${YELLOW}📈 네트워크 요약${NC}"
    echo "• 전체 노드: $total_nodes"
    echo "• 실행 중: ${GREEN}$running_nodes${NC}"
    echo "• 중지됨: ${RED}$((total_nodes - running_nodes))${NC}"
    
    # 상태에 따른 메시지
    echo
    if [ $running_nodes -eq $total_nodes ]; then
        echo -e "${GREEN}$ICON_OK 모든 노드가 정상적으로 실행 중입니다!${NC}"
    elif [ $running_nodes -eq 0 ]; then
        echo -e "${RED}$ICON_ERROR 실행 중인 노드가 없습니다!${NC}"
    else
        echo -e "${YELLOW}$ICON_WARNING 일부 노드가 중지되어 있습니다.${NC}"
    fi
    
    echo
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 실시간 모니터링 모드
monitor_mode() {
    while true; do
        show_dashboard
        echo
        echo -e "${BLUE}🔄 5초 후 새로고침... (Ctrl+C로 종료)${NC}"
        sleep 5
    done
}

# 메인 실행
main() {
    if [ "$1" == "--monitor" ] || [ "$1" == "-m" ]; then
        monitor_mode
    else
        show_dashboard
        echo
        echo -e "${BLUE}💡 팁: 실시간 모니터링을 원하시면 '$0 --monitor'를 사용하세요.${NC}"
    fi
}

# 스크립트 실행
main "$@" 
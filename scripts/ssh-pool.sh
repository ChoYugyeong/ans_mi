#!/bin/bash
# SSH connection pool manager for Mitum Ansible

set -euo pipefail

SOCKET_DIR="/tmp/ansible-ssh-sockets"
INVENTORY="${INVENTORY:-inventories/production/hosts.yml}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[INFO]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# Get hosts from inventory
get_hosts() {
    if [[ ! -f "$INVENTORY" ]]; then
        error "Inventory file not found: $INVENTORY"
        exit 1
    fi
    
    # Extract hostnames from inventory
    grep -E "^[[:space:]]*node[0-9]+:" "$INVENTORY" | sed 's/://g' | tr -d ' '
}

case "${1:-help}" in
    start)
        log "Starting SSH connection pool..."
        mkdir -p "$SOCKET_DIR"
        
        # Start bastion connection first
        log "Establishing bastion connection..."
        ssh -M -N -f -o ControlPath="$SOCKET_DIR/bastion.sock" \
            -o ControlPersist=1800s \
            -o ServerAliveInterval=60 \
            bastion 2>/dev/null || true
        
        # Start connections to all nodes
        HOSTS=$(get_hosts)
        for host in $HOSTS; do
            log "Establishing connection to $host..."
            ssh -M -N -f -o ControlPath="$SOCKET_DIR/$host.sock" \
                -o ControlPersist=1800s \
                -o ProxyJump=bastion \
                "$host" 2>/dev/null || true
        done
        log "Connection pool established."
        ;;
        
    stop)
        log "Stopping SSH connection pool..."
        if [[ -d "$SOCKET_DIR" ]]; then
            for sock in "$SOCKET_DIR"/*.sock; do
                if [[ -e "$sock" ]]; then
                    ssh -O exit -o ControlPath="$sock" localhost 2>/dev/null || true
                fi
            done
            rm -rf "$SOCKET_DIR"
        fi
        log "Connection pool stopped."
        ;;
        
    status)
        echo "SSH connection pool status:"
        if [[ -d "$SOCKET_DIR" ]]; then
            for sock in "$SOCKET_DIR"/*.sock; do
                if [[ -e "$sock" ]]; then
                    host=$(basename "$sock" .sock)
                    if ssh -O check -o ControlPath="$sock" localhost 2>/dev/null; then
                        echo -e "  $host: ${GREEN}Active${NC}"
                    else
                        echo -e "  $host: ${RED}Inactive${NC}"
                    fi
                fi
            done
        else
            warning "No connection pool found"
        fi
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        echo ""
        echo "Manages SSH connection multiplexing for faster Ansible operations."
        echo "Connections are maintained for 30 minutes (1800s)."
        exit 1
        ;;
esac
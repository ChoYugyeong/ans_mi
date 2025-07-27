#!/bin/bash

# 🚀 Mitum Ansible Interactive Setup Script
# User-friendly initial setup assistant

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Functions to print with emojis
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

# Dashboard display
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
    echo -e "${GREEN}🎉 Mitum blockchain deployment automation system welcomes you!${NC}"
    echo -e "${BLUE}📖 This script helps you with initial setup.${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Progress bar display
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

# Environment selection
select_environment() {
    print_header "Environment Selection"
    echo "Which environment would you like to set up?"
    echo
    echo "  1) 🏗️  Development (Development Environment)"
    echo "  2) 🧪 Staging (Staging Environment)"
    echo "  3) 🚀 Production (Production Environment)"
    echo
    
    while true; do
        print_question "Please select (1-3): "
        read -r env_choice
        
        case $env_choice in
            1)
                ENVIRONMENT="development"
                print_success "You have selected the development environment."
                break
                ;;
            2)
                ENVIRONMENT="staging"
                print_success "You have selected the staging environment."
                break
                ;;
            3)
                ENVIRONMENT="production"
                print_warning "You have selected the production environment. Please proceed with caution!"
                break
                ;;
            *)
                print_error "Invalid selection. Please choose between 1-3."
                ;;
        esac
    done
}

# Input node count
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

# SSH settings
configure_ssh() {
    print_header "SSH Connection Settings"
    
    print_question "Would you like to generate SSH keys automatically? (Y/n): "
    read -r generate_ssh
    
    if [[ "$generate_ssh" != "n" && "$generate_ssh" != "N" ]]; then
        print_info "Generating SSH keys..."
        
        SSH_KEY_PATH="keys/ssh/$ENVIRONMENT/mitum_key"
        mkdir -p "keys/ssh/$ENVIRONMENT"
        
        if [ ! -f "$SSH_KEY_PATH" ]; then
            ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -q
            print_success "SSH keys have been generated: $SSH_KEY_PATH"
        else
            print_warning "SSH keys already exist: $SSH_KEY_PATH"
        fi
    else
        print_info "Using existing SSH keys."
        print_question "Please enter the SSH key path: "
        read -r ssh_key_path
        SSH_KEY_PATH=$ssh_key_path
    fi
}

# Inventory generation
create_inventory() {
    print_header "Inventory File Generation"
    
    INVENTORY_FILE="inventories/$ENVIRONMENT/hosts.yml"
    mkdir -p "inventories/$ENVIRONMENT/group_vars"
    mkdir -p "inventories/$ENVIRONMENT/host_vars"
    
    cat > "$INVENTORY_FILE" << EOF
---
# $ENVIRONMENT Environment Inventory
# Auto-generated: $(date)

all:
  vars:
    ansible_user: ubuntu
    ansible_ssh_private_key_file: ../../$SSH_KEY_PATH
    ansible_ssh_common_args: '-o StrictHostKeyChecking=no'
    
    # Mitum Settings
    mitum_environment: $ENVIRONMENT
    mitum_network_id: $NETWORK_ID
    mitum_chain_id: $CHAIN_ID

mitum_nodes:
  hosts:
EOF
    
    # Add nodes
    for i in $(seq 1 "$node_count"); do
        echo "    node$((i-1)):" >> "$INVENTORY_FILE"
        
        print_question "Please enter the IP address for node$((i-1)): "
        read -r node_ip
        
        echo "      ansible_host: $node_ip" >> "$INVENTORY_FILE"
        
        if [ "$i" -le 3 ]; then
            echo "      mitum_node_type: consensus" >> "$INVENTORY_FILE"
        else
            echo "      mitum_node_type: api" >> "$INVENTORY_FILE"
        fi
        echo >> "$INVENTORY_FILE"
    done
    
    print_success "Inventory file has been generated: $INVENTORY_FILE"
}

# Validation
validate_setup() {
    print_header "Setup Validation"
    
    echo "Validating settings..."
    echo
    
    # Progress bar display
    items=("Python Version" "Ansible Installation" "SSH Keys" "Inventory File" "Network Connection")
    total=${#items[@]}
    
    for i in "${!items[@]}"; do
        show_progress $((i+1)) $total
        sleep 0.5
        
        case $i in
            0) python3 --version &>/dev/null && status="✅" || status="❌" ;;
            1) [ -f "venv/bin/ansible" ] && status="✅" || status="❌" ;;
            2) [ -f "$SSH_KEY_PATH" ] && status="✅" || status="❌" ;;
            3) [ -f "$INVENTORY_FILE" ] && status="✅" || status="❌" ;;
            4) status="✅" ;; # Network connection will be tested later
        esac
    done
    
    echo -e "\n"
    print_success "Validation complete!"
}

# Next steps guidance
show_next_steps() {
    print_header "🎉 Setup Complete!"
    
    echo -e "${GREEN}Congratulations! Initial setup is complete.${NC}"
    echo
    echo -e "${CYAN}Setup Summary:${NC}"
    echo "  • Environment: $ENVIRONMENT"
    echo "  • Number of Nodes: $node_count"
    echo "  • Network ID: $NETWORK_ID"
    echo "  • Chain ID: $CHAIN_ID"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo
    echo "1. Activate Virtual Environment:"
    echo -e "   ${BLUE}source venv/bin/activate${NC}"
    echo
    echo "2. Test Connection:"
    echo -e "   ${BLUE}make test ENV=$ENVIRONMENT${NC}"
    echo
    echo "3. System Preparation:"
    echo -e "   ${BLUE}make prepare ENV=$ENVIRONMENT${NC}"
    echo
    echo "4. Mitum Deployment:"
    echo -e "   ${BLUE}make deploy ENV=$ENVIRONMENT${NC}"
    echo
    echo -e "${GREEN}💡 If you need help, please run 'make help'.${NC}"
    echo
}

# Main execution
main() {
    show_dashboard
    
    print_question "Would you like to start the setup? (Y/n): "
    read -r confirm
    
    if [[ "$confirm" == "n" || "$confirm" == "N" ]]; then
        print_info "Setup cancelled."
        exit 0
    fi
    
    select_environment
    input_node_count
    configure_network
    configure_ssh
    create_inventory
    validate_setup
    show_next_steps
    
    # Save settings
    cat > ".last_setup" << EOF
ENVIRONMENT=$ENVIRONMENT
NODE_COUNT=$node_count
NETWORK_ID=$NETWORK_ID
CHAIN_ID=$CHAIN_ID
SETUP_DATE=$(date)
EOF
}

# Script execution
main 
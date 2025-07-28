#!/bin/bash
# Interactive Setup Wizard for Mitum Ansible
# Version: 2.0.0 - Completely rewritten for stability
#
# This script provides an interactive wizard for setting up Mitum deployments

set -euo pipefail

# Find the actual project root by looking for characteristic files
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR=""
while [[ "$CURRENT_DIR" != "/" ]]; do
    if [[ -f "$CURRENT_DIR/ansible.cfg" ]] && [[ -f "$CURRENT_DIR/Makefile" ]]; then
        ROOT_DIR="$CURRENT_DIR"
        break
    fi
    CURRENT_DIR="$(dirname "$CURRENT_DIR")"
done

if [[ -z "$ROOT_DIR" ]]; then
    echo "Error: Could not find the project root directory." >&2
    exit 1
fi

# Set script directory
SCRIPT_DIR="${ROOT_DIR}/scripts"

# Source common functions
source "${SCRIPT_DIR}/lib/common.sh" || {
    echo "Error: Cannot load common functions library" >&2
    exit 1
}

# Initialize directories
LOG_DIR="${ROOT_DIR}/logs"
TEMP_DIR="${ROOT_DIR}/.tmp"
ensure_directory "$LOG_DIR"
ensure_directory "$TEMP_DIR"
export LOG_FILE="${LOG_DIR}/mitum-ansible-wizard.log"

# Global variables
WIZARD_ENVIRONMENT=""
WIZARD_NODE_COUNT=3
WIZARD_BASTION_IP=""
WIZARD_NODE_IPS=()
WIZARD_IP_METHOD=""
WIZARD_NODE_SUBNET=""
WIZARD_SSH_USER=""
WIZARD_BASTION_KEY_PATH=""
WIZARD_NODES_KEY_PATH=""
WIZARD_NETWORK_ID=""
WIZARD_MODEL_TYPE=""
WIZARD_MONITORING=""
WIZARD_MONITORING_IP=""
WIZARD_BACKUP=""
WIZARD_SSL=""

#==============================================================================
# Helper Functions
#==============================================================================

# Validate Host or IP
validate_host_or_ip() {
    local host_or_ip="$1"
    local ip_pattern='^([0-9]{1,3}\.){3}[0-9]{1,3}$'
    local hostname_pattern='^[a-zA-Z0-9.-]+$'

    if [[ -z "$host_or_ip" ]]; then
        return 1
    fi

    if [[ "$host_or_ip" =~ $ip_pattern ]]; then
        # Check IP octet ranges
        IFS=. read -r i1 i2 i3 i4 <<< "$host_or_ip"
        if (( i1 > 255 || i2 > 255 || i3 > 255 || i4 > 255 )); then
            return 1
        fi
        return 0
    elif [[ "$host_or_ip" =~ $hostname_pattern ]]; then
        return 0
    else
        return 1
    fi
}

# Display welcome message
display_welcome() {
    clear
    cat << 'EOF'
    __  __ _ _                      _              _ _     _      
   |  \/  (_) |_ _   _ _ __ ___   / \   _ __  ___(_) |__ | | ___ 
   | |\/| | | __| | | | '_ ` _ \ / _ \ | '_ \/ __| | '_ \| |/ _ \
   | |  | | | |_| |_| | | | | | / ___ \| | | \__ \ | |_) | |  __/
   |_|  |_|_|\__|\__,_|_| |_| |_/_/   \_\_| |_|___/_|_.__/|_|\___|
   
                     Interactive Setup Wizard v2.0

Welcome to the Mitum Ansible Interactive Setup Wizard!
This wizard will help you configure and deploy a Mitum blockchain cluster.

EOF
    echo "Press Enter to continue..."
    read -r
}

# Step 1: Environment Selection
select_environment() {
    clear
    echo "=========================================="
    echo "Step 1: Select Environment"
    echo "=========================================="
    echo
    echo "Available environments:"
    echo "1) Production - For live deployments"
    echo "2) Staging - For testing and validation"
    echo "3) Development - For local development"
    echo

    while true; do
        read -rp "Select environment [1-3]: " choice
        case $choice in
            1) WIZARD_ENVIRONMENT="production"; break;;
            2) WIZARD_ENVIRONMENT="staging"; break;;
            3) WIZARD_ENVIRONMENT="development"; break;;
            *) echo "Please select a valid option (1-3).";;
        esac
    done

    log_success "Environment selected: $WIZARD_ENVIRONMENT"
}

# Step 2: Node Configuration
configure_nodes() {
    clear
    echo "=========================================="
    echo "Step 2: Node Configuration"
    echo "=========================================="
    echo
    echo "How many nodes do you want to deploy?"
    echo "(Minimum: 1, Recommended: 3-7, Maximum: 100)"
    echo

    while true; do
        read -rp "Number of nodes: " WIZARD_NODE_COUNT
        if [[ "$WIZARD_NODE_COUNT" =~ ^[0-9]+$ ]] && (( WIZARD_NODE_COUNT >= 1 && WIZARD_NODE_COUNT <= 100 )); then
            break
        else
            echo "Please enter a number between 1 and 100."
        fi
    done

    # Calculate node distribution
    local consensus_nodes=$((WIZARD_NODE_COUNT > 1 ? WIZARD_NODE_COUNT - 1 : 1))
    local api_nodes=$((WIZARD_NODE_COUNT > 1 ? 1 : 0))

    log_info "Node distribution:"
    log_info "- Total nodes: $WIZARD_NODE_COUNT"
    log_info "- Consensus nodes: $consensus_nodes"
    log_info "- API nodes: $api_nodes"
}

# Step 3: Network Configuration
configure_network() {
    clear
    echo "=========================================="
    echo "Step 3: Network Configuration"
    echo "=========================================="
    echo

    # Bastion IP (optional)
    while true; do
        read -rp "Enter Bastion IP or SSH alias (or press Enter to skip): " WIZARD_BASTION_IP
        if [[ -z "$WIZARD_BASTION_IP" ]]; then
            log_warn "Bastion host skipped."
            break
        elif validate_host_or_ip "$WIZARD_BASTION_IP"; then
            log_success "Bastion set: $WIZARD_BASTION_IP"
            break
        else
            log_error "Invalid format. Please enter a valid IP/alias or press Enter to skip."
        fi
    done

    # Node IPs configuration method
    echo
    echo "How do you want to configure node IPs?"
    echo "1) Manual - Enter each IP manually"
    echo "2) Subnet - Auto-generate from subnet (e.g., 10.0.1.x)"
    echo

    while true; do
        read -rp "Select IP configuration method [1-2]: " choice
        case $choice in
            1) 
                WIZARD_IP_METHOD="manual"
                configure_manual_ips
                break
                ;;
            2) 
                WIZARD_IP_METHOD="subnet"
                configure_subnet
                break
                ;;
            *) echo "Please select 1 or 2.";;
        esac
    done

    # SSH User
    read -rp "Enter SSH username for all nodes (e.g., ubuntu, ec2-user) [ubuntu]: " WIZARD_SSH_USER
    WIZARD_SSH_USER=${WIZARD_SSH_USER:-ubuntu}
    log_success "SSH User: $WIZARD_SSH_USER"

    # SSH Keys
    configure_ssh_keys

    # Network ID
    read -rp "Enter Network ID (e.g., mitum) [mitum]: " WIZARD_NETWORK_ID
    WIZARD_NETWORK_ID=${WIZARD_NETWORK_ID:-mitum}
    log_success "Network ID: $WIZARD_NETWORK_ID"
}

# Configure manual IPs
configure_manual_ips() {
    echo
    log_info "Enter IP addresses or SSH aliases for each of the ${WIZARD_NODE_COUNT} nodes."
    log_info "You can enter them one by one, or paste a comma/space-separated list."
    
    WIZARD_NODE_IPS=()
    
    while [[ ${#WIZARD_NODE_IPS[@]} -lt $WIZARD_NODE_COUNT ]]; do
        local count_needed=$((WIZARD_NODE_COUNT - ${#WIZARD_NODE_IPS[@]}))
        read -rp "Enter ${count_needed} more IP(s) or alias(es): " user_input
        
        if [[ -z "$user_input" ]]; then
            log_warn "No input entered. Please try again."
            continue
        fi

        # Parse input: split by comma and/or spaces
        local entered_ips=()
        local normalized_input=$(echo "$user_input" | tr ',' ' ')
        read -ra temp_array <<< "$normalized_input"
        for item in "${temp_array[@]}"; do
            item=$(echo "$item" | tr -d ',' | xargs)
            if [[ -n "$item" ]]; then
                entered_ips+=("$item")
            fi
        done
        
        if [[ ${#entered_ips[@]} -eq 0 ]]; then
            log_warn "No valid entries found. Please try again."
            continue
        fi

        # Process each entered IP or alias
        for item in "${entered_ips[@]}"; do
            if validate_host_or_ip "$item"; then
                # Check for duplicates (safe array handling)
                local duplicate_found=false
                if [[ ${#WIZARD_NODE_IPS[@]} -gt 0 ]]; then
                    for existing_item in "${WIZARD_NODE_IPS[@]}"; do
                        if [[ "$existing_item" == "$item" ]]; then
                            duplicate_found=true
                            break
                        fi
                    done
                fi
                
                if [[ "$duplicate_found" == "true" ]]; then
                    log_warn "Duplicate entry '$item' ignored."
                else
                    WIZARD_NODE_IPS+=("$item")
                    log_success "Added: $item (${#WIZARD_NODE_IPS[@]}/${WIZARD_NODE_COUNT})"
                fi
            else
                log_error "Invalid format: '$item'. Please try again."
            fi

            if [[ ${#WIZARD_NODE_IPS[@]} -eq $WIZARD_NODE_COUNT ]]; then
                break
            fi
        done
    done
    
    log_info "All ${WIZARD_NODE_COUNT} node entries have been configured."
}

# Configure subnet
configure_subnet() {
    echo
    read -rp "Enter subnet base (e.g., 10.0.1 for 10.0.1.x): " WIZARD_NODE_SUBNET
    log_success "Subnet: $WIZARD_NODE_SUBNET"
}

# Configure SSH keys
configure_ssh_keys() {
    echo
    log_info "Configuring SSH private key paths..."
    
    # Bastion Key (optional, only if bastion host is set)
    if [[ -n "$WIZARD_BASTION_IP" ]]; then
        while true; do
            local default_bastion_key="${ROOT_DIR}/keys/ssh/${WIZARD_ENVIRONMENT}/bastion.pem"
            read -rp "Enter path to Bastion private key (.pem) [${default_bastion_key}]: " WIZARD_BASTION_KEY_PATH
            WIZARD_BASTION_KEY_PATH=${WIZARD_BASTION_KEY_PATH:-$default_bastion_key}
            WIZARD_BASTION_KEY_PATH="${WIZARD_BASTION_KEY_PATH/#\~/$HOME}"

            if [[ -f "$WIZARD_BASTION_KEY_PATH" ]]; then
                log_success "Bastion key path set: $WIZARD_BASTION_KEY_PATH"
                break
            else
                log_error "File not found: '$WIZARD_BASTION_KEY_PATH'. Please enter a valid path."
            fi
        done
    else
        WIZARD_BASTION_KEY_PATH=""
    fi

    # Nodes Key (optional)
    while true; do
        local default_nodes_key="${ROOT_DIR}/keys/ssh/${WIZARD_ENVIRONMENT}/nodes.pem"
        read -rp "Enter path to Nodes private key (.pem) (or press Enter if none): " WIZARD_NODES_KEY_PATH
        
        if [[ -z "$WIZARD_NODES_KEY_PATH" ]]; then
            log_warn "Nodes private key skipped. Password-based authentication will be assumed."
            WIZARD_NODES_KEY_PATH=""
            break
        fi

        WIZARD_NODES_KEY_PATH=${WIZARD_NODES_KEY_PATH:-$default_nodes_key}
        WIZARD_NODES_KEY_PATH="${WIZARD_NODES_KEY_PATH/#\~/$HOME}"
        
        if [[ -f "$WIZARD_NODES_KEY_PATH" ]]; then
            log_success "Nodes key path set: $WIZARD_NODES_KEY_PATH"
            break
        else
            log_error "File not found: '$WIZARD_NODES_KEY_PATH'. Please enter a valid path or press Enter to skip."
        fi
    done
}

# Step 4: Deployment Configuration
configure_deployment() {
    clear
    echo "=========================================="
    echo "Step 4: Deployment Configuration"
    echo "=========================================="
    echo

    # Model Type
    read -rp "Enter Mitum model type (e.g., mitum-currency) [mitum-currency]: " WIZARD_MODEL_TYPE
    WIZARD_MODEL_TYPE=${WIZARD_MODEL_TYPE:-mitum-currency}
    log_success "Model Type: $WIZARD_MODEL_TYPE"

    # Monitoring
    while true; do
        read -rp "Enable Monitoring (Prometheus/Grafana)? [y/N]: " yn
        case $yn in
            [Yy]* ) 
                WIZARD_MONITORING="yes"
                log_success "Monitoring: Enabled"
                
                read -rp "Enter Monitoring node IP/alias (or press Enter to use Bastion): " WIZARD_MONITORING_IP
                if [[ -z "$WIZARD_MONITORING_IP" ]]; then
                    WIZARD_MONITORING_IP="$WIZARD_BASTION_IP"
                elif ! validate_host_or_ip "$WIZARD_MONITORING_IP"; then
                    log_warn "Invalid IP/alias, using bastion instead"
                    WIZARD_MONITORING_IP="$WIZARD_BASTION_IP"
                fi
                log_success "Monitoring IP: $WIZARD_MONITORING_IP"
                break
                ;;
            [Nn]* | "" ) 
                WIZARD_MONITORING="no"
                log_success "Monitoring: Disabled"
                break
                ;;
            * ) echo "Please answer yes or no.";;
        esac
    done

    # Backup
    while true; do
        read -rp "Enable automated backups? [y/N]: " yn
        case $yn in
            [Yy]* ) WIZARD_BACKUP="yes"; log_success "Backup: Enabled"; break;;
            [Nn]* | "" ) WIZARD_BACKUP="no"; log_success "Backup: Disabled"; break;;
            * ) echo "Please answer yes or no.";;
        esac
    done

    # SSL/TLS
    while true; do
        read -rp "Enable SSL/TLS for API endpoints? [y/N]: " yn
        case $yn in
            [Yy]* ) WIZARD_SSL="yes"; log_success "SSL/TLS: Enabled"; break;;
            [Nn]* | "" ) WIZARD_SSL="no"; log_success "SSL/TLS: Disabled"; break;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Step 5: Review Configuration
review_configuration() {
    clear
    echo "=========================================="
    echo "Step 5: Review Configuration"
    echo "=========================================="
    echo
    echo "Environment:     $WIZARD_ENVIRONMENT"
    echo "Node Count:      $WIZARD_NODE_COUNT"
    echo "Bastion IP:      ${WIZARD_BASTION_IP:-'(none)'}"
    echo "IP Method:       $WIZARD_IP_METHOD"
    
    if [[ "$WIZARD_IP_METHOD" == "manual" ]]; then
        if [[ ${#WIZARD_NODE_IPS[@]} -gt 0 ]]; then
            echo "Node IPs:        ${WIZARD_NODE_IPS[*]}"
        else
            echo "Node IPs:        (none configured)"
        fi
    elif [[ "$WIZARD_IP_METHOD" == "subnet" ]]; then
        echo "Node Subnet:     $WIZARD_NODE_SUBNET"
    fi
    
    echo "SSH User:        $WIZARD_SSH_USER"
    echo "Network ID:      $WIZARD_NETWORK_ID"
    echo "Model Type:      $WIZARD_MODEL_TYPE"
    echo "Monitoring:      $WIZARD_MONITORING"
    echo "Backup:          $WIZARD_BACKUP"
    echo "SSL/TLS:         $WIZARD_SSL"
    echo
    echo "=========================================="
    echo

    while true; do
        read -rp "Is this configuration correct? [Y/n]: " yn
        case $yn in
            [Yy]* | "" ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Generate inventory and configuration
generate_configuration() {
    clear
    echo "=========================================="
    echo "Generating Configuration Files"
    echo "=========================================="

    log_info "Generating inventory..."

    # Build the command to run the inventory generation playbook
    local gen_cmd="ansible-playbook playbooks/generate-inventory.yml"
    local extra_vars=(
        "env=${WIZARD_ENVIRONMENT}"
        "total_nodes=${WIZARD_NODE_COUNT}"
        "ssh_user=${WIZARD_SSH_USER}"
        "network_id=${WIZARD_NETWORK_ID}"
        "model_type=${WIZARD_MODEL_TYPE}"
        "bastion_ip=${WIZARD_BASTION_IP}"
        "bastion_key_path=${WIZARD_BASTION_KEY_PATH}"
        "nodes_key_path=${WIZARD_NODES_KEY_PATH}"
        "ip_config_method=${WIZARD_IP_METHOD}"
        "node_ips_list=$(IFS=,; echo "${WIZARD_NODE_IPS[*]}")"
        "node_subnet=${WIZARD_NODE_SUBNET}"
        "monitoring_enabled=${WIZARD_MONITORING}"
        "monitoring_ip=${WIZARD_MONITORING_IP}"
        "backup_enabled=${WIZARD_BACKUP}"
        "ssl_enabled=${WIZARD_SSL}"
    )

    gen_cmd+=" --extra-vars \"$(IFS=' ' ; echo "${extra_vars[*]}")\""

    # Execute the command
    if ! eval "$gen_cmd"; then
        log_error "Failed to generate inventory"
        log_error "Please check the output above for errors."
        exit 1
    fi

    log_success "Inventory generated successfully!"
    echo
}

# Show deployment options
show_deployment_options() {
    clear
    echo "=========================================="
    echo "Your Mitum cluster configuration is ready."
    echo "=========================================="
    echo
    echo "What would you like to do next?"
    echo "1) Deploy now"
    echo "2) Test connectivity first"
    echo "3) Exit (deploy manually later)"
    echo

    while true; do
        read -rp "Select option [1-3]: " choice
        case $choice in
            1) deploy_now; break;;
            2) test_connectivity; break;;
            3) exit_gracefully; break;;
            *) echo "Please select a valid option (1-3).";;
        esac
    done
}

# Deploy now
deploy_now() {
    log_info "Starting deployment..."
    log_info "Executing: ansible-playbook playbooks/site.yml -i inventories/${WIZARD_ENVIRONMENT}/hosts.yml"
    
    if ansible-playbook playbooks/site.yml -i "inventories/${WIZARD_ENVIRONMENT}/hosts.yml"; then
        log_success "Deployment completed successfully!"
        show_post_deployment_info
    else
        log_error "Deployment failed"
        echo "Check the logs for details: logs/ansible.log"
    fi
}

# Test connectivity
test_connectivity() {
    log_info "Testing connectivity..."
    
    if ansible all -i "inventories/${WIZARD_ENVIRONMENT}/hosts.yml" -m ping; then
        log_success "Connectivity test passed!"
        show_deployment_options
    else
        log_error "Connectivity test failed"
        echo "Please check your SSH configuration and try again."
    fi
}

# Exit gracefully
exit_gracefully() {
    echo
    log_info "Configuration saved. You can deploy manually using:"
    echo "  make deploy ENV=${WIZARD_ENVIRONMENT}"
    echo "or"
    echo "  ansible-playbook playbooks/site.yml -i inventories/${WIZARD_ENVIRONMENT}/hosts.yml"
    echo
    log_success "Setup wizard completed."
}

# Show post-deployment information
show_post_deployment_info() {
    echo
    echo "=========================================="
    echo "Deployment Complete!"
    echo "=========================================="
    echo
    echo "Your Mitum cluster has been deployed successfully."
    echo
    echo "Useful commands:"
    echo "  Check status: make status"
    echo "  View logs:    make logs"
    echo "  Stop nodes:   make stop"
    echo "  Start nodes:  make start"
    echo
    if [[ "$WIZARD_MONITORING" == "yes" ]]; then
        echo "Monitoring is available at:"
        echo "  Grafana:    http://${WIZARD_MONITORING_IP}:3000"
        echo "  Prometheus: http://${WIZARD_MONITORING_IP}:9090"
        echo
    fi
    echo "=========================================="
}

#==============================================================================
# Main Function
#==============================================================================

main() {
    # Initialize
    display_welcome
    
    # Run configuration steps
    while true; do
        select_environment
        configure_nodes
        configure_network
        configure_deployment
        
        if review_configuration; then
            break
        else
            echo "Let's reconfigure..."
            sleep 1
        fi
    done
    
    # Generate configuration
    generate_configuration
    
    # Show deployment options
    show_deployment_options
}

# Run main function
main "$@"
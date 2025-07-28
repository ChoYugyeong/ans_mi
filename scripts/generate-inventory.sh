#!/bin/bash
# Generate Dynamic Inventory Script
# Version: 3.0.0
#
# This script generates Ansible inventory based on user input
# with improved security and SSH multiplexing support

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Source common functions
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh" || {
    echo "Error: Cannot load common functions library" >&2
    exit 1
}

# Default values
DEFAULT_ENVIRONMENT="production"
DEFAULT_NODE_COUNT=3
DEFAULT_NODE_USER="ubuntu"
DEFAULT_BASTION_USER="ubuntu"
DEFAULT_NODE_PORT=22
DEFAULT_NETWORK_ID="mitum"
DEFAULT_MODEL_TYPE="mitum-currency"

# Variables
ENVIRONMENT=""
NODE_COUNT=""
BASTION_IP=""
NODE_IPS=()
NODE_SUBNET=""
NODE_USER=""
BASTION_USER=""
BASTION_KEY_PATH=""
NODE_KEY_PATH=""
NETWORK_ID=""
MODEL_TYPE=""
MONITORING_ENABLED=false
MONITORING_IP=""
IP_CONFIG_METHOD="manual"

# Usage information
usage() {
    cat << EOF
${COLOR_GREEN}Generate Dynamic Inventory for Mitum Deployment${COLOR_NC}

This script generates Ansible inventory files with SSH multiplexing support.

${COLOR_YELLOW}Usage:${COLOR_NC}
    $0 [OPTIONS]

${COLOR_YELLOW}Options:${COLOR_NC}
    -e, --environment ENV       Environment name (default: production)
    -n, --nodes COUNT          Number of nodes (default: 3)
    -b, --bastion-ip IP        Bastion host IP address (required)
    -i, --node-ips IPS         Comma-separated list of node IPs
    -s, --subnet SUBNET        Subnet base for auto-generation (e.g., 10.0.1)
    -u, --user USER            SSH user for nodes (default: ubuntu)
    --bastion-user USER        SSH user for bastion (default: same as node user)
    --network-id ID            Mitum network ID (default: mitum)
    --model-type TYPE          Mitum model type (default: mitum-currency)
    --monitoring               Enable monitoring node
    --monitoring-ip IP         Monitoring node IP
    --aws-discovery            Use AWS EC2 auto-discovery
    --gcp-discovery            Use GCP auto-discovery
    -h, --help                 Show this help message

${COLOR_YELLOW}Examples:${COLOR_NC}
    # Manual IP configuration
    $0 -n 5 -b 52.74.123.45 -i 10.0.1.10,10.0.1.11,10.0.1.12,10.0.1.13,10.0.1.14

    # Subnet-based auto-generation
    $0 -n 5 -b 52.74.123.45 -s 10.0.1

    # With monitoring
    $0 -n 3 -b 52.74.123.45 -s 10.0.1 --monitoring --monitoring-ip 10.0.1.100

    # AWS auto-discovery
    $0 -n 5 -b 52.74.123.45 --aws-discovery

${COLOR_YELLOW}SSH Multiplexing:${COLOR_NC}
    This script configures SSH multiplexing for improved performance.
    Connections are reused for 10 minutes after the last session.

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -n|--nodes)
                NODE_COUNT="$2"
                shift 2
                ;;
            -b|--bastion-ip)
                BASTION_IP="$2"
                shift 2
                ;;
            -i|--node-ips)
                IFS=',' read -ra NODE_IPS <<< "$2"
                IP_CONFIG_METHOD="manual"
                shift 2
                ;;
            -s|--subnet)
                NODE_SUBNET="$2"
                IP_CONFIG_METHOD="subnet"
                shift 2
                ;;
            -u|--user)
                NODE_USER="$2"
                shift 2
                ;;
            --bastion-user)
                BASTION_USER="$2"
                shift 2
                ;;
            --network-id)
                NETWORK_ID="$2"
                shift 2
                ;;
            --model-type)
                MODEL_TYPE="$2"
                shift 2
                ;;
            --monitoring)
                MONITORING_ENABLED=true
                shift
                ;;
            --monitoring-ip)
                MONITORING_IP="$2"
                shift 2
                ;;
            --aws-discovery)
                IP_CONFIG_METHOD="aws"
                shift
                ;;
            --gcp-discovery)
                IP_CONFIG_METHOD="gcp"
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

# Validate inputs
validate_inputs() {
    # Set defaults
    ENVIRONMENT="${ENVIRONMENT:-$DEFAULT_ENVIRONMENT}"
    NODE_COUNT="${NODE_COUNT:-$DEFAULT_NODE_COUNT}"
    NODE_USER="${NODE_USER:-$DEFAULT_NODE_USER}"
    BASTION_USER="${BASTION_USER:-$NODE_USER}"
    NETWORK_ID="${NETWORK_ID:-$DEFAULT_NETWORK_ID}"
    MODEL_TYPE="${MODEL_TYPE:-$DEFAULT_MODEL_TYPE}"
    
    # Validate bastion IP
    if [[ -z "$BASTION_IP" ]]; then
        error_exit "Bastion IP is required"
    fi
    
    if ! validate_ip "$BASTION_IP"; then
        error_exit "Invalid bastion IP: $BASTION_IP"
    fi
    
    # Validate node count
    if [[ ! "$NODE_COUNT" =~ ^[0-9]+$ ]] || [[ "$NODE_COUNT" -lt 1 ]] || [[ "$NODE_COUNT" -gt 100 ]]; then
        error_exit "Node count must be between 1 and 100"
    fi
    
    # Validate IPs based on method
    case "$IP_CONFIG_METHOD" in
        manual)
            if [[ ${#NODE_IPS[@]} -eq 0 ]]; then
                error_exit "Node IPs are required for manual configuration"
            fi
            if [[ ${#NODE_IPS[@]} -ne $NODE_COUNT ]]; then
                error_exit "Number of IPs (${#NODE_IPS[@]}) doesn't match node count ($NODE_COUNT)"
            fi
            for ip in "${NODE_IPS[@]}"; do
                if ! validate_ip "$ip"; then
                    error_exit "Invalid node IP: $ip"
                fi
            done
            ;;
        subnet)
            if [[ -z "$NODE_SUBNET" ]]; then
                error_exit "Subnet is required for auto-generation"
            fi
            # Generate IPs
            generate_subnet_ips
            ;;
        aws|gcp)
            log_info "Using cloud discovery method: $IP_CONFIG_METHOD"
            discover_cloud_instances
            ;;
    esac
    
    # Validate monitoring
    if [[ "$MONITORING_ENABLED" == "true" ]] && [[ -n "$MONITORING_IP" ]]; then
        if ! validate_ip "$MONITORING_IP"; then
            error_exit "Invalid monitoring IP: $MONITORING_IP"
        fi
    fi
    
    # Check SSH keys
    find_ssh_keys
}

# Generate IPs from subnet
generate_subnet_ips() {
    log_info "Generating IPs from subnet: $NODE_SUBNET"
    
    NODE_IPS=()
    local start_ip=10
    
    for ((i = 0; i < NODE_COUNT; i++)); do
        NODE_IPS+=("${NODE_SUBNET}.$(( start_ip + i ))")
    done
    
    log_info "Generated ${#NODE_IPS[@]} IPs"
}

# Discover cloud instances
discover_cloud_instances() {
    case "$IP_CONFIG_METHOD" in
        aws)
            discover_aws_instances
            ;;
        gcp)
            discover_gcp_instances
            ;;
    esac
}

# AWS EC2 discovery
discover_aws_instances() {
    log_info "Discovering AWS EC2 instances..."
    
    if ! command -v aws >/dev/null 2>&1; then
        error_exit "AWS CLI is required for EC2 discovery"
    fi
    
    # Get instances with specific tags
    local instances=$(aws ec2 describe-instances \
        --filters "Name=tag:MitumRole,Values=node" \
                  "Name=instance-state-name,Values=running" \
        --query "Reservations[*].Instances[*].[PrivateIpAddress]" \
        --output text)
    
    NODE_IPS=()
    while IFS= read -r ip; do
        if [[ -n "$ip" ]]; then
            NODE_IPS+=("$ip")
        fi
    done <<< "$instances"
    
    if [[ ${#NODE_IPS[@]} -eq 0 ]]; then
        error_exit "No AWS instances found with MitumRole=node tag"
    fi
    
    NODE_COUNT=${#NODE_IPS[@]}
    log_info "Found $NODE_COUNT AWS instances"
}

# GCP discovery
discover_gcp_instances() {
    log_info "Discovering GCP instances..."
    
    if ! command -v gcloud >/dev/null 2>&1; then
        error_exit "gcloud CLI is required for GCP discovery"
    fi
    
    # Get instances with specific labels
    local instances=$(gcloud compute instances list \
        --filter="labels.mitum-role=node" \
        --format="value(networkInterfaces[0].networkIP)")
    
    NODE_IPS=()
    while IFS= read -r ip; do
        if [[ -n "$ip" ]]; then
            NODE_IPS+=("$ip")
        fi
    done <<< "$instances"
    
    if [[ ${#NODE_IPS[@]} -eq 0 ]]; then
        error_exit "No GCP instances found with mitum-role=node label"
    fi
    
    NODE_COUNT=${#NODE_IPS[@]}
    log_info "Found $NODE_COUNT GCP instances"
}

# Find SSH keys
find_ssh_keys() {
    local key_dir="$ROOT_DIR/keys/ssh/$ENVIRONMENT"
    
    # Find bastion key
    if [[ -f "$key_dir/bastion.pem" ]]; then
        BASTION_KEY_PATH="$key_dir/bastion.pem"
        fix_ssh_key_permissions "$BASTION_KEY_PATH"
    elif [[ -f "$key_dir/bastion" ]]; then
        BASTION_KEY_PATH="$key_dir/bastion"
        fix_ssh_key_permissions "$BASTION_KEY_PATH"
    else
        log_warn "Bastion SSH key not found in $key_dir"
    fi
    
    # Find node key
    if [[ -f "$key_dir/nodes.pem" ]]; then
        NODE_KEY_PATH="$key_dir/nodes.pem"
        fix_ssh_key_permissions "$NODE_KEY_PATH"
    elif [[ -f "$key_dir/node.pem" ]]; then
        NODE_KEY_PATH="$key_dir/node.pem"
        fix_ssh_key_permissions "$NODE_KEY_PATH"
    else
        log_warn "Node SSH key not found in $key_dir"
        NODE_KEY_PATH="$BASTION_KEY_PATH"
    fi
}

# Generate inventory file
generate_inventory() {
    local inventory_dir="$ROOT_DIR/inventories/$ENVIRONMENT"
    local inventory_file="$inventory_dir/hosts.yml"
    
    ensure_directory "$inventory_dir"
    ensure_directory "$inventory_dir/group_vars"
    ensure_directory "$inventory_dir/host_vars"
    
    log_info "Generating inventory: $inventory_file"
    
    # Backup existing inventory
    backup_file "$inventory_file" "$ROOT_DIR/backups"
    
    # Generate inventory
    cat > "$inventory_file" << EOF
---
# Mitum Ansible Inventory
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# Environment: $ENVIRONMENT
# Nodes: $NODE_COUNT
# Method: $IP_CONFIG_METHOD

all:
  vars:
    # SSH Multiplexing Configuration
    ansible_ssh_common_args: '-o ControlMaster=auto -o ControlPersist=10m -o ControlPath=~/.ansible/cp/%h-%p-%r'
    ansible_ssh_pipelining: true
    
  children:
    bastion:
      hosts:
        bastion:
          ansible_host: $BASTION_IP
          ansible_user: $BASTION_USER
EOF

    # Add bastion key if exists
    if [[ -n "$BASTION_KEY_PATH" ]]; then
        echo "          ansible_ssh_private_key_file: $BASTION_KEY_PATH" >> "$inventory_file"
    fi
    
    cat >> "$inventory_file" << EOF
          public_ip: $BASTION_IP
          private_ip: $BASTION_IP

    mitum_nodes:
      hosts:
EOF

    # Calculate consensus nodes (80% of total, minimum 1)
    local consensus_count=$(( NODE_COUNT * 80 / 100 ))
    [[ $consensus_count -lt 1 ]] && consensus_count=1
    
    # Add nodes
    for i in "${!NODE_IPS[@]}"; do
        local node_name="node$i"
        local node_ip="${NODE_IPS[$i]}"
        local is_consensus=$([[ $i -lt $consensus_count ]] && echo "true" || echo "false")
        local is_api=$([[ $i -eq 0 ]] && echo "true" || echo "false")
        
        cat >> "$inventory_file" << EOF
        $node_name:
          ansible_host: $node_ip
          mitum_node_id: $i
          mitum_node_type: $([[ "$is_consensus" == "true" ]] && echo "consensus" || echo "api")
          mitum_api_enabled: $is_api
          mitum_api_port: 54320
          mitum_node_port: $(( 4320 + i ))
          private_ip: $node_ip
EOF
    done
    
    # Add node group vars
    cat >> "$inventory_file" << EOF

      vars:
        ansible_user: $NODE_USER
EOF

    # Add node SSH key if different from bastion
    if [[ -n "$NODE_KEY_PATH" ]] && [[ "$NODE_KEY_PATH" != "$BASTION_KEY_PATH" ]]; then
        echo "        ansible_ssh_private_key_file: $NODE_KEY_PATH" >> "$inventory_file"
    fi
    
    # Add proxy jump through bastion
    cat >> "$inventory_file" << EOF
        ansible_ssh_common_args: '-o ProxyJump=bastion -o ControlMaster=auto -o ControlPersist=10m -o ControlPath=~/.ansible/cp/%h-%p-%r'
        
        # Mitum configuration
        mitum_network_id: "$NETWORK_ID"
        mitum_model_type: "$MODEL_TYPE"
        mitum_environment: "$ENVIRONMENT"
        
        # Network settings
        mitum_bind_host: "0.0.0.0"
        mitum_advertise_host: "{{ private_ip }}"
        
        # Consensus settings
        mitum_consensus_threshold: $(( consensus_count > 3 ? 67 : 100 ))
        mitum_interval_broadcast_ballot: "1.5s"
        mitum_wait_broadcast_ballot: "5s"
        mitum_interval_broadcast_proposal: "5s"
        mitum_wait_broadcast_proposal: "10s"
        mitum_interval_broadcast_accept: "1.5s"
        mitum_wait_broadcast_accept: "5s"
EOF

    # Add monitoring section if enabled
    if [[ "$MONITORING_ENABLED" == "true" ]]; then
        cat >> "$inventory_file" << EOF

    monitoring:
      hosts:
        monitor:
          ansible_host: ${MONITORING_IP:-$BASTION_IP}
          ansible_user: $NODE_USER
EOF
        
        if [[ "$MONITORING_IP" != "$BASTION_IP" ]]; then
            echo "          ansible_ssh_common_args: '-o ProxyJump=bastion -o ControlMaster=auto -o ControlPersist=10m'" >> "$inventory_file"
        fi
        
        cat >> "$inventory_file" << EOF
      vars:
        prometheus_port: 9090
        grafana_port: 3000
        alertmanager_port: 9093
EOF
    fi
    
    log_success "Inventory generated: $inventory_file"
}

# Generate group_vars
generate_group_vars() {
    local group_vars_file="$ROOT_DIR/inventories/$ENVIRONMENT/group_vars/all.yml"
    
    log_info "Generating group variables..."
    
    cat > "$group_vars_file" << EOF
---
# Mitum Ansible Group Variables
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# Environment: $ENVIRONMENT

# === Deployment Settings ===
mitum_environment: "$ENVIRONMENT"
mitum_deployment_type: "cluster"
mitum_deployment_phase: "all"

# === Version Settings ===
mitum_version: "latest"
mitum_install_method: "binary"
mitum_download_url: "https://github.com/ProtoconNet/mitum2/releases/download"

# === Network Configuration ===
mitum_network_id: "$NETWORK_ID"
mitum_model_type: "$MODEL_TYPE"
mitum_genesis_time: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# === Directory Structure ===
mitum_base_dir: "/opt/mitum"
mitum_install_dir: "{{ mitum_base_dir }}/bin"
mitum_data_dir: "{{ mitum_base_dir }}/data"
mitum_config_dir: "{{ mitum_base_dir }}/config"
mitum_keys_dir: "{{ mitum_base_dir }}/keys"
mitum_log_dir: "/var/log/mitum"
mitum_backup_dir: "/var/backups/mitum"

# === Service Configuration ===
mitum_service_name: "mitum"
mitum_service_user: "mitum"
mitum_service_group: "mitum"
mitum_service_enabled: true
mitum_service_state: "started"

# === Performance Tuning ===
mitum_max_open_files: 65536
mitum_tcp_keepalive: true
mitum_connection_timeout: 30
mitum_max_message_size: 104857600  # 100MB

# === MongoDB Configuration ===
mitum_mongodb_enabled: true
mitum_mongodb_version: "7.0"
mitum_mongodb_install_method: "native"
mitum_mongodb_replica_set: "mitum-rs"
mitum_mongodb_port: 27017
mitum_mongodb_auth_enabled: true
mitum_mongodb_admin_user: "admin"
mitum_mongodb_mitum_user: "mitum"
mitum_mongodb_data_dir: "/var/lib/mongodb"
mitum_mongodb_log_dir: "/var/log/mongodb"

# === Key Generation ===
mitum_keygen_enabled: true
mitum_keygen_strategy: "centralized"
mitum_key_prefix: "mitum"
mitum_keys_backup: true

# === Monitoring Configuration ===
mitum_monitoring:
  enabled: $([[ "$MONITORING_ENABLED" == "true" ]] && echo "true" || echo "false")
  prometheus_enabled: true
  grafana_enabled: true
  alertmanager_enabled: true
  node_exporter_enabled: true
  
mitum_node_exporter_port: 9100
mitum_metrics_port: 9090

# === Backup Configuration ===
mitum_backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention_days: 7
  compression: true
  encryption: true

# === Security Settings ===
security_firewall_enabled: true
security_ssl_enabled: false
security_fail2ban_enabled: true
security_auditd_enabled: true

# === SSH Configuration ===
ssh_hardening_enabled: true
ssh_permit_root_login: "no"
ssh_password_authentication: "no"
ssh_x11_forwarding: "no"

# === System Requirements ===
system_packages:
  - curl
  - wget
  - jq
  - htop
  - iotop
  - sysstat
  - net-tools
  - python3
  - python3-pip

# === Ansible Settings ===
ansible_python_interpreter: /usr/bin/python3
ansible_ssh_pipelining: true
EOF
    
    log_success "Group variables generated"
}

# Generate SSH config
generate_ssh_config() {
    local ssh_config_file="$ROOT_DIR/inventories/$ENVIRONMENT/ssh_config"
    
    log_info "Generating SSH configuration..."
    
    cat > "$ssh_config_file" << EOF
# SSH Configuration for $ENVIRONMENT environment
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Global settings
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    Compression yes
    
# SSH Multiplexing
Host *
    ControlMaster auto
    ControlPath ~/.ansible/cp/%h-%p-%r
    ControlPersist 10m

# Bastion host
Host bastion mitum-bastion
    HostName $BASTION_IP
    User $BASTION_USER
    Port 22
EOF

    if [[ -n "$BASTION_KEY_PATH" ]]; then
        echo "    IdentityFile $BASTION_KEY_PATH" >> "$ssh_config_file"
    fi
    
    cat >> "$ssh_config_file" << EOF
    StrictHostKeyChecking yes
    UserKnownHostsFile ~/.ssh/known_hosts_mitum

# Mitum nodes
Host node* mitum-node-*
    User $NODE_USER
    Port 22
    ProxyJump bastion
EOF

    if [[ -n "$NODE_KEY_PATH" ]]; then
        echo "    IdentityFile $NODE_KEY_PATH" >> "$ssh_config_file"
    fi
    
    cat >> "$ssh_config_file" << EOF
    StrictHostKeyChecking yes
    UserKnownHostsFile ~/.ssh/known_hosts_mitum

# Direct node access (for specific IPs)
EOF

    # Add individual node configurations
    for i in "${!NODE_IPS[@]}"; do
        cat >> "$ssh_config_file" << EOF
Host ${NODE_IPS[$i]}
    User $NODE_USER
    ProxyJump bastion
EOF
        if [[ -n "$NODE_KEY_PATH" ]]; then
            echo "    IdentityFile $NODE_KEY_PATH" >> "$ssh_config_file"
        fi
    done
    
    chmod 600 "$ssh_config_file"
    log_success "SSH configuration generated"
}

# Display summary
display_summary() {
    echo
    echo "=========================================="
    echo "    Inventory Generation Complete!"
    echo "=========================================="
    echo
    echo "Environment: ${COLOR_CYAN}$ENVIRONMENT${COLOR_NC}"
    echo "Bastion IP: ${COLOR_CYAN}$BASTION_IP${COLOR_NC}"
    echo "Node Count: ${COLOR_CYAN}$NODE_COUNT${COLOR_NC}"
    echo "Network ID: ${COLOR_CYAN}$NETWORK_ID${COLOR_NC}"
    echo "Model Type: ${COLOR_CYAN}$MODEL_TYPE${COLOR_NC}"
    echo
    echo "Generated Files:"
    echo "- Inventory: ${COLOR_GREEN}inventories/$ENVIRONMENT/hosts.yml${COLOR_NC}"
    echo "- Variables: ${COLOR_GREEN}inventories/$ENVIRONMENT/group_vars/all.yml${COLOR_NC}"
    echo "- SSH Config: ${COLOR_GREEN}inventories/$ENVIRONMENT/ssh_config${COLOR_NC}"
    echo
    echo "Node Configuration:"
    for i in "${!NODE_IPS[@]}"; do
        local node_type=$([[ $i -lt $(( NODE_COUNT * 80 / 100 )) ]] && echo "consensus" || echo "api")
        echo "- node$i: ${COLOR_CYAN}${NODE_IPS[$i]}${COLOR_NC} ($node_type)"
    done
    echo
    echo "Next Steps:"
    echo "1. Test connectivity:"
    echo "   ${COLOR_CYAN}ansible all -i inventories/$ENVIRONMENT/hosts.yml -m ping${COLOR_NC}"
    echo
    echo "2. Deploy Mitum:"
    echo "   ${COLOR_CYAN}ansible-playbook playbooks/site.yml -i inventories/$ENVIRONMENT/hosts.yml${COLOR_NC}"
    echo
    echo "3. Use SSH config:"
    echo "   ${COLOR_CYAN}ssh -F inventories/$ENVIRONMENT/ssh_config node0${COLOR_NC}"
    echo
    echo "=========================================="
}

# Main function
main() {
    log_info "Starting inventory generation..."
    
    # Parse arguments
    parse_args "$@"
    
    # Validate inputs
    validate_inputs
    
    # Generate files
    generate_inventory
    generate_group_vars
    generate_ssh_config
    
    # Display summary
    display_summary
    
    log_success "Inventory generation completed successfully!"
}

# Execute main function
main "$@"
#!/bin/bash
# generate-inventory.sh - Enhanced inventory generator with interactive mode
# Version: 4.0.0 - Supports both interactive and command-line modes

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Default values
DEFAULT_NODE_COUNT=5
DEFAULT_CONSENSUS_NODES=4
DEFAULT_ENVIRONMENT="production"
DEFAULT_MODEL="mitum-currency"
DEFAULT_NODE_USER="ubuntu"
DEFAULT_BASTION_USER="ubuntu"
DEFAULT_NETWORK_ID="mitum"

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Functions
log() { echo -e "${GREEN}[INFO]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }
prompt() { echo -ne "${PURPLE}$*${NC} "; }

usage() {
    cat << EOF
${GREEN}Mitum Inventory Generator${NC}

Generate Ansible inventory for Mitum blockchain deployment.
Supports both interactive mode and command-line options.

${YELLOW}Usage:${NC}
    $0                          # Interactive mode (recommended)
    $0 [OPTIONS]                # Command-line mode

${YELLOW}Required Options (command-line mode):${NC}
    -b, --bastion-ip IP         Bastion host public IP

${YELLOW}Node Configuration (choose one):${NC}
    --node-ips IP1,IP2,IP3      Comma-separated list of node IPs
    --node-subnet SUBNET        Auto-generate IPs from subnet (e.g., 172.16.1)
    --start-ip IP               Starting IP for auto-generation (default: 10)

${YELLOW}Optional Parameters:${NC}
    -n, --nodes COUNT           Total number of nodes (default: $DEFAULT_NODE_COUNT)
    -c, --consensus COUNT       Number of consensus nodes (default: $DEFAULT_CONSENSUS_NODES)
    -e, --environment ENV       Environment name (default: $DEFAULT_ENVIRONMENT)
    -m, --model MODEL           Mitum model type (default: $DEFAULT_MODEL)
    --network-id ID             Network identifier (default: $DEFAULT_NETWORK_ID)
    
${YELLOW}SSH Configuration:${NC}
    --bastion-user USER         Bastion SSH user (default: $DEFAULT_BASTION_USER)
    --node-user USER            Node SSH user (default: $DEFAULT_NODE_USER)
    --node-key-name NAME        Node key filename (default: nodes.pem)
    
${YELLOW}Additional Options:${NC}
    -o, --output FILE           Output file path
    --port-start PORT           Starting port number (default: 4320)
    --monitoring-ip IP          Monitoring server IP
    --use-jump-host             Use -J option instead of ProxyCommand
    --check-keys                Validate SSH keys exist
    --dry-run                   Show what would be generated
    -h, --help                  Show this help

${YELLOW}Examples:${NC}
    # Interactive mode (easiest)
    $0

    # Basic usage with specific IPs
    $0 -b 52.74.123.45 --node-ips 10.0.1.10,10.0.1.11,10.0.1.12

    # Auto-generate IPs from subnet
    $0 -b 52.74.123.45 --node-subnet 192.168.1 -n 5

    # Full configuration
    $0 -b 52.74.123.45 \\
       --node-ips 10.0.1.10,10.0.1.11,10.0.1.12 \\
       -m mitum-currency \\
       --network-id mainnet \\
       -e production \\
       --check-keys

${YELLOW}SSH Key Requirements:${NC}
    Required keys in keys/ssh/{environment}/:
    - bastion.pem: Access to bastion host
    - nodes.pem: Access from bastion to nodes (can be different name)

EOF
}

# Check SSH keys
check_ssh_keys() {
    local env=$1
    local node_key_name=${2:-nodes.pem}
    local keys_dir="$ROOT_DIR/keys/ssh/$env"
    local all_good=true
    
    log "Checking SSH keys for $env environment..."
    
    # Check bastion key
    if [[ -f "$keys_dir/bastion.pem" ]] || [[ -f "$keys_dir/bastion.key" ]]; then
        log "✓ Found bastion key"
    else
        warning "Missing bastion key"
        echo "  To add: ./scripts/manage-keys.sh add $env ~/path/to/key.pem bastion.pem"
        all_good=false
    fi
    
    # Check node key
    if [[ -f "$keys_dir/$node_key_name" ]]; then
        log "✓ Found node key: $node_key_name"
    else
        warning "Missing node key: $node_key_name"
        echo "  To add: ./scripts/manage-keys.sh add $env ~/path/to/key.pem $node_key_name"
        all_good=false
    fi
    
    if [[ "$all_good" == "false" ]]; then
        return 1
    fi
    return 0
}

# Interactive mode
interactive_mode() {
    echo -e "${GREEN}=== Mitum Ansible Inventory Generation Assistant ===${NC}"
    echo -e "${YELLOW}Please provide the required information step by step.${NC}\n"
    
    # Environment selection
    prompt "Select environment [production/staging/development] (default: production):"
    read -r env_input
    ENVIRONMENT=${env_input:-production}
    
    # Bastion information
    prompt "Enter Bastion server's public IP address:"
    read -r BASTION_IP
    while [[ ! "$BASTION_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; do
        error "Invalid IP address format."
        prompt "Please enter Bastion IP again:"
        read -r BASTION_IP
    done
    
    prompt "Bastion server SSH username (default: ubuntu):"
    read -r bastion_user_input
    BASTION_USER=${bastion_user_input:-ubuntu}
    
    # Node information
    echo -e "\n${YELLOW}Enter node server information.${NC}"
    prompt "Enter node internal IPs separated by commas (e.g., 192.168.50.88,192.168.50.89,192.168.50.90):"
    read -r node_ips_input
    IFS=',' read -ra NODE_IPS <<< "$node_ips_input"
    NODE_COUNT=${#NODE_IPS[@]}
    
    prompt "Node server SSH username (default: ubuntu):"
    read -r node_user_input
    NODE_USER=${node_user_input:-ubuntu}
    
    # SSH key configuration
    echo -e "\n${YELLOW}SSH Key Configuration${NC}"
    echo -e "Current project key directory: ${BLUE}$ROOT_DIR/keys/ssh/$ENVIRONMENT/${NC}"
    
    # Check/add bastion key
    local bastion_key_path="$ROOT_DIR/keys/ssh/$ENVIRONMENT/bastion.pem"
    if [[ ! -f "$bastion_key_path" ]]; then
        warning "Bastion SSH key not found."
        prompt "Enter bastion key file path (e.g., ~/Downloads/my-key.pem):"
        read -r bastion_key_source
        
        if [[ -f "$bastion_key_source" ]]; then
            mkdir -p "$ROOT_DIR/keys/ssh/$ENVIRONMENT"
            cp "$bastion_key_source" "$bastion_key_path"
            chmod 600 "$bastion_key_path"
            log "Bastion key copied successfully."
        else
            error "Key file not found: $bastion_key_source"
            exit 1
        fi
    else
        log "Bastion key found: bastion.pem"
    fi
    
    # Check node key
    prompt "Do nodes use a different SSH key than bastion? [y/N]:"
    read -r use_different_key
    
    if [[ "$use_different_key" =~ ^[Yy]$ ]]; then
        USE_NODE_KEY=true
        
        # Node key name
        prompt "Enter node SSH key filename (default: nodes.pem):"
        read -r node_key_name_input
        NODE_KEY_NAME=${node_key_name_input:-nodes.pem}
        
        # Method to obtain node key
        echo -e "\n${YELLOW}Select how to obtain the node key:${NC}"
        echo "1) Copy from Bastion server (recommended)"
        echo "2) Copy from local file"
        echo "3) Add manually later"
        prompt "Select [1-3]:"
        read -r key_option
        
        case "$key_option" in
            1)
                prompt "Enter node key path on Bastion server (e.g., /home/ubuntu/.ssh/imfact-dev-01):"
                read -r remote_key_path
                
                log "Copying key from Bastion server..."
                local node_key_path="$ROOT_DIR/keys/ssh/$ENVIRONMENT/$NODE_KEY_NAME"
                scp -i "$bastion_key_path" "$BASTION_USER@$BASTION_IP:$remote_key_path" "$node_key_path"
                chmod 600 "$node_key_path"
                log "Node key copied successfully: $NODE_KEY_NAME"
                ;;
            2)
                prompt "Enter local node key file path:"
                read -r local_key_path
                
                if [[ -f "$local_key_path" ]]; then
                    local node_key_path="$ROOT_DIR/keys/ssh/$ENVIRONMENT/$NODE_KEY_NAME"
                    cp "$local_key_path" "$node_key_path"
                    chmod 600 "$node_key_path"
                    log "Node key copied successfully: $NODE_KEY_NAME"
                else
                    error "Key file not found: $local_key_path"
                    exit 1
                fi
                ;;
            3)
                warning "You need to add the node key later:"
                echo "  cp ~/your-node-key.pem $ROOT_DIR/keys/ssh/$ENVIRONMENT/$NODE_KEY_NAME"
                echo "  chmod 600 $ROOT_DIR/keys/ssh/$ENVIRONMENT/$NODE_KEY_NAME"
                ;;
        esac
    else
        USE_NODE_KEY=false
        NODE_KEY_NAME="bastion.pem"
    fi
    
    # Consensus nodes
    local default_consensus=$((NODE_COUNT < 3 ? NODE_COUNT : 3))
    local max_consensus=$((NODE_COUNT - 1))
    prompt "Number of consensus nodes (1-$max_consensus, default: $default_consensus):"
    read -r consensus_input
    CONSENSUS_COUNT=${consensus_input:-$default_consensus}
    
    # Network configuration
    echo -e "\n${YELLOW}Mitum Network Configuration${NC}"
    prompt "Network ID (default: testnet):"
    read -r network_id_input
    NETWORK_ID=${network_id_input:-testnet}
    
    prompt "Model Type [mitum-currency/mitum-nft/mitum-document] (default: mitum-currency):"
    read -r model_input
    MODEL_TYPE=${model_input:-mitum-currency}
    
    # Port configuration
    prompt "Starting port number (default: 4320):"
    read -r port_input
    PORT_START=${port_input:-4320}
    
    # Monitoring
    prompt "Do you want to setup monitoring? [y/N]:"
    read -r has_monitoring
    if [[ "$has_monitoring" =~ ^[Yy]$ ]]; then
        SETUP_MONITORING=true
        prompt "Enter monitoring server IP (leave empty to use first node):"
        read -r MONITORING_IP
        
        if [[ -z "$MONITORING_IP" ]]; then
            MONITORING_IP="${NODE_IPS[0]}"
            log "Using first node as monitoring server: $MONITORING_IP"
        fi
        
        # AWX integration
        prompt "Enable AWX integration? [y/N]:"
        read -r enable_awx
        if [[ "$enable_awx" =~ ^[Yy]$ ]]; then
            AWX_ENABLED=true
            prompt "Enter AWX URL (e.g., http://awx.example.com):"
            read -r AWX_URL
            prompt "Enter AWX Token (will be stored in vault):"
            read -s AWX_TOKEN
            echo ""  # New line after password input
        else
            AWX_ENABLED=false
        fi
    else
        SETUP_MONITORING=false
        MONITORING_IP=""
        AWX_ENABLED=false
    fi
    
    # Confirmation
    echo -e "\n${GREEN}=== Configuration Summary ===${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Bastion: $BASTION_USER@$BASTION_IP"
    echo "Nodes: ${#NODE_IPS[@]} nodes (${NODE_IPS[*]})"
    echo "Consensus nodes: $CONSENSUS_COUNT"
    echo "Node user: $NODE_USER"
    echo "Network ID: $NETWORK_ID"
    echo "Model Type: $MODEL_TYPE"
    echo "Starting port: $PORT_START"
    echo "Use separate node key: $([ "$USE_NODE_KEY" == "true" ] && echo "Yes ($NODE_KEY_NAME)" || echo "No")"
    echo "Monitoring: $([ "$SETUP_MONITORING" == "true" ] && echo "Yes (Server: $MONITORING_IP)" || echo "No")"
    [[ "$AWX_ENABLED" == "true" ]] && echo "AWX Integration: Yes ($AWX_URL)"
    
    prompt "\nProceed with these settings? [Y/n]:"
    read -r confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    
    # Set variables for generate_inventory function
    OUTPUT_FILE="$ROOT_DIR/inventories/$ENVIRONMENT/hosts.yml"
    DRY_RUN=false
    USE_JUMP_HOST=false
    
    # Generate inventory
    generate_inventory
}

# Parse command-line arguments
parse_args() {
    # Initialize variables
    BASTION_IP=""
    NODE_IPS=()
    NODE_SUBNET=""
    START_IP=10
    NODE_COUNT=$DEFAULT_NODE_COUNT
    CONSENSUS_COUNT=$DEFAULT_CONSENSUS_NODES
    ENVIRONMENT=$DEFAULT_ENVIRONMENT
    MODEL_TYPE=$DEFAULT_MODEL
    NETWORK_ID=$DEFAULT_NETWORK_ID
    BASTION_USER=$DEFAULT_BASTION_USER
    NODE_USER=$DEFAULT_NODE_USER
    NODE_KEY_NAME="nodes.pem"
    PORT_START=4320
    MONITORING_IP=""
    OUTPUT_FILE=""
    DRY_RUN=false
    USE_JUMP_HOST=false
    CHECK_KEYS=false
    SETUP_MONITORING=false
    AWX_ENABLED=false
    AWX_URL=""
    AWX_TOKEN=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--bastion-ip)
                BASTION_IP="$2"
                shift 2
                ;;
            --node-ips)
                IFS=',' read -ra NODE_IPS <<< "$2"
                shift 2
                ;;
            --node-subnet)
                NODE_SUBNET="$2"
                shift 2
                ;;
            --start-ip)
                START_IP="$2"
                shift 2
                ;;
            -n|--nodes)
                NODE_COUNT="$2"
                shift 2
                ;;
            -c|--consensus)
                CONSENSUS_COUNT="$2"
                shift 2
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -m|--model)
                MODEL_TYPE="$2"
                shift 2
                ;;
            --network-id)
                NETWORK_ID="$2"
                shift 2
                ;;
            --bastion-user)
                BASTION_USER="$2"
                shift 2
                ;;
            --node-user)
                NODE_USER="$2"
                shift 2
                ;;
            --node-key-name)
                NODE_KEY_NAME="$2"
                shift 2
                ;;
            --port-start)
                PORT_START="$2"
                shift 2
                ;;
            --monitoring-ip)
                MONITORING_IP="$2"
                SETUP_MONITORING=true
                shift 2
                ;;
            -o|--output)
                OUTPUT_FILE="$2"
                shift 2
                ;;
            --use-jump-host)
                USE_JUMP_HOST=true
                shift
                ;;
            --check-keys)
                CHECK_KEYS=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done

    # Set default output file
    if [[ -z "$OUTPUT_FILE" ]]; then
        OUTPUT_FILE="$ROOT_DIR/inventories/$ENVIRONMENT/hosts.yml"
    fi

    # Validation
    if [[ -z "$BASTION_IP" ]]; then
        error "Bastion IP is required (-b option)"
        usage
        exit 1
    fi

    # Validate IP configuration
    if [[ ${#NODE_IPS[@]} -eq 0 ]] && [[ -z "$NODE_SUBNET" ]]; then
        error "Either --node-ips or --node-subnet must be specified"
        usage
        exit 1
    fi

    # If using specific IPs, adjust node count
    if [[ ${#NODE_IPS[@]} -gt 0 ]]; then
        NODE_COUNT=${#NODE_IPS[@]}
        log "Node count set to ${NODE_COUNT} based on provided IPs"
    fi

    # Generate IPs if using subnet
    if [[ -n "$NODE_SUBNET" ]] && [[ ${#NODE_IPS[@]} -eq 0 ]]; then
        for ((i=0; i<NODE_COUNT; i++)); do
            NODE_IPS+=("${NODE_SUBNET}.$(($START_IP + i))")
        done
    fi

    # Validate consensus count
    if [[ $CONSENSUS_COUNT -ge $NODE_COUNT ]]; then
        CONSENSUS_COUNT=$((NODE_COUNT - 1))
        warning "Adjusted consensus count to $CONSENSUS_COUNT (must be less than total nodes)"
    fi

    # Check keys if requested
    if [[ "$CHECK_KEYS" == "true" ]]; then
        if ! check_ssh_keys "$ENVIRONMENT" "$NODE_KEY_NAME"; then
            error "SSH keys are missing. Please add them before continuing."
            exit 1
        fi
    fi
}

# Get key paths
get_key_paths() {
    local env=$1
    local node_key_name=${2:-nodes.pem}
    local keys_dir="$ROOT_DIR/keys/ssh/$env"
    
    # Bastion key
    BASTION_KEY_PATH=""
    for key_name in "bastion.pem" "bastion.key"; do
        if [[ -f "$keys_dir/$key_name" ]]; then
            BASTION_KEY_PATH="$keys_dir/$key_name"
            break
        fi
    done
    
    # Node key
    NODE_KEY_PATH=""
    if [[ -f "$keys_dir/$node_key_name" ]]; then
        NODE_KEY_PATH="$keys_dir/$node_key_name"
    fi
}

# Generate inventory file
generate_inventory() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN - Would generate inventory with:"
        echo "  Environment: $ENVIRONMENT"
        echo "  Bastion: $BASTION_USER@$BASTION_IP"
        echo "  Nodes: ${NODE_IPS[*]}"
        echo "  Model: $MODEL_TYPE"
        echo "  Network ID: $NETWORK_ID"
        echo "  Output: $OUTPUT_FILE"
        return
    fi

    log "Generating inventory..."
    log "  Environment: $ENVIRONMENT"
    log "  Network ID: $NETWORK_ID"
    log "  Model Type: $MODEL_TYPE"
    log "  Total Nodes: $NODE_COUNT ($CONSENSUS_COUNT consensus)"
    log "  Node IPs: ${NODE_IPS[*]}"

    # Create directory
    local output_dir=$(dirname "$OUTPUT_FILE")
    mkdir -p "$output_dir/group_vars" "$output_dir/host_vars"

    # Get key paths
    get_key_paths "$ENVIRONMENT" "${NODE_KEY_NAME:-nodes.pem}"

    # Determine SSH connection method
    local node_ssh_args=""
    if [[ "$USE_JUMP_HOST" == "true" ]]; then
        # Simpler -J syntax
        node_ssh_args="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -J $BASTION_USER@$BASTION_IP"
    else
        # ProxyCommand
        node_ssh_args="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ProxyCommand=\"ssh -W %h:%p -o StrictHostKeyChecking=no -i $BASTION_KEY_PATH $BASTION_USER@$BASTION_IP\""
    fi

    # Generate inventory
    cat > "$OUTPUT_FILE" << EOF
---
# Mitum Inventory - Generated $(date)
# Environment: $ENVIRONMENT
# Network ID: $NETWORK_ID
# Model: $MODEL_TYPE

all:
  children:
    bastion:
      hosts:
        bastion:
          ansible_host: $BASTION_IP
          ansible_user: $BASTION_USER
          ansible_ssh_private_key_file: $BASTION_KEY_PATH
          ansible_ssh_common_args: '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
    
    mitum_nodes:
      hosts:
EOF

    # Add nodes
    local current_port=$PORT_START
    for ((i=0; i<NODE_COUNT; i++)); do
        local node_name="node$i"
        local node_ip="${NODE_IPS[$i]}"
        local is_api_node="false"
        
        if [[ $i -ge $CONSENSUS_COUNT ]]; then
            is_api_node="true"
        fi
        
        cat >> "$OUTPUT_FILE" << EOF
        $node_name:
          ansible_host: $node_ip
          ansible_user: $NODE_USER
          ansible_ssh_common_args: '$node_ssh_args'
EOF
        
        # Add node key if different from bastion
        if [[ -n "$NODE_KEY_PATH" ]] && [[ "$NODE_KEY_PATH" != "$BASTION_KEY_PATH" ]]; then
            echo "          ansible_ssh_private_key_file: $NODE_KEY_PATH" >> "$OUTPUT_FILE"
        fi
        
        cat >> "$OUTPUT_FILE" << EOF
          mitum_node_id: $i
          mitum_node_port: $current_port
          mitum_api_enabled: $is_api_node
EOF
        
        if [[ "$is_api_node" == "true" ]]; then
            echo "          mitum_api_port: 54320" >> "$OUTPUT_FILE"
        fi
        
        echo "" >> "$OUTPUT_FILE"
        ((current_port++))
    done

    # Add group variables
    cat >> "$OUTPUT_FILE" << EOF
      vars:
        mitum_network_id: "$NETWORK_ID"
        mitum_model_type: "$MODEL_TYPE"
        mitum_bind_host: "0.0.0.0"
        mitum_mongodb_replica_set: "mitum-rs"
        mitum_mongodb_auth_enabled: true
        mitum_consensus:
          threshold: 67
          interval_broadcast_ballot: "1.5s"
EOF

    # Add monitoring section if enabled
    if [[ "$SETUP_MONITORING" == "true" ]]; then
        cat >> "$OUTPUT_FILE" << EOF

    monitoring:
      hosts:
        monitor:
          ansible_host: $MONITORING_IP
          ansible_user: $NODE_USER
          ansible_ssh_common_args: '$node_ssh_args'
EOF
        
        # Add monitoring node key if needed
        if [[ -n "$NODE_KEY_PATH" ]] && [[ "$NODE_KEY_PATH" != "$BASTION_KEY_PATH" ]]; then
            echo "          ansible_ssh_private_key_file: $NODE_KEY_PATH" >> "$OUTPUT_FILE"
        fi
        
        cat >> "$OUTPUT_FILE" << EOF
      vars:
        prometheus_port: 9090
        grafana_port: 3000
        alertmanager_port: 9093
        prometheus_version: "2.45.0"
        alertmanager_version: "0.26.0"
        grafana_version: "10.2.0"
EOF
    fi

    log "Inventory generated: $OUTPUT_FILE"
    
    # Generate additional files
    generate_group_vars "$output_dir"
    generate_ssh_config "$output_dir"
    generate_ansible_cfg "$output_dir"
    
    # Display summary
    display_summary
}

# Generate group_vars
generate_group_vars() {
    local output_dir=$1
    local group_vars_file="$output_dir/group_vars/all.yml"
    
    cat > "$group_vars_file" << EOF
---
# Environment-specific variables for $ENVIRONMENT
# Generated: $(date)

# Mitum configuration
mitum_service_name: "mitum"
mitum_version: "latest"
mitum_environment: "$ENVIRONMENT"
mitum_network_id: "$NETWORK_ID"
mitum_model_type: "$MODEL_TYPE"
mitum_install_method: "binary"

# Paths
mitum_install_dir: "/opt/mitum"
mitum_data_dir: "/opt/mitum/data"
mitum_config_dir: "/opt/mitum/config"
mitum_keys_dir: "/opt/mitum/keys"
mitum_log_dir: "/var/log/mitum"
mitum_backup_dir: "/var/backups/mitum"

# Service configuration
mitum_service_user: "mitum"
mitum_service_group: "mitum"

# Network configuration
mitum_nodes_subnet: "${NODE_SUBNET:-${NODE_IPS[0]%.*}}"
mitum_bastion_host: "$BASTION_IP"
mitum_bastion_user: "$BASTION_USER"
mitum_nodes_count: $NODE_COUNT
mitum_consensus_nodes: $CONSENSUS_COUNT

# SSH configuration
mitum_ssh_via_bastion: true
mitum_bastion_key: "keys/ssh/$ENVIRONMENT/bastion.pem"

# MongoDB configuration
mitum_mongodb_version: "7.0"
mitum_mongodb_replica_set: "mitum-rs"
mitum_mongodb_auth_enabled: false
mitum_mongodb_bind_ip: "0.0.0.0"
mitum_mongodb_port: 27017
mitum_mongodb_database: "mitum"
mitum_mongodb_user: "mitum"
mitum_mongodb_password: "mitum123"
mitum_mongodb_admin_user: "admin"
mitum_mongodb_admin_password: "admin123"
mitum_mongodb_keyfile: "/opt/mitum/mongodb-keyfile"

# Key generation
mitum_keygen_strategy: "centralized"
mitum_threshold: 67

# Consensus configuration
mitum_consensus:
  threshold: 67
  interval_broadcast_ballot: "1.5s"
  interval_broadcast_proposal: "5s"
  wait_broadcast_ballot: "10s"
  wait_broadcast_proposal: "10s"

# API configuration
mitum_api:
  bind: "0.0.0.0"
  port: 54320
  cache_size: 1000
  timeout: "30s"

# Storage
mitum_storage:
  database: "mongodb://localhost:27017/mitum"
  blockdata_path: "{{ mitum_data_dir }}/blockdata"

# Network settings
mitum_network:
  bind: "0.0.0.0"
  publish: "{{ ansible_default_ipv4.address }}"
  tls_insecure: true

# Feature flags based on model
mitum_features:
  enable_api: true
  enable_digest: true
  enable_metrics: true
  enable_profiler: false
EOF

    # Add model-specific features
    case "$MODEL_TYPE" in
        mitum-currency-operations)
            cat >> "$group_vars_file" << EOF
  enable_operations: true
  enable_contract: false
EOF
            ;;
        mitum-nft)
            cat >> "$group_vars_file" << EOF
  enable_nft: true
  enable_collection: true
EOF
            ;;
        mitum-document)
            cat >> "$group_vars_file" << EOF
  enable_document: true
  enable_storage: true
EOF
            ;;
    esac

    cat >> "$group_vars_file" << EOF

# Monitoring configuration
mitum_monitoring:
  enabled: $SETUP_MONITORING
  prometheus_enabled: $SETUP_MONITORING
  prometheus_port: 9099
  node_exporter_port: 9100
  prometheus_server: "${MONITORING_IP:-localhost}"

# Logging
mitum_logging:
  level: "info"
  format: "json"
  output: "stdout"
  file_enabled: true
  file_path: "{{ mitum_log_dir }}/mitum.log"
  file_max_size: "100MB"
  file_max_age: 30
  file_max_backups: 10

# Backup configuration
mitum_backup:
  enabled: false
  schedule: "0 2 * * *"
  retention_days: 7
  path: "/var/backups/mitum"

# Key generation settings
mitum_keys_threshold: 100
mitum_keygen_type: "btc"

# AWX Integration
awx_integration_enabled: $AWX_ENABLED
EOF

    if [[ "$AWX_ENABLED" == "true" ]]; then
        cat >> "$group_vars_file" << EOF
awx_base_url: "$AWX_URL"
# AWX token should be stored in vault
# awx_token: "{{ vault_awx_token }}"

# AWX webhook for maintenance notifications
mitum_maintenance_webhook: "$AWX_URL/api/v2/webhooks/"
EOF
        
        # Create vault file for sensitive data
        local vault_file="$output_dir/group_vars/vault.yml"
        if [[ -n "$AWX_TOKEN" ]]; then
            echo "---" > "$vault_file"
            echo "vault_awx_token: \"$AWX_TOKEN\"" >> "$vault_file"
            echo "" >> "$vault_file"
            warning "Created vault.yml with AWX token. Encrypt it with: ansible-vault encrypt $vault_file"
        fi
    fi

    log "Created group_vars: $group_vars_file"
}

# Generate SSH config
generate_ssh_config() {
    local output_dir=$1
    local ssh_config_file="$output_dir/ssh_config"
    
    cat > "$ssh_config_file" << EOF
# SSH configuration for $ENVIRONMENT environment
# Generated: $(date)

Host bastion
    HostName $BASTION_IP
    User $BASTION_USER
    IdentityFile $BASTION_KEY_PATH
    ForwardAgent yes
    ControlMaster auto
    ControlPath ~/.ssh/mitum-%r@%h:%p
    ControlPersist 30m
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

EOF

    # Add node configurations
    for ((i=0; i<NODE_COUNT; i++)); do
        cat >> "$ssh_config_file" << EOF
Host node$i
    HostName ${NODE_IPS[$i]}
    User $NODE_USER
    ProxyJump bastion
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
        
        # Add identity file if using different key
        if [[ -n "$NODE_KEY_PATH" ]] && [[ "$NODE_KEY_PATH" != "$BASTION_KEY_PATH" ]]; then
            echo "    IdentityFile $NODE_KEY_PATH" >> "$ssh_config_file"
        fi
        
        echo "" >> "$ssh_config_file"
    done

    # Add monitoring host if configured
    if [[ -n "$MONITORING_IP" ]]; then
        cat >> "$ssh_config_file" << EOF
Host monitor
    HostName $MONITORING_IP
    User $NODE_USER
    ProxyJump bastion
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
        
        if [[ -n "$NODE_KEY_PATH" ]] && [[ "$NODE_KEY_PATH" != "$BASTION_KEY_PATH" ]]; then
            echo "    IdentityFile $NODE_KEY_PATH" >> "$ssh_config_file"
        fi
    fi

    log "Created SSH config: $ssh_config_file"
}

# Generate ansible.cfg
generate_ansible_cfg() {
    local output_dir=$1
    local ansible_cfg_file="$output_dir/ansible.cfg"
    
    cat > "$ansible_cfg_file" << EOF
[defaults]
inventory = hosts.yml
host_key_checking = False
retry_files_enabled = False
gathering = smart
fact_caching = jsonfile
fact_caching_connection = .ansible_cache
fact_caching_timeout = 86400
stdout_callback = yaml
callback_whitelist = profile_tasks, timer
interpreter_python = auto_silent

[inventory]
enable_plugins = host_list, yaml, ini, auto

[ssh_connection]
ssh_args = -F ssh_config -o ControlMaster=auto -o ControlPersist=30m
control_path = ~/.ssh/mitum-%%r@%%h:%%p
pipelining = True

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
EOF

    log "Created ansible.cfg: $ansible_cfg_file"
}

# Display summary
display_summary() {
    local output_dir=$(dirname "$OUTPUT_FILE")
    
    echo ""
    echo -e "${GREEN}=== Inventory Generation Complete ===${NC}"
    echo ""
    echo "Configuration Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Network ID: $NETWORK_ID"
    echo "  Model Type: $MODEL_TYPE"
    echo "  Total Nodes: $NODE_COUNT"
    echo "  - Consensus: $CONSENSUS_COUNT (node0-node$((CONSENSUS_COUNT-1)))"
    echo "  - API/Syncer: $((NODE_COUNT-CONSENSUS_COUNT)) (node${CONSENSUS_COUNT}+)"
    echo ""
    echo "Network Configuration:"
    echo "  Bastion: $BASTION_USER@$BASTION_IP"
    echo "  Nodes:"
    for ((i=0; i<NODE_COUNT; i++)); do
        local role="Consensus"
        [[ $i -ge $CONSENSUS_COUNT ]] && role="API"
        echo "    - node$i: ${NODE_IPS[$i]} ($role)"
    done
    if [[ -n "$MONITORING_IP" ]]; then
        echo "  Monitoring: $MONITORING_IP"
    fi
    echo ""
    echo "Files created:"
    echo "  - $OUTPUT_FILE"
    echo "  - $output_dir/group_vars/all.yml"
    echo "  - $output_dir/ssh_config"
    echo "  - $output_dir/ansible.cfg"
    echo ""
    echo -e "${YELLOW}SSH Key Setup:${NC}"
    if [[ -n "$BASTION_KEY_PATH" ]]; then
        echo "  ✓ Bastion key: $BASTION_KEY_PATH"
    else
        echo "  ✗ Bastion key: Not found"
    fi
    if [[ -n "$NODE_KEY_PATH" ]]; then
        echo "  ✓ Node key: $NODE_KEY_PATH"
    else
        echo "  ✗ Node key: Not found"
    fi
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Test connectivity:"
    echo "   ansible -i $OUTPUT_FILE all -m ping"
    echo ""
    echo "2. Deploy Mitum:"
    echo "   cd $ROOT_DIR"
    echo "   source venv/bin/activate"
    echo "   make keygen"
    echo "   make deploy"
    echo ""
    echo "Alternative connection methods:"
    echo "  # Using SSH config"
    echo "  ssh -F $output_dir/ssh_config bastion"
    echo "  ssh -F $output_dir/ssh_config node0"
    echo ""
    echo "  # Using ansible.cfg"
    echo "  cd $output_dir && ansible all -m ping"
}

# Main execution
main() {
    # Interactive mode if no arguments
    if [[ $# -eq 0 ]]; then
        interactive_mode
    else
        # Command-line mode
        parse_args "$@"
        generate_inventory
    fi
}

# Execute
main "$@"
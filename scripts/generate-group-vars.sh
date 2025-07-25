#!/bin/bash
# generate-group-vars.sh - Generate comprehensive group_vars based on inventory
# Version: 1.0.0
#
# This script analyzes the inventory and generates optimized group_vars

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[INFO]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# Default values
INVENTORY="${1:-inventories/production/hosts.yml}"
FORCE="${2:-false}"

# Check inventory exists
if [[ ! -f "$INVENTORY" ]]; then
    error "Inventory not found: $INVENTORY"
    exit 1
fi

# Extract environment and paths
ENV_NAME=$(basename $(dirname "$INVENTORY"))
GROUP_VARS_DIR="$(dirname "$INVENTORY")/group_vars"
GROUP_VARS_FILE="$GROUP_VARS_DIR/all.yml"

# Check if already exists
if [[ -f "$GROUP_VARS_FILE" ]] && [[ "$FORCE" != "force" ]]; then
    warning "group_vars/all.yml already exists. Use 'force' to overwrite."
    exit 0
fi

log "Analyzing inventory: $INVENTORY"

# Parse inventory to extract information
parse_inventory() {
    # Count total nodes
    TOTAL_NODES=$(grep -E "^\s*node[0-9]+:" "$INVENTORY" | wc -l | tr -d ' ')
    
    # Count consensus vs API nodes
    CONSENSUS_NODES=0
    API_NODES=0
    
    # Extract node information
    while IFS= read -r line; do
        if [[ "$line" =~ ^[[:space:]]*node[0-9]+: ]]; then
            NODE_NAME=$(echo "$line" | sed 's/://g' | tr -d ' ')
            # Check next few lines for mitum_api_enabled
            if grep -A5 "$line" "$INVENTORY" | grep -q "mitum_api_enabled: true"; then
                ((API_NODES++))
            else
                ((CONSENSUS_NODES++))
            fi
        fi
    done < "$INVENTORY"
    
    # Extract network info from inventory
    NETWORK_ID=$(grep -E "mitum_network_id:" "$INVENTORY" | head -1 | awk -F'"' '{print $2}' || echo "$ENV_NAME-network")
    MODEL_TYPE=$(grep -E "mitum_model_type:" "$INVENTORY" | head -1 | awk -F'"' '{print $2}' || echo "mitum-currency")
    
    # Extract MongoDB settings
    MONGODB_RS=$(grep -E "mitum_mongodb_replica_set:" "$INVENTORY" | head -1 | awk -F'"' '{print $2}' || echo "mitum-rs")
    
    log "Inventory analysis complete:"
    log "  - Total nodes: $TOTAL_NODES"
    log "  - Consensus nodes: $CONSENSUS_NODES"
    log "  - API nodes: $API_NODES"
    log "  - Network ID: $NETWORK_ID"
    log "  - Model: $MODEL_TYPE"
}

# Calculate optimal settings based on node count
calculate_optimal_settings() {
    # Consensus settings
    if [[ $CONSENSUS_NODES -le 3 ]]; then
        CONSENSUS_THRESHOLD=100
        BALLOT_INTERVAL="1.5s"
        PROPOSAL_INTERVAL="5s"
        WAIT_TIME="10s"
    elif [[ $CONSENSUS_NODES -le 5 ]]; then
        CONSENSUS_THRESHOLD=67
        BALLOT_INTERVAL="2.0s"
        PROPOSAL_INTERVAL="6s"
        WAIT_TIME="12s"
    else
        CONSENSUS_THRESHOLD=67
        BALLOT_INTERVAL="2.5s"
        PROPOSAL_INTERVAL="8s"
        WAIT_TIME="15s"
    fi
    
    # MongoDB settings
    if [[ $TOTAL_NODES -le 3 ]]; then
        MONGO_CACHE_GB=2
        MONGO_CONNECTIONS=1000
    elif [[ $TOTAL_NODES -le 7 ]]; then
        MONGO_CACHE_GB=4
        MONGO_CONNECTIONS=2000
    else
        MONGO_CACHE_GB=8
        MONGO_CONNECTIONS=5000
    fi
    
    # API rate limiting
    API_RATE_LIMIT=$((TOTAL_NODES * 1000))
    API_CACHE_SIZE=$((TOTAL_NODES * 200))
    
    log "Calculated optimal settings:"
    log "  - Consensus threshold: $CONSENSUS_THRESHOLD%"
    log "  - MongoDB cache: ${MONGO_CACHE_GB}GB"
    log "  - API rate limit: $API_RATE_LIMIT req/min"
}

# Generate group_vars file
generate_group_vars() {
    mkdir -p "$GROUP_VARS_DIR"
    
    cat > "$GROUP_VARS_FILE" << EOF
---
# Mitum Ansible Configuration
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# Environment: $ENV_NAME
# Based on: $TOTAL_NODES nodes ($CONSENSUS_NODES consensus, $API_NODES API)
#
# This file was auto-generated based on your inventory configuration.
# Feel free to modify it according to your needs.

# === Environment ===
mitum_environment: "$ENV_NAME"
mitum_deployment_timestamp: "{{ ansible_date_time.iso8601 }}"

# === Mitum Core Configuration ===
mitum_version: "latest"  # Change to specific version for production
mitum_model_type: "$MODEL_TYPE"
mitum_network_id: "$NETWORK_ID"
mitum_install_method: "binary"
mitum_service_name: "mitum"

# === Directory Layout ===
mitum_base_dir: "/opt/mitum"
mitum_install_dir: "{{ mitum_base_dir }}/bin"
mitum_data_dir: "{{ mitum_base_dir }}/data"
mitum_config_dir: "{{ mitum_base_dir }}/config"
mitum_keys_dir: "{{ mitum_base_dir }}/keys"
mitum_log_dir: "/var/log/mitum"
mitum_backup_dir: "/var/backups/mitum"
mitum_temp_dir: "/tmp/mitum"

# === Service Account ===
mitum_service_user: "mitum"
mitum_service_group: "mitum"
mitum_service_shell: "/bin/bash"
mitum_service_home: "/home/mitum"

# === Resource Limits ===
# Optimized for $TOTAL_NODES nodes
mitum_service_limits:
  nofile: $(( TOTAL_NODES > 10 ? 131072 : 65536 ))
  nproc: $(( TOTAL_NODES > 10 ? 65536 : 32768 ))
  memlock: unlimited

# === Network Ports ===
mitum_node_port_start: 4320
mitum_api_port: 54320
mitum_metrics_port: 9099
mitum_bind_host: "0.0.0.0"
mitum_publish_host: "{{ ansible_default_ipv4.address }}"

# === MongoDB Configuration ===
# Optimized for $TOTAL_NODES nodes
mongodb_version: "7.0"
mongodb_install_method: "native"
mongodb_package_name: "mongodb-org"
mongodb_bind_ip: "0.0.0.0"
mongodb_port: 27017
mongodb_database: "mitum"
mongodb_replica_set: "$MONGODB_RS"
mongodb_auth_enabled: true
mongodb_admin_user: "admin"
mongodb_mitum_user: "mitum"

# Performance tuning
mongodb_config:
  storage:
    wiredTiger:
      engineConfig:
        cacheSizeGB: $MONGO_CACHE_GB
    directoryPerDB: true
    journal:
      enabled: true
  net:
    maxIncomingConnections: $MONGO_CONNECTIONS
    compression:
      compressors: "snappy,zlib,zstd"
  operationProfiling:
    mode: "slowOp"
    slowOpThresholdMs: 100
  replication:
    oplogSizeMB: $(( TOTAL_NODES * 1024 ))  # 1GB per node

# === Key Generation ===
mitum_keygen_strategy: "centralized"
mitum_keys_threshold: 100
mitum_keygen_type: "btc"
mitum_keys_prefix: "{{ mitum_network_id }}"
mitum_genesis_amount: "999999999999999999999"

# MitumJS configuration
mitum_nodejs_version: "18"
mitum_mitumjs_version: "^2.1.15"
mitum_mitumjs_install_dir: "{{ mitum_base_dir }}/tools/mitumjs"

# === Consensus Settings ===
# Optimized for $CONSENSUS_NODES consensus nodes
mitum_consensus:
  threshold: $CONSENSUS_THRESHOLD
  interval_broadcast_ballot: "$BALLOT_INTERVAL"
  interval_broadcast_proposal: "$PROPOSAL_INTERVAL"
  wait_broadcast_ballot: "$WAIT_TIME"
  wait_broadcast_proposal: "$WAIT_TIME"
  timeout_wait_ballot: "$WAIT_TIME"
  timeout_wait_proposal: "$(( ${WAIT_TIME%s} * 2 ))s"
  max_operations_in_proposal: $(( CONSENSUS_NODES > 5 ? 999 : 500 ))
  max_suffrage_size: $(( CONSENSUS_NODES * 2 + 1 ))

# === API Configuration ===
# Optimized for $API_NODES API nodes
mitum_api:
  bind: "{{ mitum_bind_host }}"
  port: "{{ mitum_api_port }}"
  cache_size: $API_CACHE_SIZE
  timeout: "30s"
  max_request_size: "10MB"
  rate_limit:
    enabled: true
    requests_per_minute: $API_RATE_LIMIT
    burst: $(( API_RATE_LIMIT / 10 ))
  cors:
    enabled: true
    allowed_origins: ["*"]
    allowed_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: ["*"]
    max_age: 3600

# === Logging ===
mitum_logging:
  level: "{{ 'debug' if mitum_environment == 'development' else 'info' }}"
  format: "json"
  output: "file"
  file:
    path: "{{ mitum_log_dir }}/mitum.log"
    max_size: "100MB"
    max_age: 30
    max_backups: $(( TOTAL_NODES > 10 ? 30 : 10 ))
    compress: true

# === Monitoring ===
mitum_monitoring:
  enabled: true
  prometheus:
    enabled: true
    port: "{{ mitum_metrics_port }}"
    path: "/metrics"
    retention: "$(( TOTAL_NODES > 10 ? 90 : 30 ))d"
  node_exporter:
    enabled: true
    port: 9100
  alerts:
    enabled: true
    rules_path: "{{ mitum_config_dir }}/alerts"

# Monitoring server (if separate)
monitoring_server: "{{ groups['monitoring'][0] | default(groups['mitum_nodes'][0]) }}"
prometheus_scrape_interval: "$(( TOTAL_NODES > 10 ? 30 : 15 ))s"
grafana_admin_password: "{{ vault_grafana_admin_password | default('admin') }}"

# === Backup Strategy ===
mitum_backup:
  enabled: true
  schedule: "0 2 * * *"  # 2 AM daily
  retention_days: $(( ENV_NAME == "production" ? 30 : 7 ))
  include_mongodb: true
  compression: "gzip"
  parallel: $(( TOTAL_NODES > 5 ? "true" : "false" ))
  encryption:
    enabled: "{{ mitum_environment == 'production' }}"
    algorithm: "aes-256-cbc"

# === Security ===
# Environment-specific security settings
security_hardening:
  enabled: true
  disable_root_login: "{{ mitum_environment != 'development' }}"
  fail2ban: true
  firewall: true
  selinux: "{{ 'enforcing' if mitum_environment == 'production' else 'permissive' }}"
  audit: "{{ mitum_environment == 'production' }}"

# SSH hardening
ssh_hardening:
  enabled: true
  port: 22
  permit_root_login: "no"
  password_authentication: "no"
  pubkey_authentication: "yes"
  max_auth_tries: 3
  client_alive_interval: 300
  client_alive_count_max: 2

# Firewall rules (auto-generated based on node configuration)
firewall_rules:
  # Mitum node communication
  - port: "{{ mitum_node_port_start }}:{{ mitum_node_port_start + groups['mitum_nodes'] | length }}"
    proto: tcp
    comment: "Mitum node P2P"
  # API access (only on API nodes)
  - port: "{{ mitum_api_port }}"
    proto: tcp
    comment: "Mitum API"
    when: "mitum_api_enabled | default(false)"
  # MongoDB (internal only)
  - port: "{{ mongodb_port }}"
    proto: tcp
    source: "{{ hostvars[inventory_hostname]['ansible_default_ipv4']['network'] }}/24"
    comment: "MongoDB internal"
  # Monitoring
  - port: "{{ mitum_metrics_port }}"
    proto: tcp
    source: "{{ hostvars[monitoring_server]['ansible_default_ipv4']['address'] | default('127.0.0.1') }}/32"
    comment: "Prometheus metrics"

# === Rolling Upgrade Strategy ===
# Conservative settings for safety
mitum_upgrade:
  strategy: "rolling"
  batch_size: 1
  batch_delay: $(( CONSENSUS_NODES > 5 ? 120 : 60 ))
  health_check_retries: 30
  health_check_delay: 5
  consensus_wait_time: $(( CONSENSUS_NODES * 10 ))
  rollback_on_failure: true
  backup_before_upgrade: true
  drain_api_traffic: true

# === Development/Debug ===
debug_mode: "{{ mitum_environment == 'development' }}"
verbose_logging: "{{ debug_mode }}"
enable_profiling: false
enable_tracing: false

# === Feature Flags ===
mitum_features:
  enable_api: true
  enable_digest: true
  enable_metrics: true
  enable_contract: "{{ mitum_model_type == 'mitum-contract' }}"
  enable_nft: "{{ mitum_model_type == 'mitum-nft' }}"
  enable_document: "{{ mitum_model_type == 'mitum-document' }}"
  enable_currency: "{{ mitum_model_type == 'mitum-currency' }}"
  enable_feefi: false
  experimental_features: false

# === Ansible Execution ===
# Control Ansible behavior
ansible_ssh_pipelining: true
ansible_ssh_retries: 3
ansible_timeout: 30
mitum_deployment_serial: "{{ '20%' if groups['mitum_nodes'] | length > 10 else '100%' }}"

# === Tags ===
# Available tags for selective execution
mitum_tags:
  - prepare
  - install
  - configure
  - keygen
  - deploy
  - upgrade
  - backup
  - restore
  - monitoring
  - security
  - validate

# === Notes ===
# 1. This file was auto-generated based on inventory analysis
# 2. Sensitive values should be in vault.yml (see vault.yml.template)
# 3. Environment-specific overrides can be added at the bottom
# 4. For optimal performance, review and adjust settings based on actual workload
EOF

    log "Generated optimized group_vars: $GROUP_VARS_FILE"
    
    # Create vault template
    create_vault_template
    
    # Create host_vars if needed
    create_host_vars
}

# Create vault template
create_vault_template() {
    local vault_template="$GROUP_VARS_DIR/vault.yml.template"
    
    if [[ ! -f "$vault_template" ]]; then
        cat > "$vault_template" << 'EOF'
---
# Ansible Vault Template
# Environment: ENVIRONMENT_NAME
# 
# IMPORTANT: 
# 1. Copy to vault.yml
# 2. Replace ALL CHANGE_ME values
# 3. Encrypt: ansible-vault encrypt vault.yml
# 4. Add to .gitignore: echo "vault.yml" >> .gitignore

# === MongoDB Credentials ===
vault_mongodb_admin_password: "CHANGE_ME_USE_STRONG_PASSWORD"
vault_mongodb_mitum_password: "CHANGE_ME_USE_STRONG_PASSWORD"

# MongoDB keyfile for replica set authentication
# Generate: openssl rand -base64 756 > keyfile.txt
vault_mongodb_keyfile_content: |
  CHANGE_ME_PASTE_YOUR_756_BYTE_BASE64_STRING_HERE

# === Monitoring Credentials ===
vault_grafana_admin_password: "CHANGE_ME_GRAFANA_ADMIN"
vault_prometheus_admin_password: "CHANGE_ME_PROMETHEUS_ADMIN"

# === Backup Encryption ===
vault_backup_encryption_key: "CHANGE_ME_32_CHAR_ENCRYPTION_KEY"

# === API Security ===
vault_api_admin_token: "CHANGE_ME_RANDOM_API_TOKEN"
vault_api_jwt_secret: "CHANGE_ME_RANDOM_JWT_SECRET"

# === Notification Webhooks (optional) ===
vault_slack_webhook_url: ""
vault_discord_webhook_url: ""
vault_email_smtp_password: ""
EOF
        
        log "Created vault template: $vault_template"
        warning "Don't forget to create and encrypt vault.yml!"
    fi
}

# Create host-specific vars if needed
create_host_vars() {
    local host_vars_dir="$GROUP_VARS_DIR/../host_vars"
    
    # Create host_vars for nodes with special configurations
    while IFS= read -r line; do
        if [[ "$line" =~ ^[[:space:]]*node[0-9]+: ]]; then
            NODE_NAME=$(echo "$line" | sed 's/://g' | tr -d ' ')
            NODE_ID=$(echo "$NODE_NAME" | grep -oE '[0-9]+')
            
            # Check if this node has special settings
            if grep -A5 "$line" "$INVENTORY" | grep -q "mitum_api_enabled: true"; then
                mkdir -p "$host_vars_dir"
                cat > "$host_vars_dir/${NODE_NAME}.yml" << EOF
---
# Host-specific variables for $NODE_NAME
# API/Syncer node configuration

# This node serves API requests
mitum_api_enabled: true
mitum_api_bind: "0.0.0.0"
mitum_api_port: 54320

# API-specific settings
mitum_api_cache_size: 2000
mitum_api_max_connections: 1000

# Logging (more verbose for API nodes)
mitum_logging:
  level: "info"
  format: "json"
  output: "file"
  api_access_log: true
EOF
                log "Created host vars for API node: $NODE_NAME"
            fi
        fi
    done < "$INVENTORY"
}

# Main execution
main() {
    log "Starting group_vars generation for environment: $ENV_NAME"
    
    # Parse inventory
    parse_inventory
    
    # Calculate optimal settings
    calculate_optimal_settings
    
    # Generate files
    generate_group_vars
    
    success "Group vars generation complete!"
    echo ""
    echo "Generated files:"
    echo "  - $GROUP_VARS_FILE"
    echo "  - $GROUP_VARS_DIR/vault.yml.template"
    [[ -d "$GROUP_VARS_DIR/../host_vars" ]] && echo "  - host_vars/ (for special nodes)"
    echo ""
    echo "Next steps:"
    echo "1. Review and adjust $GROUP_VARS_FILE"
    echo "2. Create vault.yml from template"
    echo "3. Encrypt: ansible-vault encrypt $GROUP_VARS_DIR/vault.yml"
}

# Execute
main
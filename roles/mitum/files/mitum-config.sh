#!/bin/bash
# Mitum configuration helper script

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default paths
MITUM_BASE_DIR="${MITUM_BASE_DIR:-/opt/mitum}"
MITUM_CONFIG_DIR="${MITUM_CONFIG_DIR:-$MITUM_BASE_DIR/config}"
MITUM_KEYS_DIR="${MITUM_KEYS_DIR:-$MITUM_BASE_DIR/keys}"
MITUM_DATA_DIR="${MITUM_DATA_DIR:-$MITUM_BASE_DIR/data}"

# Functions
log() { echo -e "${GREEN}[INFO]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }

usage() {
    cat << EOF
${GREEN}Mitum Configuration Helper${NC}

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    validate     Validate configuration files
    show         Display current configuration
    diff         Show configuration differences
    backup       Create configuration backup
    restore      Restore configuration from backup
    generate     Generate configuration from template

Options:
    -c, --config FILE    Configuration file (default: $MITUM_CONFIG_DIR/config.yml)
    -k, --keys DIR       Keys directory (default: $MITUM_KEYS_DIR)
    -b, --backup DIR     Backup directory
    -h, --help           Show this help

Examples:
    $0 validate
    $0 show --config /path/to/config.yml
    $0 backup --backup /var/backups/mitum
    $0 generate --template consensus-node

EOF
}

# Validate configuration
validate_config() {
    local config_file="${1:-$MITUM_CONFIG_DIR/config.yml}"
    
    log "Validating configuration: $config_file"
    
    # Check if file exists
    if [[ ! -f "$config_file" ]]; then
        error "Configuration file not found: $config_file"
        return 1
    fi
    
    # Basic YAML validation
    if ! command -v yq &> /dev/null; then
        warning "yq not installed, skipping YAML validation"
    else
        if ! yq eval . "$config_file" > /dev/null 2>&1; then
            error "Invalid YAML syntax in $config_file"
            return 1
        fi
    fi
    
    # Check required fields
    local required_fields=(
        "address"
        "privatekey"
        "network-id"
        "storage"
        "database"
        "network"
        "consensus"
    )
    
    for field in "${required_fields[@]}"; do
        if ! grep -q "^${field}:" "$config_file"; then
            error "Missing required field: $field"
            return 1
        fi
    done
    
    # Validate keys
    local private_key=$(grep "^privatekey:" "$config_file" | cut -d' ' -f2)
    local public_key=$(grep "^publickey:" "$config_file" | cut -d' ' -f2)
    
    if [[ -z "$private_key" ]] || [[ -z "$public_key" ]]; then
        error "Invalid keys in configuration"
        return 1
    fi
    
    log "Configuration validation passed ✓"
    return 0
}

# Show current configuration
show_config() {
    local config_file="${1:-$MITUM_CONFIG_DIR/config.yml}"
    
    if [[ ! -f "$config_file" ]]; then
        error "Configuration file not found: $config_file"
        return 1
    fi
    
    echo -e "${BLUE}=== Mitum Configuration ===${NC}"
    echo "File: $config_file"
    echo ""
    
    # Extract key information
    local network_id=$(grep "^network-id:" "$config_file" | cut -d' ' -f2)
    local address=$(grep "^address:" "$config_file" | cut -d' ' -f2)
    local bind=$(grep -A1 "^network:" "$config_file" | grep "bind:" | awk '{print $2}')
    local mongodb=$(grep -A2 "^database:" "$config_file" | grep "host:" | awk '{print $2}')
    
    echo "Network ID: $network_id"
    echo "Node Address: $address"
    echo "Bind Address: $bind"
    echo "MongoDB: $mongodb"
    echo ""
    
    # Show consensus nodes
    echo "Consensus Nodes:"
    sed -n '/^consensus:/,/^[^ ]/{/nodes:/,/^[^ ]/{/^ *- /p}}' "$config_file" | \
        sed 's/^ *- */  - /'
    
    echo ""
    echo -e "${BLUE}=== Full Configuration ===${NC}"
    cat "$config_file"
}

# Compare configurations
diff_config() {
    local config1="${1:-$MITUM_CONFIG_DIR/config.yml}"
    local config2="${2:-$MITUM_CONFIG_DIR/config.yml.backup}"
    
    if [[ ! -f "$config1" ]]; then
        error "First configuration file not found: $config1"
        return 1
    fi
    
    if [[ ! -f "$config2" ]]; then
        error "Second configuration file not found: $config2"
        return 1
    fi
    
    log "Comparing configurations:"
    echo "  Current: $config1"
    echo "  Compare: $config2"
    echo ""
    
    diff -u "$config2" "$config1" || true
}

# Backup configuration
backup_config() {
    local backup_dir="${1:-$MITUM_BASE_DIR/backups}"
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_name="config-backup-$timestamp"
    
    mkdir -p "$backup_dir"
    
    log "Creating configuration backup: $backup_name"
    
    # Create backup archive
    tar -czf "$backup_dir/$backup_name.tar.gz" \
        -C "$MITUM_BASE_DIR" \
        config keys 2>/dev/null || true
    
    # Create backup manifest
    cat > "$backup_dir/$backup_name.manifest" << EOF
Backup: $backup_name
Date: $(date -Iseconds)
Files:
  - config/
  - keys/
Size: $(du -h "$backup_dir/$backup_name.tar.gz" | cut -f1)
EOF
    
    log "Backup created: $backup_dir/$backup_name.tar.gz"
}

# Restore configuration
restore_config() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" ]]; then
        error "Backup file required"
        return 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    warning "This will overwrite current configuration!"
    read -p "Continue? [y/N] " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled"
        return 0
    fi
    
    # Backup current config first
    backup_config "$MITUM_BASE_DIR/backups"
    
    # Extract backup
    log "Restoring from: $backup_file"
    tar -xzf "$backup_file" -C "$MITUM_BASE_DIR"
    
    log "Configuration restored successfully"
}

# Generate configuration from template
generate_config() {
    local template="${1:-consensus}"
    local output="${2:-$MITUM_CONFIG_DIR/config.yml.new}"
    
    log "Generating configuration from template: $template"
    
    case "$template" in
        consensus)
            cat > "$output" << 'EOF'
# Mitum Consensus Node Configuration
address: node0-mitum
privatekey: <PRIVATE_KEY>
publickey: <PUBLIC_KEY>
network-id: mitum

storage:
  type: leveldb
  path: /opt/mitum/data/blockdata
  options:
    cache_size: 128
    write_buffer_size: 4
    max_open_files: 10000

database:
  type: mongodb
  mongodb:
    host: 127.0.0.1
    port: 27017
    database: mitum

network:
  bind: 0.0.0.0:4320
  advertise: <NODE_IP>:4320

consensus:
  threshold: 67
  nodes:
    # Add consensus nodes here

sync:
  interval: 10s
  sources:
    # Add sync sources here
EOF
            ;;
            
        api)
            cat > "$output" << 'EOF'
# Mitum API Node Configuration
address: api-node-mitum
privatekey: <PRIVATE_KEY>
publickey: <PUBLIC_KEY>
network-id: mitum

storage:
  type: leveldb
  path: /opt/mitum/data/blockdata

database:
  type: mongodb
  mongodb:
    host: 127.0.0.1
    port: 27017
    database: mitum

network:
  bind: 0.0.0.0:4320
  advertise: <NODE_IP>:4320

api:
  bind: 0.0.0.0:54320
  cache: true

sync:
  interval: 10s
  sources:
    # Add sync sources here
EOF
            ;;
            
        *)
            error "Unknown template: $template"
            return 1
            ;;
    esac
    
    log "Configuration template generated: $output"
    echo "Edit the file and replace placeholder values before using"
}

# Main execution
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        validate)
            validate_config "$@"
            ;;
        show)
            show_config "$@"
            ;;
        diff)
            diff_config "$@"
            ;;
        backup)
            backup_config "$@"
            ;;
        restore)
            restore_config "$@"
            ;;
        generate)
            generate_config "$@"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
#!/bin/bash
# Mitum Deployment Script
# Version: 1.2.0 - Enhanced root detection and error handling

# Strict error handling
set -euo pipefail

# Find the actual project root by looking for characteristic files
# This makes the script runnable from any directory
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
    echo "Error: Could not find the project root directory. Make sure you are running this script from within the mitum-ansible project." >&2
    exit 1
fi

# Set script directory relative to the now known ROOT_DIR
SCRIPT_DIR="${ROOT_DIR}/scripts"

# Source common functions
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh" || {
    echo "Error: Cannot load common functions library from ${SCRIPT_DIR}/lib/common.sh" >&2
    exit 1
}

# === Script Initialization ===
LOG_DIR="${ROOT_DIR}/logs"
TEMP_DIR="${ROOT_DIR}/.tmp"

ensure_directory "$LOG_DIR"
ensure_directory "$TEMP_DIR"

export LOG_FILE="${LOG_FILE:-${LOG_DIR}/$(basename "$0" .sh).log}"
# === End Initialization ===

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Script configuration
# ROOT_DIR="$(dirname "$SCRIPT_DIR")" # This line is now redundant as ROOT_DIR is set above
MAKEFILE="$ROOT_DIR/Makefile"

# Default values
INVENTORY="${INVENTORY:-inventories/production/hosts.yml}"
ENVIRONMENT="${ENV:-production}"
INTERACTIVE_MODE=false
USE_MAKEFILE=true
SKIP_KEYGEN=false
SKIP_MONGODB=false
SKIP_PREPARE=false
KEYGEN_STRATEGY="centralized"
VERBOSE=false
DRY_RUN=false

# Logging functions
log() { echo -e "${GREEN}[INFO]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
prompt() { echo -ne "${PURPLE}[?]${NC} $*"; }

# Display banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
    __  ____  __                   ___              _ __    __   
   /  |/  (_)/ /___  ______ ___   /   |  ____  ___(_) /__ / /__ 
  / /|_/ / / __/ / / / __ `__ \ / /| | / __ \/ ___/ / __ \/ / _ \
 / /  / / / /_/ /_/ / / / / / // ___ |/ / / (__  ) / /_/ / /  __/
/_/  /_/_/\__/\__,_/_/ /_/ /_//_/  |_/_/ /_/____/_/_.___/_/\___/ 
                                                                  
EOF
    echo -e "${NC}"
    echo -e "${CYAN}Mitum Blockchain Deployment Tool v4.0.0${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Usage help
usage() {
    cat << EOF
${GREEN}Usage:${NC} $0 [OPTIONS] [INVENTORY]

${YELLOW}Description:${NC}
    Deploy Mitum blockchain network with easy-to-use interface.
    Can be used standalone or with Makefile integration.

${YELLOW}Arguments:${NC}
    INVENTORY           Path to inventory file (default: inventories/production/hosts.yml)

${YELLOW}Options:${NC}
    -i, --interactive   Run in interactive mode (recommended for beginners)
    -e, --env ENV       Target environment (production/staging/development)
    --skip-keygen       Skip key generation step
    --skip-mongodb      Skip MongoDB installation
    --skip-prepare      Skip system preparation
    --no-make          Don't use Makefile (direct Ansible execution)
    --dry-run          Show what would be executed without making changes
    -v, --verbose      Enable verbose output
    -h, --help         Show this help message

${YELLOW}Examples:${NC}
    # Interactive mode (easiest for beginners)
    $0 --interactive

    # Quick deployment with defaults
    $0

    # Deploy to staging environment
    $0 --env staging

    # Skip key generation (use existing keys)
    $0 --skip-keygen

    # Dry run to preview changes
    $0 --dry-run

${YELLOW}Integration with Makefile:${NC}
    This script can use Makefile commands for better integration:
    - Uses 'make test' for connectivity testing
    - Uses 'make keygen' for key generation
    - Uses 'make deploy' for full deployment

    To use direct Ansible commands instead, add --no-make option.

${YELLOW}Requirements:${NC}
    - Python 3.8+
    - Ansible 6.0+
    - Node.js 14+ (for key generation)
    - SSH access to target servers

EOF
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if make target exists
make_target_exists() {
    make -n "$1" >/dev/null 2>&1
}

# Interactive mode for beginners
interactive_mode() {
    show_banner
    
    echo -e "${CYAN}Welcome to Mitum Deployment Interactive Mode!${NC}"
    echo -e "${CYAN}This wizard will guide you through the deployment process.${NC}"
    echo ""
    
    # Step 1: Environment selection
    echo -e "${YELLOW}Step 1: Select Environment${NC}"
    PS3="Please select environment (1-3): "
    options=("Production" "Staging" "Development")
    select opt in "${options[@]}"; do
        case $REPLY in
            1) ENVIRONMENT="production"; break;;
            2) ENVIRONMENT="staging"; break;;
            3) ENVIRONMENT="development"; break;;
            *) echo "Invalid option. Please try again.";;
        esac
    done
    echo -e "${GREEN}✓ Selected: $ENVIRONMENT${NC}"
    echo ""
    
    # Step 2: Check inventory
    INVENTORY="inventories/$ENVIRONMENT/hosts.yml"
    if [[ ! -f "$INVENTORY" ]]; then
        echo -e "${YELLOW}Step 2: Create Inventory${NC}"
        echo "No inventory found for $ENVIRONMENT environment."
        prompt "Would you like to create one now? (y/n): "
        read -r create_inventory
        
        if [[ "$create_inventory" =~ ^[Yy]$ ]]; then
            if command_exists make && make_target_exists inventory; then
                info "Starting inventory creation wizard..."
                make inventory
            else
                error "Inventory creation not available. Please create manually."
                exit 1
            fi
        else
            error "Cannot proceed without inventory file."
            exit 1
        fi
    else
        success "Inventory found: $INVENTORY"
    fi
    echo ""
    
    # Step 3: Deployment options
    echo -e "${YELLOW}Step 3: Deployment Options${NC}"
    
    prompt "Generate new blockchain keys? (y/n) [y]: "
    read -r gen_keys
    if [[ ! "$gen_keys" =~ ^[Nn]$ ]]; then
        SKIP_KEYGEN=false
        prompt "Key generation strategy (centralized/distributed) [centralized]: "
        read -r keygen_strat
        KEYGEN_STRATEGY="${keygen_strat:-centralized}"
    else
        SKIP_KEYGEN=true
    fi
    
    prompt "Install MongoDB? (y/n) [y]: "
    read -r install_mongo
    [[ "$install_mongo" =~ ^[Nn]$ ]] && SKIP_MONGODB=true
    
    prompt "Prepare systems (install dependencies)? (y/n) [y]: "
    read -r prepare_sys
    [[ "$prepare_sys" =~ ^[Nn]$ ]] && SKIP_PREPARE=true
    
    prompt "Setup monitoring (Prometheus/Grafana)? (y/n) [n]: "
    read -r setup_mon
    [[ "$setup_mon" =~ ^[Yy]$ ]] && SETUP_MONITORING=true
    
    prompt "Run in dry-run mode (preview only)? (y/n) [n]: "
    read -r dry_run
    [[ "$dry_run" =~ ^[Yy]$ ]] && DRY_RUN=true
    
    # Advanced options
    prompt "Show advanced options? (y/n) [n]: "
    read -r show_advanced
    if [[ "$show_advanced" =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}Advanced Options:${NC}"
        
        prompt "Mitum version [latest]: "
        read -r mitum_ver
        [[ -n "$mitum_ver" ]] && MITUM_VERSION="$mitum_ver"
        
        prompt "Mitum model (mitum-currency/mitum-nft/mitum-document) [mitum-currency]: "
        read -r mitum_model
        [[ -n "$mitum_model" ]] && MITUM_MODEL="$mitum_model"
        
        prompt "MongoDB version [7.0]: "
        read -r mongo_ver
        [[ -n "$mongo_ver" ]] && MONGODB_VERSION="$mongo_ver"
        
        prompt "Update group_vars even if exists? (y/n) [n]: "
        read -r update_vars
        [[ "$update_vars" =~ ^[Yy]$ ]] && UPDATE_GROUP_VARS=true
    fi
    
    echo ""
    
    # Step 4: Summary
    echo -e "${YELLOW}Step 4: Deployment Summary${NC}"
    echo "================================"
    echo "Environment: $ENVIRONMENT"
    echo "Inventory: $INVENTORY"
    echo "Generate Keys: $([ "$SKIP_KEYGEN" == "true" ] && echo "No" || echo "Yes ($KEYGEN_STRATEGY)")"
    echo "Install MongoDB: $([ "$SKIP_MONGODB" == "true" ] && echo "No" || echo "Yes")"
    echo "Prepare Systems: $([ "$SKIP_PREPARE" == "true" ] && echo "No" || echo "Yes")"
    echo "Dry Run: $([ "$DRY_RUN" == "true" ] && echo "Yes" || echo "No")"
    echo "================================"
    echo ""
    
    prompt "Proceed with deployment? (y/n): "
    read -r proceed
    if [[ ! "$proceed" =~ ^[Yy]$ ]]; then
        warning "Deployment cancelled by user."
        exit 0
    fi
    
    echo ""
    info "Starting deployment..."
    echo ""
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--interactive)
                INTERACTIVE_MODE=true
                shift
                ;;
            -e|--env)
                ENVIRONMENT="$2"
                INVENTORY="inventories/$2/hosts.yml"
                shift 2
                ;;
            --skip-keygen)
                SKIP_KEYGEN=true
                shift
                ;;
            --skip-mongodb)
                SKIP_MONGODB=true
                shift
                ;;
            --skip-prepare)
                SKIP_PREPARE=true
                shift
                ;;
            --no-make)
                USE_MAKEFILE=false
                shift
                ;;
            --keygen-strategy)
                KEYGEN_STRATEGY="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                # Assume it's inventory path
                INVENTORY="$1"
                shift
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Python
    if ! command_exists python3; then
        missing_deps+=("Python 3.8+")
    fi
    
    # Check virtual environment
    if [[ -z "${VIRTUAL_ENV:-}" ]]; then
        if [[ -f "$ROOT_DIR/venv/bin/activate" ]]; then
            info "Activating Python virtual environment..."
            source "$ROOT_DIR/venv/bin/activate"
        else
            missing_deps+=("Python virtual environment (run: make setup)")
        fi
    fi
    
    # Check Ansible
    if ! command_exists ansible; then
        missing_deps+=("Ansible 6.0+")
    fi
    
    # Check Node.js (for key generation)
    if [[ "$SKIP_KEYGEN" == "false" ]] && [[ "$KEYGEN_STRATEGY" == "centralized" ]]; then
        if ! command_exists node; then
            missing_deps+=("Node.js 14+ (for key generation)")
        else
            local node_version=$(node --version | grep -oE '[0-9]+' | head -1)
            if [[ $node_version -lt 14 ]]; then
                missing_deps+=("Node.js 14+ (current: $(node --version))")
            fi
        fi
    fi
    
    # Check Make (if using Makefile)
    if [[ "$USE_MAKEFILE" == "true" ]] && ! command_exists make; then
        warning "Make not found. Switching to direct Ansible execution."
        USE_MAKEFILE=false
    fi
    
    # Report missing dependencies
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing prerequisites:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please run: ${GREEN}make setup${NC} or install missing dependencies manually."
        exit 1
    fi
    
    success "All prerequisites satisfied ✓"
}

# Check inventory and SSH keys
check_inventory_and_keys() {
    log "Checking inventory and SSH keys..."
    
    # Check inventory file
    if [[ ! -f "$INVENTORY" ]]; then
        error "Inventory file not found: $INVENTORY"
        echo ""
        echo "To create inventory, run one of:"
        echo "  ${GREEN}make inventory BASTION_IP=x.x.x.x NODE_IPS=10.0.1.10,10.0.1.11${NC}"
        echo "  ${GREEN}$0 --interactive${NC}"
        exit 1
    fi
    
    # Extract environment from inventory path
    local env=$(basename $(dirname "$INVENTORY"))
    
    # Check SSH keys
    local bastion_key="$ROOT_DIR/keys/ssh/$env/bastion.pem"
    local keys_found=true
    
    if [[ ! -f "$bastion_key" ]]; then
        error "Bastion SSH key not found: $bastion_key"
        keys_found=false
    fi
    
    if [[ "$keys_found" == "false" ]]; then
        echo ""
        echo "To add SSH keys, run:"
        echo "  ${GREEN}./scripts/add-key.sh $env ~/path/to/your-key.pem bastion.pem${NC}"
        echo "Or:"
        echo "  ${GREEN}make keys-add ENV=$env KEY=~/path/to/your-key.pem NAME=bastion.pem${NC}"
        exit 1
    fi
    
    success "Inventory and SSH keys verified ✓"
}

# Run command with proper error handling
run_command() {
    local description="$1"
    shift
    local command="$@"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN: $description"
        echo "  Command: $command"
        return 0
    fi
    
    log "$description..."
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo "  Command: $command"
    fi
    
    if eval "$command"; then
        success "$description completed ✓"
        return 0
    else
        error "$description failed!"
        return 1
    fi
}

# Test connectivity
test_connectivity() {
    if [[ "$USE_MAKEFILE" == "true" ]] && make_target_exists test; then
        run_command "Testing connectivity" "make test ENV=$ENVIRONMENT"
    else
        run_command "Testing connectivity" "ansible -i '$INVENTORY' all -m ping"
    fi
}

# Generate keys
generate_keys() {
    if [[ "$SKIP_KEYGEN" == "true" ]]; then
        info "Skipping key generation (--skip-keygen)"
        return 0
    fi
    
    local keygen_args="-e mitum_keygen_strategy=$KEYGEN_STRATEGY"
    
    if [[ "$USE_MAKEFILE" == "true" ]] && make_target_exists keygen; then
        run_command "Generating blockchain keys" "make keygen ENV=$ENVIRONMENT"
    else
        run_command "Generating blockchain keys" \
            "ansible-playbook -i '$INVENTORY' playbooks/keygen.yml $keygen_args"
    fi
}

# Main deployment function
deploy() {
    # Show banner if not in interactive mode
    if [[ "$INTERACTIVE_MODE" == "false" ]]; then
        show_banner
    fi
    
    # Change to project root
    cd "$ROOT_DIR"
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Check inventory and keys
    check_inventory_and_keys
    
    # Step 3: Test connectivity
    test_connectivity || {
        error "Connectivity test failed. Please check:"
        echo "  1. SSH keys are correct"
        echo "  2. Bastion host is accessible"
        echo "  3. Security groups allow SSH access"
        exit 1
    }
    
    # Step 4: Generate keys
    generate_keys || {
        error "Key generation failed!"
        exit 1
    }
    
    # Step 5: Full deployment
    if [[ "$USE_MAKEFILE" == "true" ]] && make_target_exists deploy; then
        local make_args="ENV=$ENVIRONMENT"
        [[ "$SKIP_PREPARE" == "true" ]] && make_args="$make_args SKIP_PREPARE=true"
        [[ "$SKIP_MONGODB" == "true" ]] && make_args="$make_args SKIP_MONGODB=true"
        [[ "$DRY_RUN" == "true" ]] && make_args="$make_args DRY_RUN=yes"
        [[ "$VERBOSE" == "true" ]] && make_args="$make_args VERBOSE=true"
        
        run_command "Deploying Mitum cluster" "make deploy $make_args"
    else
        # Direct Ansible execution
        local playbook="$ROOT_DIR/playbooks/site.yml"
        local ansible_args="-i '$INVENTORY'"
        [[ "$DRY_RUN" == "true" ]] && ansible_args="$ansible_args --check"
        [[ "$VERBOSE" == "true" ]] && ansible_args="$ansible_args -vv"
        
        run_command "Deploying Mitum cluster" "ansible-playbook $ansible_args $playbook"
    fi
    
    # Step 6: Show completion message
    echo ""
    success "🎉 Mitum deployment completed successfully! 🎉"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Check cluster status:"
    echo "   ${GREEN}make status ENV=$ENVIRONMENT${NC}"
    echo ""
    echo "2. View logs:"
    echo "   ${GREEN}make logs ENV=$ENVIRONMENT${NC}"
    echo ""
    echo "3. Access API (find API node IP first):"
    echo "   ${GREEN}curl http://<api-node-ip>:54320/v2/node${NC}"
    echo ""
    echo "4. SSH to nodes:"
    echo "   ${GREEN}ssh -F inventories/$ENVIRONMENT/ssh_config node0${NC}"
    echo ""
    echo -e "${CYAN}For help: make help${NC}"
}

# Main execution
main() {
    # Parse arguments
    parse_args "$@"
    
    # Run interactive mode if requested
    if [[ "$INTERACTIVE_MODE" == "true" ]]; then
        interactive_mode
    fi
    
    # Check if running in CI/CD
    if [[ -n "${CI:-}" ]] || [[ -n "${JENKINS_HOME:-}" ]] || [[ -n "${GITHUB_ACTIONS:-}" ]]; then
        info "Running in CI/CD environment"
        VERBOSE=true
        USE_MAKEFILE=false  # Direct Ansible in CI/CD
    fi
    
    # Run deployment
    deploy
}

# Execute if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
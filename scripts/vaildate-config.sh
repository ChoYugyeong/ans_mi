#!/bin/bash
# Configuration Validation Script for Mitum Ansible
# Version: 2.0.0

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR="$(dirname "$SCRIPT_DIR")"
readonly VENV="${ROOT_DIR}/.venv"

# Validation counters
ERRORS=0
WARNINGS=0

# Check if running in virtual environment
if [[ -z "${VIRTUAL_ENV:-}" ]] && [[ -d "$VENV" ]]; then
    source "$VENV/bin/activate"
fi

# Logging functions
log_info() { echo -e "${GREEN}[OK]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; ((WARNINGS++)); }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; ((ERRORS++)); }
log_check() { echo -e "${BLUE}[CHECK]${NC} $*"; }

# Banner
echo -e "${BLUE}Mitum Ansible Configuration Validator${NC}"
echo "====================================="
echo ""

# Check Python version
log_check "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

if [[ "$PYTHON_MAJOR" -ge 3 ]] && [[ "$PYTHON_MINOR" -ge 9 ]]; then
    log_info "Python version $PYTHON_VERSION is supported"
else
    log_error "Python 3.9+ required, found $PYTHON_VERSION"
fi

# Check Ansible installation
log_check "Checking Ansible installation..."
if command -v ansible >/dev/null 2>&1; then
    ANSIBLE_VERSION=$(ansible --version | head -1 | awk '{print $2}')
    log_info "Ansible version $ANSIBLE_VERSION found"
else
    log_error "Ansible not found. Run: make setup"
fi

# Check required files
log_check "Checking required files..."
REQUIRED_FILES=(
    "ansible.cfg"
    "requirements.txt"
    "Makefile"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$ROOT_DIR/$file" ]]; then
        log_info "Found $file"
    else
        log_error "Missing required file: $file"
    fi
done

# Check directory structure
log_check "Checking directory structure..."
REQUIRED_DIRS=(
    "playbooks"
    "roles"
    "inventories"
    "scripts"
    "keys"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$ROOT_DIR/$dir" ]]; then
        log_info "Found directory: $dir"
    else
        log_error "Missing required directory: $dir"
    fi
done

# Check inventory files
log_check "Checking inventory files..."
for env in production staging development; do
    INVENTORY="$ROOT_DIR/inventories/$env/hosts.yml"
    if [[ -f "$INVENTORY" ]]; then
        log_info "Found $env inventory"
        
        # Validate YAML syntax
        if python3 -c "import yaml; yaml.safe_load(open('$INVENTORY'))" 2>/dev/null; then
            log_info "$env inventory has valid YAML syntax"
        else
            log_error "$env inventory has invalid YAML syntax"
        fi
    else
        log_warn "Missing $env inventory (optional)"
    fi
done

# Check playbook syntax
log_check "Checking playbook syntax..."
if [[ -d "$VENV" ]] && [[ -f "$VENV/bin/ansible-playbook" ]]; then
    ANSIBLE_PLAYBOOK="$VENV/bin/ansible-playbook"
else
    ANSIBLE_PLAYBOOK="ansible-playbook"
fi

for playbook in "$ROOT_DIR"/playbooks/*.yml; do
    if [[ -f "$playbook" ]]; then
        PLAYBOOK_NAME=$(basename "$playbook")
        if $ANSIBLE_PLAYBOOK "$playbook" --syntax-check >/dev/null 2>&1; then
            log_info "Playbook $PLAYBOOK_NAME syntax is valid"
        else
            log_error "Playbook $PLAYBOOK_NAME has syntax errors"
        fi
    fi
done

# Check role structure
log_check "Checking role structure..."
if [[ -d "$ROOT_DIR/roles/mitum" ]]; then
    ROLE_DIRS=(tasks handlers templates files vars defaults meta)
    for dir in "${ROLE_DIRS[@]}"; do
        if [[ -d "$ROOT_DIR/roles/mitum/$dir" ]]; then
            log_info "Found mitum role directory: $dir"
        else
            log_warn "Missing mitum role directory: $dir (optional)"
        fi
    done
else
    log_error "Missing mitum role"
fi

# Check for vault file
log_check "Checking vault configuration..."
if [[ -f "$ROOT_DIR/.vault_pass" ]]; then
    log_info "Vault password file found"
    if [[ "$(stat -c %a "$ROOT_DIR/.vault_pass" 2>/dev/null || stat -f %p "$ROOT_DIR/.vault_pass" | tail -c 4)" == "600" ]]; then
        log_info "Vault password file has correct permissions"
    else
        log_warn "Vault password file should have 600 permissions"
    fi
else
    log_warn "No vault password file found (optional)"
fi

# Check SSH keys
log_check "Checking SSH keys..."
SSH_KEY_COUNT=0
for key in "$ROOT_DIR"/keys/ssh/*/*.pem "$ROOT_DIR"/keys/ssh/*/*.key; do
    if [[ -f "$key" ]]; then
        ((SSH_KEY_COUNT++))
        PERMS=$(stat -c %a "$key" 2>/dev/null || stat -f %p "$key" | tail -c 4)
        if [[ "$PERMS" == "600" ]] || [[ "$PERMS" == "400" ]]; then
            log_info "SSH key $(basename "$key") has correct permissions"
        else
            log_error "SSH key $(basename "$key") has insecure permissions: $PERMS"
        fi
    fi
done

if [[ $SSH_KEY_COUNT -eq 0 ]]; then
    log_warn "No SSH keys found in keys/ssh/"
fi

# Check Node.js for key generation
log_check "Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    log_info "Node.js $NODE_VERSION found"
else
    log_warn "Node.js not found (required for key generation)"
fi

# Check for common configuration issues
log_check "Checking for common issues..."

# Check if inventory has localhost entries
if grep -r "ansible_connection.*local" "$ROOT_DIR/inventories/" >/dev/null 2>&1; then
    log_warn "Found localhost connections in inventory - ensure this is intentional"
fi

# Check for hardcoded IPs
if grep -r -E "([0-9]{1,3}\.){3}[0-9]{1,3}" "$ROOT_DIR/playbooks/" --include="*.yml" | grep -v "0.0.0.0" | grep -v "127.0.0.1" >/dev/null 2>&1; then
    log_warn "Found hardcoded IP addresses in playbooks - consider using variables"
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME" "$ROOT_DIR" --include="*.yml" --include="*.yaml" 2>/dev/null | wc -l || echo 0)
if [[ $TODO_COUNT -gt 0 ]]; then
    log_warn "Found $TODO_COUNT TODO/FIXME comments"
fi

# Summary
echo ""
echo "====================================="
echo -e "${BLUE}Validation Summary${NC}"
echo "====================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [[ $ERRORS -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}✅ Configuration validation passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Configuration validation failed!${NC}"
    echo "Please fix the errors above before proceeding."
    exit 1
fi
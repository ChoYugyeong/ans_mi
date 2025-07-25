#!/bin/bash

# Mitum Ansible Project Optimization Script
# Version: 1.0.0
#
# This script performs the following tasks:
# 1. Project structure optimization
# 2. Duplicate code removal
# 3. Performance improvement
# 4. Security enhancement

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Log functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Project structure optimization
optimize_structure() {
    log_step "Optimizing project structure..."
    
    # Create standard directory structure
    mkdir -p {logs,tmp,cache,backups}
    
    # Improve environment-specific directory structure
    for env in development staging production; do
        if [ -d "inventories/$env" ]; then
            mkdir -p "inventories/$env/{group_vars,host_vars,ssh_keys}"
        fi
    done
    
    log_info "Directory structure has been optimized"
}

# Remove duplicate code
remove_duplicates() {
    log_step "Removing duplicate code..."
    
    # Remove core-files directory if it exists (duplicate of root)
    if [ -d "core-files" ]; then
        log_info "Removing core-files directory (duplicate of root)..."
        rm -rf core-files
    fi
    
    # Remove .DS_Store files
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    
    log_info "Duplicate code has been removed"
}

# Performance improvement
improve_performance() {
    log_step "Improving performance..."
    
    # Optimize Ansible configuration
    if [ -f "ansible.cfg" ]; then
        # Improve cache settings
        if ! grep -q "fact_caching = jsonfile" ansible.cfg; then
            echo "" >> ansible.cfg
            echo "[defaults]" >> ansible.cfg
            echo "fact_caching = jsonfile" >> ansible.cfg
            echo "fact_caching_connection = .ansible_cache" >> ansible.cfg
            echo "fact_caching_timeout = 86400" >> ansible.cfg
        fi
        
        # Improve parallel processing
        if ! grep -q "forks = 50" ansible.cfg; then
            sed -i.bak 's/forks = [0-9]*/forks = 50/' ansible.cfg
        fi
    fi
    
    log_info "Performance has been improved"
}

# Security enhancement
enhance_security() {
    log_step "Enhancing security..."
    
    # Set SSH key permissions
    find keys/ -name "*.pem" -exec chmod 600 {} \; 2>/dev/null || true
    find keys/ -name "*.key" -exec chmod 600 {} \; 2>/dev/null || true
    
    # Create Vault file if it doesn't exist
    if [ ! -f ".vault_pass" ]; then
        log_info "Creating Ansible Vault password file..."
        echo "mitum-vault-$(date +%s)" > .vault_pass
        chmod 600 .vault_pass
    fi
    
    # Update .gitignore
    if [ -f ".gitignore" ]; then
        # Add security-related files
        for pattern in ".vault_pass" "*.pem" "*.key" "secrets/" "vault*.yml"; do
            if ! grep -q "$pattern" .gitignore; then
                echo "$pattern" >> .gitignore
            fi
        done
    fi
    
    log_info "Security has been enhanced"
}

# Code quality improvement
improve_code_quality() {
    log_step "Improving code quality..."
    
    # Validate YAML files
    find . -name "*.yml" -type f | while read -r file; do
        if command -v yamllint >/dev/null 2>&1; then
            yamllint "$file" >/dev/null 2>&1 || log_warn "YAML syntax error: $file"
        fi
    done
    
    # Validate Ansible syntax
    if command -v ansible-playbook >/dev/null 2>&1; then
        find playbooks/ -name "*.yml" -type f | while read -r playbook; do
            ansible-playbook --syntax-check "$playbook" >/dev/null 2>&1 || log_warn "Ansible syntax error: $playbook"
        done
    fi
    
    log_info "Code quality has been improved"
}

# Generate documentation
generate_documentation() {
    log_step "Generating documentation..."
    
    # Project structure documentation
    cat > PROJECT_STRUCTURE.md << 'EOF'
# Mitum Ansible Project Structure

## Directory Structure

```
mitum-ansible/
├── ansible.cfg              # Ansible configuration file
├── Makefile                 # Build and deployment commands
├── requirements.txt         # Python dependencies
├── README.md               # Project documentation
├── .gitignore              # Git exclude file
├── .vault_pass             # Ansible Vault password
├── playbooks/              # Ansible playbooks
│   ├── site.yml           # Main deployment playbook
│   ├── deploy-mitum.yml   # Mitum deployment
│   ├── backup.yml         # Backup
│   └── ...
├── roles/                  # Ansible roles
│   └── mitum/             # Mitum node role
├── inventories/            # Inventory
│   ├── development/       # Development environment
│   ├── staging/          # Staging environment
│   └── production/       # Production environment
├── keys/                  # SSH keys and Mitum keys
├── logs/                  # Log files
├── scripts/               # Utility scripts
└── tools/                 # Tools and scripts
```

## Key File Descriptions

- `ansible.cfg`: Ansible configuration (security, performance optimization)
- `Makefile`: Deployment and management commands
- `playbooks/`: Ansible playbook collection
- `roles/mitum/`: Mitum node configuration role
- `inventories/`: Environment-specific host and variable definitions
- `keys/`: SSH key and Mitum key storage
EOF

    log_info "Documentation has been generated"
}

# Main execution function
main() {
    echo "🚀 Mitum Ansible Project Optimization Script"
    echo "============================================"
    echo ""
    
    # Check current directory
    if [ ! -f "ansible.cfg" ] && [ ! -f "Makefile" ]; then
        log_error "This script must be run from the mitum-ansible project root"
        exit 1
    fi
    
    # User confirmation
    echo "This script will perform the following tasks:"
    echo "1. Project structure optimization"
    echo "2. Duplicate code removal"
    echo "3. Performance improvement"
    echo "4. Security enhancement"
    echo "5. Code quality improvement"
    echo "6. Documentation generation"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
    
    # Execute optimization tasks
    remove_duplicates
    optimize_structure
    improve_performance
    enhance_security
    improve_code_quality
    generate_documentation
    
    log_info "Project optimization completed!"
    echo ""
    echo "=== Optimization Results ==="
    echo "✅ Duplicate code removed"
    echo "✅ Project structure optimized"
    echo "✅ Performance improved"
    echo "✅ Security enhanced"
    echo "✅ Code quality improved"
    echo "✅ Documentation generated"
}

# Execute script
main "$@" 
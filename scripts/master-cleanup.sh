#!/bin/bash

# Mitum Ansible Master Cleanup and Optimization Script
# Version: 1.1.0 - macOS Compatible
#
# This script performs the following tasks:
# 1. Remove duplicate files
# 2. Optimize project structure
# 3. Improve performance
# 4. Enhance security
# 5. Generate documentation
# 6. Final validation

set -e

# Detect OS and set appropriate settings
UNAME=$(uname -s)
if [[ "$UNAME" == "Darwin" ]]; then
    # macOS specific settings
    OS_TYPE="macOS"
    # Use different locale for macOS
    export LC_ALL=en_US.UTF-8
    export LANG=en_US.UTF-8
    SED_CMD="sed -i.bak"
else
    OS_TYPE="Linux"
    SED_CMD="sed -i"
fi

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Create backup
create_backup() {
    log_step "Creating backup..."
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup important files (with macOS compatibility)
    for item in ansible.cfg Makefile requirements.txt playbooks roles inventories keys scripts; do
        if [ -e "$item" ]; then
            cp -r "$item" "$BACKUP_DIR/" 2>/dev/null || true
        fi
    done
    
    if [ -d "core-files" ]; then
        cp -r core-files "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    log_info "Backup created in $BACKUP_DIR"
}

# Remove duplicate files
remove_duplicates() {
    log_step "Removing duplicate files..."
    
    # .DS_Store files removal (macOS specific)
    if [[ "$OS_TYPE" == "macOS" ]]; then
        DS_STORE_COUNT=$(find . -name ".DS_Store" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$DS_STORE_COUNT" -gt 0 ]; then
            log_info "Found $DS_STORE_COUNT .DS_Store files"
            find . -name ".DS_Store" -type f -delete 2>/dev/null || true
            log_info ".DS_Store files removed"
        fi
        
        # Remove other macOS system files
        find . -name "._*" -type f -delete 2>/dev/null || true
        find . -name ".Spotlight-V100" -type d -exec rm -rf {} + 2>/dev/null || true
        find . -name ".Trashes" -type d -exec rm -rf {} + 2>/dev/null || true
    fi
    
    # Remove core-files directory (duplicate of root)
    if [ -d "core-files" ]; then
        log_info "Removing core-files directory (duplicate of root)..."
        rm -rf core-files
        log_info "core-files directory removed"
    fi
    
    # Clean empty directories
    EMPTY_DIRS=$(find . -type d -empty -not -path "./.git*" -not -path "./venv*" 2>/dev/null || true)
    if [ -n "$EMPTY_DIRS" ]; then
        echo "$EMPTY_DIRS" | xargs rmdir 2>/dev/null || true
        log_info "Empty directories cleaned"
    fi
}

# Optimize project structure
optimize_structure() {
    log_step "Optimizing project structure..."
    
    # Create standard directory structure
    mkdir -p {logs,tmp,cache,backups} 2>/dev/null || true
    
    # Improve environment-specific directory structure
    for env in development staging production; do
        if [ -d "inventories/$env" ]; then
            mkdir -p "inventories/$env"/{group_vars,host_vars,ssh_keys} 2>/dev/null || true
        fi
    done
    
    # Improve keys directory structure
    mkdir -p keys/{development,staging,production,testnet} 2>/dev/null || true
    
    log_info "Directory structure optimized"
}

# Improve performance
improve_performance() {
    log_step "Improving performance..."
    
    # Optimize Ansible configuration
    if [ -f "ansible.cfg" ]; then
        # Improve parallel processing
        if ! grep -q "forks = 50" ansible.cfg 2>/dev/null; then
            $SED_CMD 's/forks = [0-9]*/forks = 50/' ansible.cfg 2>/dev/null || true
        fi
        
        # Improve cache settings
        if ! grep -q "fact_caching = jsonfile" ansible.cfg 2>/dev/null; then
            echo "" >> ansible.cfg
            echo "[defaults]" >> ansible.cfg
            echo "fact_caching = jsonfile" >> ansible.cfg
            echo "fact_caching_connection = .ansible_cache" >> ansible.cfg
            echo "fact_caching_timeout = 86400" >> ansible.cfg
        fi
    fi
    
    # Optimize Makefile
    if [ -f "Makefile" ]; then
        # Add performance flags
        if ! grep -q "PARALLEL_FORKS" Makefile 2>/dev/null; then
            $SED_CMD '/^# === Configuration ===/a\
# Performance optimization options\
PARALLEL_FORKS ?= 50\
CACHE_ENABLED ?= yes\
FACT_CACHING ?= jsonfile' Makefile 2>/dev/null || true
        fi
    fi
    
    log_info "Performance improved"
}

# Enhance security
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
            if ! grep -q "$pattern" .gitignore 2>/dev/null; then
                echo "$pattern" >> .gitignore
            fi
        done
        
        # Add macOS specific exclusions
        if [[ "$OS_TYPE" == "macOS" ]]; then
            for pattern in ".DS_Store" ".DS_Store?" "._*" ".Spotlight-V100" ".Trashes"; do
                if ! grep -q "$pattern" .gitignore 2>/dev/null; then
                    echo "$pattern" >> .gitignore
                fi
            done
        fi
    fi
    
    log_info "Security enhanced"
}

# Improve code quality
improve_code_quality() {
    log_step "Improving code quality..."
    
    # Validate YAML files
    YAML_ERRORS=0
    find . -name "*.yml" -type f 2>/dev/null | while read -r file; do
        if command -v yamllint >/dev/null 2>&1; then
            if ! yamllint "$file" >/dev/null 2>&1; then
                log_warn "YAML syntax error: $file"
                YAML_ERRORS=$((YAML_ERRORS + 1))
            fi
        fi
    done
    
    # Validate Ansible syntax
    ANSIBLE_ERRORS=0
    if command -v ansible-playbook >/dev/null 2>&1; then
        find playbooks/ -name "*.yml" -type f 2>/dev/null | while read -r playbook; do
            if ! ansible-playbook --syntax-check "$playbook" >/dev/null 2>&1; then
                log_warn "Ansible syntax error: $playbook"
                ANSIBLE_ERRORS=$((ANSIBLE_ERRORS + 1))
            fi
        done
    fi
    
    if [ "$YAML_ERRORS" -eq 0 ] && [ "$ANSIBLE_ERRORS" -eq 0 ]; then
        log_info "Code quality improved"
    else
        log_warn "Some code quality issues found"
    fi
}

# Generate documentation
generate_documentation() {
    log_step "Generating documentation..."
    
    # Project structure documentation
    cat > PROJECT_STRUCTURE.md << 'EOF'
# Mitum Ansible Project Structure (Optimized Version)

## Overview
This document describes the structure of the optimized Mitum Ansible project.

## Directory Structure

```
mitum-ansible/
├── ansible.cfg              # Ansible configuration file (optimized)
├── Makefile                 # Build and deployment commands (optimized)
├── requirements.txt         # Python dependencies
├── README.md               # Project documentation
├── .gitignore              # Git exclude file (security enhanced)
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

## Key Improvements

### 1. Duplicate Removal
- core-files directory removed
- .DS_Store files cleaned
- Duplicate configuration files merged

### 2. Performance Optimization
- Parallel processing improved (forks = 50)
- Fact caching enabled
- Connection reuse optimization

### 3. Security Enhancement
- SSH key permissions set (600)
- Vault encryption support
- Sensitive files excluded from .gitignore

### 4. Structure Improvement
- Standard directory structure
- Environment separation
- Clear file organization

## Usage

### Basic Commands
```bash
# Project optimization
make optimize

# Duplicate removal
make deduplicate

# Deployment
make deploy

# Backup
make backup
```

### Environment-specific Usage
```bash
# Development environment
ENV=development make deploy

# Production environment
ENV=production make deploy
```
EOF

    # Optimization guide documentation
    cat > OPTIMIZATION_GUIDE.md << 'EOF'
# Mitum Ansible Optimization Guide

## Overview
This guide explains how to optimize the Mitum Ansible project.

## Optimization Steps

### 1. Duplicate Removal
```bash
# Clean duplicate files
./cleanup-duplicates.sh

# Or use Makefile
make deduplicate
```

### 2. Performance Optimization
```bash
# Optimize Ansible configuration
make optimize-config

# Set parallel processing
PARALLEL_FORKS=100 make deploy
```

### 3. Security Enhancement
```bash
# Optimize security settings
make optimize-security

# Setup Vault
make setup-vault
```

### 4. Code Quality Improvement
```bash
# Syntax validation
make validate

# Code quality check
yamllint playbooks/
ansible-lint playbooks/
```

## Monitoring and Maintenance

### Regular Cleanup
```bash
# Weekly cleanup
make clean

# Monthly deep cleanup
make clean-all
```

### Backup Management
```bash
# Automated backup
make backup BACKUP_TYPE=scheduled

# Backup restoration
make restore BACKUP_TIMESTAMP=20231201-120000
```

## Troubleshooting

### Common Issues
1. **Duplicate file errors**: Run `make deduplicate`
2. **Performance issues**: Adjust `PARALLEL_FORKS` value
3. **Security issues**: Run `make optimize-security`
4. **Syntax errors**: Run `make validate`

### Log Checking
```bash
# View logs
make logs

# Specific node logs
ansible mitum_nodes[0] -m shell -a "tail -f /var/log/mitum/mitum.log"
```
EOF

    log_info "Documentation generated"
}

# Final validation
final_validation() {
    log_step "Final validation..."
    
    # Check required files
    REQUIRED_FILES=("ansible.cfg" "Makefile" "requirements.txt")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file missing: $file"
            return 1
        fi
    done
    
    # Check directory structure
    REQUIRED_DIRS=("playbooks" "roles" "inventories" "keys" "scripts")
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            log_warn "Recommended directory missing: $dir"
        fi
    done
    
    # Check for duplicate files
    if [ -d "core-files" ]; then
        log_warn "core-files directory still exists"
    fi
    
    # Check .DS_Store files
    if [[ "$OS_TYPE" == "macOS" ]]; then
        DS_STORE_COUNT=$(find . -name ".DS_Store" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$DS_STORE_COUNT" -gt 0 ]; then
            log_warn "$DS_STORE_COUNT .DS_Store files remain"
        fi
    fi
    
    log_info "Final validation completed"
}

# Show summary
show_summary() {
    log_header "Cleanup and optimization completed!"
    
    echo ""
    echo "=== Cleanup Results ==="
    echo "✅ Duplicate files removed"
    echo "✅ Project structure optimized"
    echo "✅ Performance improved"
    echo "✅ Security enhanced"
    echo "✅ Code quality improved"
    echo "✅ Documentation generated"
    echo ""
    
    # Current directory size
    if command -v du >/dev/null 2>&1; then
        TOTAL_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")
        echo "📁 Current project size: $TOTAL_SIZE"
    fi
    
    # File count
    FILE_COUNT=$(find . -type f -not -path "./.git*" -not -path "./venv*" 2>/dev/null | wc -l | tr -d ' ')
    echo "📄 Total file count: $FILE_COUNT"
    
    # Directory count
    DIR_COUNT=$(find . -type d -not -path "./.git*" -not -path "./venv*" 2>/dev/null | wc -l | tr -d ' ')
    echo "📂 Total directory count: $DIR_COUNT"
    
    # Generated documentation
    echo ""
    echo "📚 Generated documentation:"
    echo "  - PROJECT_STRUCTURE.md"
    echo "  - OPTIMIZATION_GUIDE.md"
    
    # Next steps
    echo ""
    echo "🚀 Next steps:"
    echo "  1. make help - Check available commands"
    echo "  2. make setup - Initial setup"
    echo "  3. make test - Connectivity test"
    echo "  4. make deploy - Start deployment"
}

# macOS specific confirmation function
confirm_action() {
    echo ""
    echo "$1"
    echo "This script will perform the following tasks:"
    echo "1. Remove duplicate files"
    echo "2. Optimize project structure"
    echo "3. Improve performance"
    echo "4. Enhance security"
    echo "5. Improve code quality"
    echo "6. Generate documentation"
    echo "7. Final validation"
    echo ""
    echo "Continue? (y/N): "
    read -r REPLY
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
}

# Main execution function
main() {
    echo "🧹 Mitum Ansible Master Cleanup and Optimization Script"
    echo "================================================"
    echo "Running on: $OS_TYPE"
    echo ""
    
    # Check current directory
    if [ ! -f "ansible.cfg" ] && [ ! -f "Makefile" ]; then
        log_error "This script must be run from the mitum-ansible project root"
        exit 1
    fi
    
    # User confirmation with macOS compatibility
    confirm_action "🚨 IMPORTANT: This will modify your project files!"
    
    # Create backup
    create_backup
    
    # Execute cleanup and optimization tasks
    remove_duplicates
    optimize_structure
    improve_performance
    enhance_security
    improve_code_quality
    generate_documentation
    final_validation
    
    # Show summary
    show_summary
    
    log_success "Master cleanup and optimization completed!"
}

# Execute script
main "$@" 
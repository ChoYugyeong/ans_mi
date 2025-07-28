#!/bin/bash
# Cleanup Unnecessary Files Script
# Version: 1.0.0
#
# This script removes unnecessary and duplicate files from the project

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }

# Track what will be removed
FILES_TO_REMOVE=()
DIRS_TO_REMOVE=()
TOTAL_SIZE=0

# Files that should be removed
UNNECESSARY_FILES=(
    # Old/duplicate scripts (replaced by improved versions)
    "scripts/optimize-project.sh"      # Replaced by this cleanup script
    "scripts/master-cleanup.sh"        # Duplicate functionality
    "scripts/setup-old.sh"            # If exists, old version
    "scripts/generate-group-vars.sh"   # Integrated into generate-inventory.sh
    
    # Temporary and cache files
    "*.retry"
    "*.pyc"
    "*.pyo"
    "*.swp"
    "*.swo"
    "*~"
    ".DS_Store"
    "Thumbs.db"
    
    # Log files (optional - ask user)
    # "logs/*.log"
    
    # Backup files
    "*.bak"
    "*.backup"
    "*.old"
    "*.orig"
    
    # Test/temporary configuration files
    ".mitum-ansible-wizard.conf"      # Temporary wizard config
    "security-report.json"            # Old security reports
    
    # Generated files that should be regenerated
    "PROJECT_STRUCTURE.md"            # Can be regenerated
)

# Directories that might be removed
UNNECESSARY_DIRS=(
    # Python cache
    "__pycache__"
    ".pytest_cache"
    ".tox"
    
    # IDE directories (optional - ask user)
    # ".vscode"
    # ".idea"
    
    # Old/temporary directories
    ".tmp"
    "tmp"
    "temp"
    
    # Old backups (optional - ask user)
    # "backups_old"
    # "archive"
)

# Files that should NEVER be removed
PROTECTED_FILES=(
    "lib/common.sh"
    "scripts/setup.sh"
    "scripts/generate-inventory.sh"
    "scripts/vault-manager.sh"
    "scripts/interactive-setup.sh"
    "scripts/security-scan.sh"
    "ansible.cfg"
    "Makefile"
    "requirements.txt"
    "README.md"
    ".gitignore"
)

# Check if file is protected
is_protected() {
    local file="$1"
    for protected in "${PROTECTED_FILES[@]}"; do
        if [[ "$file" == *"$protected"* ]]; then
            return 0
        fi
    done
    return 1
}

# Get file size
get_file_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            stat -f%z "$file" 2>/dev/null || echo 0
        else
            stat -c%s "$file" 2>/dev/null || echo 0
        fi
    else
        echo 0
    fi
}

# Format size
format_size() {
    local size=$1
    if [[ $size -lt 1024 ]]; then
        echo "${size}B"
    elif [[ $size -lt 1048576 ]]; then
        echo "$((size / 1024))KB"
    else
        echo "$((size / 1048576))MB"
    fi
}

# Find unnecessary files
find_unnecessary_files() {
    log_info "Scanning for unnecessary files..."
    
    # Check each pattern
    for pattern in "${UNNECESSARY_FILES[@]}"; do
        # Handle wildcards
        if [[ "$pattern" == *"*"* ]]; then
            while IFS= read -r file; do
                if [[ -n "$file" ]] && ! is_protected "$file"; then
                    local size=$(get_file_size "$file")
                    TOTAL_SIZE=$((TOTAL_SIZE + size))
                    FILES_TO_REMOVE+=("$file")
                fi
            done < <(find "$ROOT_DIR" -name "$pattern" -type f 2>/dev/null | grep -v ".git/" | grep -v ".venv/" | grep -v "node_modules/")
        else
            # Direct file
            if [[ -f "$ROOT_DIR/$pattern" ]] && ! is_protected "$pattern"; then
                local size=$(get_file_size "$ROOT_DIR/$pattern")
                TOTAL_SIZE=$((TOTAL_SIZE + size))
                FILES_TO_REMOVE+=("$ROOT_DIR/$pattern")
            fi
        fi
    done
    
    # Check directories
    for dir_pattern in "${UNNECESSARY_DIRS[@]}"; do
        while IFS= read -r dir; do
            if [[ -n "$dir" ]] && [[ -d "$dir" ]]; then
                # Calculate directory size
                local dir_size=0
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    dir_size=$(du -sk "$dir" 2>/dev/null | cut -f1 | awk '{print $1 * 1024}')
                else
                    dir_size=$(du -sb "$dir" 2>/dev/null | cut -f1)
                fi
                TOTAL_SIZE=$((TOTAL_SIZE + dir_size))
                DIRS_TO_REMOVE+=("$dir")
            fi
        done < <(find "$ROOT_DIR" -name "$dir_pattern" -type d 2>/dev/null | grep -v ".git/" | grep -v ".venv/" | grep -v "node_modules/")
    done
}

# Check for old log files
check_old_logs() {
    log_info "Checking for old log files..."
    
    local log_dir="$ROOT_DIR/logs"
    if [[ -d "$log_dir" ]]; then
        local old_logs=$(find "$log_dir" -name "*.log" -type f -mtime +30 2>/dev/null)
        if [[ -n "$old_logs" ]]; then
            echo
            log_warn "Found log files older than 30 days:"
            echo "$old_logs" | while read -r log; do
                echo "  - $log ($(format_size $(get_file_size "$log")))"
            done
            echo
            read -rp "Remove old log files? [y/N]: " response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                while IFS= read -r log; do
                    FILES_TO_REMOVE+=("$log")
                done <<< "$old_logs"
            fi
        fi
    fi
}

# Check for old backups
check_old_backups() {
    log_info "Checking for old backup files..."
    
    local backup_dir="$ROOT_DIR/backups"
    if [[ -d "$backup_dir" ]]; then
        local old_backups=$(find "$backup_dir" -type f -mtime +7 2>/dev/null)
        if [[ -n "$old_backups" ]]; then
            echo
            log_warn "Found backup files older than 7 days:"
            echo "$old_backups" | while read -r backup; do
                echo "  - $backup ($(format_size $(get_file_size "$backup")))"
            done
            echo
            read -rp "Remove old backup files? [y/N]: " response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                while IFS= read -r backup; do
                    FILES_TO_REMOVE+=("$backup")
                done <<< "$old_backups"
            fi
        fi
    fi
}

# Display summary
display_summary() {
    echo
    echo "=========================================="
    echo "       Cleanup Summary"
    echo "=========================================="
    echo
    
    if [[ ${#FILES_TO_REMOVE[@]} -eq 0 ]] && [[ ${#DIRS_TO_REMOVE[@]} -eq 0 ]]; then
        log_success "No unnecessary files found. Your project is clean!"
        return 0
    fi
    
    echo "Files to remove: ${#FILES_TO_REMOVE[@]}"
    echo "Directories to remove: ${#DIRS_TO_REMOVE[@]}"
    echo "Total size to free: $(format_size $TOTAL_SIZE)"
    echo
    
    if [[ ${#FILES_TO_REMOVE[@]} -gt 0 ]]; then
        echo "Files:"
        for file in "${FILES_TO_REMOVE[@]:0:20}"; do
            echo "  - ${file#$ROOT_DIR/}"
        done
        if [[ ${#FILES_TO_REMOVE[@]} -gt 20 ]]; then
            echo "  ... and $((${#FILES_TO_REMOVE[@]} - 20)) more files"
        fi
        echo
    fi
    
    if [[ ${#DIRS_TO_REMOVE[@]} -gt 0 ]]; then
        echo "Directories:"
        for dir in "${DIRS_TO_REMOVE[@]}"; do
            echo "  - ${dir#$ROOT_DIR/}"
        done
        echo
    fi
    
    return 1
}

# Perform cleanup
perform_cleanup() {
    local removed_count=0
    local failed_count=0
    
    # Remove files
    for file in "${FILES_TO_REMOVE[@]}"; do
        if rm -f "$file" 2>/dev/null; then
            ((removed_count++))
        else
            ((failed_count++))
            log_warn "Failed to remove: $file"
        fi
    done
    
    # Remove directories
    for dir in "${DIRS_TO_REMOVE[@]}"; do
        if rm -rf "$dir" 2>/dev/null; then
            ((removed_count++))
        else
            ((failed_count++))
            log_warn "Failed to remove: $dir"
        fi
    done
    
    echo
    log_success "Cleanup complete!"
    log_info "Removed: $removed_count items"
    if [[ $failed_count -gt 0 ]]; then
        log_warn "Failed: $failed_count items"
    fi
    log_info "Space freed: $(format_size $TOTAL_SIZE)"
}

# Create cleanup report
create_cleanup_report() {
    local report_file="$ROOT_DIR/cleanup-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$report_file" << EOF
Mitum Ansible Cleanup Report
Generated: $(date)
================================

Files Removed: ${#FILES_TO_REMOVE[@]}
Directories Removed: ${#DIRS_TO_REMOVE[@]}
Total Space Freed: $(format_size $TOTAL_SIZE)

Removed Items:
EOF
    
    for file in "${FILES_TO_REMOVE[@]}"; do
        echo "- [FILE] ${file#$ROOT_DIR/}" >> "$report_file"
    done
    
    for dir in "${DIRS_TO_REMOVE[@]}"; do
        echo "- [DIR] ${dir#$ROOT_DIR/}" >> "$report_file"
    done
    
    log_info "Cleanup report saved to: $report_file"
}

# Main function
main() {
    clear
    echo "=========================================="
    echo "    Mitum Ansible Cleanup Tool"
    echo "=========================================="
    echo
    log_info "This tool will help you remove unnecessary files"
    log_info "Protected files will NOT be removed"
    echo
    
    # Change to root directory
    cd "$ROOT_DIR"
    
    # Find unnecessary files
    find_unnecessary_files
    
    # Check for old logs
    check_old_logs
    
    # Check for old backups
    check_old_backups
    
    # Display summary
    if display_summary; then
        # No files to remove
        exit 0
    fi
    
    # Confirm cleanup
    echo
    read -rp "Proceed with cleanup? [y/N]: " response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        # Create report before cleanup
        create_cleanup_report
        
        # Perform cleanup
        perform_cleanup
        
        # Additional cleanup tasks
        echo
        log_info "Running additional cleanup tasks..."
        
        # Clear Ansible cache
        if [[ -d ".ansible_cache" ]]; then
            rm -rf .ansible_cache/*
            log_info "Cleared Ansible cache"
        fi
        
        # Clear Python cache
        find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
        
        # Clear SSH multiplexing sockets
        if [[ -d "$HOME/.ansible/cp" ]]; then
            rm -f "$HOME/.ansible/cp/*" 2>/dev/null || true
            log_info "Cleared SSH multiplexing sockets"
        fi
        
        echo
        log_success "All cleanup tasks completed!"
        
        # Suggest next steps
        echo
        echo "Next steps:"
        echo "1. Run 'git status' to see changes"
        echo "2. Commit the cleanup: git commit -am 'Clean up unnecessary files'"
        echo "3. Continue with your deployment"
    else
        log_info "Cleanup cancelled"
    fi
}

# Execute main function
main "$@"
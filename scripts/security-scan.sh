#!/bin/bash
# Security Scan Script
# Version: 1.0.0
#
# This script performs comprehensive security scans on the Mitum Ansible project

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

# Variables
SCAN_RESULTS_DIR="$ROOT_DIR/security-scan-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$SCAN_RESULTS_DIR/security-report-$TIMESTAMP.json"
ISSUES_FOUND=0

# Security checks to perform
declare -A SECURITY_CHECKS=(
    ["vault_encryption"]="Check for unencrypted vault files"
    ["ssh_permissions"]="Check SSH key permissions"
    ["hardcoded_secrets"]="Scan for hardcoded secrets"
    ["dependency_vulnerabilities"]="Check for vulnerable dependencies"
    ["ansible_security"]="Ansible security best practices"
    ["file_permissions"]="Check file permissions"
    ["exposed_ports"]="Check for exposed ports in configurations"
    ["ssl_tls"]="Check SSL/TLS configurations"
)

# Initialize scan
initialize_scan() {
    log_info "Initializing security scan..."
    ensure_directory "$SCAN_RESULTS_DIR"
    
    # Create report structure
    cat > "$REPORT_FILE" << EOF
{
    "scan_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "scan_version": "1.0.0",
    "project_root": "$ROOT_DIR",
    "issues": []
}
EOF
}

# Add issue to report
add_issue() {
    local severity="$1"
    local category="$2"
    local description="$3"
    local file="${4:-}"
    local line="${5:-}"
    local remediation="${6:-}"
    
    ((ISSUES_FOUND++))
    
    local issue=$(cat << EOF
{
    "severity": "$severity",
    "category": "$category",
    "description": "$description",
    "file": "$file",
    "line": "$line",
    "remediation": "$remediation"
}
EOF
)
    
    # Add to JSON report
    local temp_file=$(mktemp)
    jq ".issues += [$issue]" "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    # Log based on severity
    case "$severity" in
        "CRITICAL"|"HIGH")
            log_error "[$severity] $description"
            ;;
        "MEDIUM")
            log_warn "[$severity] $description"
            ;;
        "LOW"|"INFO")
            log_info "[$severity] $description"
            ;;
    esac
}

# Check vault encryption
check_vault_encryption() {
    log_info "Checking vault file encryption..."
    
    local vault_files=$(find "$ROOT_DIR" -name "vault*.yml" -o -name "*.vault" 2>/dev/null)
    
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            if ! head -1 "$file" | grep -q "ANSIBLE_VAULT"; then
                add_issue "HIGH" "vault_encryption" \
                    "Unencrypted vault file found" \
                    "$file" "" \
                    "Encrypt with: ansible-vault encrypt $file"
            fi
        fi
    done <<< "$vault_files"
}

# Check SSH key permissions
check_ssh_permissions() {
    log_info "Checking SSH key permissions..."
    
    local key_files=$(find "$ROOT_DIR/keys" -type f \( -name "*.pem" -o -name "*.key" -o -name "*_rsa" -o -name "*_ed25519" \) 2>/dev/null)
    
    while IFS= read -r key_file; do
        if [[ -f "$key_file" ]]; then
            local perms=$(stat -c "%a" "$key_file" 2>/dev/null || stat -f "%OLp" "$key_file")
            if [[ "$perms" != "600" ]]; then
                add_issue "HIGH" "ssh_permissions" \
                    "Insecure SSH key permissions: $perms (should be 600)" \
                    "$key_file" "" \
                    "Fix with: chmod 600 $key_file"
            fi
        fi
    done <<< "$key_files"
}

# Scan for hardcoded secrets
check_hardcoded_secrets() {
    log_info "Scanning for hardcoded secrets..."
    
    # Patterns to search for
    local patterns=(
        "password.*=.*['\"].*['\"]"
        "secret.*=.*['\"].*['\"]"
        "token.*=.*['\"].*['\"]"
        "api_key.*=.*['\"].*['\"]"
        "private_key.*=.*['\"].*['\"]"
        "BEGIN.*PRIVATE KEY"
        "mongodb://.*:.*@"
        "postgres://.*:.*@"
        "mysql://.*:.*@"
    )
    
    # Files to exclude
    local exclude_patterns=(
        "*.md"
        "*.txt"
        "*.log"
        ".git/*"
        ".venv/*"
        "node_modules/*"
    )
    
    for pattern in "${patterns[@]}"; do
        local found_files=$(grep -r -i -E "$pattern" "$ROOT_DIR" \
            --exclude-dir=.git \
            --exclude-dir=.venv \
            --exclude-dir=node_modules \
            --exclude="*.md" \
            --exclude="*.log" \
            --exclude="security-report*.json" \
            2>/dev/null || true)
        
        while IFS=: read -r file line content; do
            if [[ -n "$file" ]] && [[ -n "$content" ]]; then
                # Check if it's a template or example
                if [[ "$content" =~ (CHANGE_ME|EXAMPLE|PLACEHOLDER|TODO|FIXME|your-password|your-secret) ]]; then
                    continue
                fi
                
                add_issue "CRITICAL" "hardcoded_secrets" \
                    "Potential hardcoded secret found" \
                    "$file" "$line" \
                    "Move to vault file and use variable reference"
            fi
        done <<< "$found_files"
    done
}

# Check dependency vulnerabilities
check_dependency_vulnerabilities() {
    log_info "Checking for vulnerable dependencies..."
    
    # Check Python dependencies
    if [[ -f "$ROOT_DIR/requirements.txt" ]]; then
        if command -v safety >/dev/null 2>&1; then
            local vulns=$(safety check -r "$ROOT_DIR/requirements.txt" --json 2>/dev/null || echo '[]')
            
            if [[ "$vulns" != "[]" ]]; then
                local count=$(echo "$vulns" | jq '. | length')
                add_issue "HIGH" "dependency_vulnerabilities" \
                    "Found $count vulnerable Python dependencies" \
                    "requirements.txt" "" \
                    "Update dependencies: pip install --upgrade -r requirements.txt"
            fi
        else
            log_warn "safety not installed, skipping Python vulnerability check"
        fi
    fi
    
    # Check Node.js dependencies
    if [[ -f "$ROOT_DIR/tools/mitumjs/package-lock.json" ]]; then
        if command -v npm >/dev/null 2>&1; then
            cd "$ROOT_DIR/tools/mitumjs"
            local audit_result=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
            local vuln_count=$(echo "$audit_result" | jq '.vulnerabilities | to_entries | length')
            
            if [[ "$vuln_count" -gt 0 ]]; then
                add_issue "HIGH" "dependency_vulnerabilities" \
                    "Found $vuln_count vulnerable npm dependencies" \
                    "tools/mitumjs/package-lock.json" "" \
                    "Fix with: cd tools/mitumjs && npm audit fix"
            fi
            cd - >/dev/null
        fi
    fi
}

# Check Ansible security
check_ansible_security() {
    log_info "Checking Ansible security configurations..."
    
    # Check ansible.cfg
    if [[ -f "$ROOT_DIR/ansible.cfg" ]]; then
        # Check host key checking
        if grep -q "host_key_checking.*=.*False" "$ROOT_DIR/ansible.cfg"; then
            add_issue "MEDIUM" "ansible_security" \
                "Host key checking is disabled" \
                "ansible.cfg" "" \
                "Enable with: host_key_checking = True"
        fi
        
        # Check vault password file
        if grep -q "vault_password_file.*=.*" "$ROOT_DIR/ansible.cfg"; then
            local vault_pass_file=$(grep "vault_password_file" "$ROOT_DIR/ansible.cfg" | cut -d= -f2 | tr -d ' ')
            if [[ -f "$vault_pass_file" ]]; then
                add_issue "HIGH" "ansible_security" \
                    "Vault password file referenced in ansible.cfg" \
                    "ansible.cfg" "" \
                    "Use environment variable instead: export ANSIBLE_VAULT_PASSWORD_FILE"
            fi
        fi
    fi
    
    # Check playbooks for security issues
    local playbooks=$(find "$ROOT_DIR/playbooks" -name "*.yml" -o -name "*.yaml" 2>/dev/null)
    
    while IFS= read -r playbook; do
        if [[ -f "$playbook" ]]; then
            # Check for command/shell without proper quoting
            if grep -q -E "(command|shell):\s*[^|>]" "$playbook"; then
                local line=$(grep -n -E "(command|shell):\s*[^|>]" "$playbook" | head -1 | cut -d: -f1)
                add_issue "MEDIUM" "ansible_security" \
                    "Potential command injection vulnerability" \
                    "$playbook" "$line" \
                    "Use proper quoting or switch to specific modules"
            fi
            
            # Check for become without password
            if grep -q "become:.*true" "$playbook" && ! grep -q "become_ask_pass" "$playbook"; then
                add_issue "LOW" "ansible_security" \
                    "Using become without password prompt" \
                    "$playbook" "" \
                    "Consider using become_ask_pass for interactive sessions"
            fi
        fi
    done <<< "$playbooks"
}

# Check file permissions
check_file_permissions() {
    log_info "Checking file permissions..."
    
    # Check for world-readable sensitive files
    local sensitive_patterns=(
        "*.key"
        "*.pem"
        "*.vault"
        "vault*.yml"
        ".env"
        "*.secret"
    )
    
    for pattern in "${sensitive_patterns[@]}"; do
        local files=$(find "$ROOT_DIR" -name "$pattern" -type f 2>/dev/null)
        
        while IFS= read -r file; do
            if [[ -f "$file" ]]; then
                local perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%OLp" "$file")
                if [[ "${perms: -1}" != "0" ]]; then
                    add_issue "HIGH" "file_permissions" \
                        "Sensitive file is world-readable: $perms" \
                        "$file" "" \
                        "Fix with: chmod 600 $file"
                fi
            fi
        done <<< "$files"
    done
}

# Check exposed ports
check_exposed_ports() {
    log_info "Checking for exposed ports in configurations..."
    
    # Common database and service ports
    local dangerous_binds=(
        "0\\.0\\.0\\.0:27017"  # MongoDB
        "0\\.0\\.0\\.0:3306"   # MySQL
        "0\\.0\\.0\\.0:5432"   # PostgreSQL
        "0\\.0\\.0\\.0:6379"   # Redis
        "0\\.0\\.0\\.0:9200"   # Elasticsearch
    )
    
    for bind in "${dangerous_binds[@]}"; do
        local found=$(grep -r -E "bind.*$bind" "$ROOT_DIR" \
            --include="*.yml" \
            --include="*.yaml" \
            --include="*.conf" \
            --exclude-dir=.git \
            2>/dev/null || true)
        
        while IFS=: read -r file line content; do
            if [[ -n "$file" ]]; then
                add_issue "HIGH" "exposed_ports" \
                    "Service bound to all interfaces" \
                    "$file" "$line" \
                    "Bind to localhost or specific interface instead"
            fi
        done <<< "$found"
    done
}

# Check SSL/TLS configurations
check_ssl_tls() {
    log_info "Checking SSL/TLS configurations..."
    
    # Check for weak SSL/TLS settings
    local weak_patterns=(
        "ssl_protocols.*SSLv2"
        "ssl_protocols.*SSLv3"
        "ssl_protocols.*TLSv1[^.]"
        "ssl_ciphers.*:RC4"
        "ssl_ciphers.*:DES"
        "ssl_ciphers.*:MD5"
    )
    
    for pattern in "${weak_patterns[@]}"; do
        local found=$(grep -r -i -E "$pattern" "$ROOT_DIR" \
            --include="*.yml" \
            --include="*.yaml" \
            --include="*.conf" \
            --exclude-dir=.git \
            2>/dev/null || true)
        
        while IFS=: read -r file line content; do
            if [[ -n "$file" ]]; then
                add_issue "MEDIUM" "ssl_tls" \
                    "Weak SSL/TLS configuration detected" \
                    "$file" "$line" \
                    "Use TLS 1.2+ and strong ciphers only"
            fi
        done <<< "$found"
    done
}

# Generate summary
generate_summary() {
    log_info "Generating security scan summary..."
    
    # Count issues by severity
    local critical=$(jq '[.issues[] | select(.severity == "CRITICAL")] | length' "$REPORT_FILE")
    local high=$(jq '[.issues[] | select(.severity == "HIGH")] | length' "$REPORT_FILE")
    local medium=$(jq '[.issues[] | select(.severity == "MEDIUM")] | length' "$REPORT_FILE")
    local low=$(jq '[.issues[] | select(.severity == "LOW")] | length' "$REPORT_FILE")
    local info=$(jq '[.issues[] | select(.severity == "INFO")] | length' "$REPORT_FILE")
    
    # Add summary to report
    local temp_file=$(mktemp)
    jq ".summary = {
        \"total_issues\": $ISSUES_FOUND,
        \"critical\": $critical,
        \"high\": $high,
        \"medium\": $medium,
        \"low\": $low,
        \"info\": $info,
        \"scan_duration_seconds\": $SECONDS
    }" "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    # Display summary
    echo
    echo "=========================================="
    echo "       Security Scan Summary"
    echo "=========================================="
    echo
    echo "Total Issues Found: $ISSUES_FOUND"
    echo
    echo "By Severity:"
    echo "  CRITICAL: $critical"
    echo "  HIGH:     $high"
    echo "  MEDIUM:   $medium"
    echo "  LOW:      $low"
    echo "  INFO:     $info"
    echo
    echo "Report saved to: $REPORT_FILE"
    echo "=========================================="
    
    # Exit with error if critical or high issues found
    if [[ $critical -gt 0 ]] || [[ $high -gt 0 ]]; then
        log_error "Security scan failed with critical/high severity issues"
        return 1
    elif [[ $medium -gt 0 ]]; then
        log_warn "Security scan completed with medium severity issues"
        return 0
    else
        log_success "Security scan completed with no major issues"
        return 0
    fi
}

# Main function
main() {
    log_info "Starting security scan..."
    
    # Initialize
    initialize_scan
    
    # Run all security checks
    for check_name in "${!SECURITY_CHECKS[@]}"; do
        log_info "Running: ${SECURITY_CHECKS[$check_name]}"
        case "$check_name" in
            vault_encryption)
                check_vault_encryption
                ;;
            ssh_permissions)
                check_ssh_permissions
                ;;
            hardcoded_secrets)
                check_hardcoded_secrets
                ;;
            dependency_vulnerabilities)
                check_dependency_vulnerabilities
                ;;
            ansible_security)
                check_ansible_security
                ;;
            file_permissions)
                check_file_permissions
                ;;
            exposed_ports)
                check_exposed_ports
                ;;
            ssl_tls)
                check_ssl_tls
                ;;
        esac
    done
    
    # Generate summary
    generate_summary
}

# Execute main function
main "$@"
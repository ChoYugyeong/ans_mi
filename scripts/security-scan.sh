#!/bin/bash
# Security Scan Script for Mitum Ansible
# Version: 2.0.0 - Complete implementation

set -euo pipefail

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR="$(dirname "$SCRIPT_DIR")"
readonly REPORT_DIR="$ROOT_DIR/security-scan-results"
readonly REPORT_FILE="$REPORT_DIR/security-report-$(date +%Y%m%d-%H%M%S).json"
readonly LOG_FILE="$REPORT_DIR/scan.log"

# Create report directory
mkdir -p "$REPORT_DIR"

# Initialize report
declare -A ISSUES=()
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

# Logging functions
log_info() { echo -e "${GREEN}[INFO]${NC} $*" | tee -a "$LOG_FILE"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"; }

# Add issue to report
add_issue() {
    local severity="$1"
    local category="$2"
    local description="$3"
    local file="$4"
    local line="${5:-}"
    local recommendation="${6:-}"
    
    case "$severity" in
        CRITICAL) ((CRITICAL_COUNT++)) ;;
        HIGH) ((HIGH_COUNT++)) ;;
        MEDIUM) ((MEDIUM_COUNT++)) ;;
        LOW) ((LOW_COUNT++)) ;;
    esac
    
    local issue_id="${category}_${file//\//_}_${line}"
    ISSUES["$issue_id"]=$(cat <<EOF
{
    "severity": "$severity",
    "category": "$category",
    "description": "$description",
    "file": "$file",
    "line": "$line",
    "recommendation": "$recommendation"
}
EOF
)
}

# Banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
    __  ____  __                   _____                      _ __       
   /  |/  (_)/ /___  ______ ___   / ___/___  _______  _______(_) /___  __
  / /|_/ / / __/ / / / __ `__ \  \__ \/ _ \/ ___/ / / / ___/ / __/ / / /
 / /  / / / /_/ /_/ / / / / / / ___/ /  __/ /__/ /_/ / /  / / /_/ /_/ / 
/_/  /_/_/\__/\__,_/_/ /_/ /_/ /____/\___/\___/\__,_/_/  /_/\__/\__, /  
                                                                /____/   
EOF
    echo -e "${NC}"
    echo -e "${CYAN}Security Scan v2.0.0${NC}"
    echo -e "${CYAN}===================${NC}"
}

# Check for hardcoded secrets
check_hardcoded_secrets() {
    log_info "Checking for hardcoded secrets..."
    
    local patterns=(
        "password.*=.*['\"].*['\"]"
        "passwd.*=.*['\"].*['\"]"
        "pwd.*=.*['\"].*['\"]"
        "secret.*=.*['\"].*['\"]"
        "token.*=.*['\"].*['\"]"
        "api_key.*=.*['\"].*['\"]"
        "apikey.*=.*['\"].*['\"]"
        "private_key.*=.*['\"].*['\"]"
        "privatekey.*=.*['\"].*['\"]"
        "BEGIN.*PRIVATE KEY"
        "mongodb://.*:.*@"
        "postgres://.*:.*@"
        "mysql://.*:.*@"
        "redis://.*:.*@"
        "amqp://.*:.*@"
    )
    
    # Files to exclude
    local exclude_patterns=(
        "*.md"
        "*.txt"
        "*.log"
        ".git/*"
        ".venv/*"
        "node_modules/*"
        "*.example"
        "*.sample"
        "*.template"
    )
    
    for pattern in "${patterns[@]}"; do
        while IFS=: read -r file line content; do
            if [[ -n "$file" ]] && [[ -n "$content" ]]; then
                # Check if it's a template or example
                if [[ "$content" =~ (CHANGE_ME|EXAMPLE|PLACEHOLDER|TODO|FIXME|your-password|your-secret|dummy|fake) ]]; then
                    continue
                fi
                
                # Check if it's a variable reference
                if [[ "$content" =~ \{\{.*\}\} ]] || [[ "$content" =~ \$\{.*\} ]]; then
                    continue
                fi
                
                add_issue "CRITICAL" "hardcoded_secrets" \
                    "Potential hardcoded secret found" \
                    "$file" "$line" \
                    "Move to vault file and use variable reference"
            fi
        done < <(grep -r -i -E "$pattern" "$ROOT_DIR" \
            --exclude-dir=.git \
            --exclude-dir=.venv \
            --exclude-dir=node_modules \
            --exclude-dir=.ansible_cache \
            --exclude-dir=security-scan-results \
            --exclude="*.md" \
            --exclude="*.log" \
            --exclude="security-report*.json" \
            2>/dev/null | head -20 || true)
    done
}

# Check file permissions
check_file_permissions() {
    log_info "Checking file permissions..."
    
    # Check for world-readable private keys
    while IFS= read -r file; do
        local perms=$(stat -c %a "$file" 2>/dev/null || stat -f %p "$file" 2>/dev/null | tail -c 4)
        if [[ "${perms: -1}" != "0" ]]; then
            add_issue "HIGH" "file_permissions" \
                "Private key file is world-readable" \
                "$file" "" \
                "Set permissions to 600: chmod 600 $file"
        fi
    done < <(find "$ROOT_DIR" -type f \( -name "*.key" -o -name "*.pem" \) 2>/dev/null || true)
    
    # Check vault files
    while IFS= read -r file; do
        local perms=$(stat -c %a "$file" 2>/dev/null || stat -f %p "$file" 2>/dev/null | tail -c 4)
        if [[ "${perms: -2}" != "00" ]]; then
            add_issue "HIGH" "file_permissions" \
                "Vault file has excessive permissions" \
                "$file" "" \
                "Set permissions to 600: chmod 600 $file"
        fi
    done < <(find "$ROOT_DIR" -type f -name "*vault*.yml" 2>/dev/null || true)
}

# Check Ansible configuration
check_ansible_config() {
    log_info "Checking Ansible configuration..."
    
    if [[ -f "$ROOT_DIR/ansible.cfg" ]]; then
        # Check host key checking
        if grep -q "host_key_checking.*=.*[Ff]alse" "$ROOT_DIR/ansible.cfg"; then
            add_issue "MEDIUM" "ansible_config" \
                "Host key checking is disabled" \
                "ansible.cfg" "" \
                "Enable host key checking for production use"
        fi
        
        # Check logging
        if ! grep -q "log_path" "$ROOT_DIR/ansible.cfg"; then
            add_issue "LOW" "ansible_config" \
                "Ansible logging is not configured" \
                "ansible.cfg" "" \
                "Add log_path configuration for audit trail"
        fi
    fi
}

# Check for unsafe Jinja2 templates
check_unsafe_templates() {
    log_info "Checking for unsafe Jinja2 templates..."
    
    # Check for unsafe variable usage
    while IFS=: read -r file line content; do
        add_issue "HIGH" "unsafe_template" \
            "Unsafe use of 'safe' filter in template" \
            "$file" "$line" \
            "Review if 'safe' filter is necessary; it disables escaping"
    done < <(grep -r "| *safe" "$ROOT_DIR" --include="*.j2" --include="*.jinja2" 2>/dev/null || true)
    
    # Check for shell command injection
    while IFS=: read -r file line content; do
        if [[ ! "$content" =~ quote ]]; then
            add_issue "HIGH" "command_injection" \
                "Potential command injection in template" \
                "$file" "$line" \
                "Use | quote filter for shell commands"
        fi
    done < <(grep -r "shell:.*{{" "$ROOT_DIR" --include="*.yml" --include="*.yaml" 2>/dev/null | grep -v "| *quote" || true)
}

# Check for exposed ports
check_exposed_ports() {
    log_info "Checking for exposed ports..."
    
    # Check for 0.0.0.0 bindings
    while IFS=: read -r file line content; do
        if [[ "$content" =~ 0\.0\.0\.0 ]]; then
            add_issue "MEDIUM" "exposed_ports" \
                "Service binding to all interfaces" \
                "$file" "$line" \
                "Bind to specific interfaces in production"
        fi
    done < <(grep -r "0\\.0\\.0\\.0" "$ROOT_DIR" --include="*.yml" --include="*.yaml" --include="*.j2" 2>/dev/null || true)
}

# Check for outdated software versions
check_versions() {
    log_info "Checking software versions..."
    
    # Check MongoDB version
    if grep -r "mongodb.*3\\." "$ROOT_DIR" --include="*.yml" 2>/dev/null | grep -q version; then
        add_issue "MEDIUM" "outdated_software" \
            "MongoDB version 3.x is outdated" \
            "group_vars" "" \
            "Update to MongoDB 5.x or later"
    fi
    
    # Check Ansible version in requirements
    if [[ -f "$ROOT_DIR/requirements.txt" ]]; then
        if grep -q "ansible.*<2\\.9" "$ROOT_DIR/requirements.txt"; then
            add_issue "HIGH" "outdated_software" \
                "Ansible version is outdated" \
                "requirements.txt" "" \
                "Update to Ansible 2.9 or later"
        fi
    fi
}

# Check for security headers
check_security_headers() {
    log_info "Checking security headers configuration..."
    
    # Check nginx configurations
    while IFS= read -r file; do
        local has_security_headers=false
        
        if grep -q "X-Frame-Options" "$file"; then
            has_security_headers=true
        fi
        
        if ! $has_security_headers; then
            add_issue "MEDIUM" "security_headers" \
                "Missing security headers in web server config" \
                "$file" "" \
                "Add X-Frame-Options, X-Content-Type-Options, etc."
        fi
    done < <(find "$ROOT_DIR" -name "*.conf" -o -name "nginx*.j2" 2>/dev/null || true)
}

# Check SSL/TLS configuration
check_ssl_config() {
    log_info "Checking SSL/TLS configuration..."
    
    # Check for weak ciphers
    while IFS=: read -r file line content; do
        if [[ "$content" =~ (SSL.*v2|SSL.*v3|TLS.*v1\.0) ]]; then
            add_issue "HIGH" "weak_crypto" \
                "Weak SSL/TLS protocol version" \
                "$file" "$line" \
                "Use TLS 1.2 or higher"
        fi
    done < <(grep -r -E "(ssl_protocol|SSLProtocol)" "$ROOT_DIR" --include="*.yml" --include="*.conf" --include="*.j2" 2>/dev/null || true)
}

# Check for default credentials
check_default_credentials() {
    log_info "Checking for default credentials..."
    
    local default_patterns=(
        "admin:admin"
        "root:root"
        "test:test"
        "user:password"
        "admin:password"
        "root:toor"
        "admin:123456"
    )
    
    for pattern in "${default_patterns[@]}"; do
        if grep -r "$pattern" "$ROOT_DIR" --include="*.yml" --include="*.yaml" 2>/dev/null | grep -q .; then
            add_issue "CRITICAL" "default_credentials" \
                "Default credentials found" \
                "multiple files" "" \
                "Change all default credentials immediately"
            break
        fi
    done
}

# Check Python dependencies for vulnerabilities
check_python_dependencies() {
    log_info "Checking Python dependencies..."
    
    if [[ -f "$ROOT_DIR/requirements.txt" ]]; then
        # Check for packages without version pins
        while IFS= read -r line; do
            if [[ "$line" =~ ^[a-zA-Z] ]] && [[ ! "$line" =~ [=\<\>] ]]; then
                add_issue "MEDIUM" "unpinned_dependency" \
                    "Python package without version pin: $line" \
                    "requirements.txt" "" \
                    "Pin all dependencies to specific versions"
            fi
        done < "$ROOT_DIR/requirements.txt"
        
        # Check if safety is available
        if command -v safety >/dev/null 2>&1; then
            log_info "Running safety check on Python dependencies..."
            if ! safety check -r "$ROOT_DIR/requirements.txt" --json > "$REPORT_DIR/safety-check.json" 2>/dev/null; then
                add_issue "HIGH" "vulnerable_dependencies" \
                    "Vulnerable Python packages detected" \
                    "requirements.txt" "" \
                    "Review safety-check.json and update packages"
            fi
        else
            log_warn "Safety not installed. Run: pip install safety"
        fi
    fi
}

# Generate report
generate_report() {
    log_info "Generating security report..."
    
    local report_json=$(cat <<EOF
{
    "scan_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "scan_version": "2.0.0",
    "project_root": "$ROOT_DIR",
    "summary": {
        "total_issues": $((CRITICAL_COUNT + HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT)),
        "critical": $CRITICAL_COUNT,
        "high": $HIGH_COUNT,
        "medium": $MEDIUM_COUNT,
        "low": $LOW_COUNT
    },
    "issues": [
EOF
)
    
    local first=true
    for issue_id in "${!ISSUES[@]}"; do
        if [[ "$first" == true ]]; then
            first=false
        else
            report_json+=","
        fi
        report_json+=\n        '
        report_json+="${ISSUES[$issue_id]}"
    done
    
    report_json+=\n    ]\n}'
    
    echo "$report_json" > "$REPORT_FILE"
    
    # Generate HTML report
    generate_html_report
}

# Generate HTML report
generate_html_report() {
    local html_file="${REPORT_FILE%.json}.html"
    
    cat > "$html_file" <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Mitum Security Scan Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 20px; border-radius: 8px; min-width: 120px; }
        .critical { background-color: #f8d7da; color: #721c24; }
        .high { background-color: #fff3cd; color: #856404; }
        .medium { background-color: #cce5ff; color: #004085; }
        .low { background-color: #d4edda; color: #155724; }
        .issue { margin: 15px 0; padding: 15px; border-left: 4px solid; border-radius: 4px; background-color: #f8f9fa; }
        .issue.critical { border-color: #dc3545; }
        .issue.high { border-color: #ffc107; }
        .issue.medium { border-color: #17a2b8; }
        .issue.low { border-color: #28a745; }
        .issue-header { font-weight: bold; margin-bottom: 5px; }
        .issue-file { color: #666; font-size: 0.9em; }
        .issue-recommendation { margin-top: 10px; padding: 10px; background-color: #e9ecef; border-radius: 4px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Mitum Security Scan Report</h1>
        <p>Scan Date: <span id="scan-date"></span></p>
        
        <h2>Summary</h2>
        <div class="summary">
            <div class="summary-item critical">
                <h3>Critical</h3>
                <div class="count" id="critical-count">0</div>
            </div>
            <div class="summary-item high">
                <h3>High</h3>
                <div class="count" id="high-count">0</div>
            </div>
            <div class="summary-item medium">
                <h3>Medium</h3>
                <div class="count" id="medium-count">0</div>
            </div>
            <div class="summary-item low">
                <h3>Low</h3>
                <div class="count" id="low-count">0</div>
            </div>
        </div>
        
        <h2>Issues</h2>
        <div id="issues-container"></div>
        
        <div class="footer">
            Generated by Mitum Security Scanner v2.0.0
        </div>
    </div>
    
    <script>
        // Load report data
        const reportData = 
EOF
    
    cat "$REPORT_FILE" >> "$html_file"
    
    cat >> "$html_file" <<'EOF'
        ;
        
        // Populate summary
        document.getElementById('scan-date').textContent = new Date(reportData.scan_date).toLocaleString();
        document.getElementById('critical-count').textContent = reportData.summary.critical;
        document.getElementById('high-count').textContent = reportData.summary.high;
        document.getElementById('medium-count').textContent = reportData.summary.medium;
        document.getElementById('low-count').textContent = reportData.summary.low;
        
        // Populate issues
        const container = document.getElementById('issues-container');
        reportData.issues.forEach(issue => {
            const div = document.createElement('div');
            div.className = `issue ${issue.severity.toLowerCase()}`;
            div.innerHTML = `
                <div class="issue-header">[${issue.severity}] ${issue.description}</div>
                <div class="issue-file">File: ${issue.file}${issue.line ? ` (Line ${issue.line})` : ''}</div>
                <div class="issue-recommendation">
                    <strong>Recommendation:</strong> ${issue.recommendation}
                </div>
            `;
            container.appendChild(div);
        });
    </script>
</body>
</html>
EOF
    
    log_info "HTML report generated: $html_file"
}

# Main execution
main() {
    show_banner
    
    log_info "Starting security scan of $ROOT_DIR"
    log_info "Report will be saved to: $REPORT_FILE"
    
    # Run all checks
    check_hardcoded_secrets
    check_file_permissions
    check_ansible_config
    check_unsafe_templates
    check_exposed_ports
    check_versions
    check_security_headers
    check_ssl_config
    check_default_credentials
    check_python_dependencies
    
    # Generate report
    generate_report
    
    # Display summary
    echo ""
    log_info "Security Scan Complete!"
    echo -e "${YELLOW}Summary:${NC}"
    echo -e "  Critical Issues: ${RED}$CRITICAL_COUNT${NC}"
    echo -e "  High Issues: ${YELLOW}$HIGH_COUNT${NC}"
    echo -e "  Medium Issues: ${BLUE}$MEDIUM_COUNT${NC}"
    echo -e "  Low Issues: ${GREEN}$LOW_COUNT${NC}"
    echo -e ""
    echo -e "Reports saved to:"
    echo -e "  JSON: $REPORT_FILE"
    echo -e "  HTML: ${REPORT_FILE%.json}.html"
    
    # Exit with error if critical issues found
    if [[ $CRITICAL_COUNT -gt 0 ]]; then
        log_error "Critical security issues found! Please address them immediately."
        exit 1
    elif [[ $HIGH_COUNT -gt 0 ]]; then
        log_warn "High severity issues found. Please review and fix them."
        exit 0
    else
        log_success "No critical or high severity issues found."
        exit 0
    fi
}

# Run main function
main "$@"
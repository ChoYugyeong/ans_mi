#!/bin/bash
# Common Functions Library
# Version: 1.0.0
#
# This library provides common functions used across all scripts
# to eliminate code duplication and ensure consistency

# Strict error handling
set -euo pipefail

# === Color Definitions ===
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_PURPLE='\033[0;35m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_WHITE='\033[1;37m'
readonly COLOR_NC='\033[0m' # No Color

# === OS Detection ===
detect_os() {
    local os=""
    local version=""
    local arch=""
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        os="linux"
        if [[ -f /etc/os-release ]]; then
            . /etc/os-release
            version="$VERSION_ID"
        fi
        arch=$(uname -m)
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        os="macos"
        version=$(sw_vers -productVersion)
        arch=$(uname -m)
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        os="windows"
        version="unknown"
        arch=$(uname -m)
    else
        os="unknown"
        version="unknown"
        arch=$(uname -m)
    fi
    
    echo "${os}:${version}:${arch}"
}

# === Logging Functions ===
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)
            echo -e "${COLOR_GREEN}[INFO]${COLOR_NC} ${timestamp} - $message"
            ;;
        WARN)
            echo -e "${COLOR_YELLOW}[WARN]${COLOR_NC} ${timestamp} - $message"
            ;;
        ERROR)
            echo -e "${COLOR_RED}[ERROR]${COLOR_NC} ${timestamp} - $message" >&2
            ;;
        DEBUG)
            if [[ "${DEBUG:-false}" == "true" ]]; then
                echo -e "${COLOR_BLUE}[DEBUG]${COLOR_NC} ${timestamp} - $message"
            fi
            ;;
        SUCCESS)
            echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_NC} ${timestamp} - $message"
            ;;
        *)
            echo -e "${timestamp} - $message"
            ;;
    esac
    
    # Also log to file if LOG_FILE is set
    if [[ -n "${LOG_FILE:-}" ]]; then
        echo "${timestamp} [$level] $message" >> "$LOG_FILE"
    fi
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { log "DEBUG" "$@"; }
log_success() { log "SUCCESS" "$@"; }

# === Error Handling ===
error_exit() {
    local message="$1"
    local exit_code="${2:-1}"
    log_error "$message"
    exit "$exit_code"
}

# Trap function for cleanup on exit
cleanup_on_exit() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Script failed with exit code: $exit_code"
    fi
    
    # Cleanup temporary files
    if [[ -n "${TEMP_DIR:-}" ]] && [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
    fi
    
    # Additional cleanup can be added here
}

# Set trap
trap cleanup_on_exit EXIT

# === File and Directory Functions ===
ensure_directory() {
    local dir="$1"
    local perms="${2:-755}"
    
    if [[ ! -d "$dir" ]]; then
        log_debug "Creating directory: $dir"
        mkdir -p "$dir"
        chmod "$perms" "$dir"
    fi
}

ensure_file() {
    local file="$1"
    local perms="${2:-644}"
    
    if [[ ! -f "$file" ]]; then
        log_debug "Creating file: $file"
        touch "$file"
        chmod "$perms" "$file"
    fi
}

backup_file() {
    local file="$1"
    local backup_dir="${2:-./backups}"
    
    if [[ -f "$file" ]]; then
        ensure_directory "$backup_dir"
        local backup_file="${backup_dir}/$(basename "$file").$(date +%Y%m%d_%H%M%S).bak"
        cp -p "$file" "$backup_file"
        log_info "Backed up $file to $backup_file"
    fi
}

# === SSH Key Management ===
fix_ssh_key_permissions() {
    local key_file="$1"
    
    if [[ -f "$key_file" ]]; then
        chmod 600 "$key_file"
        log_debug "Fixed permissions for SSH key: $key_file"
    else
        log_warn "SSH key not found: $key_file"
    fi
}

fix_all_ssh_keys() {
    local keys_dir="${1:-./keys}"
    
    if [[ -d "$keys_dir" ]]; then
        find "$keys_dir" -type f \( -name "*.pem" -o -name "*.key" -o -name "*_rsa" -o -name "*_ed25519" \) -exec chmod 600 {} \;
        log_info "Fixed permissions for all SSH keys in: $keys_dir"
    fi
}

# === Validation Functions ===
validate_ip() {
    local ip="$1"
    local regex='^([0-9]{1,3}\.){3}[0-9]{1,3}$'
    
    if [[ $ip =~ $regex ]]; then
        # Check each octet
        IFS='.' read -ra OCTETS <<< "$ip"
        for octet in "${OCTETS[@]}"; do
            if (( octet > 255 )); then
                return 1
            fi
        done
        return 0
    fi
    return 1
}

validate_port() {
    local port="$1"
    if [[ "$port" =~ ^[0-9]+$ ]] && (( port >= 1 && port <= 65535 )); then
        return 0
    fi
    return 1
}

validate_hostname() {
    local hostname="$1"
    local regex='^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$'
    
    if [[ $hostname =~ $regex ]]; then
        return 0
    fi
    return 1
}

# === Network Functions ===
check_connectivity() {
    local host="$1"
    local port="${2:-22}"
    local timeout="${3:-5}"
    
    if command -v nc >/dev/null 2>&1; then
        nc -z -w "$timeout" "$host" "$port" >/dev/null 2>&1
        return $?
    elif command -v timeout >/dev/null 2>&1; then
        timeout "$timeout" bash -c "echo >/dev/tcp/$host/$port" >/dev/null 2>&1
        return $?
    else
        # Fallback to ping
        ping -c 1 -W "$timeout" "$host" >/dev/null 2>&1
        return $?
    fi
}

wait_for_port() {
    local host="$1"
    local port="$2"
    local timeout="${3:-60}"
    local interval="${4:-2}"
    
    log_info "Waiting for $host:$port to be ready (timeout: ${timeout}s)..."
    
    local elapsed=0
    while (( elapsed < timeout )); do
        if check_connectivity "$host" "$port" 1; then
            log_success "$host:$port is ready"
            return 0
        fi
        sleep "$interval"
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo
    
    log_error "$host:$port is not ready after ${timeout}s"
    return 1
}

# === Tool Check Functions ===
check_required_tools() {
    local tools=("$@")
    local missing_tools=()
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        return 1
    fi
    
    return 0
}

# === Process Management ===
is_process_running() {
    local process_name="$1"
    pgrep -f "$process_name" >/dev/null 2>&1
}

wait_for_process_stop() {
    local process_name="$1"
    local timeout="${2:-30}"
    local interval="${3:-1}"
    
    log_info "Waiting for process '$process_name' to stop..."
    
    local elapsed=0
    while (( elapsed < timeout )); do
        if ! is_process_running "$process_name"; then
            log_success "Process '$process_name' has stopped"
            return 0
        fi
        sleep "$interval"
        elapsed=$((elapsed + interval))
    done
    
    log_error "Process '$process_name' did not stop after ${timeout}s"
    return 1
}

# === Configuration Functions ===
load_config() {
    local config_file="$1"
    
    if [[ -f "$config_file" ]]; then
        # shellcheck source=/dev/null
        source "$config_file"
        log_debug "Loaded configuration from: $config_file"
    else
        log_warn "Configuration file not found: $config_file"
        return 1
    fi
}

get_config_value() {
    local key="$1"
    local default="${2:-}"
    local config_file="${3:-}"
    
    if [[ -n "$config_file" ]] && [[ -f "$config_file" ]]; then
        local value=$(grep "^${key}=" "$config_file" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        echo "${value:-$default}"
    else
        echo "$default"
    fi
}

# === Security Functions ===
generate_secure_password() {
    local length="${1:-32}"
    local use_special="${2:-true}"
    
    if [[ "$use_special" == "true" ]]; then
        openssl rand -base64 48 | tr -d '\n' | cut -c1-"$length"
    else
        openssl rand -base64 48 | tr -d '\n' | tr -d '+/=' | cut -c1-"$length"
    fi
}

hash_password() {
    local password="$1"
    local algorithm="${2:-sha256}"
    
    echo -n "$password" | openssl dgst -"$algorithm" -hex | awk '{print $2}'
}

# === Ansible Functions ===
run_ansible_playbook() {
    local playbook="$1"
    shift
    local extra_args=("$@")
    
    log_info "Running Ansible playbook: $playbook"
    
    # Build ansible-playbook command
    local cmd=(ansible-playbook)
    
    # Add vault password file if set
    if [[ -n "${ANSIBLE_VAULT_PASSWORD_FILE:-}" ]]; then
        cmd+=(--vault-password-file "$ANSIBLE_VAULT_PASSWORD_FILE")
    elif [[ -n "${ANSIBLE_VAULT_PASSWORD:-}" ]]; then
        cmd+=(--vault-password-file <(echo "$ANSIBLE_VAULT_PASSWORD"))
    fi
    
    # Add playbook and extra arguments
    cmd+=("$playbook" "${extra_args[@]}")
    
    # Execute
    "${cmd[@]}"
}

# === Interactive Functions ===
prompt_yes_no() {
    local prompt="$1"
    local default="${2:-n}"
    
    local yn_prompt="[y/N]"
    if [[ "$default" == "y" ]]; then
        yn_prompt="[Y/n]"
    fi
    
    while true; do
        read -rp "$prompt $yn_prompt: " yn
        yn=${yn:-$default}
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

prompt_input() {
    local prompt="$1"
    local default="${2:-}"
    local variable_name="$3"
    
    if [[ -n "$default" ]]; then
        read -rp "$prompt [$default]: " input
        input=${input:-$default}
    else
        read -rp "$prompt: " input
    fi
    
    if [[ -n "$variable_name" ]]; then
        eval "$variable_name='$input'"
    else
        echo "$input"
    fi
}

# === Progress Bar ===
show_progress() {
    local current="$1"
    local total="$2"
    local prefix="${3:-Progress}"
    
    local progress=$((current * 100 / total))
    local done=$((progress * 50 / 100))
    local todo=$((50 - done))
    
    # Build progress bar
    local bar="["
    for ((i = 0; i < done; i++)); do bar+="="; done
    for ((i = 0; i < todo; i++)); do bar+=" "; done
    bar+="]"
    
    printf "\r%s: %s %d%%" "$prefix" "$bar" "$progress"
    
    if [[ $current -eq $total ]]; then
        echo
    fi
}

# === Export all functions ===
export -f detect_os log log_info log_warn log_error log_debug log_success
export -f error_exit cleanup_on_exit ensure_directory ensure_file backup_file
export -f fix_ssh_key_permissions fix_all_ssh_keys validate_ip validate_port
export -f validate_hostname check_connectivity wait_for_port check_required_tools
export -f is_process_running wait_for_process_stop load_config get_config_value
export -f generate_secure_password hash_password run_ansible_playbook
export -f prompt_yes_no prompt_input show_progress

# === Script Initialization ===
# This section is now handled by the calling scripts to ensure correct ROOT_DIR detection.
# Create required directories
# SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# ROOT_DIR="$(dirname "$SCRIPT_DIR")"
# LOG_DIR="${ROOT_DIR}/logs"
# TEMP_DIR="${ROOT_DIR}/.tmp"

# ensure_directory "$LOG_DIR"
# ensure_directory "$TEMP_DIR"

# Set default log file
# export LOG_FILE="${LOG_FILE:-${LOG_DIR}/mitum-ansible.log}"

log_debug "Common functions library loaded successfully"
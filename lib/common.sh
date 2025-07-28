#!/bin/bash
# Common Functions Library - Minimal version for bootstrap
set -euo pipefail

# Colors
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_NC='\033[0m'

# Basic logging
log_info() { echo -e "${COLOR_GREEN}[INFO]${COLOR_NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"; }
log_warn() { echo -e "${COLOR_YELLOW}[WARN]${COLOR_NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"; }
log_error() { echo -e "${COLOR_RED}[ERROR]${COLOR_NC} $(date '+%Y-%m-%d %H:%M:%S') - $*" >&2; }
log_success() { echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_NC} $(date '+%Y-%m-%d %H:%M:%S') - $*"; }

# OS Detection
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos:$(sw_vers -productVersion):$(uname -m)"
    else
        echo "linux:unknown:$(uname -m)"
    fi
}

# Directory functions
ensure_directory() {
    local dir="$1"
    [[ -d "$dir" ]] || mkdir -p "$dir"
}

# Export functions
export -f log_info log_warn log_error log_success detect_os ensure_directory

#!/bin/bash
# Simple setup script
set -e

# Source common functions
source "$(dirname "$0")/../lib/common.sh"

log_info "Starting Mitum Ansible setup..."

# Create virtual environment
if [[ ! -d .venv ]]; then
    log_info "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate and install
source .venv/bin/activate
log_info "Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

log_success "Setup complete!"
echo "Activate environment with: source .venv/bin/activate"

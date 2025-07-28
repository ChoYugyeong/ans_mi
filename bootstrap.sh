#!/bin/bash
# Bootstrap script to initialize Mitum Ansible project
# This script sets up the basic structure and files needed

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Mitum Ansible Bootstrap Script${NC}"
echo "=================================="

# 1. Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p lib scripts keys/ssh/{production,staging,development}
mkdir -p inventories/{production,staging,development}/{group_vars,host_vars}
mkdir -p playbooks roles/mitum/{tasks,handlers,templates,files,vars,defaults,meta}
mkdir -p docs logs backups security-scan-results .ansible_cache .tmp

# 2. Create lib/common.sh first
echo -e "${YELLOW}Creating common functions library...${NC}"
cat > lib/common.sh << 'COMMON_EOF'
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
COMMON_EOF

chmod +x lib/common.sh

# 3. Create updated requirements.txt for Python 3.13
echo -e "${YELLOW}Creating requirements.txt...${NC}"
cat > requirements.txt << 'REQ_EOF'
# Mitum Ansible Python Requirements - Updated for Python 3.13
# Version: 3.0.0

# Core Ansible (use latest version compatible with Python 3.13)
ansible>=10.0.0,<11.0.0
ansible-core>=2.17.0,<2.18.0

# Essential Dependencies
jinja2>=3.1.2
PyYAML>=6.0
cryptography>=41.0.0
paramiko>=3.1.0
packaging>=23.0
jmespath>=1.0.1
netaddr>=0.8.0
urllib3>=1.26.15
requests>=2.31.0

# MongoDB
pymongo>=4.3.0
dnspython>=2.3.0

# Security
bcrypt>=4.0.1

# Ansible Tools
ansible-lint>=6.14.0
mitogen>=0.3.3

# Cloud Support
boto3>=1.26.100
docker>=6.1.0

# CLI and Output
rich>=13.3.0
click>=8.1.3
tabulate>=0.9.0

# Performance
psutil>=5.9.5
REQ_EOF

# 4. Create a simple setup script
echo -e "${YELLOW}Creating setup script...${NC}"
cat > scripts/setup.sh << 'SETUP_EOF'
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
SETUP_EOF

chmod +x scripts/setup.sh

# 5. Create ansible.cfg
echo -e "${YELLOW}Creating ansible.cfg...${NC}"
cat > ansible.cfg << 'ANSIBLE_EOF'
[defaults]
inventory = inventories/production/hosts.yml
host_key_checking = True
retry_files_enabled = True
stdout_callback = yaml
callbacks_enabled = timer, profile_tasks

[ssh_connection]
ssh_args = -C -o ControlMaster=auto -o ControlPersist=10m -o ControlPath=~/.ansible/cp/%h-%p-%r
pipelining = True
ANSIBLE_EOF

# 6. Create basic Makefile
echo -e "${YELLOW}Creating Makefile...${NC}"
cat > Makefile << 'MAKEFILE_EOF'
.PHONY: help setup deploy test clean

help:
	@echo "Mitum Ansible Commands"
	@echo "  make setup    - Setup environment"
	@echo "  make deploy   - Deploy Mitum"
	@echo "  make test     - Test connectivity"
	@echo "  make clean    - Clean temporary files"

setup:
	@bash scripts/setup.sh

deploy:
	@echo "Deploy command - configure inventory first"

test:
	@echo "Test command - configure inventory first"

clean:
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@rm -rf .tmp/* .ansible_cache/*
MAKEFILE_EOF

# 7. Create .gitignore
echo -e "${YELLOW}Creating .gitignore...${NC}"
cat > .gitignore << 'GITIGNORE_EOF'
# Python
__pycache__/
*.pyc
.venv/
venv/

# Ansible
*.retry
.ansible_cache/

# Keys
keys/
*.pem
*.key

# Logs
logs/
*.log

# OS
.DS_Store

# IDE
.vscode/
.idea/

# Temp
.tmp/
*.swp
GITIGNORE_EOF

echo -e "${GREEN}Bootstrap complete!${NC}"
echo
echo "Next steps:"
echo "1. Run: make setup"
echo "2. Activate virtual environment: source .venv/bin/activate"
echo "3. Create your inventory files"
echo "4. Deploy with: make deploy"
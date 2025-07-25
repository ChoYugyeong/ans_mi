#!/bin/bash
# setup.sh - Mitum Ansible initial setup script with MitumJS support
# Version: 2.2.0 - macOS support added

set -euo pipefail

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# OS detection - macOS support added
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="darwin"
        VER=$(sw_vers -productVersion)
    elif [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        echo -e "${RED}Unsupported OS.${NC}"
        exit 1
    fi
}

detect_os

echo -e "${GREEN}Starting Mitum Ansible setup with MitumJS${NC}"
echo "OS: $OS $VER"
echo ""

# Install Python and pip
install_python() {
    echo -e "${YELLOW}>>> Installing Python...${NC}"
    
    case "$OS" in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip python3-venv
            ;;
        centos|rhel|fedora)
            sudo yum install -y python3 python3-pip
            ;;
        darwin)
            if ! command -v brew &> /dev/null; then
                echo -e "${RED}Homebrew is required. Install from https://brew.sh${NC}"
                exit 1
            fi
            brew install python3
            ;;
        *)
            echo -e "${RED}Unsupported OS: $OS${NC}"
            exit 1
            ;;
    esac
}

# Install Node.js for MitumJS
install_nodejs() {
    echo -e "${YELLOW}>>> Installing Node.js for MitumJS...${NC}"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | grep -oE '[0-9]+' | head -1)
        if [[ $NODE_VERSION -ge 14 ]]; then
            echo -e "${GREEN}✓ Node.js already installed ($(node --version))${NC}"
            return
        fi
    fi
    
    case "$OS" in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        centos|rhel|fedora)
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        darwin)
            brew install node
            ;;
    esac
    
    echo -e "${GREEN}✓ Node.js installation complete: $(node --version)${NC}"
}

# Install Ansible
install_ansible() {
    echo -e "${YELLOW}>>> Installing Ansible...${NC}"
    
    # Create virtual environment
    if [[ ! -d venv ]]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install Ansible and dependencies
    pip install ansible ansible-lint jmespath netaddr
    
    echo -e "${GREEN}✓ Ansible installation complete${NC}"
    ansible --version
}

# Install additional tools
install_tools() {
    echo -e "${YELLOW}>>> Installing additional tools...${NC}"
    
    case "$OS" in
        ubuntu|debian)
            sudo apt-get install -y jq git curl sshpass make
            ;;
        centos|rhel|fedora)
            sudo yum install -y jq git curl sshpass make
            ;;
        darwin)
            # sshpass is not available on macOS for security reasons
            for tool in jq git curl make; do
                if ! command -v $tool &> /dev/null; then
                    brew install $tool
                fi
            done
            echo -e "${YELLOW}Note: sshpass is not available on macOS. Please use SSH key authentication.${NC}"
            ;;
    esac
}

# Install MitumJS and related tools
install_mitumjs() {
    echo -e "${YELLOW}>>> Installing MitumJS SDK...${NC}"
    
    # Create tools directory
    mkdir -p "${ROOT_DIR}/tools/mitumjs"
    
    # Copy MitumJS files
    if [[ -f "${ROOT_DIR}/roles/mitum/files/package.json" ]]; then
        cp "${ROOT_DIR}/roles/mitum/files/package.json" "${ROOT_DIR}/tools/mitumjs/"
        cp "${ROOT_DIR}/roles/mitum/files/mitum-config.sh" "${ROOT_DIR}/tools/mitumjs/"
        cp "${ROOT_DIR}/roles/mitum/files/mitum-keygen.js" "${ROOT_DIR}/tools/mitumjs/"
        
        # Make scripts executable
        chmod +x "${ROOT_DIR}/tools/mitumjs/mitum-config.sh"
        
        # Install dependencies
        cd "${ROOT_DIR}/tools/mitumjs"
        npm install
        cd "${ROOT_DIR}"
        
        echo -e "${GREEN}✓ MitumJS SDK installed${NC}"
    else
        echo -e "${YELLOW}MitumJS files will be installed during role execution${NC}"
    fi
}

# Install Ansible Galaxy roles
install_galaxy_roles() {
    echo -e "${YELLOW}>>> Installing Ansible Galaxy roles...${NC}"
    
    # Create requirements.yml if not exists
    if [[ ! -f requirements.yml ]]; then
        cat > requirements.yml << 'EOF'
---
collections:
  - name: community.general
  - name: community.crypto
  - name: ansible.posix

roles: []
EOF
    fi
    
    ansible-galaxy install -r requirements.yml
    echo -e "${GREEN}✓ Galaxy roles installed${NC}"
}

# Create directory structure
create_structure() {
    echo -e "${YELLOW}>>> Creating directory structure...${NC}"
    
    # Main directories
    mkdir -p {logs,backups,artifacts,reports}
    mkdir -p inventories/{production,staging,development}/{group_vars,host_vars}
    mkdir -p playbooks
    mkdir -p roles/mitum/{tasks,handlers,templates,files,vars,defaults}
    mkdir -p tools/{mitumjs,scripts}
    
    # Create SSH keys directory structure
    mkdir -p keys/{ssh,mitum}/{production,staging,development}
    chmod 700 keys/ssh
    
    # Create .gitignore for keys directory
    cat > keys/.gitignore << 'EOF'
# Ignore all key files
*.pem
*.key
*.pub
id_*
*_rsa
*_dsa
*_ecdsa
*_ed25519

# But track README files
!README.md
!.gitignore
EOF
    
    # Create README for keys directory
    cat > keys/README.md << 'EOF'
# Keys Directory

This directory stores SSH keys and Mitum blockchain keys.

## Directory Structure

```
keys/
├── ssh/                    # SSH keys for server access
│   ├── production/        # Production environment keys
│   │   ├── bastion.pem   # Bastion host SSH key
│   │   └── nodes.pem     # Node SSH keys
│   ├── staging/          # Staging environment keys
│   └── development/      # Development environment keys
└── mitum/                 # Mitum blockchain keys (auto-generated)
    ├── production/       # Production blockchain keys
    ├── staging/         # Staging blockchain keys
    └── development/     # Development blockchain keys
```

## Adding SSH Keys

1. Copy your PEM files to the appropriate environment folder:
   ```bash
   cp ~/Downloads/my-aws-key.pem keys/ssh/production/bastion.pem
   chmod 600 keys/ssh/production/bastion.pem
   ```

2. The inventory generator will automatically look for keys in:
   - `keys/ssh/{environment}/bastion.pem`
   - `keys/ssh/{environment}/nodes.pem`

## Security Notes

- All key files are ignored by git (see .gitignore)
- Keep permissions at 600 for all key files
- Never commit keys to version control
- Use different keys for each environment
EOF
    
    # Create example inventory
    if [[ ! -f inventories/development/hosts.yml ]]; then
        cat > inventories/development/hosts.yml << 'EOF'
---
all:
  children:
    mitum_nodes:
      hosts:
        node0:
          ansible_host: 127.0.0.1
          ansible_port: 2222
          mitum_node_id: 0
          mitum_node_port: 4320
          mitum_api_enabled: true
          mitum_api_port: 54320
        node1:
          ansible_host: 127.0.0.1
          ansible_port: 2223
          mitum_node_id: 1
          mitum_node_port: 4321
          mitum_api_enabled: false
      vars:
        ansible_user: vagrant
        ansible_ssh_private_key_file: ~/.vagrant.d/insecure_private_key
        mitum_network_id: "mitum-dev"
        mitum_keygen_strategy: "centralized"
        mitum_mongodb_install_method: "docker"
EOF
        echo -e "${GREEN}✓ Development inventory created${NC}"
    fi
    
    # Create group_vars/all.yml
    if [[ ! -f inventories/development/group_vars/all.yml ]]; then
        cat > inventories/development/group_vars/all.yml << 'EOF'
---
# Mitum configuration
mitum_version: "latest"
mitum_model_type: "mitum-currency"
mitum_install_method: "source"

# Key generation
mitum_keygen_strategy: "centralized"
mitum_nodejs_version: "18"
mitum_mitumjs_version: "^2.1.15"

# Paths
mitum_install_dir: "/opt/mitum"
mitum_data_dir: "/opt/mitum/data"
mitum_config_dir: "/opt/mitum/config"
mitum_keys_dir: "/opt/mitum/keys"
mitum_log_dir: "/var/log/mitum"

# MongoDB
mitum_mongodb_version: "7.0"
mitum_mongodb_install_method: "native"
mitum_mongodb_replica_set: "mitum"

# Service
mitum_service_name: "mitum"
mitum_service_user: "mitum"
mitum_service_group: "mitum"

# Monitoring
mitum_monitoring:
  enabled: false
  prometheus_enabled: false
EOF
        echo -e "${GREEN}✓ Default variables created${NC}"
    fi
}

# Setup SSH
setup_ssh() {
    echo -e "${YELLOW}>>> Setting up SSH...${NC}"
    
    # Create SSH config file
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    if [[ ! -f ~/.ssh/config ]]; then
        touch ~/.ssh/config
        chmod 600 ~/.ssh/config
    fi
    
    # Add StrictHostKeyChecking setting (for development)
    if ! grep -q "StrictHostKeyChecking" ~/.ssh/config; then
        cat >> ~/.ssh/config << 'EOF'

# Mitum Ansible Development
Host 127.0.0.1 localhost
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
    fi
}

# Create configuration file
create_config() {
    echo -e "${YELLOW}>>> Creating configuration file...${NC}"
    
    if [[ ! -f .mitum-ansible.conf ]]; then
        cat > .mitum-ansible.conf << 'EOF'
# Mitum Ansible Configuration
# This file is used by mitum.sh script

# Default inventory
DEFAULT_INVENTORY="inventories/production"

# Default Mitum version
DEFAULT_VERSION="latest"

# Key generation settings
KEYGEN_STRATEGY="centralized"
MITUMJS_VERSION="^2.1.15"

# SSH Keys location
SSH_KEYS_DIR="keys/ssh"
MITUM_KEYS_DIR="keys/mitum"

# Ansible options
ANSIBLE_OPTS=""

# Log settings
LOG_LEVEL="info"
LOG_DIR="logs"

# Backup settings
BACKUP_DIR="backups"
BACKUP_RETENTION_DAYS=7

# MongoDB settings
MONGODB_VERSION="7.0"
MONGODB_INSTALL_METHOD="native"

# AWX settings (optional)
#AWX_URL="http://awx.example.com"
#AWX_TOKEN="your-token-here"

# Prometheus settings (optional)
#PROMETHEUS_URL="http://prometheus.example.com:9090"

# MitumJS tool location
MITUMJS_TOOL_DIR="tools/mitumjs"
EOF
        echo -e "${GREEN}✓ Configuration file created${NC}"
    fi
}

# Create ansible.cfg
create_ansible_cfg() {
    echo -e "${YELLOW}>>> Creating ansible.cfg...${NC}"
    
    if [[ ! -f ansible.cfg ]]; then
        cat > ansible.cfg << 'EOF'
[defaults]
inventory = inventories/production/hosts.yml
roles_path = roles
host_key_checking = False
retry_files_enabled = False
gathering = smart
fact_caching = jsonfile
fact_caching_connection = .ansible_cache
fact_caching_timeout = 86400
stdout_callback = yaml
callback_whitelist = profile_tasks, timer
interpreter_python = auto_silent

[inventory]
enable_plugins = host_list, yaml, ini, auto

[ssh_connection]
pipelining = True
control_path = /tmp/ansible-ssh-%%h-%%p-%%r
ssh_args = -o ControlMaster=auto -o ControlPersist=60s

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
EOF
        echo -e "${GREEN}✓ ansible.cfg created${NC}"
    fi
}

# Create example playbooks
create_example_playbooks() {
    echo -e "${YELLOW}>>> Creating example playbooks...${NC}"
    
    # Test playbook
    if [[ ! -f playbooks/test.yml ]]; then
        cat > playbooks/test.yml << 'EOF'
---
- name: Test connectivity and setup
  hosts: mitum_nodes
  gather_facts: yes
  tasks:
    - name: Test connection
      ping:
    
    - name: Show system info
      debug:
        msg: |
          Hostname: {{ ansible_hostname }}
          OS: {{ ansible_distribution }} {{ ansible_distribution_version }}
          CPU: {{ ansible_processor_vcpus }} cores
          Memory: {{ ansible_memtotal_mb }} MB
    
    - name: Check required tools
      command: "{{ item }} --version"
      loop:
        - python3
        - node
        - jq
      register: tool_versions
      changed_when: false
      failed_when: false
    
    - name: Display tool versions
      debug:
        msg: "{{ item.item }}: {{ item.stdout_lines[0] | default('Not installed') }}"
      loop: "{{ tool_versions.results }}"
EOF
    fi
    
    # Site playbook
    if [[ ! -f playbooks/site.yml ]]; then
        cat > playbooks/site.yml << 'EOF'
---
# Main site playbook - includes all components
- import_playbook: deploy-mitum.yml
EOF
    fi
}

# Create helper script for key management - macOS compatible version
create_key_helper() {
    echo -e "${YELLOW}>>> Creating key management helper...${NC}"
    
    mkdir -p scripts
    
    cat > scripts/manage-keys.sh << 'EOF'
#!/bin/bash
# Key management helper script - macOS compatible version

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
KEYS_DIR="$ROOT_DIR/keys"

# OS detection
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MACOS=true
else
    IS_MACOS=false
fi

usage() {
    cat << USAGE
${GREEN}SSH Key Management Helper${NC}

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    add     Add SSH key to project
    list    List all SSH keys
    check   Check key permissions
    fix     Fix key permissions

Examples:
    $0 add production ~/Downloads/my-aws-key.pem
    $0 list
    $0 check
    $0 fix

USAGE
}

add_key() {
    local env=$1
    local source=$2
    local name=${3:-}
    
    if [[ ! -f "$source" ]]; then
        echo -e "${RED}Error: Key file not found: $source${NC}"
        exit 1
    fi
    
    # Determine target name
    if [[ -z "$name" ]]; then
        name=$(basename "$source")
    fi
    
    # Create directory if needed
    mkdir -p "$KEYS_DIR/ssh/$env"
    
    # Copy key
    cp "$source" "$KEYS_DIR/ssh/$env/$name"
    chmod 600 "$KEYS_DIR/ssh/$env/$name"
    
    echo -e "${GREEN}✓ Key added: $KEYS_DIR/ssh/$env/$name${NC}"
}

list_keys() {
    echo -e "${YELLOW}SSH Keys in project:${NC}"
    echo ""
    
    for env in production staging development; do
        echo "[$env]"
        if [[ -d "$KEYS_DIR/ssh/$env" ]]; then
            for key in "$KEYS_DIR/ssh/$env"/*.pem "$KEYS_DIR/ssh/$env"/*.key 2>/dev/null; do
                if [[ -f "$key" ]]; then
                    if [[ "$IS_MACOS" == "true" ]]; then
                        local perms=$(stat -f %Lp "$key")
                    else
                        local perms=$(stat -c %a "$key")
                    fi
                    echo "  $(basename "$key") (permissions: $perms)"
                fi
            done
        else
            echo "  (no keys)"
        fi
        echo ""
    done
}

check_permissions() {
    local errors=0
    
    echo -e "${YELLOW}Checking key permissions...${NC}"
    
    find "$KEYS_DIR/ssh" -type f \( -name "*.pem" -o -name "*.key" \) -print0 | while IFS= read -r -d '' key; do
        if [[ "$IS_MACOS" == "true" ]]; then
            local perms=$(stat -f %Lp "$key")
        else
            local perms=$(stat -c %a "$key")
        fi
        
        if [[ "$perms" != "600" ]]; then
            echo -e "${RED}✗ Wrong permissions ($perms): $key${NC}"
            ((errors++))
        else
            echo -e "${GREEN}✓ OK: $key${NC}"
        fi
    done
    
    if [[ $errors -eq 0 ]]; then
        echo -e "\n${GREEN}All keys have correct permissions!${NC}"
    else
        echo -e "\n${RED}Found $errors keys with wrong permissions${NC}"
        echo "Run '$0 fix' to fix permissions"
    fi
}

fix_permissions() {
    echo -e "${YELLOW}Fixing key permissions...${NC}"
    
    find "$KEYS_DIR/ssh" -type f \( -name "*.pem" -o -name "*.key" \) -exec chmod 600 {} \;
    
    echo -e "${GREEN}✓ All key permissions fixed${NC}"
}

# Main
case "${1:-help}" in
    add)
        if [[ $# -lt 3 ]]; then
            echo -e "${RED}Error: Missing arguments${NC}"
            echo "Usage: $0 add <environment> <source-key-file> [target-name]"
            exit 1
        fi
        add_key "$2" "$3" "${4:-}"
        ;;
    list)
        list_keys
        ;;
    check)
        check_permissions
        ;;
    fix)
        fix_permissions
        ;;
    *)
        usage
        ;;
esac
EOF
    
    chmod +x scripts/manage-keys.sh
    echo -e "${GREEN}✓ Key management helper created${NC}"
}

# Verify installation
verify_installation() {
    echo -e "${YELLOW}>>> Verifying installation...${NC}"
    
    local errors=0
    
    # Check commands
    for cmd in python3 ansible ansible-playbook jq node npm; do
        if command -v "$cmd" &> /dev/null; then
            echo -e "${GREEN}✓${NC} $cmd installed"
        else
            echo -e "${RED}✗${NC} $cmd not installed"
            ((errors++))
        fi
    done
    
    # Check directories
    for dir in logs backups inventories playbooks roles tools keys/ssh keys/mitum; do
        if [[ -d "$dir" ]]; then
            echo -e "${GREEN}✓${NC} $dir directory exists"
        else
            echo -e "${RED}✗${NC} $dir directory missing"
            ((errors++))
        fi
    done
    
    # Check MitumJS
    if [[ -d "tools/mitumjs/node_modules" ]]; then
        echo -e "${GREEN}✓${NC} MitumJS SDK installed"
    else
        echo -e "${YELLOW}!${NC} MitumJS SDK not yet installed (will install during deployment)"
    fi
    
    if [[ $errors -eq 0 ]]; then
        echo -e "\n${GREEN}✓ All setup complete!${NC}"
        echo -e "\nQuick start commands:"
        echo -e "  ${BLUE}source venv/bin/activate${NC}    # Activate Python environment"
        echo -e "  ${BLUE}./scripts/manage-keys.sh${NC}    # Manage SSH keys"
        echo -e "  ${BLUE}make test${NC}                   # Test connectivity"
        echo -e "  ${BLUE}make keygen${NC}                 # Generate keys"
        echo -e "  ${BLUE}make deploy${NC}                 # Deploy nodes"
        echo -e "  ${BLUE}make help${NC}                   # Show all commands"
        echo -e "\n${PURPLE}SSH Key Setup:${NC}"
        echo -e "  1. Copy your SSH keys to: ${YELLOW}keys/ssh/<environment>/${NC}"
        echo -e "  2. Example: ${BLUE}cp ~/my-key.pem keys/ssh/production/bastion.pem${NC}"
        echo -e "  3. Fix permissions: ${BLUE}./scripts/manage-keys.sh fix${NC}"
    else
        echo -e "\n${RED}✗ Some components missing.${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${GREEN}=== Mitum Ansible Setup with MitumJS ===${NC}\n"
    
    # Check and install Python
    if ! command -v python3 &> /dev/null; then
        install_python
    else
        echo -e "${GREEN}✓ Python already installed${NC}"
    fi
    
    # Install Node.js for MitumJS
    install_nodejs
    
    # Install Ansible
    install_ansible
    
    # Install additional tools
    install_tools
    
    # Install MitumJS
    install_mitumjs
    
    # Install Galaxy roles
    install_galaxy_roles
    
    # Create directory structure
    create_structure
    
    # Setup SSH
    setup_ssh
    
    # Create configuration files
    create_config
    create_ansible_cfg
    
    # Create example playbooks
    create_example_playbooks
    
    # Create key management helper
    create_key_helper
    
    # Verify installation
    verify_installation
    
    echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
    echo -e "\n${PURPLE}Next steps:${NC}"
    echo -e "1. Add SSH keys: ${BLUE}./scripts/manage-keys.sh add production ~/your-key.pem${NC}"
    echo -e "2. Edit inventory file: ${BLUE}inventories/production/hosts.yml${NC}"
    echo -e "3. Configure variables: ${BLUE}inventories/production/group_vars/all.yml${NC}"
    echo -e "4. Test connection: ${BLUE}make test${NC}"
    echo -e "5. Generate keys: ${BLUE}make keygen${NC}"
    echo -e "6. Deploy Mitum: ${BLUE}make deploy${NC}"
}

# Execute
main
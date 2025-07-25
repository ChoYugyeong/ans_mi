# 🚀 Mitum Blockchain Ansible Automation System

[![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)](https://github.com/your-repo/mitum-ansible)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Ansible](https://img.shields.io/badge/ansible-2.13+-red.svg)](https://www.ansible.com/)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos-lightgrey.svg)](https://github.com/your-repo/mitum-ansible)

Production-ready Ansible automation framework for deploying and managing Mitum blockchain networks with enterprise-grade features including monitoring, automated backups, rolling upgrades, and multi-environment support.

## 🎯 Get Started in 3 Minutes!

Choose your preferred method:

### 🌟 Method 1: Interactive Setup (Recommended for Beginners)
```bash
git clone https://github.com/your-org/mitum-ansible.git
cd mitum-ansible
make interactive-setup
```

### ⚡ Method 2: Quick Deploy (For Experienced Users)
```bash
git clone https://github.com/your-org/mitum-ansible.git
cd mitum-ansible
make setup
make quick-deploy
```

### 🚀 Method 3: Full Control (Advanced)
```bash
git clone https://github.com/your-org/mitum-ansible.git
cd mitum-ansible
./scripts/start.sh
```

📚 **Documentation:** [Quick Start Guide](QUICK_START.md) | [Troubleshooting](TROUBLESHOOTING.md) | [API Reference](#api-reference)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#-architecture)
- [📋 Requirements](#-requirements)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [🎮 Usage Guide](#-usage-guide)
- [📊 Monitoring & Alerting](#-monitoring--alerting)
- [🛡️ Security](#-security)
- [🔧 Advanced Features](#-advanced-features)
- [📚 API Reference](#-api-reference)
- [🆘 Troubleshooting](#-troubleshooting)
- [🔄 CI/CD Integration](#-cicd-integration)
- [🤝 Contributing](#-contributing)

## ✨ Features

### Core Features
- **Automated Deployment**: One-command deployment of entire Mitum blockchain network
- **Multi-Node Support**: Deploy consensus nodes and API/syncer nodes
- **Key Management**: Centralized key generation using MitumJS
- **MongoDB Integration**: Automated replica set configuration
- **Rolling Upgrades**: Zero-downtime upgrades with automatic rollback
- **Backup & Restore**: Scheduled backups with encryption support

### Security Features
- **Ansible Vault**: Encrypted storage for sensitive data
- **SSH Key Management**: Automated key distribution and validation
- **Host Key Verification**: Secure SSH connections with known_hosts management
- **Firewall Configuration**: Automated security rules
- **MongoDB Authentication**: Secure database with user management

### Operational Features
- **Health Checks**: Automated service monitoring and recovery
- **Cross-Platform**: Support for Ubuntu, CentOS/RHEL, and limited macOS
- **Idempotent**: Safe to run multiple times
- **Dry Run Mode**: Preview changes before applying
- **Comprehensive Logging**: Detailed logs for troubleshooting

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Bastion Host  │────▶│  Consensus Node │────▶│  MongoDB Primary│
│                 │     │     (node0)     │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │              ┌─────────────────┐     ┌─────────────────┐
         ├─────────────▶│  Consensus Node │────▶│ MongoDB Secondary│
         │              │     (node1)     │     │                 │
         │              └─────────────────┘     └─────────────────┘
         │              ┌─────────────────┐     ┌─────────────────┐
         └─────────────▶│   API/Syncer    │────▶│ MongoDB Secondary│
                        │     (node2)     │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## 📋 Requirements

### Control Machine (Your Local Machine)
- **OS**: Linux, macOS, or WSL2 on Windows
- **Python**: 3.8 or higher
- **Ansible**: 6.0 or higher
- **Node.js**: 14.0 or higher (for MitumJS key generation)
- **Git**: 2.0 or higher

### Target Nodes
- **OS**: Ubuntu 18.04+, CentOS/RHEL 7+
- **CPU**: Minimum 2 cores, recommended 4+ cores
- **Memory**: Minimum 4GB, recommended 8GB+
- **Disk**: Minimum 20GB free space
- **Network**: All nodes must be accessible via SSH

### Network Requirements
- **Ports**:
  - SSH: 22 (configurable)
  - Mitum Node: 4320-4330
  - Mitum API: 54320
  - MongoDB: 27017
  - Prometheus: 9090, 9099
  - Grafana: 3000

## 🚀 Quick Start

### Option 1: Interactive Mode (Easiest for Beginners) 🌟

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/mitum-ansible.git
cd mitum-ansible

# 2. Run the easy start script
./start.sh

# That's it! The script will guide you through everything.
```

### Option 2: Using Deploy Script (Flexible)

```bash
# 1. Clone and setup
git clone https://github.com/your-repo/mitum-ansible.git
cd mitum-ansible
make setup

# 2. Add SSH keys
./scripts/add-key.sh production ~/path/to/your-key.pem bastion.pem

# 3. Run interactive deployment
./scripts/deploy-mitum.sh --interactive

# Or quick deployment with defaults
./scripts/deploy-mitum.sh
```

### Option 3: Using Makefile (Advanced)

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/mitum-ansible.git
cd mitum-ansible

# 2. Run initial setup
make setup

# 3. Add SSH keys
make keys-add KEY=~/path/to/your-key.pem NAME=bastion.pem

# 4. Generate inventory
make inventory BASTION_IP=52.74.123.45 NODE_IPS=10.0.1.10,10.0.1.11,10.0.1.12

# 5. Test connectivity
make test

# 6. Deploy Mitum
make deploy
```

## 📦 Installation

### 1. Initial Setup

Run the setup script to install all dependencies:

```bash
make setup
```

This will:
- Create Python virtual environment
- Install Ansible and required Python packages
- Install Node.js dependencies for MitumJS
- Create directory structure
- Generate configuration templates

### 2. SSH Key Configuration

Add your SSH keys for accessing the servers:

```bash
# Add bastion key
./scripts/add-key.sh production ~/Downloads/bastion-key.pem bastion.pem

# Add node key (if different from bastion)
./scripts/add-key.sh production ~/Downloads/node-key.pem nodes.pem
```

### 3. Inventory Generation

Generate an Ansible inventory for your environment:

```bash
# Basic usage
make inventory BASTION_IP=52.74.123.45 NODE_IPS=10.0.1.10,10.0.1.11,10.0.1.12

# With custom network ID and model
make inventory BASTION_IP=52.74.123.45 \
               NODE_SUBNET=10.0.1 \
               NODE_COUNT=5 \
               NETWORK_ID=mainnet \
               MODEL=mitum-currency
```

### 4. Configure Variables

Edit the generated configuration files:

```bash
# Edit global variables
vim inventories/production/group_vars/all.yml

# Create and encrypt vault for sensitive data
cp inventories/production/group_vars/vault.yml.template \
   inventories/production/group_vars/vault.yml
vim inventories/production/group_vars/vault.yml
ansible-vault encrypt inventories/production/group_vars/vault.yml
```

## ⚙️ Configuration

### Directory Structure

```
mitum-ansible/
├── inventories/
│   ├── production/
│   │   ├── hosts.yml              # Inventory file
│   │   ├── group_vars/
│   │   │   ├── all.yml           # Global variables
│   │   │   └── vault.yml         # Encrypted secrets
│   │   └── host_vars/            # Host-specific variables
│   ├── staging/
│   └── development/
├── playbooks/
│   ├── site.yml                  # Main deployment playbook
│   ├── prepare-system.yml        # System preparation
│   ├── deploy-mitum.yml          # Mitum deployment
│   └── rolling-upgrade.yml       # Upgrade playbook
├── roles/
│   └── mitum/
│       ├── tasks/                # Task files
│       ├── templates/            # Jinja2 templates
│       ├── handlers/             # Handler definitions
│       └── defaults/             # Default variables
├── keys/
│   ├── ssh/                      # SSH keys (git-ignored)
│   └── mitum/                    # Generated blockchain keys
└── scripts/
    ├── setup.sh                  # Initial setup script
    └── manage-keys.sh            # Key management helper
```

### Key Configuration Files

#### inventories/production/group_vars/all.yml
```yaml
# Mitum configuration
mitum_version: "latest"
mitum_model_type: "mitum-currency"
mitum_network_id: "mainnet"

# MongoDB configuration
mongodb_version: "7.0"
mongodb_auth_enabled: true
mongodb_replica_set: "mitum-rs"

# Security settings
security_hardening:
  enabled: true
  firewall: true
  fail2ban: true
```

#### inventories/production/group_vars/vault.yml
```yaml
# Encrypt this file with: ansible-vault encrypt vault.yml
vault_mongodb_admin_password: "strong_password_here"
vault_mongodb_mitum_password: "another_strong_password"
vault_grafana_admin_password: "grafana_admin_password"
```

## 📖 Usage

### Basic Operations

```bash
# Full deployment
make deploy

# Deploy specific components
make deploy-mitum     # Mitum nodes only
make mongodb          # MongoDB only
make monitoring       # Monitoring stack only

# Check status
make status

# View logs
make logs
make logs-follow      # Real-time logs

# Backup
make backup

# Restore
make restore BACKUP_TIMESTAMP=20240120-123456
```

### Advanced Operations

```bash
# Dry run (preview changes)
make deploy DRY_RUN=yes

# Skip specific steps
make deploy SKIP_KEYGEN=true SKIP_MONGODB=true

# Use specific inventory
make deploy INVENTORY=inventories/staging/hosts.yml

# Rolling upgrade
make upgrade VERSION=v0.0.2

# Emergency stop
make stop-cluster

# Clean data (DANGEROUS!)
make clean-data
```

### Maintenance Commands

```bash
# Validate configuration
make validate

# Run security checks
./scripts/security-check.sh

# Update dependencies
make update-deps

# Clean temporary files
make clean

# Deep clean (removes venv)
make clean-all
```

## 🔒 Security

### Security Best Practices

1. **SSH Keys**
   - Use dedicated keys for each environment
   - Set proper permissions (600) on all key files
   - Never commit keys to version control

2. **Ansible Vault**
   - Always encrypt sensitive variables
   - Use strong vault passwords
   - Store vault password securely

3. **Network Security**
   - Use bastion hosts for access
   - Configure firewall rules
   - Enable MongoDB authentication
   - Use TLS for API endpoints

4. **Operational Security**
   - Regular security audits
   - Keep dependencies updated
   - Monitor access logs
   - Implement least privilege

### Security Checklist

Run the security check script:

```bash
./scripts/security-check.sh
```

This will verify:
- SSH key permissions
- Vault encryption status
- Firewall configuration
- MongoDB authentication
- SSL/TLS settings

## 📊 Monitoring

### Prometheus & Grafana

The deployment includes optional monitoring with:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Node Exporter**: System metrics
- **Custom Mitum metrics**: Blockchain-specific monitoring

Enable monitoring:

```yaml
# inventories/production/group_vars/all.yml
mitum_monitoring:
  enabled: true
  prometheus:
    enabled: true
    retention: "30d"
```

Access dashboards:
- Prometheus: http://monitoring-server:9090
- Grafana: http://monitoring-server:3000

### Health Checks

Automated health checks run every 5 minutes:
- Node connectivity
- Consensus participation
- Block synchronization
- MongoDB replication status

## 🔧 Troubleshooting

### Common Issues

#### 1. SSH Connection Issues
```bash
# Test SSH connectivity
ssh -F inventories/production/ssh_config bastion
ssh -F inventories/production/ssh_config node0

# Debug Ansible connection
ansible -i inventories/production/hosts.yml all -m ping -vvv
```

#### 2. MongoDB Connection Issues
```bash
# Check MongoDB status
make exec CMD="systemctl status mongod"

# Test MongoDB connection
make exec CMD="mongosh --eval 'db.adminCommand({ping: 1})'"
```

#### 3. Mitum Service Issues
```bash
# Check service status
make status

# View detailed logs
make logs

# Restart specific node
make restart-node NODE=node0
```

#### 4. Key Generation Issues
```bash
# Verify Node.js installation
node --version
npm --version

# Regenerate keys
make keygen FORCE=true
```

### Debug Mode

Enable verbose output:

```bash
# Ansible verbose mode
make deploy VERBOSE=true

# Debug specific task
ansible-playbook -i inventories/production/hosts.yml \
                 playbooks/site.yml \
                 --tags keygen \
                 -vvv
```

### Recovery Procedures

#### Node Recovery
```bash
# Automatic recovery
make recover NODE=node0

# Manual recovery
make stop-node NODE=node0
make clean-node-data NODE=node0
make start-node NODE=node0
```

#### Cluster Recovery
```bash
# From backup
make restore BACKUP_TIMESTAMP=20240120-123456

# Full reset
make clean-cluster
make deploy
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-repo/mitum-ansible.git
cd mitum-ansible

# Create development environment
make dev-env

# Run tests
make test-playbooks

# Lint code
make lint
```

### Pull Request Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mitum Blockchain](https://github.com/ProtoconNet/mitum-currency)
- [Ansible Documentation](https://docs.ansible.com/)
- [MitumJS SDK](https://github.com/ProtoconNet/mitumjs)

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-repo/mitum-ansible/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/mitum-ansible/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/mitum-ansible/discussions)
- **Email**: support@your-domain.com

---

Made with ❤️ by the Mitum Team

## 🎮 Usage Guide

### Available Commands

The project provides multiple ways to deploy and manage Mitum networks:

#### 🚀 Deployment Commands

```bash
# Full deployment (recommended)
make deploy ENV=production

# Quick deployment with defaults
make quick-deploy ENV=development

# Deploy specific components only
make deploy ENV=staging --tags keygen,configure
make deploy ENV=staging --tags mongodb,monitoring

# Dry run (preview changes without applying)
make deploy ENV=production DRY_RUN=yes
```

#### 🔧 Management Commands

```bash
# Check node status
make status ENV=production

# View live dashboard
make dashboard ENV=production

# Real-time monitoring
./scripts/visual-status.sh --monitor

# View logs
make logs ENV=production

# Test connectivity
make test ENV=production
```

#### 💾 Backup & Recovery

```bash
# Create full backup
make backup ENV=production

# Create backup with custom name
make backup ENV=production BACKUP_NAME="pre-upgrade-backup"

# List available backups
make backup-list ENV=production

# Restore from latest backup
make restore ENV=production

# Restore from specific backup
make restore ENV=production BACKUP_TIMESTAMP=20241225-120000
```

#### 🔄 Upgrades & Maintenance

```bash
# Rolling upgrade (zero downtime)
make upgrade ENV=production VERSION=v1.2.3

# System maintenance
make clean ENV=production
make optimize ENV=production

# Security audit
make security-scan
```

### Script-Based Operations

#### Interactive Setup
```bash
# Guided setup for beginners
./scripts/interactive-setup.sh

# Features:
# - Environment selection
# - Node configuration
# - SSH key generation
# - Inventory creation
# - Validation
```

#### Advanced Deployment
```bash
# Full control deployment
./scripts/deploy-mitum.sh --interactive

# Automated deployment
./scripts/deploy-mitum.sh \
  --environment production \
  --network-id mainnet \
  --node-count 5 \
  --model mitum-currency

# With monitoring and backup
./scripts/deploy-mitum.sh \
  --environment production \
  --enable-monitoring \
  --enable-backup \
  --slack-webhook https://hooks.slack.com/...
```

#### Key Management
```bash
# Generate new keys
./scripts/manage-keys.sh --generate --environment production

# Rotate keys
./scripts/manage-keys.sh --rotate --environment production

# Backup keys
./scripts/manage-keys.sh --backup --environment production

# Verify key integrity
./scripts/manage-keys.sh --verify --environment production
```

#### System Management
```bash
# Generate inventory
./scripts/generate-inventory.sh \
  --bastion-ip 52.74.123.45 \
  --node-ips 10.0.1.10,10.0.1.11,10.0.1.12 \
  --environment production \
  --network-id mainnet

# Generate variables
./scripts/generate-group-vars.sh \
  --environment production \
  --model mitum-currency \
  --enable-features api,digest,metrics

# Setup SSH connection pooling
./scripts/ssh-pool.sh --setup --environment production
```

## 📊 Monitoring & Alerting

### Built-in Monitoring Stack

The project includes a comprehensive monitoring solution:

```bash
# Deploy monitoring stack
ansible-playbook -i inventories/production/hosts.yml \
  playbooks/setup-monitoring-alerts.yml

# Access monitoring services
# Prometheus: http://monitoring-host:9090
# Grafana: http://monitoring-host:3000
# AlertManager: http://monitoring-host:9093
```

### Available Dashboards

1. **Mitum Network Overview**
   - Node status and health
   - Block height progress
   - Transaction throughput
   - Network consensus status

2. **System Resources**
   - CPU, Memory, Disk usage
   - Network I/O
   - Process monitoring

3. **Application Metrics**
   - API response times
   - Database performance
   - Error rates and logs

### Alert Configuration

```yaml
# Custom alerts (in group_vars)
monitoring_alerts:
  node_down:
    enabled: true
    threshold: "5m"
    severity: "critical"
  
  block_height_stalled:
    enabled: true
    threshold: "10m"
    severity: "warning"
  
  high_memory_usage:
    enabled: true
    threshold: "85%"
    severity: "warning"
  
  disk_space_low:
    enabled: true
    threshold: "15%"
    severity: "warning"
```

### Notification Channels

```yaml
# Slack integration
slack_webhook_url: "https://hooks.slack.com/services/..."
slack_channel: "#mitum-alerts"

# PagerDuty integration
pagerduty_service_key: "your-service-key"

# Email notifications
smtp_server: "smtp.gmail.com"
smtp_port: 587
alert_email: "ops@yourcompany.com"
```

## 📚 API Reference

### Makefile Targets

| Command | Description | Environment | Options |
|---------|-------------|-------------|---------|
| `make help` | Show all available commands | Any | - |
| `make setup` | Initial environment setup | Any | - |
| `make test` | Test connectivity to nodes | Any | `ENV=<env>` |
| `make deploy` | Full Mitum deployment | Any | `ENV=<env>`, `DRY_RUN=yes` |
| `make status` | Check node status | Any | `ENV=<env>` |
| `make logs` | View logs | Any | `ENV=<env>`, `LINES=100` |
| `make backup` | Create backup | Any | `ENV=<env>`, `BACKUP_NAME=<name>` |
| `make restore` | Restore from backup | Any | `ENV=<env>`, `BACKUP_TIMESTAMP=<time>` |
| `make upgrade` | Rolling upgrade | Any | `ENV=<env>`, `VERSION=<version>` |
| `make clean` | Clean temporary files | Any | - |
| `make optimize` | Optimize project | Any | - |
| `make dashboard` | Open visual dashboard | Any | `ENV=<env>` |
| `make interactive-setup` | Interactive setup wizard | Any | - |

### Environment Variables

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `ENV` | Target environment | `production` | `development`, `staging`, `production` |
| `DRY_RUN` | Preview mode | `no` | `yes`, `no` |
| `SAFE_MODE` | Safety checks | `yes` | `yes`, `no` |
| `PARALLEL_FORKS` | Parallel execution | `50` | `1-100` |
| `USE_VAULT` | Ansible Vault | `yes` | `yes`, `no` |

### Script Parameters

#### deploy-mitum.sh
```bash
./scripts/deploy-mitum.sh [OPTIONS]

Options:
  -e, --environment ENV     Target environment (development|staging|production)
  -n, --network-id ID       Network identifier (default: testnet)
  -c, --node-count NUM      Number of nodes to deploy (default: 3)
  -m, --model TYPE         Mitum model type (mitum-currency|mitum-document)
  -i, --interactive        Interactive mode
  -d, --dry-run           Preview mode only
  -v, --verbose           Verbose output
  -h, --help              Show help message
```

#### interactive-setup.sh
```bash
./scripts/interactive-setup.sh [OPTIONS]

Options:
  --skip-validation       Skip requirement validation
  --auto-keys            Auto-generate SSH keys
  --default-config       Use default configurations
  --quiet                Minimal output
```

#### visual-status.sh
```bash
./scripts/visual-status.sh [OPTIONS]

Options:
  -m, --monitor          Real-time monitoring mode
  -e, --environment ENV   Target environment
  -r, --refresh SECONDS  Refresh interval (default: 5)
  -o, --output FORMAT    Output format (table|json|yaml)
```

### Configuration Variables

#### Core Variables (group_vars/all.yml)
```yaml
# Environment configuration
mitum_environment: "production"
mitum_network_id: "mainnet"
mitum_model_type: "mitum-currency"
mitum_version: "latest"

# Network settings
mitum_api_port: 54320
mitum_node_port: 4320
mitum_metrics_port: 9090

# Resource limits
mitum_memory_limit: "4G"
mitum_cpu_limit: "2"
mitum_disk_space: "100G"

# Feature flags
mitum_features:
  enable_api: true
  enable_digest: true
  enable_metrics: true
  enable_profiler: false
  enable_monitoring: true
  enable_backup: true
```

#### Security Variables (group_vars/vault.yml)
```yaml
# MongoDB credentials
mongodb_admin_password: "secure_password"
mongodb_replica_key: "replica_key"

# SSL certificates
ssl_private_key: "certificate_content"
ssl_certificate: "certificate_content"

# API keys
monitoring_api_key: "monitoring_key"
backup_encryption_key: "backup_key"
```

## 🔧 Advanced Features

### 1. Multi-Environment Management

```bash
# Development environment
make deploy ENV=development
# - 1-3 nodes
# - Minimal monitoring
# - Fast deployment

# Staging environment  
make deploy ENV=staging
# - 3-5 nodes
# - Full monitoring
# - Production-like setup

# Production environment
make deploy ENV=production
# - 5+ nodes
# - Full security
# - High availability
```

### 2. Custom Deployment Phases

```bash
# Deploy only system preparation
make deploy ENV=production --tags prepare

# Deploy only key generation
make deploy ENV=production --tags keygen

# Deploy only configuration
make deploy ENV=production --tags configure

# Deploy only monitoring
make deploy ENV=production --tags monitoring
```

### 3. Rolling Upgrades

```bash
# Upgrade with automatic rollback
make upgrade ENV=production VERSION=v1.2.3

# Upgrade specific nodes only
ansible-playbook -i inventories/production/hosts.yml \
  playbooks/rolling-upgrade.yml \
  --limit node0,node1

# Manual upgrade control
ansible-playbook -i inventories/production/hosts.yml \
  playbooks/rolling-upgrade.yml \
  --step
```

### 4. Disaster Recovery

```bash
# Full system backup
make backup ENV=production BACKUP_TYPE=full

# Incremental backup
make backup ENV=production BACKUP_TYPE=incremental

# Database-only backup
make backup ENV=production BACKUP_TYPE=database

# Recovery procedures
make restore ENV=production RESTORE_TYPE=full
make restore ENV=production RESTORE_TYPE=database
```

### 5. Security Hardening

```bash
# Security audit
make security-scan

# Apply security policies
ansible-playbook -i inventories/production/hosts.yml \
  playbooks/security-hardening.yml

# Certificate management
./scripts/manage-keys.sh --rotate-certs --environment production
```

## 🔄 CI/CD Integration

### GitHub Actions

The project includes GitHub Actions workflows:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  - lint: Ansible and YAML linting
  - test: Molecule testing
  - security: Security scanning
  - deploy: Automated deployment
```

### GitLab CI

GitLab CI configuration available:

```yaml
# .gitlab-ci.yml
stages: [validate, test, security, deploy, notify]
- Comprehensive validation
- Multi-scenario testing
- Security scanning
- Environment-specific deployment
```

### Manual Integration

```bash
# Run CI/CD locally
make validate          # Syntax validation
make test-all          # Full test suite
make security-scan     # Security audit
make deploy-test       # Test deployment
```# ans_mi

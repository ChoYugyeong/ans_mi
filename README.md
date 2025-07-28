# Mitum Ansible

<p align="center">
  <img src="docs/images/mitum-logo.png" alt="Mitum Logo" width="200">
</p>

<p align="center">
  <strong>Enterprise-grade Mitum Blockchain Automated Deployment & Management Tool</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Ansible-2.13+-red.svg" alt="Ansible">
  <img src="https://img.shields.io/badge/Python-3.6+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20macOS-lightgrey.svg" alt="Platform">
</p>

---

## 🎯 Overview

Mitum Ansible is a powerful automation tool for deploying and managing Mitum blockchain nodes. Deploy clusters from 3 to 100+ nodes in minutes with integrated monitoring, backup, and security features.

### Why Mitum Ansible?

- **⚡ Fast Deployment**: Deploy entire clusters in under 15 minutes without complex configuration
- **🔧 Flexible Configuration**: Dynamically adjust node count, IPs, and network settings
- **🔒 Enterprise Security**: SSL/TLS, firewall, Vault integration, SSH multiplexing
- **📊 Real-time Monitoring**: Included Prometheus & Grafana dashboards
- **🤖 Fully Automated**: From key generation to backups, everything is automated

## 🚀 Quick Start

### Getting Started (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/your-org/mitum-ansible.git
cd mitum-ansible

# 2. Auto setup (includes dependency installation)
make setup

# 3. Start interactive deployment
make interactive-setup
```

### First Deployment

```bash
# Add SSH key
./scripts/manage-keys.sh add production ~/your-key.pem

# Deploy 5-node cluster
make deploy NODE_COUNT=5 BASTION_IP=52.74.123.45
```

## 🌟 Features

### Core Features

| Feature | Description |
|---------|-------------|
| **🔢 Dynamic Node Configuration** | Configure 3-100+ nodes freely |
| **🌐 Multi-Cloud** | Support for AWS, GCP, Azure, On-premises |
| **🛡️ Enhanced Security** | Automatic SSL/TLS, firewall, SSH key management |
| **📈 Monitoring** | Integrated Prometheus, Grafana, AlertManager |
| **💾 Auto Backup** | Scheduled backup and recovery |
| **🎛️ AWX Integration** | Web UI management (optional) |
| **🔄 SSH Multiplexing** | Optimized SSH connections for faster deployments |

### Supported Environments

- **Operating Systems**: Ubuntu 18.04+, CentOS 7+, macOS 10.14+
- **Cloud**: AWS EC2, Google Cloud, Azure VM
- **On-premises**: Any Linux server

## 📦 Installation

### Requirements

- Python 3.6+
- SSH access permissions
- Minimum 4GB RAM, 20GB disk (per node)

### Installation Methods

#### Option 1: Auto Installation (Recommended)
```bash
make setup
```

#### Option 2: Manual Installation
```bash
# Install Ansible
pip3 install -r requirements.txt

# Install Ansible collections
ansible-galaxy install -r requirements.yml
```

## 📖 Usage

### 1. Generate Inventory

#### Interactive Mode (Recommended)
```bash
make interactive-setup
```

#### Command Line Mode
```bash
./scripts/generate-inventory.sh \
  --nodes 5 \
  --bastion-ip 52.74.123.45 \
  --node-ips 10.0.1.10,10.0.1.11,10.0.1.12,10.0.1.13,10.0.1.14
```

### 2. Deploy

```bash
# Production deployment
make deploy ENV=production

# Staging deployment (with monitoring)
make deploy ENV=staging MONITORING=yes

# Development environment (using Docker)
make deploy ENV=development DOCKER=yes
```

### 3. Management Commands

```bash
# Check status
make status

# Create backup
make backup

# View logs
make logs

# Stop/Start cluster
make stop
make start

# Update configuration
make update-config
```

## 🔧 Configuration Options

### Node Configuration

```yaml
# inventories/production/group_vars/all.yml
mitum_nodes:
  total_count: 5
  consensus_nodes: 4
  api_nodes: 1
  
mitum_network:
  id: "mainnet"
  genesis_time: "2024-01-01T00:00:00Z"
```

### Security Settings

```yaml
# Enable firewall
security_firewall_enabled: true

# SSL/TLS configuration
security_ssl_enabled: true
security_ssl_cert_path: "/etc/ssl/certs/mitum.crt"

# Vault integration
security_vault_enabled: true
security_vault_address: "https://vault.example.com"

# SSH multiplexing
ssh_multiplexing_enabled: true
ssh_control_persist: "10m"
```

## 📊 Monitoring

### Grafana Dashboard

Access dashboard after deployment:
- URL: `http://BASTION_IP:3000`
- Default credentials: admin / admin

### Collected Metrics

- Node status and performance
- Transaction throughput
- Consensus latency
- System resource usage

## 🔒 Security

### Security Best Practices

1. **SSH Key Management**
   ```bash
   # Set key permissions
   chmod 600 keys/ssh/production/*.pem
   ```

2. **Use Vault**
   ```bash
   # Encrypt secrets
   ansible-vault encrypt inventories/production/group_vars/vault.yml
   ```

3. **Regular Updates**
   ```bash
   # Apply security patches
   make security-update
   ```

## 🐛 Troubleshooting

### Common Issues

<details>
<summary>Node won't start</summary>

```bash
# Test connection
make test ENV=production

# Check detailed logs
ansible-playbook -vvv playbooks/deploy-mitum.yml
```
</details>

<details>
<summary>MongoDB connection failure</summary>

```bash
# Check MongoDB status
make check-mongodb

# Check firewall rules
sudo iptables -L -n | grep 27017
```
</details>

### Debugging

```bash
# Generate diagnostic report
./scripts/diagnostic-report.sh

# Run specific tasks
make deploy TAGS=mongodb
```

## 📚 Documentation

- [Detailed Installation Guide](docs/INSTALL.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Operations Guide](docs/OPERATIONS.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [API Reference](docs/API.md)

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup

```bash
# Setup development environment
make dev-setup

# Run tests
make test

# Code quality check
make lint
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Mitum Development Team
- Ansible Community
- All Contributors

---

<p align="center">
  <strong>Need help or support?</strong><br>
  <a href="https://github.com/your-org/mitum-ansible/issues">Create Issue</a> •
  <a href="https://discord.gg/mitum">Join Discord</a> •
  <a href="mailto:support@mitum.com">Email Support</a>
</p>
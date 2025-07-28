# Mitum Ansible Makefile
# Version: 3.0.0
#
# This Makefile provides convenient commands for managing Mitum deployments
# Note: Make sure to use TAB characters for indentation, not spaces!

.PHONY: help setup deploy test clean status logs backup restore \
        keygen vault-init vault-edit security-scan update-deps \
        monitoring-start monitoring-stop ssh-cleanup dev-setup lint \
        interactive-setup generate-inventory

# Default shell
SHELL := /bin/bash

# Variables
PYTHON := python3
VENV := .venv
ANSIBLE := $(VENV)/bin/ansible
ANSIBLE_PLAYBOOK := $(VENV)/bin/ansible-playbook
ANSIBLE_VAULT := $(VENV)/bin/ansible-vault
ANSIBLE_LINT := $(VENV)/bin/ansible-lint

# Environment variables
export ANSIBLE_CONFIG := $(PWD)/ansible.cfg
export ANSIBLE_HOST_KEY_CHECKING := True
export ANSIBLE_SSH_PIPELINING := True
export ANSIBLE_RETRY_FILES_ENABLED := True
export ANSIBLE_NOCOWS := 1

# Default values
ENV ?= production
INVENTORY ?= inventories/$(ENV)/hosts.yml
PLAYBOOK ?= playbooks/site.yml
TAGS ?= all
SKIP_TAGS ?= 
LIMIT ?= all
VERBOSE ?= 
NODE_COUNT ?= 3
BASTION_IP ?= 
MONITORING ?= no
VAULT_FILE ?= inventories/$(ENV)/group_vars/vault.yml

# SSH multiplexing settings
SSH_CONTROL_PATH := ~/.ansible/cp
SSH_CONTROL_PERSIST := 10m

# Color output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target
help:
	@echo "$(GREEN)Mitum Ansible Management Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup Commands:$(NC)"
	@echo "  make setup                - Initial setup (install dependencies)"
	@echo "  make dev-setup           - Setup development environment"
	@echo "  make interactive-setup   - Interactive deployment wizard"
	@echo "  make generate-inventory  - Generate inventory files"
	@echo ""
	@echo "$(YELLOW)Deployment Commands:$(NC)"
	@echo "  make deploy              - Deploy Mitum cluster"
	@echo "  make deploy ENV=staging  - Deploy to specific environment"
	@echo "  make deploy TAGS=mongodb - Deploy specific components"
	@echo ""
	@echo "$(YELLOW)Management Commands:$(NC)"
	@echo "  make status              - Check cluster status"
	@echo "  make logs                - View Mitum logs"
	@echo "  make backup              - Create backup"
	@echo "  make restore             - Restore from backup"
	@echo "  make stop                - Stop Mitum services"
	@echo "  make start               - Start Mitum services"
	@echo "  make restart             - Restart Mitum services"
	@echo ""
	@echo "$(YELLOW)Security Commands:$(NC)"
	@echo "  make keygen              - Generate Mitum keys"
	@echo "  make vault-init          - Initialize Ansible Vault"
	@echo "  make vault-edit          - Edit vault secrets"
	@echo "  make vault-encrypt       - Encrypt vault file"
	@echo "  make security-scan       - Run security scan"
	@echo "  make rotate-secrets      - Rotate all secrets"
	@echo ""
	@echo "$(YELLOW)Testing Commands:$(NC)"
	@echo "  make test                - Test connectivity"
	@echo "  make test-playbook       - Syntax check playbooks"
	@echo "  make lint                - Lint Ansible code"
	@echo "  make validate            - Validate configuration"
	@echo ""
	@echo "$(YELLOW)Maintenance Commands:$(NC)"
	@echo "  make update-deps         - Update dependencies"
	@echo "  make ssh-cleanup         - Clean SSH connections"
	@echo "  make clean               - Clean temporary files"
	@echo "  make clean-all           - Clean everything"
	@echo ""
	@echo "$(YELLOW)Common Options:$(NC)"
	@echo "  ENV=production          - Environment (production/staging/dev)"
	@echo "  TAGS=tag1,tag2          - Ansible tags to run"
	@echo "  LIMIT=node0             - Limit to specific hosts"
	@echo "  VERBOSE=-vvv            - Verbose output"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make deploy ENV=staging TAGS=mongodb"
	@echo "  make status ENV=production"
	@echo "  make backup ENV=production"

# Setup environment
setup:
	@echo "$(GREEN)Setting up Mitum Ansible environment...$(NC)"
	@bash scripts/setup.sh
	@echo "$(GREEN)Setup complete! Activate with: source $(VENV)/bin/activate$(NC)"

# Development setup
dev-setup: setup
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@$(VENV)/bin/pip install -r requirements-dev.txt || true
	@pre-commit install || true
	@echo "$(GREEN)Development setup complete!$(NC)"

# Interactive setup wizard
interactive-setup:
	@echo "$(GREEN)Starting interactive setup wizard...$(NC)"
	@bash scripts/interactive-setup.sh

# Generate inventory
generate-inventory:
	@echo "$(GREEN)Generating inventory...$(NC)"
	@bash scripts/generate-inventory.sh \
		--environment $(ENV) \
		--nodes $(NODE_COUNT) \
		--bastion-ip $(BASTION_IP) \
		$(if $(NODE_IPS),--node-ips $(NODE_IPS)) \
		$(if $(SUBNET),--subnet $(SUBNET))

# Deploy Mitum
deploy: check-env
	@echo "$(GREEN)Deploying Mitum to $(ENV) environment...$(NC)"
	@$(ANSIBLE_PLAYBOOK) $(PLAYBOOK) \
		-i $(INVENTORY) \
		$(if $(TAGS),--tags $(TAGS)) \
		$(if $(SKIP_TAGS),--skip-tags $(SKIP_TAGS)) \
		$(if $(LIMIT),--limit $(LIMIT)) \
		$(VERBOSE)

# Test connectivity
test: check-env
	@echo "$(GREEN)Testing connectivity to $(ENV) environment...$(NC)"
	@$(ANSIBLE) all -i $(INVENTORY) -m ping $(VERBOSE)

# Check cluster status
status: check-env
	@echo "$(GREEN)Checking Mitum cluster status...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/status.yml -i $(INVENTORY) $(VERBOSE)

# View logs
logs: check-env
	@echo "$(GREEN)Fetching Mitum logs...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/logs.yml -i $(INVENTORY) \
		-e "log_lines=100" $(VERBOSE)

# Start services
start: check-env
	@echo "$(GREEN)Starting Mitum services...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/manage-services.yml -i $(INVENTORY) \
		-e "service_action=start" $(VERBOSE)

# Stop services
stop: check-env
	@echo "$(GREEN)Stopping Mitum services...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/manage-services.yml -i $(INVENTORY) \
		-e "service_action=stop" $(VERBOSE)

# Restart services
restart: check-env
	@echo "$(GREEN)Restarting Mitum services...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/manage-services.yml -i $(INVENTORY) \
		-e "service_action=restart" $(VERBOSE)

# Generate keys
keygen: check-env
	@echo "$(GREEN)Generating Mitum keys...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/keygen.yml -i $(INVENTORY) $(VERBOSE)

# Initialize vault
vault-init:
	@echo "$(GREEN)Initializing Ansible Vault...$(NC)"
	@bash scripts/vault-manager.sh init --environment $(ENV)

# Edit vault
vault-edit: check-vault
	@echo "$(GREEN)Editing vault file...$(NC)"
	@bash scripts/vault-manager.sh edit --file $(VAULT_FILE)

# Encrypt vault
vault-encrypt: check-vault
	@echo "$(GREEN)Encrypting vault file...$(NC)"
	@$(ANSIBLE_VAULT) encrypt $(VAULT_FILE)

# Rotate secrets
rotate-secrets: check-env
	@echo "$(GREEN)Rotating secrets...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/rotate-secrets.yml -i $(INVENTORY) $(VERBOSE)

# Security scan
security-scan: lint
	@echo "$(GREEN)Running security scan...$(NC)"
	@bash scripts/security-scan.sh

# Create backup
backup: check-env
	@echo "$(GREEN)Creating backup...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/backup.yml -i $(INVENTORY) $(VERBOSE)

# Restore from backup
restore: check-env
	@echo "$(GREEN)Restoring from backup...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/restore.yml -i $(INVENTORY) \
		$(if $(BACKUP_TIMESTAMP),-e backup_timestamp=$(BACKUP_TIMESTAMP)) \
		$(VERBOSE)

# Lint Ansible code
lint:
	@echo "$(GREEN)Linting Ansible code...$(NC)"
	@$(ANSIBLE_LINT) playbooks/*.yml || true
	@yamllint -c .yamllint . || true

# Validate configuration
validate: lint test-playbook
	@echo "$(GREEN)Validating configuration...$(NC)"
	@bash scripts/validate-config.sh

# Test playbook syntax
test-playbook:
	@echo "$(GREEN)Testing playbook syntax...$(NC)"
	@$(ANSIBLE_PLAYBOOK) $(PLAYBOOK) -i $(INVENTORY) --syntax-check

# Update dependencies
update-deps:
	@echo "$(GREEN)Updating dependencies...$(NC)"
	@$(VENV)/bin/pip install --upgrade pip setuptools wheel
	@$(VENV)/bin/pip install --upgrade -r requirements.txt
	@$(ANSIBLE) --version

# Start monitoring
monitoring-start: check-env
	@echo "$(GREEN)Starting monitoring stack...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/monitoring.yml -i $(INVENTORY) \
		--tags start $(VERBOSE)

# Stop monitoring
monitoring-stop: check-env
	@echo "$(GREEN)Stopping monitoring stack...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/monitoring.yml -i $(INVENTORY) \
		--tags stop $(VERBOSE)

# Clean SSH connections
ssh-cleanup:
	@echo "$(GREEN)Cleaning SSH multiplexed connections...$(NC)"
	@rm -f $(SSH_CONTROL_PATH)/*
	@ssh-add -D 2>/dev/null || true
	@echo "$(GREEN)SSH connections cleaned$(NC)"

# Clean temporary files
clean:
	@echo "$(GREEN)Cleaning temporary files...$(NC)"
	@find . -name "*.retry" -delete
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@rm -rf .ansible_cache .tmp
	@rm -f security-report.json

# Clean everything
clean-all: clean ssh-cleanup
	@echo "$(RED)Cleaning all generated files...$(NC)"
	@rm -rf $(VENV)
	@rm -rf logs/*.log
	@rm -rf backups/*
	@echo "$(GREEN)All clean!$(NC)"

# Check environment
check-env:
	@if [ ! -f "$(INVENTORY)" ]; then \
		echo "$(RED)Error: Inventory file not found: $(INVENTORY)$(NC)"; \
		echo "Run 'make generate-inventory' first"; \
		exit 1; \
	fi
	@if [ ! -d "$(VENV)" ]; then \
		echo "$(RED)Error: Virtual environment not found$(NC)"; \
		echo "Run 'make setup' first"; \
		exit 1; \
	fi

# Check vault
check-vault:
	@if [ ! -f "$(VAULT_FILE)" ]; then \
		echo "$(RED)Error: Vault file not found: $(VAULT_FILE)$(NC)"; \
		echo "Run 'make vault-init' first"; \
		exit 1; \
	fi
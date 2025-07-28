# Mitum Ansible Makefile
# Version: 4.0.1 - Enhanced with better error handling and path management

# Shell settings
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m

# Project paths
ROOT_DIR := $(shell pwd)
VENV := $(ROOT_DIR)/.venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
ANSIBLE := $(VENV)/bin/ansible
ANSIBLE_PLAYBOOK := $(VENV)/bin/ansible-playbook
ANSIBLE_VAULT := $(VENV)/bin/ansible-vault
ANSIBLE_LINT := $(VENV)/bin/ansible-lint

# Default settings
INVENTORY ?= inventories/production/hosts.yml
PLAYBOOK ?= playbooks/site.yml
VAULT_FILE ?= .vault_pass
VERBOSE ?= 
SSH_CONTROL_PATH := ~/.ansible/cp
ANSIBLE_LOG_PATH := $(ROOT_DIR)/logs/ansible.log

# Python version check
PYTHON_VERSION := $(shell python3 --version 2>/dev/null | cut -d' ' -f2)
PYTHON_MAJOR := $(shell echo $(PYTHON_VERSION) | cut -d'.' -f1)
PYTHON_MINOR := $(shell echo $(PYTHON_VERSION) | cut -d'.' -f2)

# Ansible options
ANSIBLE_OPTS := 
ifdef VERBOSE
	ANSIBLE_OPTS += -$(VERBOSE)
endif
ifdef TAGS
	ANSIBLE_OPTS += --tags $(TAGS)
endif
ifdef SKIP_TAGS
	ANSIBLE_OPTS += --skip-tags $(SKIP_TAGS)
endif
ifdef LIMIT
	ANSIBLE_OPTS += --limit $(LIMIT)
endif

# Export for ansible
export ANSIBLE_LOG_PATH

.PHONY: help
help:
	@echo "$(GREEN)Mitum Ansible Management System$(NC)"
	@echo "$(BLUE)================================$(NC)"
	@echo ""
	@echo "$(YELLOW)🚀 Quick Start:$(NC)"
	@echo "  make setup              - Initial setup (creates venv, installs dependencies)"
	@echo "  make generate-inventory - Generate inventory interactively"
	@echo "  make deploy             - Deploy Mitum cluster"
	@echo ""
	@echo "$(YELLOW)📦 Setup Commands:$(NC)"
	@echo "  make setup              - Initial environment setup"
	@echo "  make update-deps        - Update Python dependencies"
	@echo "  make generate-inventory - Interactive inventory generation"
	@echo "  make vault-init         - Initialize ansible vault"
	@echo ""
	@echo "$(YELLOW)🚀 Deployment Commands:$(NC)"
	@echo "  make deploy             - Full deployment (all components)"
	@echo "  make deploy-mitum       - Deploy Mitum nodes only"
	@echo "  make deploy-mongodb     - Deploy MongoDB only"
	@echo "  make deploy-monitoring  - Deploy monitoring stack"
	@echo "  make keygen             - Generate keys only"
	@echo "  make rolling-upgrade    - Perform rolling upgrade"
	@echo ""
	@echo "$(YELLOW)🔧 Operations:$(NC)"
	@echo "  make status             - Check cluster status"
	@echo "  make logs               - View Mitum logs"
	@echo "  make backup             - Backup cluster data"
	@echo "  make restore            - Restore from backup"
	@echo "  make restart            - Restart all services"
	@echo "  make stop               - Stop all services"
	@echo "  make start              - Start all services"
	@echo ""
	@echo "$(YELLOW)🧪 Testing & Validation:$(NC)"
	@echo "  make test               - Test connectivity"
	@echo "  make validate           - Validate configuration"
	@echo "  make lint               - Lint playbooks"
	@echo "  make security-scan      - Run security scan"
	@echo "  make dry-run            - Deployment dry run"
	@echo ""
	@echo "$(YELLOW)🧹 Cleanup:$(NC)"
	@echo "  make clean              - Clean temporary files"
	@echo "  make clean-all          - Clean everything (including venv)"
	@echo "  make ssh-cleanup        - Clean SSH connections"
	@echo ""
	@echo "$(YELLOW)📊 Monitoring:$(NC)"
	@echo "  make monitoring-start   - Start monitoring stack"
	@echo "  make monitoring-stop    - Stop monitoring stack"
	@echo "  make monitoring-status  - Check monitoring status"
	@echo ""
	@echo "$(YELLOW)⚙️  Options:$(NC)"
	@echo "  INVENTORY=path          - Custom inventory (default: $(INVENTORY))"
	@echo "  VERBOSE=vvv             - Verbosity level (v, vv, vvv)"
	@echo "  TAGS=tag1,tag2          - Run specific tags"
	@echo "  SKIP_TAGS=tag1,tag2     - Skip specific tags"
	@echo "  LIMIT=host1,host2       - Limit to specific hosts"
	@echo ""
	@echo "$(YELLOW)📚 Examples:$(NC)"
	@echo "  make deploy VERBOSE=vv"
	@echo "  make deploy TAGS=mitum"
	@echo "  make status LIMIT=mitum-node-01"
	@echo "  make deploy INVENTORY=inventories/staging/hosts.yml"

# Check Python version
.PHONY: check-python
check-python:
	@if [ "$(PYTHON_MAJOR)" -lt "3" ] || [ "$(PYTHON_MINOR)" -lt "9" ]; then \
		echo "$(RED)Error: Python 3.9+ required, found $(PYTHON_VERSION)$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Python $(PYTHON_VERSION) OK$(NC)"

# Setup virtual environment
.PHONY: setup
setup: check-python
	@echo "$(GREEN)Setting up Mitum Ansible environment...$(NC)"
	@if [ ! -d "$(VENV)" ]; then \
		echo "Creating virtual environment..."; \
		python3 -m venv $(VENV); \
	fi
	@echo "Upgrading pip..."
	@$(PIP) install --upgrade pip setuptools wheel
	@echo "Installing dependencies..."
	@$(PIP) install -r requirements.txt
	@echo ""
	@echo "$(GREEN)✅ Setup complete!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "1. Activate environment: source $(VENV)/bin/activate"
	@echo "2. Generate inventory: make generate-inventory"
	@echo "3. Deploy: make deploy"

# Generate inventory
.PHONY: generate-inventory
generate-inventory: check-env
	@echo "$(GREEN)Generating inventory...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/generate-inventory.yml -i localhost, $(VERBOSE)

# Initialize vault
.PHONY: vault-init
vault-init: check-env
	@echo "$(GREEN)Initializing Ansible Vault...$(NC)"
	@if [ ! -f "$(VAULT_FILE)" ]; then \
		read -sp "Enter vault password: " vault_pass; \
		echo "$$vault_pass" > $(VAULT_FILE); \
		chmod 600 $(VAULT_FILE); \
		echo ""; \
		echo "$(GREEN)✓ Vault password saved to $(VAULT_FILE)$(NC)"; \
	else \
		echo "$(YELLOW)Vault file already exists$(NC)"; \
	fi

# Key generation
.PHONY: keygen
keygen: check-env
	@echo "$(GREEN)Generating Mitum keys...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/keygen-only.yml -i localhost, $(ANSIBLE_OPTS) $(VERBOSE)

# Full deployment
.PHONY: deploy
deploy: check-env check-vault
	@echo "$(GREEN)Starting Mitum deployment...$(NC)"
	@echo "Environment: $$(grep mitum_environment $(INVENTORY) | awk '{print $$2}')"
	@$(ANSIBLE_PLAYBOOK) $(PLAYBOOK) -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Deploy Mitum only
.PHONY: deploy-mitum
deploy-mitum: check-env check-vault
	@echo "$(GREEN)Deploying Mitum nodes...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/deploy-mitum.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Deploy MongoDB only
.PHONY: deploy-mongodb
deploy-mongodb: check-env check-vault
	@echo "$(GREEN)Deploying MongoDB...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/setup-mongodb.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Deploy monitoring
.PHONY: deploy-monitoring
deploy-monitoring: check-env
	@echo "$(GREEN)Deploying monitoring stack...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/setup-monitoring.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Cluster status
.PHONY: status
status: check-env
	@echo "$(GREEN)Checking cluster status...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/status.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# View logs
.PHONY: logs
logs: check-env
	@echo "$(GREEN)Fetching Mitum logs...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/logs.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Backup
.PHONY: backup
backup: check-env
	@echo "$(GREEN)Starting backup...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/backup.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Restore
.PHONY: restore
restore: check-env
	@echo "$(YELLOW)⚠️  Warning: This will restore data from backup$(NC)"
	@read -p "Continue? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(ANSIBLE_PLAYBOOK) playbooks/restore.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Rolling upgrade
.PHONY: rolling-upgrade
rolling-upgrade: check-env
	@echo "$(GREEN)Starting rolling upgrade...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/rolling-upgrade.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Service control
.PHONY: restart
restart: check-env
	@echo "$(GREEN)Restarting services...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/restart.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

.PHONY: stop
stop: check-env
	@echo "$(YELLOW)Stopping services...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/stop.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

.PHONY: start
start: check-env
	@echo "$(GREEN)Starting services...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/start.yml -i $(INVENTORY) $(ANSIBLE_OPTS) $(VERBOSE)

# Test connectivity
.PHONY: test
test: check-env
	@echo "$(GREEN)Testing connectivity...$(NC)"
	@$(ANSIBLE) all -i $(INVENTORY) -m ping $(VERBOSE) || \
		(echo "$(RED)Connectivity test failed!$(NC)" && exit 1)
	@echo "$(GREEN)✓ All nodes reachable$(NC)"

# Dry run
.PHONY: dry-run
dry-run: check-env
	@echo "$(GREEN)Running deployment dry run...$(NC)"
	@$(ANSIBLE_PLAYBOOK) $(PLAYBOOK) -i $(INVENTORY) --check --diff $(ANSIBLE_OPTS) $(VERBOSE)

# Lint
.PHONY: lint
lint: check-env
	@echo "$(GREEN)Linting playbooks...$(NC)"
	@$(ANSIBLE_LINT) playbooks/*.yml || true

# Validate configuration
.PHONY: validate
validate: lint test-playbook
	@echo "$(GREEN)Validating configuration...$(NC)"
	@bash scripts/validate-config.sh

# Test playbook syntax
.PHONY: test-playbook
test-playbook: check-env
	@echo "$(GREEN)Testing playbook syntax...$(NC)"
	@$(ANSIBLE_PLAYBOOK) $(PLAYBOOK) -i $(INVENTORY) --syntax-check

# Security scan
.PHONY: security-scan
security-scan: check-env
	@echo "$(GREEN)Running security scan...$(NC)"
	@bash scripts/security-scan.sh

# Update dependencies
.PHONY: update-deps
update-deps: check-env
	@echo "$(GREEN)Updating dependencies...$(NC)"
	@$(PIP) install --upgrade pip setuptools wheel
	@$(PIP) install --upgrade -r requirements.txt
	@$(ANSIBLE) --version

# Start monitoring
.PHONY: monitoring-start
monitoring-start: check-env
	@echo "$(GREEN)Starting monitoring stack...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/monitoring.yml -i $(INVENTORY) \
		--tags start $(ANSIBLE_OPTS) $(VERBOSE)

# Stop monitoring
.PHONY: monitoring-stop
monitoring-stop: check-env
	@echo "$(GREEN)Stopping monitoring stack...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/monitoring.yml -i $(INVENTORY) \
		--tags stop $(ANSIBLE_OPTS) $(VERBOSE)

# Monitoring status
.PHONY: monitoring-status
monitoring-status: check-env
	@echo "$(GREEN)Checking monitoring status...$(NC)"
	@$(ANSIBLE_PLAYBOOK) playbooks/monitoring.yml -i $(INVENTORY) \
		--tags status $(ANSIBLE_OPTS) $(VERBOSE)

# Clean SSH connections
.PHONY: ssh-cleanup
ssh-cleanup:
	@echo "$(GREEN)Cleaning SSH multiplexed connections...$(NC)"
	@rm -f $(SSH_CONTROL_PATH)/*
	@ssh-add -D 2>/dev/null || true
	@echo "$(GREEN)✓ SSH connections cleaned$(NC)"

# Clean temporary files
.PHONY: clean
clean:
	@echo "$(GREEN)Cleaning temporary files...$(NC)"
	@find . -name "*.retry" -delete
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@rm -rf .ansible_cache .tmp
	@rm -f security-report*.json
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

# Clean everything
.PHONY: clean-all
clean-all: clean ssh-cleanup
	@echo "$(RED)Cleaning all generated files...$(NC)"
	@rm -rf $(VENV)
	@rm -rf logs/*.log
	@rm -rf backups/*
	@rm -f $(VAULT_FILE)
	@echo "$(GREEN)✓ All clean!$(NC)"

# Check environment
.PHONY: check-env
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
.PHONY: check-vault
check-vault:
	@if [ ! -f "$(VAULT_FILE)" ]; then \
		echo "$(RED)Error: Vault file not found: $(VAULT_FILE)$(NC)"; \
		echo "Run 'make vault-init' first"; \
		exit 1; \
	fi

# Default target
.DEFAULT_GOAL := help
# Mitum Ansible Makefile (Optimized Version)
# Version: 5.0.0 - Enhanced with deduplication, performance, and security
# 
# Key improvements:
# 1. Duplicate code removal and structure optimization
# 2. Performance enhancement (parallel processing, caching)
# 3. Security hardening (Vault, key management)
# 4. Automated cleanup and optimization
# 5. Cross-platform compatibility

.PHONY: help setup test keygen deploy status logs backup restore clean upgrade inventory optimize deduplicate

# === Configuration ===
# Environment variables - defaults and overridable
ENV ?= production
INVENTORY ?= inventories/$(ENV)/hosts.yml
PLAYBOOK_DIR = playbooks
VENV = venv
ANSIBLE = $(VENV)/bin/ansible
ANSIBLE_PLAYBOOK = $(VENV)/bin/ansible-playbook
ANSIBLE_VAULT = $(VENV)/bin/ansible-vault

# OS detection - Mac and Linux differentiation
UNAME := $(shell uname -s)
ifeq ($(UNAME),Darwin)
    OS_TYPE = macos
    PACKAGE_MANAGER = brew
    SERVICE_MANAGER = launchctl
    SED_CMD = sed -i.bak
else
    OS_TYPE = linux
    PACKAGE_MANAGER = apt-get
    SERVICE_MANAGER = systemctl
    SED_CMD = sed -i
endif

# Security options - enabled by default
STRICT_HOST_KEY_CHECKING ?= yes
USE_VAULT ?= yes
VAULT_PASSWORD_FILE ?= .vault_pass

# Safe mode - additional confirmation for destructive operations
SAFE_MODE ?= yes
DRY_RUN ?= no

# Performance optimization options
PARALLEL_FORKS ?= 50
CACHE_ENABLED ?= yes
FACT_CACHING ?= jsonfile

# Color definitions
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m

# === Helper Functions ===
# Safety confirmation function - used before destructive operations
define confirm_action
	@if [ "$(SAFE_MODE)" = "yes" ]; then \
		echo "$(RED)WARNING: $(1)$(NC)"; \
		echo "$(YELLOW)This action cannot be undone!$(NC)"; \
		read -p "Type 'yes' to confirm: " confirm; \
		if [ "$$confirm" != "yes" ]; then \
			echo "$(GREEN)Operation cancelled.$(NC)"; \
			exit 1; \
		fi \
	fi
endef

# Dry run check function
define check_dry_run
	$(if $(filter yes,$(DRY_RUN)),--check)
endef

# Performance optimization function
define performance_flags
	--forks $(PARALLEL_FORKS) \
	$(if $(filter yes,$(CACHE_ENABLED)),--fact-cache .ansible_cache) \
	--timeout 30
endef

# Default target
.DEFAULT_GOAL := help

# === Main Targets ===

help: ## Show help message with categorized commands
	@echo ""
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🚀 Mitum Ansible Automation System v5.0.0$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "📌 OS: $(GREEN)$(OS_TYPE)$(NC) | Package Manager: $(GREEN)$(PACKAGE_MANAGER)$(NC)"
	@echo ""
	@echo "$(YELLOW)🚀 Quick Start:$(NC)"
	@echo "  $(BLUE)interactive-setup$(NC)     💬 Interactive setup (recommended for beginners!)"
	@echo "  $(BLUE)quick-deploy$(NC)          ⚡ Quick deployment (uses default settings)"
	@echo ""
	@echo "$(YELLOW)🔧 Setup & Configuration:$(NC)"
	@echo "  $(BLUE)setup$(NC)                 📦 Environment setup"
	@echo "  $(BLUE)test$(NC)                  🧪 Connection test"
	@echo "  $(BLUE)keygen$(NC)                🔑 Key generation"
	@echo ""
	@echo "$(YELLOW)🚀 Deployment & Operations:$(NC)"
	@echo "  $(BLUE)deploy$(NC)                🎯 Full deployment"
	@echo "  $(BLUE)status$(NC)                📊 Status check"
	@echo "  $(BLUE)logs$(NC)                  📜 View logs"
	@echo "  $(BLUE)dashboard$(NC)             📈 Open dashboard"
	@echo ""
	@echo "$(YELLOW)🛡️  Maintenance:$(NC)"
	@echo "  $(BLUE)backup$(NC)                💾 Create backup"
	@echo "  $(BLUE)restore$(NC)               ♻️  Restore backup"
	@echo "  $(BLUE)upgrade$(NC)               📡 Upgrade"
	@echo "  $(BLUE)clean$(NC)                 🧹 Clean up"
	@echo ""
	@echo "$(YELLOW)✨ Optimization:$(NC)"
	@echo "  $(BLUE)optimize$(NC)              🔧 Optimize project"
	@echo "  $(BLUE)deduplicate$(NC)           🗑️  Remove duplicates"
	@echo ""
	@echo "$(YELLOW)⚙️  Options:$(NC)"
	@echo "  $(CYAN)ENV=<environment>$(NC)     🌍 Target environment (default: $(GREEN)$(ENV)$(NC))"
	@echo "  $(CYAN)DRY_RUN=yes$(NC)           👀 Preview changes"
	@echo "  $(CYAN)SAFE_MODE=no$(NC)          ⚠️  Disable safety checks"
	@echo ""
	@echo "$(GREEN)💡 Tip:$(NC) New to this? Start with $(BLUE)'make interactive-setup'$(NC)!"
	@echo "$(GREEN)📚 Help:$(NC) For more details, check $(BLUE)'cat QUICK_START.md'$(NC)"
	@echo ""

# === Quick Start Targets ===

interactive-setup: ## Interactive setup start (recommended for beginners!)
	@echo "$(GREEN)🎯 Starting interactive setup...$(NC)"
	@if [ ! -f scripts/interactive-setup.sh ]; then \
		echo "$(RED)❌ Error: interactive-setup.sh file not found$(NC)"; \
		exit 1; \
	fi
	@bash ./scripts/interactive-setup.sh

start: interactive-setup ## Interactive setup start (alias)

quick-deploy: setup ## Quick deployment with minimal steps
	@echo "$(GREEN)>>> Quick Deployment Mode$(NC)"
	@echo "This will deploy Mitum with default settings."
	@echo ""
	@if [ -z "$(BASTION_IP)" ] || [ -z "$(NODE_IPS)" ]; then \
		echo "$(RED)Error: Required variables missing$(NC)"; \
		echo "Usage: make quick-deploy BASTION_IP=x.x.x.x NODE_IPS=10.0.1.10,10.0.1.11"; \
		exit 1; \
	fi
	@make inventory
	@make test
	@make deploy

# === Setup Commands ===

setup: ## Initial setup with dependency checks
	@echo "$(GREEN)>>> Running enhanced setup for $(OS_TYPE)...$(NC)"
	@if [ ! -f scripts/setup.sh ]; then \
		echo "$(RED)Error: setup.sh not found$(NC)"; \
		exit 1; \
	fi
	@bash ./scripts/setup.sh
	@make setup-vault
	@make optimize-config
	@echo "$(GREEN)✓ Setup complete!$(NC)"

setup-vault: ## Setup Ansible Vault for secrets
	@if [ "$(USE_VAULT)" = "yes" ] && [ ! -f "$(VAULT_PASSWORD_FILE)" ]; then \
		echo "$(YELLOW)>>> Setting up Ansible Vault...$(NC)"; \
		echo "Enter a strong password for Ansible Vault:"; \
		read -s vault_pass; \
		echo "$$vault_pass" > $(VAULT_PASSWORD_FILE); \
		chmod 600 $(VAULT_PASSWORD_FILE); \
		echo "$(GREEN)✓ Vault password saved to $(VAULT_PASSWORD_FILE)$(NC)"; \
		echo "$(YELLOW)Keep this file safe and add it to .gitignore!$(NC)"; \
	fi

# === Optimization Commands (New) ===

optimize: ## Full project optimization
	@echo "$(GREEN)>>> Running project optimization...$(NC)"
	@if [ -f scripts/optimize-project.sh ]; then \
		bash ./scripts/optimize-project.sh; \
	else \
		echo "$(YELLOW)Optimization script not found, running basic optimization...$(NC)"; \
		make deduplicate; \
		make optimize-config; \
		make optimize-security; \
	fi

deduplicate: ## Remove duplicate files
	@echo "$(GREEN)>>> Removing duplicate files...$(NC)"
	@if [ -f cleanup-duplicates.sh ]; then \
		bash ./cleanup-duplicates.sh; \
	else \
		echo "$(YELLOW)Cleanup script not found, manual cleanup required$(NC)"; \
	fi

optimize-config: ## Optimize Ansible configuration
	@echo "$(GREEN)>>> Optimizing Ansible configuration...$(NC)"
	@if [ -f ansible.cfg ]; then \
		$(SED_CMD) 's/forks = [0-9]*/forks = $(PARALLEL_FORKS)/' ansible.cfg; \
		$(SED_CMD) 's/fact_caching = [^[:space:]]*/fact_caching = $(FACT_CACHING)/' ansible.cfg; \
		echo "$(GREEN)✓ Configuration optimized$(NC)"; \
	fi

optimize-security: ## Security optimization
	@echo "$(GREEN)>>> Optimizing security settings...$(NC)"
	@find keys/ -name "*.pem" -exec chmod 600 {} \; 2>/dev/null || true
	@find keys/ -name "*.key" -exec chmod 600 {} \; 2>/dev/null || true
	@if [ -f .vault_pass ]; then \
		chmod 600 .vault_pass; \
	fi
	@echo "$(GREEN)✓ Security optimized$(NC)"

# === Key Management ===

keys-add: ## Add SSH key with validation
	@if [ -z "$(KEY)" ]; then \
		echo "$(RED)Error: KEY variable required$(NC)"; \
		echo "Usage: make keys-add KEY=~/key.pem NAME=bastion.pem"; \
		exit 1; \
	fi
	@# Validate key format
	@if ! ssh-keygen -l -f $(KEY) > /dev/null 2>&1; then \
		echo "$(RED)Error: Invalid SSH key format$(NC)"; \
		exit 1; \
	fi
	@./scripts/manage-keys.sh add $(ENV) $(KEY) $(NAME)

keys-encrypt: ## Encrypt sensitive keys with Ansible Vault
	@if [ "$(USE_VAULT)" = "yes" ]; then \
		echo "$(YELLOW)>>> Encrypting sensitive files...$(NC)"; \
		find inventories/$(ENV) -name "vault*.yml" -exec \
			$(ANSIBLE_VAULT) encrypt {} --vault-password-file=$(VAULT_PASSWORD_FILE) \; ; \
		echo "$(GREEN)✓ Files encrypted$(NC)"; \
	fi

# === Testing ===

test: activate ## Test connectivity with host key verification
	@echo "$(GREEN)>>> Testing connectivity (secure mode)...$(NC)"
	@# First, gather host keys safely
	@if [ "$(STRICT_HOST_KEY_CHECKING)" = "yes" ]; then \
		echo "$(YELLOW)Gathering SSH host keys...$(NC)"; \
		$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/gather-host-keys.yml \
			$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE)) \
			$(call performance_flags); \
	fi
	@$(ANSIBLE) -i $(INVENTORY) all -m ping \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE)) \
		$(call performance_flags)
	@echo "$(GREEN)✓ All hosts accessible$(NC)"

test-check: activate ## Dry run connectivity test
	@$(ANSIBLE) -i $(INVENTORY) all -m ping --check $(call performance_flags)

# === Deployment ===

deploy: activate pre-deploy-check ## Full deployment with safety checks
	@echo "$(GREEN)>>> Starting safe deployment...$(NC)"
	@# Create pre-deployment snapshot
	@make backup BACKUP_TYPE=pre-deploy
	@# Run deployment
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/site.yml \
		$(call check_dry_run) \
		$(call performance_flags) \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE)) \
		-e "deployment_id=$$(date +%Y%m%d-%H%M%S)"
	@# Verify deployment
	@make post-deploy-check
	@echo "$(GREEN)✓ Deployment complete and verified!$(NC)"

pre-deploy-check: ## Pre-deployment validation
	@echo "$(YELLOW)>>> Running pre-deployment checks...$(NC)"
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/pre-deploy-check.yml \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE)) \
		$(call performance_flags)

post-deploy-check: ## Post-deployment validation
	@echo "$(YELLOW)>>> Verifying deployment...$(NC)"
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/post-deploy-check.yml \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE)) \
		$(call performance_flags)

# === Upgrade ===

upgrade: activate ## Safe rolling upgrade with automatic rollback
	@if [ -z "$(VERSION)" ]; then \
		echo "$(RED)Error: VERSION required$(NC)"; \
		echo "Usage: make upgrade VERSION=v0.0.2"; \
		exit 1; \
	fi
	@echo "$(GREEN)>>> Starting safe rolling upgrade to $(VERSION)...$(NC)"
	@# Create upgrade backup
	@make backup BACKUP_TYPE=pre-upgrade
	@# Run upgrade with rollback support
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/rolling-upgrade.yml \
		-e "mitum_version=$(VERSION)" \
		-e "enable_rollback=yes" \
		-e "rollback_on_failure=yes" \
		$(call performance_flags) \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE))

# === Monitoring ===

logs: activate ## View logs (cross-platform)
	@echo "$(GREEN)>>> Fetching logs...$(NC)"
	@if [ "$(OS_TYPE)" = "macos" ]; then \
		echo "$(YELLOW)Note: Using alternative log method for macOS$(NC)"; \
		$(ANSIBLE) -i $(INVENTORY) mitum_nodes \
			-m shell -a "tail -n 50 /var/log/mitum/mitum.log || echo 'No logs found'" \
			--become $(call performance_flags); \
	else \
		$(ANSIBLE) -i $(INVENTORY) mitum_nodes \
			-m shell -a "journalctl -u mitum -n 50 --no-pager || tail -n 50 /var/log/mitum/mitum.log" \
			--become $(call performance_flags); \
	fi

# === Destructive Operations ===

clean-data: activate ## Clean blockchain data (PROTECTED)
	$(call confirm_action,This will DELETE all blockchain data!)
	@echo "$(RED)>>> Starting data cleanup...$(NC)"
	@# Create emergency backup first
	@make backup BACKUP_TYPE=emergency
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/clean-data.yml \
		--extra-vars "safety_confirmed=yes" \
		$(call performance_flags) \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE))

# === Backup & Restore ===

backup: activate ## Create timestamped backup with metadata
	@echo "$(GREEN)>>> Creating backup...$(NC)"
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/backup.yml \
		-e "backup_type=$${BACKUP_TYPE:-manual}" \
		-e "backup_timestamp=$$(date +%Y%m%d-%H%M%S)" \
		$(call performance_flags) \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE))

restore: activate ## Restore from backup with validation
	@if [ -z "$(BACKUP_TIMESTAMP)" ]; then \
		echo "$(RED)Error: BACKUP_TIMESTAMP required$(NC)"; \
		echo "Available backups:"; \
		@$(ANSIBLE) -i $(INVENTORY) mitum_nodes[0] -m shell \
			-a "ls -la /var/backups/mitum/" --become; \
		exit 1; \
	fi
	$(call confirm_action,This will restore from backup $(BACKUP_TIMESTAMP))
	@$(ANSIBLE_PLAYBOOK) -i $(INVENTORY) $(PLAYBOOK_DIR)/restore.yml \
		-e "backup_timestamp=$(BACKUP_TIMESTAMP)" \
		-e "validate_backup=yes" \
		$(call performance_flags) \
		$(if $(USE_VAULT),--vault-password-file=$(VAULT_PASSWORD_FILE))

# === Utility Commands ===

vault-edit: ## Edit vault-encrypted files
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE required$(NC)"; \
		echo "Usage: make vault-edit FILE=inventories/production/group_vars/vault.yml"; \
		exit 1; \
	fi
	@$(ANSIBLE_VAULT) edit $(FILE) --vault-password-file=$(VAULT_PASSWORD_FILE)

validate: activate ## Validate all playbooks and syntax
	@echo "$(YELLOW)>>> Validating Ansible files...$(NC)"
	@for playbook in $(PLAYBOOK_DIR)/*.yml; do \
		echo "Checking $$playbook..."; \
		$(ANSIBLE_PLAYBOOK) --syntax-check $$playbook; \
	done
	@echo "$(GREEN)✓ All playbooks valid$(NC)"

# === Development Helpers ===

dev-env: ## Setup development environment with safety defaults
	@echo "$(YELLOW)>>> Setting up development environment...$(NC)"
	@cp -n inventories/development/hosts.yml.example inventories/development/hosts.yml || true
	@echo "SAFE_MODE=no" >> .env.development
	@echo "DRY_RUN=yes" >> .env.development
	@echo "$(GREEN)✓ Development environment ready$(NC)"

# === Virtual Environment ===

venv: ## Create Python virtual environment
	@if [ ! -d "$(VENV)" ]; then \
		echo "$(GREEN)>>> Creating virtual environment...$(NC)"; \
		python3 -m venv $(VENV); \
		$(VENV)/bin/pip install --upgrade pip; \
		$(VENV)/bin/pip install -r requirements.txt; \
	fi

activate: venv ## Ensure virtual environment is active
	@if [ -z "$${VIRTUAL_ENV}" ]; then \
		echo "$(YELLOW)Activating virtual environment...$(NC)"; \
		. $(VENV)/bin/activate; \
	fi

# === Clean Commands ===

clean: ## Clean generated files and caches
	@echo "$(GREEN)>>> Cleaning temporary files...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@rm -rf .ansible_cache .ansible_inventory_cache
	@rm -rf logs/*.log
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean ## Deep clean including venv (CAREFUL!)
	$(call confirm_action,This will remove virtual environment and all dependencies)
	@rm -rf $(VENV)
	@rm -rf tools/mitumjs/node_modules
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

.PHONY: all $(MAKECMDGOALS) 
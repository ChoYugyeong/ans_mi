# Mitum Ansible Project Structure

## Directory Structure

```
mitum-ansible/
├── ansible.cfg              # Ansible configuration file
├── Makefile                 # Build and deployment commands
├── requirements.txt         # Python dependencies
├── README.md               # Project documentation
├── .gitignore              # Git exclude file
├── .vault_pass             # Ansible Vault password
├── playbooks/              # Ansible playbooks
│   ├── site.yml           # Main deployment playbook
│   ├── deploy-mitum.yml   # Mitum deployment
│   ├── backup.yml         # Backup
│   └── ...
├── roles/                  # Ansible roles
│   └── mitum/             # Mitum node role
├── inventories/            # Inventory
│   ├── development/       # Development environment
│   ├── staging/          # Staging environment
│   └── production/       # Production environment
├── keys/                  # SSH keys and Mitum keys
├── logs/                  # Log files
├── scripts/               # Utility scripts
└── tools/                 # Tools and scripts
```

## Key File Descriptions

- `ansible.cfg`: Ansible configuration (security, performance optimization)
- `Makefile`: Deployment and management commands
- `playbooks/`: Ansible playbook collection
- `roles/mitum/`: Mitum node configuration role
- `inventories/`: Environment-specific host and variable definitions
- `keys/`: SSH key and Mitum key storage

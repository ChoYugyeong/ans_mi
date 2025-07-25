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

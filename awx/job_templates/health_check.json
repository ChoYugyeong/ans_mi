# AWX Credentials Setup for Mitum

## Required Credentials

### 1. Mitum SSH Credential
- **Type**: Machine
- **Name**: Mitum SSH
- **Username**: ubuntu (or your SSH user)
- **SSH Private Key**: Your node access key
- **Privilege Escalation Method**: sudo
- **Privilege Escalation Username**: root

### 2. Bastion SSH Credential
- **Type**: Machine
- **Name**: Bastion SSH
- **Username**: ubuntu
- **SSH Private Key**: Your bastion key
- **SSH Private Key Passphrase**: (if applicable)

### 3. Mitum Vault Credential
- **Type**: Vault
- **Name**: Mitum Vault
- **Vault Password**: Your ansible vault password
- **Vault Identifier**: (optional)

### 4. MongoDB Credential
- **Type**: Custom Credential Type**
- **Name**: MongoDB Admin
- **Fields**:
  - mongodb_admin_user
  - mongodb_admin_password
  - mongodb_user
  - mongodb_password

### 5. AWX API Credential
- **Type**: Custom Credential Type**
- **Name**: AWX API
- **Fields**:
  - awx_url
  - awx_token

### 6. Monitoring Credential
- **Type**: Custom Credential Type**
- **Name**: Prometheus
- **Fields**:
  - prometheus_url
  - grafana_admin_password

## Custom Credential Type Definition

### MongoDB Credential Type
```yaml
fields:
  - id: mongodb_admin_user
    type: string
    label: MongoDB Admin Username
  - id: mongodb_admin_password
    type: string
    label: MongoDB Admin Password
    secret: true
  - id: mongodb_user
    type: string
    label: MongoDB User
  - id: mongodb_password
    type: string
    label: MongoDB Password
    secret: true
required:
  - mongodb_admin_user
  - mongodb_admin_password
injectors:
  extra_vars:
    mongodb_admin_user: '{{ mongodb_admin_user }}'
    mongodb_admin_password: '{{ mongodb_admin_password }}'
    mongodb_user: '{{ mongodb_user }}'
    mongodb_password: '{{ mongodb_password }}'
```

### AWX API Credential Type
```yaml
fields:
  - id: awx_url
    type: string
    label: AWX URL
  - id: awx_token
    type: string
    label: AWX Token
    secret: true
required:
  - awx_url
  - awx_token
injectors:
  env:
    AWX_URL: '{{ awx_url }}'
    AWX_TOKEN: '{{ awx_token }}'
```

## Setup Instructions

1. Create Custom Credential Types first
2. Create individual credentials
3. Attach to Job Templates as needed
4. Test with a simple ping job

## Security Best Practices

1. Use different SSH keys for bastion and nodes
2. Rotate credentials regularly
3. Use AWX RBAC to limit access
4. Enable credential rotation
5. Audit credential usage
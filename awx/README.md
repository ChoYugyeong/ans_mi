# AWX Integration for Mitum Ansible

This directory contains AWX/Tower integration files for enterprise-grade Mitum blockchain management.

## Overview

AWX provides:
- Web-based UI for Ansible playbook execution
- Role-based access control (RBAC)
- Job scheduling and automation
- Real-time job output and logging
- REST API for integration
- Webhook support for event-driven automation

## Directory Structure

```
awx/
├── README.md                    # This file
├── job_templates/              # Job template definitions
│   ├── deploy_mitum.json       # Main deployment template
│   ├── rolling_upgrade.json    # Zero-downtime upgrade
│   ├── health_check.json       # Health validation
│   └── recovery.json           # Automated recovery
├── workflows/                  # Workflow definitions
│   └── automated_recovery.json # Recovery workflow
├── surveys/                    # Survey specifications
│   ├── deployment_survey.json  # Deployment options
│   └── upgrade_survey.json     # Upgrade parameters
└── scripts/                    # Helper scripts
    └── import_templates.sh     # Import templates to AWX
```

## Prerequisites

1. **AWX Installation**
   - AWX 19.0+ or Ansible Tower 3.8+
   - PostgreSQL database
   - Redis for caching

2. **AWX CLI**
   ```bash
   pip install awxkit
   ```

3. **API Token**
   - Create in AWX UI: Settings → Users → Tokens
   - Export: `export AWX_TOKEN=your-token`

## Setup Instructions

### 1. Configure AWX Connection

```bash
# Set environment variables
export AWX_URL=https://awx.example.com
export AWX_TOKEN=your-token-here

# Test connection
awx config
```

### 2. Create Organization and Team

```bash
# Create organization
awx organizations create \
  --name "Mitum Operations" \
  --description "Mitum blockchain management"

# Create team
awx teams create \
  --name "Mitum Admins" \
  --organization "Mitum Operations"
```

### 3. Import Inventory

```bash
# Create inventory
awx inventories create \
  --name "Mitum Production" \
  --organization "Mitum Operations" \
  --variables @inventories/production/group_vars/all.yml

# Import hosts
awx inventory_sources create \
  --name "Mitum Nodes" \
  --inventory "Mitum Production" \
  --source "scm" \
  --source_path "inventories/production/hosts.yml"
```

### 4. Create Project

```bash
# Create project
awx projects create \
  --name "Mitum Ansible" \
  --organization "Mitum Operations" \
  --scm_type "git" \
  --scm_url "https://github.com/your-org/mitum-ansible.git" \
  --scm_branch "main" \
  --scm_update_on_launch true
```

### 5. Import Job Templates

```bash
# Import all templates
./awx/scripts/import_templates.sh

# Or import individually
awx import < awx/job_templates/deploy_mitum.json
awx import < awx/job_templates/rolling_upgrade.json
awx import < awx/job_templates/health_check.json
awx import < awx/job_templates/recovery.json
```

### 6. Create Workflows

```bash
# Import recovery workflow
awx import < awx/workflows/automated_recovery.json
```

## Job Templates

### Deploy Mitum
- **Purpose**: Full cluster deployment
- **Playbook**: `playbooks/deploy-mitum.yml`
- **Survey**: Deployment options (node count, network ID)
- **Credentials**: SSH, Vault

### Rolling Upgrade
- **Purpose**: Zero-downtime version upgrade
- **Playbook**: `playbooks/rolling-upgrade.yml`
- **Survey**: Version selection, maintenance window
- **Features**: 
  - Pre-flight checks
  - Sequential consensus node updates
  - API node maintenance mode

### Health Check
- **Purpose**: Cluster validation
- **Playbook**: `playbooks/validate.yml`
- **Schedule**: Every 5 minutes
- **Notifications**: Slack, email on failure

### Recovery
- **Purpose**: Automated node recovery
- **Playbook**: `playbooks/recovery.yml`
- **Trigger**: Webhook from monitoring
- **Actions**: Restart, resync, or full recovery

## Workflows

### Automated Recovery Workflow

```
Prometheus Alert
    ↓
Health Check Job
    ↓
[Success] ← → [Failure]
              ↓
         Recovery Job
              ↓
    [Success] ← → [Failure]
                     ↓
              Escalation
```

## Webhook Integration

### Configure Prometheus Alertmanager

```yaml
# alertmanager.yml
receivers:
  - name: 'awx-webhook'
    webhook_configs:
      - url: 'https://awx.example.com/api/v2/job_templates/123/launch/'
        http_config:
          bearer_token: 'your-awx-token'
```

### Webhook Payload

```json
{
  "extra_vars": {
    "alert_name": "{{ .GroupLabels.alertname }}",
    "node_name": "{{ .Labels.instance }}",
    "severity": "{{ .Labels.severity }}",
    "recovery_action": "auto"
  }
}
```

## Survey Examples

### Deployment Survey

```json
{
  "name": "Deployment Options",
  "spec": [
    {
      "question_name": "Network ID",
      "variable": "mitum_network_id",
      "type": "text",
      "default": "mitum",
      "required": true
    },
    {
      "question_name": "Node Count",
      "variable": "node_count",
      "type": "integer",
      "min": 3,
      "max": 100,
      "default": 5
    }
  ]
}
```

## Monitoring Dashboard

AWX provides built-in dashboards for:
- Job success/failure rates
- Average job duration
- Resource utilization
- User activity

### Custom Dashboard Queries

```sql
-- Failed jobs in last 24 hours
SELECT count(*) 
FROM main_job 
WHERE status = 'failed' 
  AND created > NOW() - INTERVAL '24 hours';

-- Average deployment time
SELECT AVG(EXTRACT(EPOCH FROM (finished - created))) as avg_seconds
FROM main_job
WHERE job_template_id = 123
  AND status = 'successful';
```

## Best Practices

1. **Use Surveys**: Make templates reusable with survey variables
2. **Set Timeouts**: Configure appropriate job timeouts
3. **Enable Notifications**: Set up alerts for critical jobs
4. **Version Control**: Store all AWX configurations in Git
5. **RBAC**: Implement proper role-based access
6. **Backup**: Regular AWX database backups
7. **Monitoring**: Integrate AWX metrics with Prometheus

## Troubleshooting

### Common Issues

1. **Job Stuck in Pending**
   - Check available capacity
   - Verify instance groups
   - Check resource limits

2. **Inventory Sync Failures**
   - Verify SCM credentials
   - Check network connectivity
   - Review source format

3. **Webhook Not Triggering**
   - Verify token permissions
   - Check webhook URL
   - Review AWX logs

### Debug Commands

```bash
# Check job output
awx jobs get <job_id>
awx jobs stdout <job_id>

# List failed jobs
awx jobs list --status failed

# Check capacity
awx instances list
```

## API Examples

### Launch Job via API

```bash
# Launch deployment
curl -X POST https://awx.example.com/api/v2/job_templates/123/launch/ \
  -H "Authorization: Bearer $AWX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extra_vars": {
      "mitum_network_id": "mainnet",
      "node_count": 5
    }
  }'
```

### Monitor Job Status

```python
import requests
import time

def monitor_job(job_id, token):
    headers = {'Authorization': f'Bearer {token}'}
    
    while True:
        r = requests.get(
            f'https://awx.example.com/api/v2/jobs/{job_id}/',
            headers=headers
        )
        job = r.json()
        
        print(f"Status: {job['status']}")
        
        if job['status'] in ['successful', 'failed', 'error', 'canceled']:
            break
            
        time.sleep(5)
    
    return job['status']
```

## Support

- AWX Documentation: https://docs.ansible.com/awx/
- AWX GitHub: https://github.com/ansible/awx
- Community: https://groups.google.com/g/awx-project
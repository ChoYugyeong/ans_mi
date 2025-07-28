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

1. **Credentials Management**
   - Use AWX credential types
   - Rotate tokens regularly
   - Separate prod/staging credentials

2. **Job Template Design**
   - Use surveys for user input
   - Set appropriate timeouts
   - Enable concurrent jobs carefully

3. **Workflow Optimization**
   - Chain related jobs
   - Use conditional paths
   - Add approval nodes for critical ops

4. **Monitoring Integration**
   - Configure notifications
   - Set up webhook receivers
   - Create custom alerts

5. **Security**
   - Enable RBAC
   - Audit job executions
   - Use encrypted variables

## Troubleshooting

### Common Issues

1. **Job fails with "Host unreachable"**
   ```bash
   # Check SSH connectivity
   awx ad_hoc_commands create \
     --inventory "Mitum Production" \
     --module_name ping
   ```

2. **Slow job execution**
   - Enable fact caching
   - Use mitogen strategy
   - Optimize gather_facts

3. **Webhook not triggering**
   - Verify token permissions
   - Check webhook logs
   - Test with curl

### Debug Commands

```bash
# View job output
awx jobs get <job_id>

# List recent failures
awx jobs list --status failed --created__gt $(date -d '1 day ago' -Iseconds)

# Export job logs
awx jobs stdout <job_id> > job_output.txt
```

## API Examples

### Launch Job via API

```bash
curl -X POST https://awx.example.com/api/v2/job_templates/123/launch/ \
  -H "Authorization: Bearer $AWX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extra_vars": {
      "mitum_version": "3.0.0",
      "target_nodes": "mitum-node-01,mitum-node-02"
    }
  }'
```

### Monitor Job Progress

```python
import requests
import time

def monitor_job(job_id, token, awx_url):
    headers = {'Authorization': f'Bearer {token}'}
    
    while True:
        response = requests.get(
            f'{awx_url}/api/v2/jobs/{job_id}/',
            headers=headers
        )
        job = response.json()
        
        print(f"Status: {job['status']}")
        
        if job['status'] in ['successful', 'failed', 'canceled']:
            break
            
        time.sleep(5)
    
    return job['status']
```

## Integration with CI/CD

### GitLab CI Example

```yaml
deploy_mitum:
  stage: deploy
  script:
    - |
      JOB_ID=$(curl -s -X POST $AWX_URL/api/v2/job_templates/$TEMPLATE_ID/launch/ \
        -H "Authorization: Bearer $AWX_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"extra_vars": {"version": "'$CI_COMMIT_TAG'"}}' \
        | jq -r '.id')
    - |
      while true; do
        STATUS=$(curl -s $AWX_URL/api/v2/jobs/$JOB_ID/ \
          -H "Authorization: Bearer $AWX_TOKEN" \
          | jq -r '.status')
        echo "Job status: $STATUS"
        [[ "$STATUS" == "successful" ]] && exit 0
        [[ "$STATUS" == "failed" ]] && exit 1
        sleep 10
      done
  only:
    - tags
```

## Resources

- [AWX Documentation](https://docs.ansible.com/ansible-tower/)
- [AWX API Reference](https://docs.ansible.com/ansible-tower/latest/html/towerapi/index.html)
- [Mitum Ansible Repository](https://github.com/your-org/mitum-ansible)

---

For support, contact the Mitum Operations team or create an issue in the repository.
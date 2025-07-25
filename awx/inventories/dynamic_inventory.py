#!/usr/bin/env python3
"""
Dynamic inventory script for AWX to discover Mitum nodes from Prometheus
"""

import json
import os
import sys
import requests
from urllib.parse import urljoin

class MitumInventory:
    def __init__(self):
        self.inventory = {}
        self.read_cli_args()
        
        # Configuration from environment
        self.prometheus_url = os.environ.get('PROMETHEUS_URL', 'http://prometheus:9090')
        self.network_id = os.environ.get('MITUM_NETWORK_ID', 'mainnet')
        
        # Generate inventory
        if self.args.list:
            self.inventory = self.get_inventory()
        elif self.args.host:
            self.inventory = self.get_host_info(self.args.host)
        else:
            self.inventory = self.empty_inventory()
        
        print(json.dumps(self.inventory))
    
    def get_inventory(self):
        inventory = {
            'mitum_nodes': {
                'hosts': [],
                'vars': {
                    'mitum_network_id': self.network_id,
                    'ansible_ssh_common_args': '-o ProxyCommand="ssh -W %h:%p bastion"'
                }
            },
            '_meta': {
                'hostvars': {}
            }
        }
        
        # Query Prometheus for active nodes
        try:
            response = requests.get(
                urljoin(self.prometheus_url, '/api/v1/query'),
                params={'query': 'up{job="mitum"}'}
            )
            data = response.json()
            
            if data['status'] == 'success':
                for result in data['data']['result']:
                    metric = result['metric']
                    value = result['value'][1]
                    
                    if value == '1':  # Node is up
                        hostname = metric.get('instance', '').split(':')[0]
                        node_type = metric.get('node_type', 'consensus')
                        
                        # Add to hosts
                        inventory['mitum_nodes']['hosts'].append(hostname)
                        
                        # Add host variables
                        inventory['_meta']['hostvars'][hostname] = {
                            'ansible_host': hostname,
                            'mitum_node_type': node_type,
                            'mitum_api_enabled': node_type == 'api',
                            'mitum_metrics_endpoint': f"http://{hostname}:9099/metrics"
                        }
        except Exception as e:
            sys.stderr.write(f"Error querying Prometheus: {e}\n")
        
        return inventory
    
    def get_host_info(self, host):
        """Get variables for a specific host"""
        return self.get_inventory()['_meta']['hostvars'].get(host, {})
    
    def empty_inventory(self):
        return {'_meta': {'hostvars': {}}}
    
    def read_cli_args(self):
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument('--list', action='store_true')
        parser.add_argument('--host', action='store')
        self.args = parser.parse_args()

if __name__ == '__main__':
    MitumInventory()
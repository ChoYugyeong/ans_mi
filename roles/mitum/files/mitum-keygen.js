#!/usr/bin/env node
/**
 * Mitum Key Generator using MitumJS SDK
 * Generates keys for Mitum nodes with support for multi-sig
 * Version: 2.0.0 - ESM Module version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fix crypto issue for Node.js environments
if (!global.crypto) {
    global.crypto = crypto.webcrypto || {
        getRandomValues: (arr) => crypto.randomBytes(arr.length)
    };
}

// Import MitumJS
import { Keypair, Address } from '@mitumjs/mitumjs';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    networkId: 'mitum',
    nodeCount: 1,
    threshold: 100,
    output: './keys',
    type: 'btc',
    seed: null
};

// Help function
function showHelp() {
    console.log(`
Mitum Key Generator
Usage: node mitum-keygen.js [options]

Options:
  --network-id <id>    Network ID (default: mitum)
  --node-count <n>     Number of nodes (default: 1)
  --threshold <n>      Threshold percentage for multi-sig (default: 100)
  --output <dir>       Output directory (default: ./keys)
  --type <type>        Key type: btc, ether, stellar (default: btc)
  --seed <seed>        Seed for deterministic generation (optional)
  --help               Show this help message

Example:
  node mitum-keygen.js --network-id mainnet --node-count 5 --threshold 80
`);
    process.exit(0);
}

// Parse arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
        showHelp();
    }
    
    if (arg.startsWith('--') && i + 1 < args.length) {
        const key = arg.replace('--', '');
        const value = args[i + 1];
        
        switch (key) {
            case 'network-id':
                options.networkId = value;
                i++;
                break;
            case 'node-count':
                options.nodeCount = parseInt(value);
                i++;
                break;
            case 'threshold':
                options.threshold = parseInt(value);
                i++;
                break;
            case 'output':
                options.output = value;
                i++;
                break;
            case 'type':
                if (!['btc', 'ether', 'stellar'].includes(value)) {
                    console.error(`Error: Invalid key type '${value}'. Must be btc, ether, or stellar`);
                    process.exit(1);
                }
                options.type = value;
                i++;
                break;
            case 'seed':
                options.seed = value;
                i++;
                break;
        }
    }
}

// Validate options
if (options.nodeCount < 1) {
    console.error('Error: node-count must be at least 1');
    process.exit(1);
}

if (options.threshold < 1 || options.threshold > 100) {
    console.error('Error: threshold must be between 1 and 100');
    process.exit(1);
}

// Create output directory
const outputDir = path.resolve(options.output);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate keys function
async function generateKeys() {
    const keys = [];
    const summary = {
        network_id: options.networkId,
        generated_at: new Date().toISOString(),
        node_count: options.nodeCount,
        threshold: options.threshold,
        key_type: options.type,
        nodes: []
    };

    console.log(`Mitum Key Generator v2.0.0`);
    console.log(`========================`);
    console.log(`Network ID: ${options.networkId}`);
    console.log(`Node Count: ${options.nodeCount}`);
    console.log(`Key Type: ${options.type}`);
    console.log(`Threshold: ${options.threshold}%`);
    console.log(`Output Dir: ${outputDir}`);
    console.log(`\nGenerating keys...`);

    try {
        for (let i = 0; i < options.nodeCount; i++) {
            // Generate keypair with error handling
            let keypair;
            try {
                const seed = options.seed ? `${options.seed}-node${i}` : null;
                keypair = Keypair.random(options.type, seed);
            } catch (error) {
                console.error(`Error generating keypair for node ${i}:`, error.message);
                process.exit(1);
            }

            const nodeData = {
                index: i,
                node_name: `node${i}`,
                address: keypair.publickey.toString(),
                public_key: keypair.publickey.toString(),
                private_key: keypair.privatekey.toString(),
                type: options.type,
                network_id: options.networkId
            };

            keys.push(nodeData);
            summary.nodes.push({
                index: i,
                node_name: nodeData.node_name,
                address: nodeData.address,
                public_key: nodeData.public_key
            });

            // Save individual key file
            const keyFile = path.join(outputDir, `node${i}.json`);
            fs.writeFileSync(keyFile, JSON.stringify(nodeData, null, 2));
            console.log(`✓ Generated keys for node${i}`);

            // Also save in PEM format for compatibility
            const pemFile = path.join(outputDir, `node${i}-private.pem`);
            fs.writeFileSync(pemFile, `-----BEGIN PRIVATE KEY-----\n${nodeData.private_key}\n-----END PRIVATE KEY-----\n`);
            fs.chmodSync(pemFile, 0o600);
        }

        // Generate genesis account if multiple nodes
        if (options.nodeCount > 1) {
            const publicKeys = keys.map(k => ({ 
                key: k.public_key, 
                weight: Math.floor(100 / options.nodeCount) 
            }));
            
            // Adjust last key weight to ensure total is 100
            const totalWeight = publicKeys.reduce((sum, k) => sum + k.weight, 0);
            if (totalWeight < 100) {
                publicKeys[publicKeys.length - 1].weight += (100 - totalWeight);
            }
            
            const genesisAddress = new Address(publicKeys, options.threshold, options.networkId);
            
            summary.genesis_account = {
                address: genesisAddress.toString(),
                threshold: options.threshold,
                keys: publicKeys
            };

            // Save genesis account file
            const genesisFile = path.join(outputDir, 'genesis-account.json');
            fs.writeFileSync(genesisFile, JSON.stringify(summary.genesis_account, null, 2));
            console.log(`✓ Generated genesis account`);
        }

        // Save summary
        const summaryFile = path.join(outputDir, 'keys-summary.json');
        fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
        
        // Create a simple text summary for easy reading
        const readmePath = path.join(outputDir, 'README.txt');
        const readmeContent = `Mitum Keys Generated
====================
Date: ${summary.generated_at}
Network ID: ${options.networkId}
Node Count: ${options.nodeCount}
Key Type: ${options.type}
Threshold: ${options.threshold}%

Node Keys:
${summary.nodes.map(n => `- ${n.node_name}: ${n.address}`).join('\n')}

${summary.genesis_account ? `Genesis Account:
Address: ${summary.genesis_account.address}
Threshold: ${summary.genesis_account.threshold}%` : ''}

Files Generated:
- keys-summary.json : Complete summary in JSON format
- node*.json : Individual node key files
- node*-private.pem : Private keys in PEM format
${summary.genesis_account ? '- genesis-account.json : Genesis account details' : ''}

IMPORTANT: Keep these files secure! Private keys should never be shared.
`;
        fs.writeFileSync(readmePath, readmeContent);
        
        console.log(`\n✅ Key generation complete!`);
        console.log(`📁 Files saved to: ${outputDir}`);
        console.log(`📄 Summary: ${summaryFile}`);
        
        // Display summary
        console.log('\n--- Key Generation Summary ---');
        console.log(`Network ID: ${summary.network_id}`);
        console.log(`Nodes: ${summary.node_count}`);
        console.log(`Type: ${summary.key_type}`);
        if (summary.genesis_account) {
            console.log(`\nGenesis Account: ${summary.genesis_account.address}`);
            console.log(`Threshold: ${summary.genesis_account.threshold}%`);
        }

    } catch (error) {
        console.error('\n❌ Error during key generation:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run key generation
generateKeys().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
#!/bin/bash
# start.sh - Simple start script for Mitum deployment
# This script provides the easiest way to start Mitum deployment

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Detect script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║     Welcome to Mitum Blockchain!         ║"
echo "║     Easy Deployment Tool v4.0.0          ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}This script will help you deploy Mitum blockchain easily.${NC}"
echo ""

# Check if this is first run
if [[ ! -d "$SCRIPT_DIR/venv" ]]; then
    echo -e "${YELLOW}First time setup detected!${NC}"
    echo "Running initial setup..."
    echo ""
    
    if [[ -f "$SCRIPT_DIR/scripts/setup.sh" ]]; then
        bash "$SCRIPT_DIR/scripts/setup.sh"
    else
        echo "Please run: make setup"
        exit 1
    fi
fi

# Run interactive deployment
echo -e "${GREEN}Starting interactive deployment...${NC}"
echo ""

if [[ -f "$SCRIPT_DIR/scripts/deploy-mitum.sh" ]]; then
    bash "$SCRIPT_DIR/scripts/deploy-mitum.sh" --interactive
else
    echo "Error: deploy-mitum.sh not found!"
    exit 1
fi
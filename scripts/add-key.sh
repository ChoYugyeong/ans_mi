#!/bin/bash
# Simple key addition script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
KEYS_DIR="$ROOT_DIR/keys"

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <environment> <key-file> [name]"
    echo "Example: $0 production ~/mitum_sit.pem bastion.pem"
    exit 1
fi

ENV=$1
SOURCE=$2
NAME=${3:-$(basename "$SOURCE")}

# Validate environment
if [[ ! "$ENV" =~ ^(production|staging|development)$ ]]; then
    echo -e "${RED}Error: Invalid environment '$ENV'${NC}"
    echo "Valid: production, staging, development"
    exit 1
fi

# Check source file
if [ ! -f "$SOURCE" ]; then
    echo -e "${RED}Error: Key file not found: $SOURCE${NC}"
    exit 1
fi

# Create directory
mkdir -p "$KEYS_DIR/ssh/$ENV"

# Copy key
TARGET="$KEYS_DIR/ssh/$ENV/$NAME"
cp "$SOURCE" "$TARGET"
chmod 600 "$TARGET"

echo -e "${GREEN}✓ Key added successfully${NC}"
echo "  Environment: $ENV"
echo "  Key name: $NAME"
echo "  Location: $TARGET"

# List all keys
echo -e "\n${GREEN}Current keys in $ENV:${NC}"
ls -la "$KEYS_DIR/ssh/$ENV/"
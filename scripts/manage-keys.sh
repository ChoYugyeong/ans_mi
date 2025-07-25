#!/bin/bash
# Key management helper script

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
KEYS_DIR="$ROOT_DIR/keys"

usage() {
    cat << USAGE
${GREEN}SSH Key Management Helper${NC}

Manage SSH keys for Mitum Ansible deployments.

${YELLOW}Usage:${NC} 
    $0 [COMMAND] [OPTIONS]

${YELLOW}Commands:${NC}
    add <env> <source> [name]   Add SSH key to project
    list                        List all SSH keys
    check                       Check key permissions
    fix                         Fix key permissions (set to 600)
    show <env>                  Show keys for specific environment
    remove <env> <name>         Remove a key

${YELLOW}Arguments:${NC}
    env         Environment (production, staging, development)
    source      Source key file path
    name        Target key name (default: keeps original name)

${YELLOW}Examples:${NC}
    # Add AWS key as bastion key for production
    $0 add production ~/Downloads/aws-key.pem bastion.pem
    
    # Add same key for nodes
    $0 add production ~/Downloads/aws-key.pem nodes.pem
    
    # List all keys
    $0 list
    
    # Check permissions
    $0 check
    
    # Fix permissions
    $0 fix
    
    # Show production keys
    $0 show production
    
    # Remove a key
    $0 remove staging old-key.pem

${YELLOW}Key Naming Convention:${NC}
    bastion.pem     - For bastion host access
    nodes.pem       - For node access
    <custom>.pem    - Custom key names

USAGE
}

# Add key function
add_key() {
    local env=$1
    local source=$2
    local name=${3:-}
    
    # Validate environment
    if [[ ! "$env" =~ ^(production|staging|development)$ ]]; then
        echo -e "${RED}Error: Invalid environment '$env'${NC}"
        echo "Valid environments: production, staging, development"
        exit 1
    fi
    
    # Check source file
    if [[ ! -f "$source" ]]; then
        echo -e "${RED}Error: Source key file not found: $source${NC}"
        exit 1
    fi
    
    # Determine target name
    if [[ -z "$name" ]]; then
        name=$(basename "$source")
    fi
    
    # Validate key extension
    if [[ ! "$name" =~ \.(pem|key)$ ]]; then
        echo -e "${YELLOW}Warning: Key file should have .pem or .key extension${NC}"
    fi
    
    # Create directory if needed
    mkdir -p "$KEYS_DIR/ssh/$env"
    
    # Target path
    local target="$KEYS_DIR/ssh/$env/$name"
    
    # Check if exists
    if [[ -f "$target" ]]; then
        echo -ne "${YELLOW}Key already exists. Overwrite? [y/N]: ${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Cancelled"
            exit 0
        fi
    fi
    
    # Copy key
    cp "$source" "$target"
    chmod 600 "$target"
    
    echo -e "${GREEN}✓ Key added successfully${NC}"
    echo -e "  Environment: ${BLUE}$env${NC}"
    echo -e "  Key name: ${BLUE}$name${NC}"
    echo -e "  Location: ${BLUE}$target${NC}"
    
    # Show usage hint
    if [[ "$name" == "bastion.pem" ]] || [[ "$name" == "nodes.pem" ]]; then
        echo -e "\n${YELLOW}This key will be automatically used when generating inventory for $env environment${NC}"
    fi
}

# List keys function
list_keys() {
    echo -e "${GREEN}=== SSH Keys in Project ===${NC}\n"
    
    local found_any=false
    
    for env in production staging development; do
        echo -e "${BLUE}[$env]${NC}"
        
        if [[ -d "$KEYS_DIR/ssh/$env" ]]; then
            local found=false
            for key in "$KEYS_DIR/ssh/$env"/*.pem "$KEYS_DIR/ssh/$env"/*.key 2>/dev/null; do
                if [[ -f "$key" ]]; then
                    found=true
                    found_any=true
                    local perms=$(stat -c %a "$key" 2>/dev/null || stat -f %p "$key" 2>/dev/null | tail -c 4)
                    local size=$(du -h "$key" | cut -f1)
                    local modified=$(stat -c %y "$key" 2>/dev/null || stat -f "%Sm" "$key" 2>/dev/null)
                    modified=${modified%% *}  # Get just the date
                    
                    local name=$(basename "$key")
                    local status="OK"
                    local color=$GREEN
                    
                    if [[ "$perms" != "600" ]]; then
                        status="Wrong permissions"
                        color=$RED
                    fi
                    
                    printf "  %-20s %s %-5s %-10s %s\n" \
                        "$name" \
                        "($perms)" \
                        "$size" \
                        "$modified" \
                        "$(echo -e "$color$status$NC")"
                fi
            done
            
            if [[ "$found" == "false" ]]; then
                echo "  (no keys)"
            fi
        else
            echo "  (no keys)"
        fi
        echo ""
    done
    
    if [[ "$found_any" == "false" ]]; then
        echo -e "${YELLOW}No SSH keys found in project${NC}"
        echo -e "Add keys using: $0 add <environment> <key-file>"
    fi
}

# Show specific environment
show_env() {
    local env=$1
    
    if [[ ! "$env" =~ ^(production|staging|development)$ ]]; then
        echo -e "${RED}Error: Invalid environment '$env'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}SSH Keys for $env:${NC}\n"
    
    if [[ -d "$KEYS_DIR/ssh/$env" ]]; then
        local found=false
        for key in "$KEYS_DIR/ssh/$env"/*.pem "$KEYS_DIR/ssh/$env"/*.key 2>/dev/null; do
            if [[ -f "$key" ]]; then
                found=true
                local name=$(basename "$key")
                local perms=$(stat -c %a "$key" 2>/dev/null || stat -f %p "$key" 2>/dev/null | tail -c 4)
                local fingerprint=$(ssh-keygen -l -f "$key" 2>/dev/null | awk '{print $2}' || echo "N/A")
                
                echo -e "${BLUE}$name${NC}"
                echo "  Path: $key"
                echo "  Permissions: $perms"
                echo "  Fingerprint: $fingerprint"
                echo ""
            fi
        done
        
        if [[ "$found" == "false" ]]; then
            echo "(no keys found)"
        fi
    else
        echo "(no keys directory)"
    fi
}

# Check permissions
check_permissions() {
    echo -e "${GREEN}Checking SSH key permissions...${NC}\n"
    
    local errors=0
    local checked=0
    
    find "$KEYS_DIR/ssh" -type f \( -name "*.pem" -o -name "*.key" \) 2>/dev/null | while IFS= read -r key; do
        ((checked++))
        local perms=$(stat -c %a "$key" 2>/dev/null || stat -f %p "$key" 2>/dev/null | tail -c 4)
        local relpath=${key#$KEYS_DIR/ssh/}
        
        if [[ "$perms" != "600" ]]; then
            echo -e "${RED}✗ Wrong permissions ($perms):${NC} $relpath"
            ((errors++))
        else
            echo -e "${GREEN}✓ OK:${NC} $relpath"
        fi
    done
    
    if [[ $checked -eq 0 ]]; then
        echo -e "${YELLOW}No SSH keys found to check${NC}"
    elif [[ $errors -eq 0 ]]; then
        echo -e "\n${GREEN}All $checked keys have correct permissions (600)${NC}"
    else
        echo -e "\n${RED}Found $errors keys with incorrect permissions${NC}"
        echo -e "Run '${BLUE}$0 fix${NC}' to fix permissions automatically"
    fi
}

# Fix permissions
fix_permissions() {
    echo -e "${GREEN}Fixing SSH key permissions...${NC}\n"
    
    local fixed=0
    
    find "$KEYS_DIR/ssh" -type f \( -name "*.pem" -o -name "*.key" \) 2>/dev/null | while IFS= read -r key; do
        local perms=$(stat -c %a "$key" 2>/dev/null || stat -f %p "$key" 2>/dev/null | tail -c 4)
        local relpath=${key#$KEYS_DIR/ssh/}
        
        if [[ "$perms" != "600" ]]; then
            chmod 600 "$key"
            echo -e "${GREEN}✓ Fixed:${NC} $relpath (was $perms, now 600)"
            ((fixed++))
        fi
    done
    
    if [[ $fixed -eq 0 ]]; then
        echo -e "${GREEN}All keys already have correct permissions${NC}"
    else
        echo -e "\n${GREEN}Fixed permissions for $fixed key(s)${NC}"
    fi
}

# Remove key
remove_key() {
    local env=$1
    local name=$2
    
    if [[ ! "$env" =~ ^(production|staging|development)$ ]]; then
        echo -e "${RED}Error: Invalid environment '$env'${NC}"
        exit 1
    fi
    
    local key_path="$KEYS_DIR/ssh/$env/$name"
    
    if [[ ! -f "$key_path" ]]; then
        echo -e "${RED}Error: Key not found: $key_path${NC}"
        exit 1
    fi
    
    echo -ne "${YELLOW}Remove key '$name' from $env? [y/N]: ${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -f "$key_path"
        echo -e "${GREEN}✓ Key removed${NC}"
    else
        echo "Cancelled"
    fi
}

# Main execution
case "${1:-help}" in
    add)
        if [[ $# -lt 3 ]]; then
            echo -e "${RED}Error: Missing arguments${NC}"
            echo "Usage: $0 add <environment> <source-key-file> [target-name]"
            echo "Example: $0 add production ~/Downloads/aws-key.pem bastion.pem"
            exit 1
        fi
        add_key "$2" "$3" "${4:-}"
        ;;
    
    list)
        list_keys
        ;;
    
    show)
        if [[ $# -lt 2 ]]; then
            echo -e "${RED}Error: Missing environment${NC}"
            echo "Usage: $0 show <environment>"
            exit 1
        fi
        show_env "$2"
        ;;
    
    check)
        check_permissions
        ;;
    
    fix)
        fix_permissions
        ;;
    
    remove)
        if [[ $# -lt 3 ]]; then
            echo -e "${RED}Error: Missing arguments${NC}"
            echo "Usage: $0 remove <environment> <key-name>"
            exit 1
        fi
        remove_key "$2" "$3"
        ;;
    
    help|--help|-h)
        usage
        ;;
    
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        usage
        exit 1
        ;;
esac
#!/bin/bash

# Mitum Ansible Autocomplete Script
# Enhanced bash completion for Makefile targets

_mitum_ansible_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
    
    # Extract make targets from Makefile
    local targets=$(grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile 2>/dev/null | awk -F':' '{print $1}' | sort -u)
    
    # Environment options
    local environments="development staging production"
    
    # Common options
    local options="ENV= DRY_RUN= SAFE_MODE= PARALLEL_FORKS= USE_VAULT="
    
    case "${prev}" in
        ENV=)
            COMPREPLY=( $(compgen -W "${environments}" -- ${cur}) )
            return 0
            ;;
        DRY_RUN=|SAFE_MODE=|USE_VAULT=)
            COMPREPLY=( $(compgen -W "yes no" -- ${cur}) )
            return 0
            ;;
        PARALLEL_FORKS=)
            COMPREPLY=( $(compgen -W "25 50 75 100" -- ${cur}) )
            return 0
            ;;
        make)
            # Show all targets and common options
            COMPREPLY=( $(compgen -W "${targets} ${options}" -- ${cur}) )
            return 0
            ;;
        *)
            # Check if we're completing an option
            if [[ ${cur} == *=* ]]; then
                local option="${cur%%=*}="
                local value="${cur#*=}"
                
                case "${option}" in
                    ENV=)
                        COMPREPLY=( $(compgen -W "${environments}" -P "${option}" -- ${value}) )
                        ;;
                    DRY_RUN=|SAFE_MODE=|USE_VAULT=)
                        COMPREPLY=( $(compgen -W "yes no" -P "${option}" -- ${value}) )
                        ;;
                    PARALLEL_FORKS=)
                        COMPREPLY=( $(compgen -W "25 50 75 100" -P "${option}" -- ${value}) )
                        ;;
                esac
            else
                # Show options for current context
                COMPREPLY=( $(compgen -W "${options}" -- ${cur}) )
            fi
            ;;
    esac
}

# Register completion
complete -F _mitum_ansible_completion make

# Install instructions
echo "# Mitum Ansible Autocomplete Installed!"
echo "# To enable permanently, add this line to your ~/.bashrc or ~/.zshrc:"
echo "# source $(pwd)/scripts/autocomplete.sh" 
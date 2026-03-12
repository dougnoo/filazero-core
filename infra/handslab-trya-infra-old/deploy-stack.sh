#!/bin/bash

# Trya Infrastructure - Stack Deploy Script
# Deploy individual stacks for different environments

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Available stacks
VALID_STACKS="network frontend backend platform chat chat-agents"

# Usage function
usage() {
    echo -e "${BLUE}Trya Infrastructure - Stack Deploy${NC}"
    echo ""
    echo "Usage: ./deploy-stack.sh <environment> <stack> [action]"
    echo ""
    echo "Arguments:"
    echo "  environment   Environment to deploy (dev, hml, prod)"
    echo "  stack         Stack to deploy (${VALID_STACKS})"
    echo "  action        Terraform action (plan, apply, destroy) - default: plan"
    echo ""
    echo "Examples:"
    echo "  ./deploy-stack.sh dev network plan"
    echo "  ./deploy-stack.sh hml frontend apply"
    echo "  ./deploy-stack.sh dev backend destroy"
    echo ""
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
fi

ENVIRONMENT=$1
STACK=$2
ACTION=${3:-plan}

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "hml" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}Invalid environment. Use 'dev', 'hml', or 'prod'${NC}"
    exit 1
fi

# Validate stack
if [[ ! " $VALID_STACKS " =~ " $STACK " ]]; then
    echo -e "${RED}Invalid stack. Valid stacks: ${VALID_STACKS}${NC}"
    exit 1
fi

# Validate action
if [[ "$ACTION" != "plan" && "$ACTION" != "apply" && "$ACTION" != "destroy" && "$ACTION" != "init" ]]; then
    echo -e "${RED}Invalid action. Use 'init', 'plan', 'apply', or 'destroy'${NC}"
    exit 1
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Trya Infrastructure - Stack Deploy${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "  Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "  Stack:       ${YELLOW}${STACK}${NC}"
echo -e "  Action:      ${YELLOW}${ACTION}${NC}"
echo ""

# Configuration files
STACK_DIR="stacks/${STACK}"
BACKEND_CONFIG="environments/${ENVIRONMENT}/${STACK}.backend.conf"
TFVARS_FILE="environments/${ENVIRONMENT}/${STACK}.tfvars"

# Check if stack directory exists
if [ ! -d "$STACK_DIR" ]; then
    echo -e "${RED}Stack directory not found: ${STACK_DIR}${NC}"
    exit 1
fi

# Check if configuration files exist
if [ ! -f "$BACKEND_CONFIG" ]; then
    echo -e "${RED}Backend configuration not found: ${BACKEND_CONFIG}${NC}"
    exit 1
fi

if [ ! -f "$TFVARS_FILE" ]; then
    echo -e "${RED}Variables file not found: ${TFVARS_FILE}${NC}"
    exit 1
fi

# Change to stack directory
cd "$STACK_DIR"

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init -backend-config="../../${BACKEND_CONFIG}" -upgrade

echo ""

# Execute action
case $ACTION in
    init)
        echo -e "${GREEN}Initialization completed successfully${NC}"
        ;;

    plan)
        echo -e "${YELLOW}Running Terraform Plan...${NC}"
        terraform plan -var-file="../../${TFVARS_FILE}" -out=tfplan
        echo ""
        echo -e "${GREEN}Plan completed successfully${NC}"
        echo -e "  To apply: ${YELLOW}./deploy-stack.sh ${ENVIRONMENT} ${STACK} apply${NC}"
        ;;
    
    apply)
        echo -e "${YELLOW}Running Terraform Apply...${NC}"
        
        # Check if plan file exists
        if [ -f "tfplan" ]; then
            echo -e "  Using existing plan file..."
            terraform apply tfplan
            rm -f tfplan
        else
            echo -e "  No plan file found. Running plan first..."
            terraform plan -var-file="../../${TFVARS_FILE}" -out=tfplan
            echo ""
            read -p "Do you want to apply these changes? (yes/no): " CONFIRM
            
            if [ "$CONFIRM" == "yes" ]; then
                terraform apply tfplan
                rm -f tfplan
            else
                echo -e "${YELLOW}Apply cancelled${NC}"
                rm -f tfplan
                exit 0
            fi
        fi
        
        echo ""
        echo -e "${GREEN}Stack deployed successfully!${NC}"
        echo ""
        echo -e "${YELLOW}Outputs:${NC}"
        terraform output
        ;;
    
    destroy)
        echo -e "${RED}WARNING: This will destroy all resources in ${ENVIRONMENT}/${STACK}!${NC}"
        read -p "Are you absolutely sure? Type '${ENVIRONMENT}-${STACK}-destroy' to confirm: " CONFIRM
        
        if [ "$CONFIRM" == "${ENVIRONMENT}-${STACK}-destroy" ]; then
            echo -e "${YELLOW}Destroying infrastructure...${NC}"
            terraform destroy -var-file="../../${TFVARS_FILE}" -auto-approve
            echo -e "${GREEN}Infrastructure destroyed${NC}"
        else
            echo -e "${YELLOW}Destroy cancelled${NC}"
            exit 0
        fi
        ;;
esac

echo ""

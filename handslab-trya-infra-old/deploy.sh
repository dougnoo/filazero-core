#!/bin/bash

# Trya Infrastructure - Deploy Script
# Quick deploy script for different environments

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Usage: ./deploy.sh [dev|hml] [plan|apply|destroy]${NC}"
    exit 1
fi

ENVIRONMENT=$1
ACTION=${2:-plan}

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "hml" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'dev' or 'hml'${NC}"
    exit 1
fi

# Validate action
if [[ "$ACTION" != "plan" && "$ACTION" != "apply" && "$ACTION" != "destroy" ]]; then
    echo -e "${RED}❌ Invalid action. Use 'plan', 'apply', or 'destroy'${NC}"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Trya Infrastructure - Deploy${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "  Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "  Action:      ${YELLOW}${ACTION}${NC}"
echo ""

# Configuration files
TFVARS_FILE="environments/${ENVIRONMENT}/terraform.tfvars"
BACKEND_CONFIG="environments/${ENVIRONMENT}/backend.conf"

# Check if configuration files exist
if [ ! -f "$TFVARS_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found: ${TFVARS_FILE}${NC}"
    exit 1
fi

if [ ! -f "$BACKEND_CONFIG" ]; then
    echo -e "${RED}❌ Backend configuration not found: ${BACKEND_CONFIG}${NC}"
    exit 1
fi

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init -backend-config="$BACKEND_CONFIG" -upgrade

echo ""

# Execute action
case $ACTION in
    plan)
        echo -e "${YELLOW}Running Terraform Plan...${NC}"
        terraform plan -var-file="$TFVARS_FILE" -out=tfplan
        echo ""
        echo -e "${GREEN}✓ Plan completed successfully${NC}"
        echo -e "  To apply: ${YELLOW}./deploy.sh ${ENVIRONMENT} apply${NC}"
        ;;
    
    apply)
        echo -e "${YELLOW}Running Terraform Apply...${NC}"
        
        # Check if plan file exists
        if [ -f "tfplan" ]; then
            echo -e "  Using existing plan file..."
            terraform apply tfplan
            rm tfplan
        else
            echo -e "  No plan file found. Running plan first..."
            terraform plan -var-file="$TFVARS_FILE" -out=tfplan
            echo ""
            read -p "Do you want to apply these changes? (yes/no): " CONFIRM
            
            if [ "$CONFIRM" == "yes" ]; then
                terraform apply tfplan
                rm tfplan
            else
                echo -e "${YELLOW}Apply cancelled${NC}"
                rm tfplan
                exit 0
            fi
        fi
        
        echo ""
        echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
        echo ""
        echo -e "${YELLOW}Outputs:${NC}"
        terraform output
        ;;
    
    destroy)
        echo -e "${RED}WARNING: This will destroy all resources in ${ENVIRONMENT}!${NC}"
        read -p "Are you absolutely sure? Type '${ENVIRONMENT}-destroy' to confirm: " CONFIRM
        
        if [ "$CONFIRM" == "${ENVIRONMENT}-destroy" ]; then
            echo -e "${YELLOW}Destroying infrastructure...${NC}"
            terraform destroy -var-file="$TFVARS_FILE" -auto-approve
            echo -e "${GREEN}✓ Infrastructure destroyed${NC}"
        else
            echo -e "${YELLOW}Destroy cancelled${NC}"
            exit 0
        fi
        ;;
esac

echo ""

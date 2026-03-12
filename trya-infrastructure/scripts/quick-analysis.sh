#!/bin/bash
# Análise rápida das contas disponíveis

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ANÁLISE DE INFRAESTRUTURA TRYA - ATUAL                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

analyze_account() {
    local PROFILE=$1
    local ACCOUNT=$2
    local REGION=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Account: $ACCOUNT | Profile: $PROFILE | Region: $REGION"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # VPCs
    echo "📡 VPCs:"
    aws ec2 describe-vpcs --region $REGION --profile $PROFILE \
        --query 'Vpcs[*].[VpcId,CidrBlock,Tags[?Key==`Name`].Value|[0]]' \
        --output text 2>/dev/null | while read line; do
        echo "  $line"
    done
    echo ""
    
    # ECS Clusters
    echo "🐳 ECS Clusters:"
    aws ecs list-clusters --region $REGION --profile $PROFILE \
        --output text 2>/dev/null | grep -v "CLUSTERARNS" | while read arn; do
        echo "  $(basename $arn)"
    done
    echo ""
    
    # ECR Repos
    echo "📦 ECR Repositories:"
    aws ecr describe-repositories --region $REGION --profile $PROFILE \
        --query 'repositories[*].repositoryName' \
        --output text 2>/dev/null | tr '\t' '\n' | while read repo; do
        echo "  $repo"
    done
    echo ""
    
    # RDS/Aurora
    echo "🗄️  Aurora Clusters:"
    aws rds describe-db-clusters --region $REGION --profile $PROFILE \
        --query 'DBClusters[*].[DBClusterIdentifier,Engine,Status]' \
        --output text 2>/dev/null | while read line; do
        echo "  $line"
    done
    echo ""
    
    # DynamoDB
    echo "📊 DynamoDB Tables:"
    aws dynamodb list-tables --region $REGION --profile $PROFILE \
        --output text 2>/dev/null | grep -v "TABLENAMES" | tr '\t' '\n' | while read table; do
        echo "  $table"
    done
    echo ""
    
    # Lambda
    echo "λ Lambda Functions:"
    aws lambda list-functions --region $REGION --profile $PROFILE \
        --query 'Functions[*].FunctionName' \
        --output text 2>/dev/null | tr '\t' '\n' | while read func; do
        echo "  $func"
    done
    echo ""
    
    # ALBs
    echo "⚖️  Load Balancers:"
    aws elbv2 describe-load-balancers --region $REGION --profile $PROFILE \
        --query 'LoadBalancers[*].[LoadBalancerName,Type]' \
        --output text 2>/dev/null | while read line; do
        echo "  $line"
    done
    echo ""
    
    # S3 (global)
    if [ "$REGION" == "us-east-1" ]; then
        echo "🪣 S3 Buckets (Trya related):"
        aws s3api list-buckets --profile $PROFILE \
            --query 'Buckets[?contains(Name, `trya`) || contains(Name, `triagem`) || contains(Name, `tfstate`)].Name' \
            --output text 2>/dev/null | tr '\t' '\n' | while read bucket; do
            echo "  $bucket"
        done
        echo ""
    fi
}

# Conta 416684166863 (trya-local)
analyze_account "trya-local" "416684166863" "us-east-1"
analyze_account "trya-local" "416684166863" "sa-east-1"

# Conta 982081056300 (solucoes)
analyze_account "solucoes" "982081056300" "us-east-1"
analyze_account "solucoes" "982081056300" "sa-east-1"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ANÁLISE CONCLUÍDA                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"

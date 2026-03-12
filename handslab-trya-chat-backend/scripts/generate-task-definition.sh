#!/bin/bash
# =============================================================================
# Gera task-definition.json a partir do template
# =============================================================================

set -e

# Usar variaveis de ambiente ou valores padrao
TASK_FAMILY="${TASK_FAMILY:-trya-chat-backend-${BITBUCKET_DEPLOYMENT_ENVIRONMENT:-dev}}"
CONTAINER_NAME="${CONTAINER_NAME:-trya-chat-backend}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG_FOR_TASK:-latest}"
TASK_CPU="${TASK_CPU:-512}"
TASK_MEMORY="${TASK_MEMORY:-1024}"
LOG_GROUP="${LOG_GROUP:-/ecs/${TASK_FAMILY}}"

echo "Gerando task-definition.json..."
echo "  Task Family: ${TASK_FAMILY}"
echo "  Image URI: ${IMAGE_URI}"

cat > task-definition.json <<EOF
{
  "family": "${TASK_FAMILY}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "${TASK_CPU}",
  "memory": "${TASK_MEMORY}",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID:-000000000000}:role/${TASK_FAMILY}-execution-role",
  "taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID:-000000000000}:role/${TASK_FAMILY}-task-role",
  "containerDefinitions": [
    {
      "name": "${CONTAINER_NAME}",
      "image": "${IMAGE_URI}",
      "portMappings": [
        {
          "containerPort": ${CONTAINER_PORT},
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {"name": "NODE_ENV", "value": "${NODE_ENV:-production}"},
        {"name": "PORT", "value": "${CONTAINER_PORT}"},
        {"name": "AWS_REGION", "value": "${AWS_REGION:-sa-east-1}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${LOG_GROUP}",
          "awslogs-region": "${AWS_REGION:-sa-east-1}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:${CONTAINER_PORT}/chat/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

echo "task-definition.json gerado com sucesso!"

# Frontend Stack - HML Environment
environment = "hml"
aws_region  = "us-east-1"

# Domain Configuration
domain_name = "trya.ai"

# Container Configuration
container_port = 3000
cpu            = 512
memory         = 1024

# Scaling Configuration
desired_count = 1
min_capacity  = 1
max_capacity  = 3

# Health Check
health_check_path = "/api/health"

# Suffix to avoid conflicts (different from backend)
name_suffix = "-fe"

# Environment Variables (build-time for Next.js)
# IMPORTANTE: Variáveis NEXT_PUBLIC_* são incorporadas no build, não em runtime
# O deploy deve usar o script scripts/deploy-hml.sh que cria .env.production
container_environment = {
  PORT                             = "3000"
  NODE_ENV                         = "hml"
  NEXT_PUBLIC_API_BASE_URL         = "https://api-hml.trya.ai"
  NEXT_PUBLIC_PLATFORM_API_BASE_URL = "https://platform-hml.trya.ai"
}

# Additional Tags
additional_tags = {
  Owner      = "DevTeam"
  CostCenter = "Homologation"
}

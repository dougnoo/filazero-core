# Platform Stack - HML Environment
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

# Suffix to avoid conflicts
name_suffix = "-plat"

# Additional Tags
additional_tags = {
  Owner      = "DevTeam"
  CostCenter = "Homologation"
}

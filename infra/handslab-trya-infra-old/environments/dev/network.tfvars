# Network Stack - DEV Environment
environment = "dev"
aws_region  = "sa-east-1"

# Network Configuration
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
enable_nat_gateway = true
single_nat_gateway = true  # Cost optimization for dev

# Domain Configuration
domain_name = "trya.ai"

# Additional Tags
additional_tags = {
  Owner      = "DevTeam"
  CostCenter = "Development"
}

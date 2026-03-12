# Network Stack - HML Environment
environment = "hml"
aws_region  = "us-east-1"

# Network Configuration
vpc_cidr           = "10.1.0.0/16"  # Different CIDR for HML
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
enable_nat_gateway = true
single_nat_gateway = true  # Cost optimization for hml

# Domain Configuration
domain_name = "trya.ai"

# Additional Tags
additional_tags = {
  Owner      = "DevTeam"
  CostCenter = "Homologation"
}

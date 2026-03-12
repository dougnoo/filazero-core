# Backend Stack - HML Environment
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

# Database Configuration
db_instance_class          = "db.t4g.small"
db_allocated_storage       = 20
db_name                    = "trya_hml"
db_username                = "trya_admin"
db_multi_az                = false  # Can enable for more production-like
db_backup_retention_period = 7
db_backup_window           = "03:00-04:00"
db_maintenance_window      = "sun:04:00-sun:05:00"

# Suffix to avoid conflicts with existing resources
name_suffix = "-v2"

# Additional Tags
additional_tags = {
  Owner      = "DevTeam"
  CostCenter = "Homologation"
}

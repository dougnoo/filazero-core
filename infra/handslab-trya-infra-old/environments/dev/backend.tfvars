# Backend Stack - DEV Environment
environment = "dev"
aws_region  = "sa-east-1"

# Domain Configuration
domain_name = "trya.ai"

# Container Configuration
container_port = 3000
cpu            = 512
memory         = 1024

# Scaling Configuration
desired_count = 1
min_capacity  = 1
max_capacity  = 2

# Health Check
health_check_path = "/health"

# Database Configuration
db_instance_class          = "db.t4g.micro"
db_allocated_storage       = 20
db_name                    = "trya_dev"
db_username                = "trya_admin"
db_multi_az                = false  # Cost optimization for dev
db_backup_retention_period = 3      # Shorter retention for dev
db_backup_window           = "03:00-04:00"
db_maintenance_window      = "sun:04:00-sun:05:00"

# Additional Tags
additional_tags = {
  Owner      = "DevTeam"
  CostCenter = "Development"
}

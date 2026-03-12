# Environment Configuration
environment = "dev"
aws_region  = "sa-east-1"

# Network Configuration
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
enable_nat_gateway = true
single_nat_gateway = true  # Cost optimization for dev

# Domain Configuration
domain_name         = "trya.com.br"
frontend_subdomain  = "dev"  # Results in dev.trya.com.br
backend_subdomain   = "api-dev"
create_route53_zone = true   # Create zone for dev environment

# Backend Configuration
backend_cpu            = 512
backend_memory         = 1024
backend_desired_count  = 1
backend_min_capacity   = 1
backend_max_capacity   = 2
backend_container_port = 3000

# Database Configuration
db_instance_class          = "db.t4g.micro"
db_allocated_storage       = 20
db_name                    = "trya_dev"
db_username                = "trya_admin"
db_multi_az                = false  # Cost optimization for dev
db_backup_retention_period = 3  # Shorter retention for dev
db_backup_window           = "03:00-04:00"
db_maintenance_window      = "sun:04:00-sun:05:00"

# Monitoring Configuration
enable_monitoring = true
alarm_email       = ""  # Add your email here to receive alarms

# Additional Tags
additional_tags = {
  Owner       = "DevTeam"
  CostCenter  = "Development"
  Terraform   = "true"
}

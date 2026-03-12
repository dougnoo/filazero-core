# Environment Configuration
environment = "hml"
aws_region  = "sa-east-1"

# Network Configuration
vpc_cidr           = "10.1.0.0/16"
availability_zones = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
enable_nat_gateway = true
single_nat_gateway = true  # Can be set to false for higher availability

# Domain Configuration
domain_name         = "trya.com.br"
frontend_subdomain  = "hml"  # Results in hml.trya.com.br
backend_subdomain   = "api-hml"
create_route53_zone = false  # Set to true if zone doesn't exist

# Backend Configuration
backend_cpu            = 512
backend_memory         = 1024
backend_desired_count  = 2  # More instances for testing
backend_min_capacity   = 1
backend_max_capacity   = 3
backend_container_port = 3000

# Database Configuration
db_instance_class          = "db.t4g.micro"
db_allocated_storage       = 20
db_name                    = "trya_hml"
db_username                = "trya_admin"
db_multi_az                = false  # Set to true for higher availability
db_backup_retention_period = 7
db_backup_window           = "03:00-04:00"
db_maintenance_window      = "sun:04:00-sun:05:00"

# Monitoring Configuration
enable_monitoring = true
alarm_email       = ""  # Add your email here to receive alarms

# Additional Tags
additional_tags = {
  Owner       = "DevTeam"
  CostCenter  = "Homologation"
  Terraform   = "true"
}

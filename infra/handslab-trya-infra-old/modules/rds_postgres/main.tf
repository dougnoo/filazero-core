locals {
  name_prefix = "${var.project_name}-${var.environment}"
  # Ensure names start with letter and contain only valid characters
  db_subnet_group_name = "db-${lower(replace(local.name_prefix, "_", "-"))}-subnet-group-v2"
  db_parameter_group_name = "pg-${lower(replace(local.name_prefix, "_", "-"))}-params-${formatdate("YYYYMMDD-hhmm", timestamp())}"
  db_identifier = "db-${lower(replace(local.name_prefix, "_", "-"))}-postgres-v2"
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${local.name_prefix}-rds-"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-rds-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Ingress rule - Allow PostgreSQL from allowed security groups
resource "aws_vpc_security_group_ingress_rule" "rds" {
  count = length(var.allowed_security_group_ids)

  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = var.allowed_security_group_ids[count.index]
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Allow PostgreSQL from application"
}

# Egress rule - Allow all outbound
resource "aws_vpc_security_group_egress_rule" "rds" {
  security_group_id = aws_security_group.rds.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Allow all outbound"
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = local.db_subnet_group_name
  subnet_ids = var.database_subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-db-subnet-group"
    }
  )
}

# DB Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = local.db_parameter_group_name
  family = "postgres16"

  parameter {
    name         = "log_connections"
    value        = "1"
    apply_method = "pending-reboot"
  }

  parameter {
    name         = "log_disconnections"
    value        = "1"
    apply_method = "pending-reboot"
  }

  parameter {
    name         = "log_duration"
    value        = "1"
    apply_method = "pending-reboot"
  }

  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements"
    apply_method = "pending-reboot"
  }

  tags = var.tags
}

# RDS Instance with AWS managed password

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier     = local.db_identifier
  engine         = "postgres"
  engine_version = var.engine_version

  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = var.storage_type
  storage_encrypted = true

  db_name  = var.database_name
  username = var.master_username

  # Use AWS managed master user password
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = var.multi_az
  publicly_accessible    = false
  skip_final_snapshot    = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${local.name_prefix}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection = var.deletion_protection
  
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? 7 : null

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-postgres"
    }
  )

  lifecycle {
    ignore_changes = [password]
  }
}

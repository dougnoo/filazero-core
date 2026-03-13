# ─── FilaZero Aurora Serverless v2 Module ──────────────────
# PostgreSQL database for platform-backend

variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "api_security_group_id" { type = string }

variable "db_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "db_min_capacity" {
  type    = number
  default = 0.5
}

variable "db_max_capacity" {
  type    = number
  default = 8
}

variable "db_deletion_protection" {
  type    = bool
  default = true
}

# ─── Subnet Group ─────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

# ─── Security Group ───────────────────────────────────────
resource "aws_security_group" "db" {
  name_prefix = "${var.project_name}-${var.environment}-db-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.api_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ─── Aurora Serverless v2 Cluster ──────────────────────────
resource "aws_rds_cluster" "main" {
  cluster_identifier = "${var.project_name}-${var.environment}"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = "15.4"
  database_name      = "filazero"
  master_username    = "filazero_admin"
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  deletion_protection = var.db_deletion_protection
  skip_final_snapshot = var.environment != "production"
  
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-${var.environment}-final" : null

  serverlessv2_scaling_configuration {
    min_capacity = var.db_min_capacity
    max_capacity = var.db_max_capacity
  }

  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  storage_encrypted       = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_rds_cluster_instance" "main" {
  count = 2

  identifier         = "${var.project_name}-${var.environment}-${count.index}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  tags = {
    Name = "${var.project_name}-${var.environment}-instance-${count.index}"
  }
}

# ─── Outputs ──────────────────────────────────────────────
output "cluster_endpoint" {
  value = aws_rds_cluster.main.endpoint
}

output "reader_endpoint" {
  value = aws_rds_cluster.main.reader_endpoint
}

output "connection_string" {
  value     = "postgresql://${aws_rds_cluster.main.master_username}@${aws_rds_cluster.main.endpoint}:5432/${aws_rds_cluster.main.database_name}"
  sensitive = true
}

output "db_security_group_id" {
  value = aws_security_group.db.id
}

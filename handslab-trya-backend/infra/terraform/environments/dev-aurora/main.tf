# ==============================================================================
# Aurora PostgreSQL Serverless v2 - DEV
# Provisionamento isolado do banco de dados
# ==============================================================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "trya-backend"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

# ==============================================================================
# Data Sources
# ==============================================================================
data "aws_vpc" "main" {
  id = var.vpc_id
}

data "aws_subnets" "private" {
  filter {
    name   = "subnet-id"
    values = var.subnet_ids
  }
}

# ==============================================================================
# Aurora PostgreSQL Cluster
# ==============================================================================
resource "aws_rds_cluster" "aurora" {
  cluster_identifier = "trya-backend-dev-aurora"
  engine             = "aurora-postgresql"
  engine_version     = "16.1"
  engine_mode        = "provisioned"
  database_name      = var.database_name
  master_username    = var.master_username
  master_password    = var.master_password

  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.aurora.id]

  backup_retention_period      = 7
  preferred_backup_window      = "03:00-04:00"
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  skip_final_snapshot       = true  # DEV - não precisa de snapshot final
  deletion_protection       = false # DEV - permitir deletar
  storage_encrypted         = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5  # Mínimo custo
    max_capacity = 4    # Escala conforme demanda
  }

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "trya-backend-dev-aurora"
  }
}

# Writer Instance
resource "aws_rds_cluster_instance" "writer" {
  identifier         = "trya-backend-dev-aurora-writer"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version

  publicly_accessible = false

  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  auto_minor_version_upgrade = true

  tags = {
    Name = "trya-backend-dev-aurora-writer"
  }
}

# Reader Instance (para alta disponibilidade)
resource "aws_rds_cluster_instance" "reader" {
  identifier         = "trya-backend-dev-aurora-reader"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version

  publicly_accessible = false

  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  auto_minor_version_upgrade = true

  tags = {
    Name = "trya-backend-dev-aurora-reader"
  }

  depends_on = [aws_rds_cluster_instance.writer]
}

# ==============================================================================
# DB Subnet Group
# ==============================================================================
resource "aws_db_subnet_group" "aurora" {
  name        = "trya-backend-dev-aurora-subnet-group"
  description = "Subnet group for Trya Backend Aurora"
  subnet_ids  = var.subnet_ids

  tags = {
    Name = "trya-backend-dev-aurora-subnet-group"
  }
}

# ==============================================================================
# Security Group
# ==============================================================================
resource "aws_security_group" "aurora" {
  name        = "trya-backend-dev-aurora-sg"
  description = "Security group for Aurora PostgreSQL"
  vpc_id      = data.aws_vpc.main.id

  # Permitir acesso do ECS (todas as subnets da VPC por enquanto)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
    description = "PostgreSQL from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "trya-backend-dev-aurora-sg"
  }
}

# ==============================================================================
# Variables
# ==============================================================================
variable "aws_region" {
  default = "us-east-1"
}

variable "aws_profile" {
  default = "skopia"
}

variable "vpc_id" {
  default = "vpc-05550ca68ba305afb"
}

variable "subnet_ids" {
  default = [
    "subnet-086fc061e53c37c3a",
    "subnet-0e24669b3bdad590a",
    "subnet-0bee6b992a1e42a6b"
  ]
}

variable "database_name" {
  default = "trya"
}

variable "master_username" {
  default = "postgres"
}

variable "master_password" {
  default   = "TryaDB2024!Secure"
  sensitive = true
}

# ==============================================================================
# Outputs
# ==============================================================================
output "cluster_endpoint" {
  description = "Writer endpoint (use para escrita)"
  value       = aws_rds_cluster.aurora.endpoint
}

output "reader_endpoint" {
  description = "Reader endpoint (use para leitura)"
  value       = aws_rds_cluster.aurora.reader_endpoint
}

output "database_name" {
  description = "Nome do banco de dados"
  value       = aws_rds_cluster.aurora.database_name
}

output "port" {
  description = "Porta do banco"
  value       = aws_rds_cluster.aurora.port
}

output "security_group_id" {
  description = "ID do Security Group"
  value       = aws_security_group.aurora.id
}

output "connection_string" {
  description = "String de conexão (substitua a senha)"
  value       = "postgresql://${var.master_username}:PASSWORD@${aws_rds_cluster.aurora.endpoint}:5432/${var.database_name}"
  sensitive   = true
}

output "bitbucket_variables" {
  description = "Variáveis para configurar no Bitbucket"
  value = {
    POSTGRES_HOST     = aws_rds_cluster.aurora.endpoint
    POSTGRES_PORT     = "5432"
    POSTGRES_USER     = var.master_username
    POSTGRES_DB       = var.database_name
    DATABASE_URL      = "postgresql://${var.master_username}:PASSWORD@${aws_rds_cluster.aurora.endpoint}:5432/${var.database_name}"
  }
  sensitive = true
}


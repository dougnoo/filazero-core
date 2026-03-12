# =============================================================================
# Aurora PostgreSQL Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/data/aurora"
}

include "root" {
  path = find_in_parent_folders()
}

dependency "vpc" {
  config_path = "../../shared-services/vpc"
  
  mock_outputs = {
    vpc_id = "vpc-mock123456"
    vpc_cidr = "10.0.0.0/16"
    public_subnet_ids = ["subnet-mock123", "subnet-mock456"]
    private_subnet_ids = ["subnet-mock789", "subnet-mock012"]
  }
}

dependency "ecs_backend" {
  config_path = "../../backend/ecs"
  
  mock_outputs = {
    security_group_id = "sg-ecs-backend-mock123"
  }
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta (admin-trya-dev -> dev)
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações do Aurora baseadas no environment
  aurora_config = {
    # Capacidade Serverless
    min_capacity = local.environment == "prod" ? 1 : 0.5
    max_capacity = local.environment == "prod" ? 8 : 4
    reader_count = local.environment == "prod" ? 1 : 0
    
    # Backup e Manutenção
    backup_retention_period = local.environment == "prod" ? 14 : 7
    deletion_protection = local.environment == "prod" ? true : false
    skip_final_snapshot = local.environment == "prod" ? false : true
    
    # Performance Insights
    performance_insights_retention_period = local.environment == "prod" ? 31 : 7
    
    # Monitoramento
    monitoring_interval = local.environment == "prod" ? 60 : 0
    create_cloudwatch_alarms = local.environment == "prod" ? true : false
    
    # Alarmes
    cpu_alarm_threshold = 80
    connections_alarm_threshold = local.environment == "prod" ? 200 : 100
  }
}

inputs = {
  # Identificação
  cluster_identifier = "${local.account_vars.locals.account_name}-aurora"
  engine_version     = "17.4"
  
  # Database
  database_name   = "trya"
  master_username = "postgres"
  master_password = "try4admIn"  # TODO: Usar AWS Secrets Manager
  
  # Rede
  vpc_id     = dependency.vpc.outputs.vpc_id
  vpc_cidr   = dependency.vpc.outputs.vpc_cidr
  subnet_ids = dependency.vpc.outputs.private_subnet_ids
  
  # Instâncias
  instance_class          = "db.serverless"
  reader_instance_class   = null  # Usa o mesmo da instância principal
  reader_count            = local.aurora_config.reader_count
  
  # Serverless
  serverless_min_capacity = local.aurora_config.min_capacity
  serverless_max_capacity = local.aurora_config.max_capacity
  
  # Backup e Manutenção
  backup_retention_period         = local.aurora_config.backup_retention_period
  preferred_backup_window         = "03:00-04:00"  # UTC - 23:00-00:00 Brasília
  preferred_maintenance_window    = "sun:04:00-sun:05:00"  # UTC - Dom 00:00-01:00 Brasília
  skip_final_snapshot            = local.aurora_config.skip_final_snapshot
  deletion_protection            = local.aurora_config.deletion_protection
  
  # Segurança
  storage_encrypted      = true
  kms_key_id            = null  # Usa chave padrão da AWS
  publicly_accessible   = false
  
  # Acesso - Permitir acesso do ECS Backend
  allowed_security_groups = [dependency.ecs_backend.outputs.security_group_id]
  allowed_cidr_blocks    = []  # Remover CIDR, usar apenas SGs específicos
  
  # Logs
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  # Performance Insights
  performance_insights_enabled          = true
  performance_insights_retention_period = local.aurora_config.performance_insights_retention_period
  
  # Monitoramento
  monitoring_interval      = local.aurora_config.monitoring_interval
  auto_minor_version_upgrade = true
  
  # Alarmes
  create_cloudwatch_alarms      = local.aurora_config.create_cloudwatch_alarms
  cpu_alarm_threshold          = local.aurora_config.cpu_alarm_threshold
  connections_alarm_threshold  = local.aurora_config.connections_alarm_threshold
  alarm_actions               = []  # TODO: Adicionar SNS topic para notificações
  ok_actions                  = []  # TODO: Adicionar SNS topic para notificações
  
  # Tags
  tags = merge(
    {
      Name        = "${local.account_vars.locals.account_name}-aurora"
      Service     = "database"
      Engine      = "aurora-postgresql"
      Environment = local.environment
    },
    local.environment == "prod" ? {
      Backup      = "required"
      Monitoring  = "enhanced"
    } : {}
  )
}

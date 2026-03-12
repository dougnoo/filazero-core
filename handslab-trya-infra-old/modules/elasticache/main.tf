# ==============================================================================
# ElastiCache Module
# ==============================================================================
# Supports both ElastiCache Serverless (Valkey/Redis) and traditional clusters

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ElastiCache Serverless Cache
resource "aws_elasticache_serverless_cache" "this" {
  count = var.use_serverless ? 1 : 0

  name        = var.cache_name
  engine      = var.engine
  description = var.description != "" ? var.description : "ElastiCache for ${var.project_name} ${var.environment}"

  security_group_ids = var.security_group_ids
  subnet_ids         = var.subnet_ids

  cache_usage_limits {
    data_storage {
      maximum = var.serverless_max_data_storage_gb
      unit    = "GB"
    }
    ecpu_per_second {
      maximum = var.serverless_max_ecpu_per_second
    }
  }

  daily_snapshot_time      = var.daily_snapshot_time
  snapshot_retention_limit = var.snapshot_retention_limit

  tags = merge(
    var.tags,
    {
      Name = var.cache_name
    }
  )
}

# Traditional ElastiCache Subnet Group (for non-serverless)
resource "aws_elasticache_subnet_group" "this" {
  count = !var.use_serverless ? 1 : 0

  name        = "${var.cache_name}-subnet-group"
  description = "Subnet group for ${var.cache_name}"
  subnet_ids  = var.subnet_ids

  tags = var.tags
}

# Traditional ElastiCache Replication Group (for non-serverless)
resource "aws_elasticache_replication_group" "this" {
  count = !var.use_serverless ? 1 : 0

  replication_group_id = var.cache_name
  description          = var.description != "" ? var.description : "ElastiCache for ${var.project_name} ${var.environment}"

  engine               = var.engine
  engine_version       = var.engine_version
  node_type            = var.node_type
  num_cache_clusters   = var.num_cache_clusters
  port                 = var.port
  parameter_group_name = var.parameter_group_name

  subnet_group_name  = aws_elasticache_subnet_group.this[0].name
  security_group_ids = var.security_group_ids

  automatic_failover_enabled = var.automatic_failover_enabled
  multi_az_enabled           = var.multi_az_enabled

  at_rest_encryption_enabled = var.at_rest_encryption_enabled
  transit_encryption_enabled = var.transit_encryption_enabled

  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window          = var.snapshot_window

  tags = merge(
    var.tags,
    {
      Name = var.cache_name
    }
  )
}

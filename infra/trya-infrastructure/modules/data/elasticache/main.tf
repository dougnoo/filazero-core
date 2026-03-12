# =============================================================================
# ElastiCache Serverless Module (Valkey/Redis)
# =============================================================================
resource "aws_security_group" "elasticache" {
  name        = "${var.cache_name}-elasticache-sg"
  description = "Security group for ElastiCache Serverless"
  vpc_id      = var.vpc_id

  # Allow access from ECS tasks
  dynamic "ingress" {
    for_each = length(var.allowed_security_groups) > 0 ? [1] : []
    content {
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      security_groups = var.allowed_security_groups
      description     = "Redis/Valkey from allowed security groups"
    }
  }

  # Fallback CIDR access (for backward compatibility)
  dynamic "ingress" {
    for_each = length(var.allowed_cidr_blocks) > 0 ? [1] : []
    content {
      from_port   = 6379
      to_port     = 6379
      protocol    = "tcp"
      cidr_blocks = [var.vpc_cidr]
      description = "Redis/Valkey from allowed CIDR blocks"
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.cache_name}-elasticache-sg"
    }
  )
}


resource "aws_elasticache_serverless_cache" "this" {
  name        = var.cache_name
  engine      = var.engine
  description = var.description

  # Security
  security_group_ids = [aws_security_group.elasticache.id]
  subnet_ids         = var.subnet_ids
  
  lifecycle { ignore_changes = [security_group_ids] }
  # Cache usage limits (optional)
  dynamic "cache_usage_limits" {
    for_each = var.cache_usage_limits != null ? [var.cache_usage_limits] : []
    content {
      data_storage {
        maximum = cache_usage_limits.value.data_storage_maximum
        unit    = cache_usage_limits.value.data_storage_unit
      }
      ecpu_per_second {
        maximum = cache_usage_limits.value.ecpu_per_second_maximum
      }
    }
  }

  tags = var.tags
}


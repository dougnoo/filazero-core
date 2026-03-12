# ==============================================================================
# ElastiCache Module Outputs
# ==============================================================================

output "endpoint" {
  description = "Primary endpoint of the cache"
  value       = var.use_serverless ? aws_elasticache_serverless_cache.this[0].endpoint[0].address : aws_elasticache_replication_group.this[0].primary_endpoint_address
}

output "port" {
  description = "Port of the cache"
  value       = var.use_serverless ? aws_elasticache_serverless_cache.this[0].endpoint[0].port : var.port
}

output "reader_endpoint" {
  description = "Reader endpoint of the cache (for non-serverless)"
  value       = var.use_serverless ? null : aws_elasticache_replication_group.this[0].reader_endpoint_address
}

output "cache_id" {
  description = "ID of the cache"
  value       = var.use_serverless ? aws_elasticache_serverless_cache.this[0].id : aws_elasticache_replication_group.this[0].id
}

output "cache_arn" {
  description = "ARN of the cache"
  value       = var.use_serverless ? aws_elasticache_serverless_cache.this[0].arn : aws_elasticache_replication_group.this[0].arn
}

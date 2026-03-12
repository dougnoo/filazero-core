output "endpoint_address" {
  description = "Endpoint address of the cache"
  value       = aws_elasticache_serverless_cache.this.endpoint[0].address
}

output "endpoint_port" {
  description = "Endpoint port of the cache"
  value       = aws_elasticache_serverless_cache.this.endpoint[0].port
}

output "cache_name" {
  description = "Name of the cache"
  value       = aws_elasticache_serverless_cache.this.name
}

output "arn" {
  description = "ARN of the cache"
  value       = aws_elasticache_serverless_cache.this.arn
}

output "security_group_id" {
  description = "ID of the ElastiCache security group"
  value       = aws_security_group.elasticache.id
}

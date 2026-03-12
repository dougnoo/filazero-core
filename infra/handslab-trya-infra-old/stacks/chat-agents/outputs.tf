# ==============================================================================
# Chat Agents Stack Outputs
# ==============================================================================

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = module.lambda.function_arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.lambda.function_name
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB sessions table"
  value       = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB sessions table"
  value       = module.dynamodb.table_arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for transcription/images"
  value       = module.s3_bucket.bucket_id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.s3_bucket.bucket_arn
}

output "elasticache_endpoint" {
  description = "Endpoint of the ElastiCache cluster"
  value       = module.elasticache.endpoint
}

output "elasticache_port" {
  description = "Port of the ElastiCache cluster"
  value       = module.elasticache.port
}

output "security_group_id" {
  description = "Security group ID for Lambda"
  value       = aws_security_group.lambda.id
}

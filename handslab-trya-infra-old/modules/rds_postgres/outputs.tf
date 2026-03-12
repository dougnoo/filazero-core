output "instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.main.id
}

output "endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS address"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.rds.id
}

output "master_user_secret_arn" {
  description = "ARN of the master user secret managed by AWS"
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
  sensitive   = true
}

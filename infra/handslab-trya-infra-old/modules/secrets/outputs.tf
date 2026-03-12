output "secret_arns" {
  description = "ARNs of all secrets"
  value       = { for k, v in aws_secretsmanager_secret.main : k => v.arn }
}

output "secret_names" {
  description = "Names of all secrets"
  value       = { for k, v in aws_secretsmanager_secret.main : k => v.name }
}

output "parameter_arns" {
  description = "ARNs of all parameters"
  value       = { for k, v in aws_ssm_parameter.main : k => v.arn }
}

output "parameter_names" {
  description = "Names of all parameters"
  value       = { for k, v in aws_ssm_parameter.main : k => v.name }
}

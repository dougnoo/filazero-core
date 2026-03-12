output "domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = var.domain != null ? aws_ses_domain_identity.this[0].arn : null
}

output "domain_identity_verification_token" {
  description = "Verification token for domain"
  value       = var.domain != null ? aws_ses_domain_identity.this[0].verification_token : null
}

output "dkim_tokens" {
  description = "DKIM tokens for DNS configuration"
  value       = var.domain != null && var.enable_dkim ? aws_ses_domain_dkim.this[0].dkim_tokens : []
}

output "configuration_set_name" {
  description = "Name of the configuration set"
  value       = var.create_configuration_set ? aws_ses_configuration_set.this[0].name : null
}

output "cognito_policy_arn" {
  description = "ARN of the Cognito SES policy"
  value       = var.create_cognito_policy ? aws_iam_policy.cognito_ses[0].arn : null
}

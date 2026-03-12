output "read_policy_arn" {
  description = "ARN of the read access policy for tenant buckets"
  value       = aws_iam_policy.tenant_buckets_read.arn
}

output "read_policy_name" {
  description = "Name of the read access policy for tenant buckets"
  value       = aws_iam_policy.tenant_buckets_read.name
}

output "write_policy_arn" {
  description = "ARN of the write access policy for tenant buckets"
  value       = var.create_write_policy ? aws_iam_policy.tenant_buckets_write[0].arn : null
}

output "write_policy_name" {
  description = "Name of the write access policy for tenant buckets"
  value       = var.create_write_policy ? aws_iam_policy.tenant_buckets_write[0].name : null
}

output "bucket_arns" {
  description = "List of bucket ARNs covered by these policies"
  value       = local.bucket_arns
}

# =============================================================================
# S3 Bucket for CloudFront Logs
# =============================================================================

terraform {
  source = "../../../../../modules/storage/s3-logs"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}

inputs = {
  bucket_name = "${local.account_vars.locals.account_name}-frontend-cloudfront-logs"
  
  # Configurações para logs do CloudFront
  log_retention_days = 365
  kms_key_arn = null  # Usar criptografia AES256 padrão
  
  tags = {
    Name    = "${local.account_vars.locals.account_name}-frontend-cloudfront-logs"
    Service = "frontend"
    Purpose = "cloudfront-logs"
  }
}
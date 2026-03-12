# Exemplo de configuração para bucket de logs
# Localização: accounts/{account}/stack/storage/logs/terragrunt.hcl

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "${dirname(find_in_parent_folders())}/_envcommon/storage/s3-logs.hcl"
}

dependency "kms" {
  config_path = "../../security/kms"
}

inputs = {
  bucket_name = "logs-${local.account_name}-${local.aws_region}"
  kms_key_arn = dependency.kms.outputs.key_arn
  
  log_retention_days = 365
  
  tags = merge(
    local.common_tags,
    {
      Purpose = "Centralized logging bucket"
    }
  )
}

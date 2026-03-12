include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "${get_repo_root()}/modules/networking/route53"
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  common_tags  = local.account_vars.locals.common_tags
}

inputs = {
  domain_name = "trya.ai"
  comment     = "Hosted zone principal para Trya"
  
  enable_health_check           = true
  health_check_fqdn             = "api.trya.ai"
  health_check_port             = 443
  health_check_type             = "HTTPS"
  health_check_path             = "/health"
  health_check_failure_threshold = 3
  health_check_interval         = 30
  
  alarm_actions = [] # Adicionar SNS topic ARN se necessário
  
  tags = merge(
    local.common_tags,
    {
      Name = "trya.ai"
    }
  )
}

# =============================================================================
# Frontend ALB Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/cdn/alb"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "../../../../../_envcommon/frontend.hcl"
}

dependency "vpc" {
  config_path = "../../shared-services/vpc"
  
  mock_outputs = {
    vpc_id = "vpc-mock123456"
    public_subnet_ids = ["subnet-mock123", "subnet-mock456"]
    private_subnet_ids = ["subnet-mock789", "subnet-mock012"]
  }
}

# TEMPORÁRIO: ACM comentado até certificado ser aprovado
# dependency "acm" {
#   config_path = "../../security/acm"
#   
#   mock_outputs = {
#     certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
#   }
# }

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações do ALB baseadas no environment
  alb_config = {
    # TEMPORÁRIO: HTTPS desabilitado até ACM ser aprovado
    enable_https = false
    enable_https_redirect = false
    container_port = 3000
    health_check_path = "/"
    health_check_matcher = "200-399"
  }
}

inputs = {
  name       = "${local.account_vars.locals.account_name}-frontend-alb"
  vpc_id     = dependency.vpc.outputs.vpc_id
  subnet_ids = dependency.vpc.outputs.public_subnet_ids
  internal   = false
  
  enable_https          = local.alb_config.enable_https
  enable_https_redirect = local.alb_config.enable_https_redirect
  # TEMPORÁRIO: certificate_arn comentado até ACM ser aprovado
  # certificate_arn       = dependency.acm.outputs.certificate_arn
  
  target_group_port = local.alb_config.container_port
  target_group_protocol = "HTTP"
  health_check_path = local.alb_config.health_check_path
  health_check_matcher = local.alb_config.health_check_matcher
  
  stickiness_enabled = false
  
  tags = {
    Name    = "${local.account_vars.locals.account_name}-frontend-alb"
    Service = "frontend"
  }
}
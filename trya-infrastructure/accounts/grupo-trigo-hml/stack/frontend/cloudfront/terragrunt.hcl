# =============================================================================
# Frontend CloudFront Distribution Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/cdn/cloudfront"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "../../../../../_envcommon/frontend.hcl"
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações do CloudFront baseadas no environment
  cloudfront_config = {
    # CloudFront habilitado em todos os ambientes
    enabled = true
    price_class = local.environment == "prod" ? "PriceClass_All" : "PriceClass_100"
    
    # WAF apenas em produção
    enable_waf = local.environment == "prod"
    
    # Domínios (será configurado quando ACM estiver pronto)
    aliases = []  # TODO: Adicionar quando certificado estiver pronto
    
    # Cache behaviors para Next.js
    static_cache_behaviors = [
      {
        path_pattern           = "/_next/static/*"
        allowed_methods        = ["GET", "HEAD"]
        cached_methods         = ["GET", "HEAD"]
        compress               = true
        viewer_protocol_policy = "redirect-to-https"
      },
      {
        path_pattern           = "/static/*"
        allowed_methods        = ["GET", "HEAD"]
        cached_methods         = ["GET", "HEAD"]
        compress               = true
        viewer_protocol_policy = "redirect-to-https"
      },
      {
        path_pattern           = "/favicon.ico"
        allowed_methods        = ["GET", "HEAD"]
        cached_methods         = ["GET", "HEAD"]
        compress               = true
        viewer_protocol_policy = "redirect-to-https"
      }
    ]
  }
}

dependency "alb" {
  config_path = "../alb"
  
  mock_outputs = {
    load_balancer_dns_name = "admin-trya-dev-frontend-alb-123456789.us-east-1.elb.amazonaws.com"
  }
}

dependency "s3_logs" {
  config_path = "../s3-logs"
  
  mock_outputs = {
    bucket_domain_name = "admin-trya-dev-frontend-cloudfront-logs.s3.amazonaws.com"
  }
}

# TEMPORÁRIO: ACM comentado até certificado ser aprovado
# dependency "acm" {
#   config_path = "../../shared-services/acm"
#   
#   mock_outputs = {
#     certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
#   }
# }

inputs = {
  name = "${local.account_vars.locals.account_name}-frontend-cdn"
  
  # Origin (ALB do frontend)
  origin_domain_name = dependency.alb.outputs.load_balancer_dns_name
  
  comment = "CloudFront distribution for ${local.account_vars.locals.account_name} frontend"
  enabled = local.cloudfront_config.enabled
  
  # Domínios customizados (quando ACM estiver pronto)
  aliases = local.cloudfront_config.aliases
  
  # Configurações de cache
  default_root_object = ""  # Para Next.js, deixar vazio
  price_class = local.cloudfront_config.price_class
  enable_ipv6 = true
  
  # Métodos HTTP
  allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
  cached_methods = ["GET", "HEAD"]
  
  # Políticas de cache (otimizadas para aplicações dinâmicas)
  cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingOptimized
  viewer_protocol_policy = "redirect-to-https"
  compress = true
  
  # Cache behaviors para arquivos estáticos
  static_cache_behaviors = local.cloudfront_config.static_cache_behaviors
  
  # Geo restriction (Brasil e EUA)
  geo_restriction_type = "whitelist"
  geo_restriction_locations = ["BR", "US"]
  
  # Logs
  logging_bucket = dependency.s3_logs.outputs.bucket_domain_name
  logging_prefix = "cloudfront/"
  
  # Security headers
  response_headers_policy_id = "67f7725c-6f97-4210-82d7-5512b31e9d03" # Managed-SecurityHeadersPolicy
  
  # Certificado SSL (usar padrão do CloudFront por enquanto)
  use_default_certificate = true
  # TEMPORÁRIO: ACM comentado até certificado ser aprovado
  # use_default_certificate = false
  # acm_certificate_arn = dependency.acm.outputs.certificate_arn
  
  # WAF (apenas em produção - null em dev)
  web_acl_id = null
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-frontend-cdn"
    Service     = "frontend"
    Environment = local.environment
  }
}
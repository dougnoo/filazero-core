# =============================================================================
# Environment Configuration - PROD
# =============================================================================

locals {
  environment = "prod"
  region      = "us-east-1"
  
  # Domínios
  domain     = "trya.ai"
  api_domain = "api.trya.ai"
  
  # VPC (será criada pelo Terraform)
  vpc_cidr = "10.2.0.0/16"
  
  # Sizing
  tier = "production"
}

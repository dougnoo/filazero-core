# =============================================================================
# Environment Configuration - DEV
# =============================================================================

locals {
  environment = "dev"
  region      = "us-east-1"
  
  # Domínios
  domain     = "dev.trya.ai"
  api_domain = "dev-api.trya.ai"
  
  # VPC (será criada pelo Terraform)
  vpc_cidr = "10.0.0.0/16"
  
  # Sizing
  tier = "development"
}

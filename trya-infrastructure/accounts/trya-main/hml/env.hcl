# =============================================================================
# Environment Configuration - HML
# =============================================================================

locals {
  environment = "hml"
  region      = "us-east-1"  # Maioria dos recursos em us-east-1
  
  # Domínios
  domain     = "hml.trya.ai"
  api_domain = "hml-api.trya.ai"
  
  # VPC (será criada pelo Terraform)
  vpc_cidr = "10.1.0.0/16"
  
  # Sizing
  tier = "staging"
}

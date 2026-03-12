# =============================================================================
# Root Terragrunt Configuration
# =============================================================================
# Este arquivo define configurações globais para todos os módulos Terragrunt
# da infraestrutura Trya multi-account.

locals {
  # Lê configurações da conta AWS
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Lê configurações da região
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  
  # Extrai valores
  account_id   = local.account_vars.locals.account_id
  account_name = local.account_vars.locals.account_name
  region       = local.region_vars.locals.aws_region
  
  # Extrai client e environment do nome da conta (ex: admin-trya-dev)
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  client = join("-", slice(local.name_parts, 0, length(local.name_parts) - 1))
}

# =============================================================================
# Generate Provider Configuration
# =============================================================================
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.region}"
  
  # Usar credenciais padrão (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
  # profile = "${local.account_name}"  # Comentado temporariamente
  
  default_tags {
    tags = {
      Client      = "${local.client}"
      Environment = "${local.environment}"
      ManagedBy   = "terragrunt"
      Account     = "${local.account_name}"
    }
  }
}

# Provider para us-east-1 (necessário para CloudFront, WAF global, etc)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  # profile = "${local.account_name}"  # Comentado temporariamente
  
  default_tags {
    tags = {
      Client      = "${local.client}"
      Environment = "${local.environment}"
      ManagedBy   = "terragrunt"
      Account     = "${local.account_name}"
    }
  }
}
EOF
}

# =============================================================================
# Remote State Configuration
# =============================================================================
remote_state {
  backend = "s3"
  
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  
  config = {
    # Bucket único por conta AWS
    bucket = "tfstate-${local.account_name}"
    
    # Key baseada no caminho relativo (ex: stack/backend/ecs/terraform.tfstate)
    key = "${path_relative_to_include()}/terraform.tfstate"
    
    region = local.region
    encrypt = true
    
    # DynamoDB table para lock
    dynamodb_table = "terraform-locks"
    
    # Profile para acesso ao bucket
    # profile = local.account_name  # Comentado temporariamente
  }
}

# =============================================================================
# Terraform Configuration
# =============================================================================
terraform {
  # Versões mínimas
  extra_arguments "common_vars" {
    commands = get_terraform_commands_that_need_vars()
  }
}

# =============================================================================
# Inputs Comuns
# =============================================================================
inputs = {
  account_id   = local.account_id
  account_name = local.account_name
  region       = local.region
  environment  = local.environment
  client       = local.client
}

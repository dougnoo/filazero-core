# =============================================================================
# Shared Services - Cognito Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/security/cognito"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  region_vars  = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  
  # Extrai environment
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Região AWS
  aws_region = local.region_vars.locals.aws_region
}

inputs = {
  pool_name = "${local.account_vars.locals.account_name}-user-pool"
  
  # Políticas de senha conforme requisitos de segurança
  password_minimum_length    = 8
  password_require_uppercase = true
  password_require_lowercase = true
  password_require_numbers   = true
  password_require_symbols   = true
  temporary_password_validity_days = 7
  
  # MFA desabilitado por enquanto (pode ser habilitado depois)
  mfa_configuration = "OFF"
  
  # Atributos verificados automaticamente
  auto_verified_attributes = ["email"]
  
  # Atributos customizados para multi-tenancy
  custom_attributes = [
    {
      name     = "tenant_id"
      type     = "String"
      mutable  = true
      required = false
      min_length = 1
      max_length = 256
    },
    {
      name       = "user_id"   # <-- adicionar isso
      type       = "String"
      mutable    = true
      required   = false
      min_length = 1
      max_length = 256
    }
  ]
  
  # Configurações do App Client
  create_client = true
  generate_client_secret = false  # SEM secret para frontend SPA
  
  # Explicit Auth Flows - Suporte para todos os fluxos necessários
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",      # User Password Auth
    "ALLOW_REFRESH_TOKEN_AUTH",      # Refresh Token
    "ALLOW_USER_SRP_AUTH",           # SRP Auth (mais seguro)
    "ALLOW_CUSTOM_AUTH"              # Custom challenges (New Password)
  ]
  
  # OAuth 2.0 Configuration
  allowed_oauth_flows = ["code"]  # Authorization Code Grant
  allowed_oauth_scopes = [
    "openid",
    "email",
    "phone",
    "profile",
    "aws.cognito.signin.user.admin"
  ]
  supported_identity_providers = ["COGNITO"]
  
  # URLs de callback e logout
  callback_urls = [
    "http://localhost:3000/auth/callback",
    "https://app.dev.trya.skopiadigital.com.br/auth/callback"
  ]
  logout_urls = [
    "http://localhost:3000/auth/logout",
    "https://app.dev.trya.skopiadigital.com.br/auth/logout"
  ]
  
  # Validade dos tokens
  access_token_validity = 1      # 1 hora
  id_token_validity = 1          # 1 hora  
  refresh_token_validity = 30    # 30 dias (apenas para BENEFICIARY)
  
  # Atributos de leitura e escrita
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "phone_number",
    "phone_number_verified",
    "custom:tenant_id",
    "custom:user_id"
  ]
  write_attributes = [
    "email",
    "name",
    "phone_number",
    "custom:tenant_id",
    "custom:user_id"
  ]
  
  # Domínio OAuth do Cognito
  domain = "${local.account_vars.locals.account_name}"
  
  # Grupos do Cognito para controle de roles
  user_groups = {
    BENEFICIARY = {
      description = "Beneficiários do sistema"
      precedence  = 4
    }
    ADMIN = {
      description = "Administradores do sistema"
      precedence  = 2
    }
    HR = {
      description = "Recursos Humanos"
      precedence  = 3
    },
    SUPER_ADMIN = {
      description = "Super Administradores do sistema"
      precedence  = 1
    },
    DOCTOR = {
      description = "Grupo de Médicos"
      precedence  = 5
    }
  }
  
  # Configurações de email (usando Cognito padrão por enquanto)
  ses_email_identity = null
  from_email_address = null
  
  # SMS Configuration (para MFA futuro)
  sns_caller_arn = null
  sns_external_id = null
  sns_region = null
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-cognito"
    Environment = local.environment
    Service     = "shared-services"
    Purpose     = "authentication"
  }
}

include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "${get_repo_root()}/modules/management/organizations"
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  common_tags  = local.account_vars.locals.common_tags
}

inputs = {
  # Se já existe uma Organization, use create_organization = false
  # e passe o root_id
  create_organization = false
  root_id             = "r-ub9b" # Obter via: aws organizations list-roots
  
  # Organizational Units
  organizational_units = {
    admin-trya = {
      name = "Admin Trya"
    }
    trya-saas = {
      name = "Trya SaaS"
    }
    grupo-trigo = {
      name = "Grupo Trigo"
    }
    shared = {
      name = "Shared Services"
    }
    concrejato = {
      name = "Concrejato"
    }
  }
  
  # Contas AWS (criar novas contas)
  accounts = {
    admin_trya_dev = {
      name      = "Admin Trya - Dev"
      email     = "douglas+admin-trya-dev@trya.ai"
      parent_id = "ou-ub9b-lpjdtn23" # Será criado na root, depois mover para OU
      tags = {
        Client      = "Admin Trya"
        Environment = "dev"
      }
    }
    admin_trya_hml = {
      name      = "Admin Trya - Homologacao"
      email     = "douglas+admin-trya-hml@trya.ai"
      parent_id = "ou-ub9b-lpjdtn23"
      tags = {
        Client      = "Admin Trya"
        Environment = "hml"
      }
    }
    admin_trya_prod = {
      name      = "Admin Trya - Producao"
      email     = "douglas+admin-trya-prod@trya.ai"
      parent_id = "ou-ub9b-lpjdtn23"
      tags = {
        Client      = "Admin Trya"
        Environment = "prod"
      }
    }
    trya_saas_dev = {
      name      = "Trya SaaS - Dev"
      email     = "douglas+trya-saas-dev@trya.ai"
      parent_id = "ou-ub9b-nv26enrg"
      tags = {
        Client      = "Trya SaaS"
        Environment = "dev"
      }
    }
    trya_saas_hml = {
      name      = "Trya SaaS - Homologacao"
      email     = "douglas+trya-saas-hml@trya.ai"
      parent_id = "ou-ub9b-nv26enrg"
      tags = {
        Client      = "Trya SaaS"
        Environment = "hml"
      }
    }
    grupo_trigo_hml = {
      name      = "Grupo Trigo - Homologacao"
      email     = "douglas+grupo-trigo-hml@trya.ai"
      parent_id = "ou-ub9b-w9yglipz"
      tags = {
        Client      = "Grupo Trigo"
        Environment = "hml"
      }
    }
    grupo_trigo_prod = {
      name      = "Grupo Trigo - Producao"
      email     = "douglas+grupo-trigo-prod@trya.ai"
      parent_id = "ou-ub9b-w9yglipz"
      tags = {
        Client      = "Grupo Trigo"
        Environment = "prod"
      }
    }
    concrejato_hml = {
      name      = "Concrejato - Homologacao"
      email     = "douglas+concrejato-hml@trya.ai"
      parent_id = "ou-ub9b-70zmeguc"
      tags = {
        Client      = "Concrejato"
        Environment = "hml"
      }
    }      
    concrejato_prod = {
      name      = "Concrejato - Producao"
      email     = "douglas+concrejato-prod@trya.ai"
      parent_id = "ou-ub9b-70zmeguc"
      tags = {
        Client      = "Concrejato"
        Environment = "prod"
      }
    }    
  }
  
  # Service Control Policies
  service_control_policies = {
    deny_root_account = {
      name        = "DenyRootAccountUsage"
      description = "Deny all actions from root account"
      content = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Deny"
          Action   = "*"
          Resource = "*"
          Condition = {
            StringLike = {
              "aws:PrincipalArn" = "arn:aws:iam::*:root"
            }
          }
        }]
      })
    }
    require_mfa = {
      name        = "RequireMFA"
      description = "Require MFA for all actions except specific ones"
      content = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Deny"
          Action   = "*"
          Resource = "*"
          Condition = {
            BoolIfExists = {
              "aws:MultiFactorAuthPresent" = "false"
            }
            StringNotEquals = {
              "aws:RequestedRegion" = ["us-east-1", "sa-east-1"]
            }
          }
        }]
      })
    }
    restrict_regions = {
      name        = "RestrictRegions"
      description = "Restrict to us-east-1 and sa-east-1 only"
      content = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Deny"
          Action   = "*"
          Resource = "*"
          Condition = {
            StringNotEquals = {
              "aws:RequestedRegion" = ["us-east-1", "sa-east-1"]
            }
          }
        }]
      })
    }
  }
  
  # Attach SCPs (exemplo - ajustar conforme necessário)
  scp_attachments = {
    # Aplicar deny_root_account em todas as contas
    # Configurar após criar as contas
  }
  
  tags = local.common_tags
}

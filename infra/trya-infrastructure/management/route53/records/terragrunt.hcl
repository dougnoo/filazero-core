include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "${get_repo_root()}/modules/networking/route53-records"
}

locals {
  # Lê configurações da conta management
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Configurações dos ambientes e domínios
  environments = {
    dev = {
      account_name = "admin-trya-dev"
      domain       = "dev.admin.trya.ai"
      api_domain   = "dev-api.admin.trya.ai"
    }
    hml = {
      account_name = "admin-trya-hml"
      domain       = "hml.admin.trya.ai"
      api_domain   = "hml-api.admin.trya.ai"
    }
    prod = {
      account_name = "admin-trya-prod"
      domain       = "admin.trya.ai"
      api_domain   = "api.admin.trya.ai"
    }
  }
}

dependency "hosted_zone" {
  config_path = "../trya.ai"
  
  mock_outputs = {
    zone_id = "Z1234567890ABC"
    zone_arn = "arn:aws:route53:::hostedzone/Z1234567890ABC"
  }
}

inputs = {
  zone_id = dependency.hosted_zone.outputs.zone_id
  
  records = [
    # =========================================================================
    # PRODUÇÃO - Admin Trya (usando mock values por enquanto)
    # =========================================================================
    
    # Apex domain produção -> ALB Produção
    {
      name = "admin.trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-prod-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # API Produção -> ALB Produção
    {
      name = "api.admin.trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-prod-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # =========================================================================
    # HOMOLOGAÇÃO - Admin Trya (usando mock values por enquanto)
    # =========================================================================
    
    # Domain homologação -> ALB Homologação
    {
      name = "hml.admin.trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-hml-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # API Homologação -> ALB Homologação
    {
      name = "hml-api.admin.trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-hml-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # =========================================================================
    # DESENVOLVIMENTO - Admin Trya (usando mock values por enquanto)
    # =========================================================================
    
    # Domain desenvolvimento -> ALB Desenvolvimento
    {
      name = "dev.admin.trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-dev-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # API Desenvolvimento -> ALB Desenvolvimento
    {
      name = "dev-api.admin.trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-dev-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # =========================================================================
    # DOMÍNIO PRINCIPAL E REDIRECIONAMENTOS
    # =========================================================================
    
    # Apex domain principal -> Produção
    {
      name = "trya.ai"
      type = "A"
      alias = {
        name                   = "admin-trya-prod-alb-123456789.us-east-1.elb.amazonaws.com"
        zone_id                = "Z35SXDOTRQ7X7K"
        evaluate_target_health = true
      }
    },
    
    # WWW -> Produção
    {
      name = "www.trya.ai"
      type = "CNAME"
      ttl  = 300
      records = ["admin.trya.ai"]
    },
    
    # API principal -> API Produção
    {
      name = "api.trya.ai"
      type = "CNAME"
      ttl  = 300
      records = ["api.admin.trya.ai"]
    },
    
    # =========================================================================
    # CONFIGURAÇÕES DE EMAIL
    # =========================================================================
    
    # MX Records para email
    {
      name = "trya.ai"
      type = "MX"
      ttl  = 3600
      records = [
        "1 aspmx.l.google.com",
        "5 alt1.aspmx.l.google.com",
        "5 alt2.aspmx.l.google.com",
        "10 alt3.aspmx.l.google.com",
        "10 alt4.aspmx.l.google.com"
      ]
    },
    
    # SPF e Google Site Verification (consolidados em um registro TXT)
    {
      name = "trya.ai"
      type = "TXT"
      ttl  = 3600
      records = [
        "v=spf1 include:_spf.google.com ~all",
        "google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      ]
    },
    
    # DMARC Record
    {
      name = "_dmarc.trya.ai"
      type = "TXT"
      ttl  = 3600
      records = [
        "v=DMARC1; p=quarantine; rua=mailto:dmarc@trya.ai; ruf=mailto:dmarc@trya.ai; fo=1"
      ]
    }
  ]
}

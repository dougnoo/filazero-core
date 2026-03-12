# =============================================================================
# ACM Certificate with Cross-Account DNS Validation
# =============================================================================

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
      configuration_aliases = [aws.dns]
    }
  }
}

# Certificado ACM na conta da aplicação
resource "aws_acm_certificate" "this" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = var.validation_method
  key_algorithm            = var.key_algorithm
  
  options {
    certificate_transparency_logging_preference = var.certificate_transparency_logging_preference
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
      Type = "ACM Certificate"
    }
  )
}

# Registros DNS para validação na conta DNS (cross-account)
resource "aws_route53_record" "validation" {
  provider = aws.dns
  
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : 
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.value]

  allow_overwrite = true
}


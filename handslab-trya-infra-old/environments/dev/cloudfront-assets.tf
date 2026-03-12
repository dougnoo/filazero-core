# =============================================================================
# CloudFront Distribution para Assets - DEV Environment
# =============================================================================
# Serve assets de tenant via CloudFront com domínio customizado
# 
# Domínios:
# - assets-dev.trya.ai -> CloudFront -> S3 trya-assets-dev
#
# Benefícios:
# - CDN global com cache
# - HTTPS com certificado ACM
# - Não expõe URLs da AWS diretamente
# =============================================================================

# Data source para o certificado ACM existente
# O certificado trya.ai inclui *.trya.ai como SAN
data "aws_acm_certificate" "trya_ai" {
  provider    = aws.us_east_1
  domain      = "trya.ai"
  statuses    = ["ISSUED"]
  most_recent = true
}

# Data source para Route53 zone
data "aws_route53_zone" "trya_ai" {
  provider = aws.us_east_1
  name     = "trya.ai"
}

# Origin Access Control para S3
resource "aws_cloudfront_origin_access_control" "assets_dev" {
  provider                          = aws.us_east_1
  name                              = "assets-dev-oac"
  description                       = "OAC for DEV assets bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Response Headers Policy para CORS
resource "aws_cloudfront_response_headers_policy" "assets_dev_cors" {
  provider = aws.us_east_1
  name     = "assets-dev-cors-policy"
  comment  = "CORS policy for assets in DEV"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }

    access_control_allow_origins {
      items = [
        "https://dev-app.trya.ai",
        "https://dev-app-grupotrigo.trya.ai",
        "https://platform-dev.trya.ai",
        "http://localhost:3000",
        "http://localhost:3001"
      ]
    }

    access_control_max_age_sec = 3600
    origin_override            = true
  }
}

# Data source para o bucket de assets existente
data "aws_s3_bucket" "trya_assets_dev" {
  provider = aws.us_east_1
  bucket   = "trya-assets-dev"
}

# CloudFront Distribution para Assets DEV
resource "aws_cloudfront_distribution" "assets_dev" {
  provider = aws.us_east_1

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Assets CDN for DEV environment"
  default_root_object = ""
  price_class         = "PriceClass_100" # US, Canada, Europe

  aliases = ["assets-dev.trya.ai"]

  # Origin: S3 bucket trya-assets-dev
  origin {
    domain_name              = data.aws_s3_bucket.trya_assets_dev.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.assets_dev.id
    origin_id                = "S3-trya-assets-dev"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-trya-assets-dev"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400    # 1 day
    max_ttl                    = 31536000 # 1 year
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.assets_dev_cors.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.trya_ai.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = "dev"
    Purpose     = "assets-cdn"
    ManagedBy   = "terraform"
  }
}

# Route53 Record para assets-dev.trya.ai
resource "aws_route53_record" "assets_dev" {
  provider = aws.us_east_1
  zone_id  = data.aws_route53_zone.trya_ai.zone_id
  name     = "assets-dev.trya.ai"
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.assets_dev.domain_name
    zone_id                = aws_cloudfront_distribution.assets_dev.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 Record para platform-dev.trya.ai (Platform Backend API)
# Aponta para o ALB do platform-backend DEV
resource "aws_route53_record" "platform_dev" {
  provider = aws.us_east_1
  zone_id  = data.aws_route53_zone.trya_ai.zone_id
  name     = "platform-dev.trya.ai"
  type     = "CNAME"
  ttl      = 300
  records  = ["platform-api.trya.ai"] # Alias para o domínio existente
}

# =============================================================================
# Outputs
# =============================================================================

output "assets_cloudfront_distribution_id" {
  description = "CloudFront Distribution ID for assets"
  value       = aws_cloudfront_distribution.assets_dev.id
}

output "assets_cloudfront_domain" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.assets_dev.domain_name
}

output "assets_custom_domain" {
  description = "Custom domain for assets"
  value       = "https://assets-dev.trya.ai"
}

output "platform_dev_domain" {
  description = "Platform API DEV domain"
  value       = "https://platform-dev.trya.ai"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "this" {
  enabled             = var.enabled
  is_ipv6_enabled     = var.enable_ipv6
  comment             = var.comment
  default_root_object = var.default_root_object
  price_class         = var.price_class
  web_acl_id          = var.web_acl_id

  aliases = var.aliases

  logging_config {
    include_cookies = false
    bucket          = var.logging_bucket
    prefix          = var.logging_prefix
  }

  origin {
    domain_name = var.origin_domain_name
    origin_id   = "${var.name}-alb-origin"

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_read_timeout      = 60
      origin_keepalive_timeout = 5
    }

    custom_header {
      name  = "X-Forwarded-Proto"
      value = "https"
    }
  }

  default_cache_behavior {
    allowed_methods  = var.allowed_methods
    cached_methods   = var.cached_methods
    target_origin_id = "${var.name}-alb-origin"

    # CachingDisabled - Não faz cache, encaminha todas as requisições
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    
    # AllViewerExceptHostHeader - Encaminha cookies, headers e query strings
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"

    # Security headers policy
    response_headers_policy_id = var.response_headers_policy_id

    viewer_protocol_policy = var.viewer_protocol_policy
    compress               = var.compress

    dynamic "lambda_function_association" {
      for_each = var.lambda_function_associations
      content {
        event_type   = lambda_function_association.value.event_type
        lambda_arn   = lambda_function_association.value.lambda_arn
        include_body = lookup(lambda_function_association.value, "include_body", false)
      }
    }
  }

  # Cache behavior for static assets
  dynamic "ordered_cache_behavior" {
    for_each = var.static_cache_behaviors
    content {
      path_pattern           = ordered_cache_behavior.value.path_pattern
      allowed_methods        = ordered_cache_behavior.value.allowed_methods
      cached_methods         = ordered_cache_behavior.value.cached_methods
      target_origin_id       = "${var.name}-alb-origin"
      compress               = ordered_cache_behavior.value.compress
      viewer_protocol_policy = ordered_cache_behavior.value.viewer_protocol_policy

      cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimizedForUncompressedObjects
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = var.geo_restriction_type
      locations        = var.geo_restriction_locations
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.use_default_certificate
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = var.use_default_certificate ? null : "sni-only"
    minimum_protocol_version       = var.use_default_certificate ? null : "TLSv1.2_2021"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code         = 403
    response_code      = 403
    response_page_path = "/403.html"
    error_caching_min_ttl = 300
  }
  
  wait_for_deployment = false

  tags = merge(
    var.tags,
    {
      Name = var.name
    }
  )
}


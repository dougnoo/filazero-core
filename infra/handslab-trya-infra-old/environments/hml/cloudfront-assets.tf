# CloudFront Distribution para Frontend HML com Assets
# Distribution ID: E1G0WJO2Z4WR7M

data "aws_cloudfront_distribution" "hml_frontend" {
  id = "E1G0WJO2Z4WR7M"
}

# Origin Access Control para bucket de assets
resource "aws_cloudfront_origin_access_control" "assets_hml" {
  name                              = "assets-hml-oac"
  description                       = "OAC for assets bucket HML"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Response Headers Policy para CORS dos assets
resource "aws_cloudfront_response_headers_policy" "assets_cors" {
  name    = "assets-hml-cors-policy"
  comment = "CORS policy for assets in HML"

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
        "https://hml-app.trya.ai",
        "https://hml-app-grupotrigo.trya.ai",
        "https://platform-hml.trya.ai"
      ]
    }

    access_control_max_age_sec = 3600
    origin_override            = true
  }
}

# Atualizar política do bucket para permitir CloudFront
resource "aws_s3_bucket_policy" "grupotrigo_assets_sa" {
  bucket = "grupotrigo-assets-sa"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "arn:aws:s3:::grupotrigo-assets-sa/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudfront::416684166863:distribution/E1G0WJO2Z4WR7M"
          }
        }
      },
      {
        Sid    = "AllowBackendAccess"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::416684166863:role/Trya-hml-v2-ecs-task-role",
            "arn:aws:iam::416684166863:role/trya-platform-backend-dev-service-ecs-task-role"
          ]
        }
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::grupotrigo-assets-sa/*",
          "arn:aws:s3:::grupotrigo-assets-sa"
        ]
      }
    ]
  })
}

output "assets_oac_id" {
  value       = aws_cloudfront_origin_access_control.assets_hml.id
  description = "Origin Access Control ID for assets"
}

output "cors_policy_id" {
  value       = aws_cloudfront_response_headers_policy.assets_cors.id
  description = "Response Headers Policy ID for CORS"
}

# Management Account
# Esta conta gerencia AWS Organizations e recursos globais como Route53

locals {
  account_name = "trya-management"
  account_id = "770922560928"
  aws_region   = "us-east-1"
  
  common_tags = {
    ManagedBy   = "Terraform"
    Environment = "management"
    Project     = "Trya"
  }
}

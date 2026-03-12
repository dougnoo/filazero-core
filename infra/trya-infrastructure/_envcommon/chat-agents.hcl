# =============================================================================
# Chat Agents Service Common Configuration
# =============================================================================
# Configurações compartilhadas para os agentes de IA (Lambda)

# Esta função retorna configurações baseadas no environment
# Deve ser chamada pelos terragrunt.hcl dos componentes passando o environment
function "get_chat_agents_config" {
  params = [environment]
  result = {
    # Lambda
    runtime = "python3.11"
    timeout = 300
    memory_size = 1024
    ephemeral_storage_size = 512
    handler = "src.lambda_handler.lambda_handler"
    
    # Logging
    log_retention_days = 7
    enable_xray = environment == "prod"
    
    # DynamoDB
    dynamodb_billing_mode = "PAY_PER_REQUEST"
    dynamodb_ttl_enabled = true
    dynamodb_ttl_attribute = "ttl"
    dynamodb_enable_point_in_time_recovery = environment == "prod"
    
    # ElastiCache
    elasticache_engine = "valkey"
    
    # S3
    s3_enable_versioning = false
    s3_lifecycle_expiration_days = 30
    
    # Bedrock
    bedrock_model_id = "anthropic.claude-3-5-sonnet-20240620-v1:0"
    
    # VPC Endpoints
    enable_vpc_endpoints = true
    vpc_endpoints = [
      "bedrock-runtime",
      "bedrock-agent-runtime",
      "dynamodb",
      "s3",
      "transcribe"
    ]
  }
}

# =============================================================================
# Lambda Security Group Module - Variables
# =============================================================================

variable "name_prefix" {
  description = "Prefix for security group name"
  type        = string
}

variable "description" {
  description = "Description for the security group"
  type        = string
  default     = "Security group for Lambda functions"
}

variable "vpc_id" {
  description = "VPC ID where the security group will be created"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

# =============================================================================
# Security Group IDs for cross-references
# =============================================================================

variable "vpc_endpoints_sg_id" {
  description = "Security group ID of VPC endpoints"
  type        = string
  default     = null
}

variable "backend_alb_sg_id" {
  description = "Security group ID of Backend ALB"
  type        = string
  default     = null
}

variable "elasticache_sg_id" {
  description = "Security group ID of ElastiCache"
  type        = string
  default     = null
}

variable "aurora_sg_id" {
  description = "Security group ID of Aurora database"
  type        = string
  default     = null
}

# =============================================================================
# Feature Flags
# =============================================================================

variable "allow_vpc_endpoints" {
  description = "Allow egress to VPC endpoints"
  type        = bool
  default     = true
}

variable "allow_internet_access" {
  description = "Allow egress to internet via NAT Gateway"
  type        = bool
  default     = true
}

variable "allow_http_internet" {
  description = "Allow HTTP egress to internet (in addition to HTTPS)"
  type        = bool
  default     = false
}

variable "allow_http_to_backend" {
  description = "Allow HTTP egress to backend ALB (in addition to HTTPS)"
  type        = bool
  default     = false
}

variable "allow_ingress_from_vpc" {
  description = "Allow ingress from VPC CIDR"
  type        = bool
  default     = false
}

variable "allow_ingress_from_alb" {
  description = "Allow ingress from ALB (for Lambda Function URLs)"
  type        = bool
  default     = false
}

# =============================================================================
# Custom Rules
# =============================================================================

variable "custom_egress_rules" {
  description = "Map of custom egress rules"
  type = map(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = optional(list(string))
    description = optional(string)
  }))
  default = {}
}

variable "custom_ingress_rules" {
  description = "Map of custom ingress rules"
  type = map(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = optional(list(string))
    description = optional(string)
  }))
  default = {}
}

# =============================================================================
# Tags
# =============================================================================

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "cache_name" {
  description = "Name of the ElastiCache Serverless cache"
  type        = string
}

variable "engine" {
  description = "Cache engine (valkey or redis)"
  type        = string
  default     = "valkey"
}

variable "vpc_cidr" {
  description = "VPC cidr"
  type = string
}
variable "description" {
  description = "Description of the cache"
  type        = string
  default     = ""
}


variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
}


variable "vpc_id" {
  description = "VPC ID where ElastiCache will be created"
  type        = string
}

variable "allowed_security_groups" {
  description = "List of security group IDs allowed to access ElastiCache"
  type        = list(string)
  default     = []
}

variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to access ElastiCache"
  type        = list(string)
  default     = []
}

variable "cache_usage_limits" {
  description = "Cache usage limits configuration"
  type = object({
    data_storage_maximum      = number
    data_storage_unit         = string
    ecpu_per_second_maximum   = number
  })
  default = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.this.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ids" {
  description = "IDs of NAT Gateways"
  value       = aws_nat_gateway.this[*].id
}

output "public_route_table_id" {
  description = "ID of public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "IDs of private route tables"
  value       = aws_route_table.private[*].id
}

output "vpc_endpoint_s3_id" {
  description = "ID of S3 VPC endpoint"
  value       = try(aws_vpc_endpoint.s3[0].id, null)
}

output "vpc_endpoint_dynamodb_id" {
  description = "ID of DynamoDB VPC endpoint"
  value       = try(aws_vpc_endpoint.dynamodb[0].id, null)
}

output "vpc_endpoint_bedrock_runtime_id" {
  description = "ID of Bedrock Runtime VPC endpoint"
  value       = try(aws_vpc_endpoint.bedrock_runtime[0].id, null)
}

output "vpc_endpoint_transcribe_id" {
  description = "ID of Transcribe VPC endpoint"
  value       = try(aws_vpc_endpoint.transcribe[0].id, null)
}

output "vpc_endpoints_security_group_id" {
  description = "ID of VPC endpoints security group"
  value       = try(aws_security_group.vpc_endpoints[0].id, null)
}

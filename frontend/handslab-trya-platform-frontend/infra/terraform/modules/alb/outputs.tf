output "load_balancer_id" {
  description = "ID of the load balancer"
  value       = aws_lb.this.id
}

output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.this.arn
}

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.this.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.this.zone_id
}

output "target_group_id" {
  description = "ID of the target group"
  value       = aws_lb_target_group.this.id
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.this.arn
}

output "http_listener_arn" {
  description = "ARN of the HTTP listener"
  value       = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  description = "ARN of the HTTPS listener"
  value       = var.enable_https ? aws_lb_listener.https[0].arn : null
}

output "security_group_id" {
  description = "ID of the security group for the load balancer"
  value       = aws_security_group.alb.id
}




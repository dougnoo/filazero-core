resource "aws_security_group" "lambda" {
  name_prefix = "${var.name_prefix}"
  description = var.description
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Egress — Allow All
# =============================================================================

resource "aws_security_group_rule" "egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.lambda.id
  description       = "Allow all outbound traffic"
}

# =============================================================================
# Ingress Rules (opcional - geralmente Lambda não recebe tráfego direto)
# =============================================================================

resource "aws_security_group_rule" "ingress_from_vpc" {
  count = var.allow_ingress_from_vpc ? 1 : 0

  type              = "ingress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = [var.vpc_cidr]
  security_group_id = aws_security_group.lambda.id
  description       = "Allow all traffic from VPC CIDR"
}

resource "aws_security_group_rule" "ingress_from_alb" {
  count = var.allow_ingress_from_alb && var.backend_alb_sg_id != null ? 1 : 0

  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.lambda.id
  source_security_group_id = var.backend_alb_sg_id
  description              = "HTTPS from Backend ALB"
}

# =============================================================================
# Regras adicionais customizadas de Ingress
# =============================================================================

resource "aws_security_group_rule" "custom_ingress" {
  for_each = var.custom_ingress_rules

  type              = "ingress"
  from_port         = each.value.from_port
  to_port           = each.value.to_port
  protocol          = each.value.protocol
  security_group_id = aws_security_group.lambda.id
  cidr_blocks       = lookup(each.value, "cidr_blocks", null)
  description       = lookup(each.value, "description", "Custom ingress rule")
}
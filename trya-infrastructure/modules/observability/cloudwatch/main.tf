# CloudWatch Dashboard - Based on 4 Golden Signals
# 1. Latency - How long it takes to service a request
# 2. Traffic - How much demand is being placed on your system
# 3. Errors - The rate of requests that fail
# 4. Saturation - How "full" your service is

resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = var.dashboard_name

  dashboard_body = jsonencode({
    widgets = concat(
      # ============================================
      # GOLDEN SIGNAL 1: LATENCY
      # ============================================
      var.alb_arn_suffix != null ? [
        {
          type   = "metric"
          x      = 0
          y      = 0
          width  = 12
          height = 6
          properties = {
            title  = "Latency - Response Time (p50, p95, p99)"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p50", label = "p50" }],
              ["...", { stat = "p95", label = "p95" }],
              ["...", { stat = "p99", label = "p99" }]
            ]
            period = 60
            yAxis = {
              left = {
                label = "Seconds"
              }
            }
            annotations = {
              horizontal = [
                {
                  label = "SLA Target"
                  value = 1.0
                  fill  = "above"
                  color = "#ff0000"
                }
              ]
            }
          }
        },
        # ============================================
        # GOLDEN SIGNAL 2: TRAFFIC
        # ============================================
        {
          type   = "metric"
          x      = 12
          y      = 0
          width  = 12
          height = 6
          properties = {
            title  = "Traffic - Request Rate (req/min)"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum", label = "Total Requests" }]
            ]
            period = 60
            stat   = "Sum"
            yAxis = {
              left = {
                label = "Requests"
              }
            }
          }
        },
        # ============================================
        # GOLDEN SIGNAL 3: ERRORS
        # ============================================
        {
          type   = "metric"
          x      = 0
          y      = 6
          width  = 12
          height = 6
          properties = {
            title  = "Errors - Error Rate & Count"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum", label = "4xx Errors", color = "#ff9900" }],
              [".", "HTTPCode_Target_5XX_Count", ".", ".", { stat = "Sum", label = "5xx Errors", color = "#d62728" }],
              [".", "HTTPCode_ELB_5XX_Count", ".", ".", { stat = "Sum", label = "ELB 5xx", color = "#9467bd" }],
              [{
                expression = "(m2+m3)/(m1+m2+m3)*100"
                label      = "Error Rate %"
                id         = "e1"
                yAxis      = "right"
                color      = "#e74c3c"
              }],
              ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { id = "m1", visible = false }],
              [".", "HTTPCode_Target_5XX_Count", ".", ".", { id = "m2", visible = false }],
              [".", "HTTPCode_ELB_5XX_Count", ".", ".", { id = "m3", visible = false }]
            ]
            period = 60
            yAxis = {
              left = {
                label = "Count"
              }
              right = {
                label = "Error Rate %"
              }
            }
          }
        },
        # ============================================
        # GOLDEN SIGNAL 4: SATURATION - ALB
        # ============================================
        {
          type   = "metric"
          x      = 12
          y      = 6
          width  = 12
          height = 6
          properties = {
            title  = "Saturation - ALB Metrics"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "ActiveConnectionCount", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum", label = "Active Connections" }],
              [".", "TargetConnectionErrorCount", ".", ".", { stat = "Sum", label = "Connection Errors" }],
              [".", "RejectedConnectionCount", ".", ".", { stat = "Sum", label = "Rejected Connections" }]
            ]
            period = 60
          }
        }
      ] : [],
      # ============================================
      # GOLDEN SIGNAL 4: SATURATION - ECS
      # ============================================
      [
        {
          type   = "metric"
          x      = 0
          y      = 12
          width  = 8
          height = 6
          properties = {
            title  = "Saturation - ECS CPU"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ECS", "CPUUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name, { stat = "Average", label = "CPU Avg" }],
              ["...", { stat = "Maximum", label = "CPU Max" }]
            ]
            period = 300
            yAxis = {
              left = {
                min = 0
                max = 100
              }
            }
            annotations = {
              horizontal = [
                {
                  label = "Warning"
                  value = 70
                  fill  = "above"
                  color = "#ff9900"
                },
                {
                  label = "Critical"
                  value = 85
                  fill  = "above"
                  color = "#d62728"
                }
              ]
            }
          }
        },
        {
          type   = "metric"
          x      = 8
          y      = 12
          width  = 8
          height = 6
          properties = {
            title  = "Saturation - ECS Memory"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ECS", "MemoryUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name, { stat = "Average", label = "Memory Avg" }],
              ["...", { stat = "Maximum", label = "Memory Max" }]
            ]
            period = 300
            yAxis = {
              left = {
                min = 0
                max = 100
              }
            }
            annotations = {
              horizontal = [
                {
                  label = "Warning"
                  value = 70
                  fill  = "above"
                  color = "#ff9900"
                },
                {
                  label = "Critical"
                  value = 85
                  fill  = "above"
                  color = "#d62728"
                }
              ]
            }
          }
        },
        {
          type   = "metric"
          x      = 16
          y      = 12
          width  = 8
          height = 6
          properties = {
            title  = "Saturation - Task Count"
            region = data.aws_region.current.name
            metrics = [
              ["ECS/ContainerInsights", "RunningTaskCount", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name, { label = "Running" }],
              [".", "DesiredTaskCount", ".", ".", ".", ".", { label = "Desired" }],
              [".", "PendingTaskCount", ".", ".", ".", ".", { label = "Pending" }]
            ]
            period = 300
          }
        }
      ],
      # ============================================
      # GOLDEN SIGNAL 4: SATURATION - Aurora
      # ============================================
      var.aurora_cluster_identifier != null ? [
        {
          type   = "metric"
          x      = 0
          y      = 18
          width  = 8
          height = 6
          properties = {
            title  = "Saturation - Aurora CPU"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/RDS", "CPUUtilization", "DBClusterIdentifier", var.aurora_cluster_identifier, { stat = "Average" }]
            ]
            period = 300
            yAxis = {
              left = {
                min = 0
                max = 100
              }
            }
            annotations = {
              horizontal = [
                {
                  label = "Warning"
                  value = 70
                  fill  = "above"
                  color = "#ff9900"
                }
              ]
            }
          }
        },
        {
          type   = "metric"
          x      = 8
          y      = 18
          width  = 8
          height = 6
          properties = {
            title  = "Saturation - Aurora Connections"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/RDS", "DatabaseConnections", "DBClusterIdentifier", var.aurora_cluster_identifier, { label = "Active Connections" }]
            ]
            period = 300
          }
        },
        {
          type   = "metric"
          x      = 16
          y      = 18
          width  = 8
          height = 6
          properties = {
            title  = "Saturation - Aurora I/O"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/RDS", "ReadIOPS", "DBClusterIdentifier", var.aurora_cluster_identifier, { label = "Read IOPS" }],
              [".", "WriteIOPS", ".", ".", { label = "Write IOPS" }],
              [".", "ReadLatency", ".", ".", { label = "Read Latency (ms)", yAxis = "right" }],
              [".", "WriteLatency", ".", ".", { label = "Write Latency (ms)", yAxis = "right" }]
            ]
            period = 300
            yAxis = {
              left = {
                label = "IOPS"
              }
              right = {
                label = "Latency (ms)"
              }
            }
          }
        }
      ] : []
    )
  })
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alarms" {
  count = var.create_sns_topic ? 1 : 0

  name              = "${var.dashboard_name}-alarms"
  kms_master_key_id = var.kms_key_id

  tags = var.tags
}

# ECS CPU Alarm
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  count = var.create_alarms ? 1 : 0

  alarm_name          = "${var.ecs_service_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.ecs_cpu_threshold
  alarm_description   = "ECS service CPU utilization is high"

  dimensions = {
    ServiceName = var.ecs_service_name
    ClusterName = var.ecs_cluster_name
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

# ECS Memory Alarm
resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  count = var.create_alarms ? 1 : 0

  alarm_name          = "${var.ecs_service_name}-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.ecs_memory_threshold
  alarm_description   = "ECS service memory utilization is high"

  dimensions = {
    ServiceName = var.ecs_service_name
    ClusterName = var.ecs_cluster_name
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

# ALB 5XX Errors Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count = var.create_alarms && var.alb_arn_suffix != null ? 1 : 0

  alarm_name          = "${var.dashboard_name}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.alb_5xx_threshold
  alarm_description   = "ALB 5XX errors are high"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

# ALB Response Time Alarm
resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  count = var.create_alarms && var.alb_arn_suffix != null ? 1 : 0

  alarm_name          = "${var.dashboard_name}-alb-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = var.alb_response_time_threshold
  alarm_description   = "ALB response time is high"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

data "aws_region" "current" {}


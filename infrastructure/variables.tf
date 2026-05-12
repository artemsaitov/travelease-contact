variable "aws_region" {
  description = "AWS region for the project"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "travelease-contact"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "sender_email" {
  description = "Verified SES sender email address"
  type        = string
}

variable "business_email" {
  description = "Verified SES business recipient email address"
  type        = string
}
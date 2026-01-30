variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 Instance Type"
  type        = string
  default     = "t3.micro" # t2.micro might be too small for Jenkins + Docker
}

variable "key_name" {
  description = "Name of existing AWS Key Pair"
  type        = string
  default     = "my-key-pair" # REPLACE with actual key name or pass via CLI/tfvars
}

variable "ami_id" {
  description = "AMI ID for EC2 (Amazon Linux 2023 or Ubuntu)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS (us-east-1)
}

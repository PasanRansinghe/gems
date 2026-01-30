output "jenkins_public_ip" {
  description = "Public IP of the Jenkins Server"
  value       = aws_instance.jenkins_server.public_ip
}

output "jenkins_url" {
  description = "URL to access Jenkins"
  value       = "http://${aws_instance.jenkins_server.public_ip}:8080"
}

output "ssh_command" {
  description = "Command to SSH into the instance (note: user might be 'ubuntu' or 'ec2-user' depending on AMI)"
  value       = "ssh -i ${var.key_name}.pem ec2-user@${aws_instance.jenkins_server.public_ip} OR ssh -i ${var.key_name}.pem ubuntu@${aws_instance.jenkins_server.public_ip}"
}

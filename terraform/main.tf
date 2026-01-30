# Data source for latest Ubuntu 22.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security Group
resource "aws_security_group" "jenkins_sg" {
  name        = "jenkins-security-group"
  description = "Allow SSH, HTTP, Jenkins, and App ports"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Jenkins"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App Port 3000 (React)"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App Port 4000 (Node)"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "jenkins_server" {
  ami           = var.ami_id # Use the variable, allowing user to switch AMIs
  instance_type = var.instance_type
  key_name      = var.key_name
  security_groups = [aws_security_group.jenkins_sg.name]

  user_data = <<-EOF
              #!/bin/bash
              
              # Function to install on Ubuntu/Debian
              install_ubuntu() {
                  sudo apt update -y
                  sudo apt install -y fontconfig openjdk-17-jre
                  
                  # Jenkins
                  sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
                    https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
                  echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
                    https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
                    /etc/apt/sources.list.d/jenkins.list > /dev/null
                  sudo apt-get update -y
                  sudo apt-get install -y jenkins
                  
                  # Docker
                  sudo apt-get install -y ca-certificates curl gnupg
                  sudo install -m 0755 -d /etc/apt/keyrings
                  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                  sudo chmod a+r /etc/apt/keyrings/docker.gpg
                  echo \
                    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
                    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                  sudo apt-get update -y
                  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                  
                  # Git
                  sudo apt install -y git
              }

              # Function to install on Amazon Linux 2023
              install_al2023() {
                  sudo dnf update -y
                  sudo dnf install java-17-amazon-corretto -y
                  
                  # Jenkins
                  sudo wget -O /etc/yum.repos.d/jenkins.repo \
                      https://pkg.jenkins.io/redhat-stable/jenkins.repo
                  sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
                  sudo dnf upgrade -y
                  sudo dnf install jenkins -y
                  
                  # Docker
                  sudo dnf install docker -y
                  
                  # Git
                  sudo dnf install git -y
              }

              # Detect OS
              if [ -f /etc/os-release ]; then
                  . /etc/os-release
                  if [[ "$ID" == "ubuntu" ]]; then
                      install_ubuntu
                  elif [[ "$ID" == "amzn" ]] || [[ "$ID" == "fedora" ]]; then
                      install_al2023
                  else
                      echo "Unsupported OS"
                      exit 1
                  fi
              fi

              # Start Services
              sudo systemctl enable jenkins
              sudo systemctl start jenkins
              sudo systemctl enable docker
              sudo systemctl start docker

              # Permission for Jenkins to run Docker
              sudo usermod -aG docker jenkins
              
              # Install legacy docker-compose binary (for compatibility)
              sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              sudo chmod +x /usr/local/bin/docker-compose
              
              # Restart Jenkins to pick up group changes
              sudo systemctl restart jenkins
              EOF

  tags = {
    Name = "Jenkins-Server"
  }
}

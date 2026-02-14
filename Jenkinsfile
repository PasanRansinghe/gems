pipeline {
  agent any

  environment {
    DOCKER_HUB_USER = 'pasanranasinghe'
    FRONTEND_IMAGE = 'pasanranasinghe/gems-frontend'
    BACKEND_IMAGE = 'pasanranasinghe/gems-backend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Push Backend') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "Logging in to Docker Hub..."
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            echo "Building Backend..."
            docker build -t $BACKEND_IMAGE:latest ./backend
            
            echo "Pushing Backend..."
            docker push $BACKEND_IMAGE:latest
          '''
        }
      }
    }

    stage('Build & Push Frontend') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "Logging in to Docker Hub..."
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            echo "Building Frontend..."
            docker build -t $FRONTEND_IMAGE:latest ./frontend
            
            echo "Pushing Frontend..."
            docker push $FRONTEND_IMAGE:latest
          '''
        }
      }
    }

    stage('Test Run with Compose') {
      steps {
        sh 'docker compose up -d'
        sh 'sleep 10' 
        sh 'docker ps'
      }
    }

    stage('Cleanup') {
      steps {
        sh 'docker compose down'
      }
    }

    stage('Deploy to EC2') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
          sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_KEY', usernameVariable: 'EC2_USER'),
          string(credentialsId: 'ec2-server-ip', variable: 'EC2_IP')
        ]) {
          script {
            // SSH Options to avoid host key checking (for demo purposes)
            def sshOptions = "-o StrictHostKeyChecking=no -i $EC2_KEY"
            
            // 1. Copy the production compose file to the EC2 server
            sh "scp $sshOptions docker-compose.prod.yaml $EC2_USER@$EC2_IP:docker-compose.yaml"
            
            // 2. SSH into EC2 and deploy
            sh """
              ssh $sshOptions $EC2_USER@$EC2_IP '
                echo "Logging into Docker Hub on EC2..."
                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                
                echo "Pulling latest images..."
                docker compose pull
                
                echo "Deploying application..."
                docker compose up -d
                
                echo "Cleaning up..."
                docker image prune -f
              '
            """
          }
        }
      }
    }
  }

  post {
    failure {
      echo '❌ Build Failed!'
    }
    success {
      echo '✅ Build and Push Succeeded!'
    }
  }
}
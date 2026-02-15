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
          string(credentialsId: 'ec2-server-ip', variable: 'EC2_IP'),
          string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
        ]) {
          script {
             sh '''
                # Secure SSH Options
                SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $EC2_KEY"
                
                echo "Deploying to $EC2_USER@$EC2_IP..."

                # 1. Copy the production compose file
                scp $SSH_OPTS docker-compose.prod.yaml $EC2_USER@$EC2_IP:docker-compose.yaml
                
                # 2. Create .env file locally and copy it to remote server
                echo "REACT_APP_API_URL=http://$EC2_IP:4000" > .env
                echo "JWT_SECRET=$JWT_SECRET" >> .env
                scp $SSH_OPTS .env $EC2_USER@$EC2_IP:.env

                # 3. Login to Docker Hub
                echo "$DOCKER_PASS" | ssh $SSH_OPTS $EC2_USER@$EC2_IP "sudo docker login -u '$DOCKER_USER' --password-stdin"
                
                # 4. Cleanup old containers (Aggressive)
                ssh $SSH_OPTS $EC2_USER@$EC2_IP "
                    echo 'Cleaning up ports...'
                    sudo systemctl stop mysql || true
                    sudo systemctl stop mariadb || true
                    sudo docker rm -f gemstone-mysql-1 || true
                    sudo docker ps -q --filter 'publish=3306' | xargs -r sudo docker rm -f
                    sudo docker compose down --remove-orphans || true
                "

                # 5. Pull and Deploy
                ssh $SSH_OPTS $EC2_USER@$EC2_IP "
                    echo 'Pulling and Deploying...'
                    sudo docker compose pull
                    sudo docker compose up -d
                    sudo docker image prune -f
                "
            '''
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
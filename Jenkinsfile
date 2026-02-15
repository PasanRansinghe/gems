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
                # Using known_hosts matching /dev/null to automatically accept new keys (careful in prod)
                SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $EC2_KEY"
                
                echo "Deploying to $EC2_USER@$EC2_IP..."

                # 1. Copy the production compose file
                scp $SSH_OPTS docker-compose.prod.yaml $EC2_USER@$EC2_IP:docker-compose.yaml
                
                # 2. Login to Docker Hub (piping password securely)
                # We pipe the password into SSH, which pipes it to 'docker login' on the remote end
                echo "$DOCKER_PASS" | ssh $SSH_OPTS $EC2_USER@$EC2_IP "sudo docker login -u '$DOCKER_USER' --password-stdin"
                
                # 3. Pull and Deploy (using sudo)
                # We export the variables inside the SSH session so docker compose can pick them up
                ssh $SSH_OPTS $EC2_USER@$EC2_IP "
                    export REACT_APP_API_URL='http://$EC2_IP:4000'
                    export JWT_SECRET='$JWT_SECRET'
                    
                    echo 'Performing aggressive cleanup...'
                    # 1. Stop host-level database services if running
                    sudo systemctl stop mysql || true
                    sudo systemctl stop mariadb || true
                    
                    # 2. Force remove specific conflicting container
                    sudo docker rm -f gemstone-mysql-1 || true
                    
                    # 3. Force remove ANY container using port 3306
                    sudo docker ps -q --filter 'publish=3306' | xargs -r sudo docker rm -f
                    
                    echo 'Stopping current project containers...'
                    sudo -E docker compose down --remove-orphans

                    echo 'Wait for ports to free up...'
                    sleep 5

                    echo 'Pulling latest images...'
                    sudo -E docker compose pull
                    
                    echo 'Deploying application...'
                    sudo -E docker compose up -d
                    
                    echo 'Cleaning up...'
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
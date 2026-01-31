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
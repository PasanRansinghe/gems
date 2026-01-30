pipeline {
    agent any

    environment {
        // Defines the Docker Hub credentials ID (configure this in Jenkins Credentials)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_USERNAME = 'your_dockerhub_username' // Replace with your actual username or use a secret text credential
        // Define the image names
        BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    echo 'Logging into Docker Hub...'
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo 'Building Docker Images...'
                    // We use docker compose build to build using the docker-compose.yaml spec
                    // The .env file or environment variable might be needed for DOCKER_HUB_USERNAME in compose
                    // We export the variable so docker-compose can see it
                    sh "export DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} && docker compose build"
                }
            }
        }

        stage('Push') {
            steps {
                script {
                    echo 'Pushing Docker Images...'
                    sh "export DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} && docker compose push"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying Application...'
                    // Pull the latest images and restart containers
                    sh "export DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} && docker compose pull"
                    sh "export DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} && docker compose up -d"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
            // Lookup cleanup commands if needed, e.g. docker system prune
             sh 'docker logout'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}

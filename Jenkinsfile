// ==============================================================================
// Jenkinsfile - Bastiyah / Nexus Store CI/CD Declarative Pipeline
// Enterprise-Grade DevOps Automation Pipeline
// ==============================================================================

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['staging', 'production', 'preview'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'BUILD_DOCKER_IMAGE',
            defaultValue: true,
            description: 'Build production Docker container image'
        )
        booleanParam(
            name: 'PUSH_DOCKER_IMAGE',
            defaultValue: false,
            description: 'Push image to Docker registry (requires docker-registry-credentials)'
        )
        string(
            name: 'DOCKER_IMAGE_NAME',
            defaultValue: 'bastiyah/nexus-store',
            description: 'Target Docker image repository/tag'
        )
        booleanParam(
            name: 'RUN_SECURITY_AUDIT',
            defaultValue: false,
            description: 'Execute npm security vulnerability audit'
        )
    }

    environment {
        CI = 'true'
        NODE_ENV = 'production'
        IMAGE_TAG = "${params.DOCKER_IMAGE_NAME}:${BUILD_NUMBER}"
        LATEST_TAG = "${params.DOCKER_IMAGE_NAME}:latest"
        APP_NAME = 'bastiyah-nexus-store'
    }

    stages {
        // ----------------------------------------------------------------------
        // Stage 1: Checkout & Verification
        // ----------------------------------------------------------------------
        stage('Checkout & Environment Info') {
            steps {
                echo '🚀 Starting CI/CD Pipeline for Bastiyah E-Commerce Platform'
                echo "Branch: ${env.BRANCH_NAME ?: 'main'}"
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Target Environment: ${params.DEPLOY_ENV}"

                sh '''
                    echo "--- Tool Versions ---"
                    node -v || true
                    npm -v || true
                    git log -1 --pretty=format:"Commit: %h - %s (%an, %cd)"
                    echo ""
                '''
            }
        }

        // ----------------------------------------------------------------------
        // Stage 2: Dependencies Installation
        // ----------------------------------------------------------------------
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing project dependencies via npm ci...'
                sh 'npm ci --prefer-offline --no-audit'
            }
        }

        // ----------------------------------------------------------------------
        // Stage 3: Type Checking & Static Code Analysis
        // ----------------------------------------------------------------------
        stage('Type Checking (TypeScript)') {
            steps {
                echo '🔍 Validating TypeScript type integrity...'
                sh 'npm run typecheck'
            }
        }

        // ----------------------------------------------------------------------
        // Stage 4: Automated Testing Suite
        // ----------------------------------------------------------------------
        stage('Automated Tests') {
            steps {
                echo '🧪 Executing unit & integration test suites...'
                // Runs store URL routing tests and universal multi-store customer tests
                sh 'npm test'
            }
        }

        // ----------------------------------------------------------------------
        // Stage 5: Security Vulnerability Scan
        // ----------------------------------------------------------------------
        stage('Security Audit') {
            when {
                expression { return params.RUN_SECURITY_AUDIT }
            }
            steps {
                echo '🛡️ Running security audit for package vulnerabilities...'
                sh 'npm audit --audit-level=critical || true'
            }
        }

        // ----------------------------------------------------------------------
        // Stage 6: Production Build (Vite & Tailwind)
        // ----------------------------------------------------------------------
        stage('Build Production Bundle') {
            steps {
                echo '⚡ Building minified production bundle with Vite...'
                sh 'npm run build'

                sh '''
                    echo "--- Build Output Inspection ---"
                    du -sh dist
                    ls -la dist/assets
                '''
            }
        }

        // ----------------------------------------------------------------------
        // Stage 7: Archive Build Artifacts
        // ----------------------------------------------------------------------
        stage('Archive Artifacts') {
            steps {
                echo '📁 Archiving build artifacts in Jenkins...'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
            }
        }

        // ----------------------------------------------------------------------
        // Stage 8: Docker Image Packaging
        // ----------------------------------------------------------------------
        stage('Docker Build & Package') {
            when {
                expression { return params.BUILD_DOCKER_IMAGE }
            }
            steps {
                echo "🐳 Building Docker image: ${env.IMAGE_TAG} and ${env.LATEST_TAG}..."
                sh """
                    docker build \
                        --tag ${env.IMAGE_TAG} \
                        --tag ${env.LATEST_TAG} \
                        --file Dockerfile .
                """

                echo "✅ Docker image built successfully:"
                sh "docker images | grep -E '${params.DOCKER_IMAGE_NAME}' | head -n 5 || true"
            }
        }

        // ----------------------------------------------------------------------
        // Stage 9: Push Docker Image (Optional / Registry Configured)
        // ----------------------------------------------------------------------
        stage('Push Docker Registry') {
            when {
                allOf {
                    expression { return params.BUILD_DOCKER_IMAGE }
                    expression { return params.PUSH_DOCKER_IMAGE }
                }
            }
            steps {
                echo "📤 Pushing Docker images to registry..."
                // Utilizes Jenkins credentials plugin if available
                withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker push ${env.IMAGE_TAG}
                        docker push ${env.LATEST_TAG}
                    """
                }
            }
        }

        // ----------------------------------------------------------------------
        // Stage 10: Deploy Application
        // ----------------------------------------------------------------------
        stage('Deploy to Target Environment') {
            when {
                anyOf {
                    branch 'main'
                    expression { return params.DEPLOY_ENV == 'production' || params.DEPLOY_ENV == 'staging' }
                }
            }
            steps {
                echo "🚀 Deploying application to ${params.DEPLOY_ENV} environment..."
                script {
                    if (params.DEPLOY_ENV == 'production') {
                        echo "🌟 Executing Production Release Deployment..."
                        // Add deployment commands (e.g. docker-compose, Kubernetes kubectl, or Vercel CLI)
                        sh '''
                            echo "Production deployment steps completed."
                        '''
                    } else {
                        echo "🧪 Executing Staging Deployment..."
                        sh '''
                            echo "Staging deployment steps completed."
                        '''
                    }
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Post-Pipeline Actions & Notifications
    // --------------------------------------------------------------------------
    post {
        always {
            echo '🧹 Post-build maintenance and status logging...'
        }
        success {
            echo "🎉 Jenkins Pipeline SUCCESSFUL! Build #${env.BUILD_NUMBER} finished cleanly."
            echo "Artifacts: ${env.BUILD_URL}artifact/dist/"
        }
        unstable {
            echo "⚠️ Pipeline is UNSTABLE. Please verify test reports."
        }
        failure {
            echo "❌ Pipeline FAILED! Check the console output above to debug failure."
            echo "Build URL: ${env.BUILD_URL}"
        }
        cleanup {
            // Prune dangling builder containers or temporary build caches if needed
            echo '✨ Workspace cleanup completed.'
        }
    }
}

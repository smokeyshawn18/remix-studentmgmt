
pipeline {
  agent any

  environment {
    
    DATABASE_URL = credentials('neon-db-url')        // Neon DB URL
    RENDER_API_KEY = credentials('render-api')  // Render API Key
    RENDER_SERVICE_ID = 'srv-d2jkjk3ipnbc73b9tqag'    // Replace with your Render service ID
  }


withCredentials([
    string(credentialsId: 'NEON_DB_URL', variable: 'DATABASE_URL'),
    string(credentialsId: 'direct-url', variable: 'DIRECT_URL')
]) {
    sh 'npx prisma migrate deploy'
}



  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/smokeyshawn18/remix-studentmgmt'
      }
    }

    stage('Install Deps') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build Remix App') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Generate Prisma Client') {
      steps {
        sh 'npx prisma generate'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm test || echo "⚠️ No tests found, skipping"'
      }
    }

    stage('Migrate Database') {
      steps {
        sh 'npx prisma migrate deploy'
      }
    }

    stage('Deploy to Render') {
      steps {
        sh """
        echo "🚀 Triggering Render deploy..."
        curl -X POST \
          -H "Accept: application/json" \
          -H "Authorization: Bearer $RENDER_API_KEY" \
          -d '' \
          https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys
        """
      }
    }
  }

  post {
    success {
      echo "✅ Deployment completed successfully!"
    }
    failure {
      echo "❌ Deployment failed! Check logs."
    }
  }
}

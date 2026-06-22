pipeline {
  agent any

  tools {
    nodejs 'NodeJS-18'
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  stages {
    stage('Checkout') {
      steps {
        echo '🔍 Récupération du code depuis GitHub...'
        checkout scm
        sh 'git log --oneline -1'
      }
    }

    stage('Install') {
      steps {
        echo '📦 Installation des dépendances avec npm ci...'
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        echo '✅ Vérification du code avec ESLint...'
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        echo '🧪 Exécution des tests Jest avec couverture...'
        sh 'npm test -- --coverage --watchAll=false'
      }
    }

    stage('Build Docker') {
      steps {
        echo '🐳 Construction de l\'image Docker...'
        sh '''
          docker build -t taskflow-api:latest .
          docker tag taskflow-api:latest taskflow-api:build-${BUILD_NUMBER}
          docker images | grep taskflow-api
        '''
      }
    }

    stage('Deploy') {
      steps {
        echo '🚀 Déploiement avec Docker Compose...'
        sh 'docker compose up -d'
        sh 'sleep 10'
        sh 'docker compose ps'
        sh 'curl -f http://localhost/health && echo "✅ API est healthy"'
      }
    }
  }

  post {
    always {
      echo '📊 Rapport de couverture des tests:'
      sh '''
        if [ -f coverage/coverage-summary.json ]; then
          echo "📈 Résumé de couverture:"
          cat coverage/coverage-summary.json | grep -E "lines|statements|functions|branches" || true
        fi
      '''
    }

    success {
      echo '✅ Pipeline réussi avec succès!'
      echo '🎉 L\'application est déployée et accessible à: http://localhost/api/tasks'
      echo '📊 Accédez au Jenkins UI: http://localhost:8080'
    }

    failure {
      echo '❌ Le pipeline a échoué!'
      echo "Stage en erreur: ${STAGE_NAME}"
      echo '📝 Vérifiez les logs ci-dessus pour identifier le problème'
    }
  }
}

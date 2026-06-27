pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  triggers {
    githubPush()
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
        sh 'npm test -- --coverage'
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
        sh '''
          docker compose stop api mongodb nginx || true
          docker compose up -d --build api mongodb nginx
          docker compose ps

          # Jenkins runs inside a container, so localhost is not the host-published port 80.
          # Probe the nginx service on the Docker network with retries.
          for i in $(seq 1 20); do
            if curl -fsS http://nginx/health >/dev/null; then
              echo "✅ API est healthy via Nginx"
              exit 0
            fi

            echo "⏳ Health-check Nginx/API en attente ($i/20)..."
            sleep 3
          done

          echo "❌ Health-check Nginx/API en échec"
          docker compose ps
          docker compose logs --tail=80 api nginx
          exit 1
        '''
      }
    }
  }

  post {
    always {
      echo '📊 Rapport de couverture des tests:'
      sh '''
        if [ -f coverage/coverage-summary.json ]; then
          node -e "
            const c = require('./coverage/coverage-summary.json').total;
            console.log('Statements : ' + c.statements.pct + '%');
            console.log('Branches   : ' + c.branches.pct + '%');
            console.log('Functions  : ' + c.functions.pct + '%');
            console.log('Lines      : ' + c.lines.pct + '%');
          "
        else
          echo 'Pas de rapport de couverture disponible'
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

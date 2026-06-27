# TaskFlow API

![Jenkins Pipeline](https://img.shields.io/badge/Jenkins-pipeline%20configur%C3%A9-brightgreen)

TaskFlow API est une API REST de gestion de tâches basée sur Node.js, Express et MongoDB.
Le projet est conteneurisé avec Docker, exposé via Nginx, et automatisé avec un pipeline Jenkins déclaratif.
Le flux CI/CD exécute lint, tests, build Docker et déploiement à chaque push sur la branche configurée.

## Prérequis

- Docker Desktop (Docker Engine + Docker Compose)
- Node.js 18+
- Git
- Jenkins (fourni dans docker-compose)
- ngrok (utilisé uniquement pour les tests de webhook en local)

## Démarrage Rapide

```bash
git clone https://github.com/yduclospro-dev/TaskFlow-API.git
cd TaskFlow-API
docker compose up -d --build
```

Points d'accès:

- API via Nginx: http://localhost/api/tasks
- Healthcheck: http://localhost/health
- Jenkins UI: http://localhost:8080

## Variables D'environnement

Créez un fichier local `.env` à partir de `.env.example`.

| Variable    | Description                                            | Exemple                            |
| ----------- | ------------------------------------------------------ | ---------------------------------- |
| `MONGO_URI` | URI de connexion MongoDB utilisée par le conteneur API | `mongodb://mongodb:27017/taskflow` |
| `PORT`      | Port interne de l'API                                  | `5000`                             |
| `NODE_ENV`  | Environnement d'exécution                              | `development`                      |

## Endpoints API

- `GET /health`
  - Rôle: vérifie l'état de l'API (utilisé pour les healthchecks Docker/Jenkins).
  - Réponse attendue: `200` avec `{ status, uptime, version }`.

- `GET /api/tasks`
  - Rôle: retourne la liste des tâches.
  - Réponse attendue: `200` avec un tableau JSON (vide ou non).

- `POST /api/tasks`
  - Rôle: crée une nouvelle tâche.
  - Body JSON: `{ "title": "...", "description": "...", "status": "todo|in-progress|done" }`.
  - Réponse attendue: `201` avec la tâche créée.
  - Cas d'erreur: `400` si `title` est absent ou vide.

- `GET /api/tasks/:id`
  - Rôle: récupère une tâche par son identifiant.
  - Réponse attendue: `200` avec la tâche.
  - Cas d'erreur: `404` si la tâche n'existe pas.

- `PUT /api/tasks/:id`
  - Rôle: met à jour une tâche existante (principalement le statut).
  - Body JSON exemple: `{ "status": "done" }`.
  - Réponse attendue: `200` avec la tâche mise à jour.

- `DELETE /api/tasks/:id`
  - Rôle: supprime une tâche.
  - Réponse attendue: `200` ou `204` selon l'implémentation.

## Architecture Du Pipeline

Pipeline Jenkins déclaratif (6 stages obligatoires):

1. Checkout
2. Install (`npm ci`)
3. Lint (`npm run lint`)
4. Test (`npm test -- --coverage`)
5. Build Docker (`taskflow-api:latest` et `taskflow-api:build-${BUILD_NUMBER}`)
6. Deploy (`docker compose up -d --build api mongodb nginx`)

Description rapide des stages:

- **Checkout**: récupère le code source du dépôt GitHub dans l'espace de travail Jenkins.
- **Install**: installe les dépendances Node.js de manière reproductible avec `npm ci`.
- **Lint**: vérifie la qualité du code avec ESLint et stoppe le pipeline en cas de violation.
- **Test**: exécute les tests unitaires/intégration avec Jest et génère la couverture.
- **Build Docker**: construit l'image API et applique deux tags (`latest` et `build-${BUILD_NUMBER}`).
- **Deploy**: redéploie les services applicatifs (`api`, `mongodb`, `nginx`) via Docker Compose puis vérifie la santé applicative.

```text
GitHub Push (webhook)
		 |
		 v
+-----------+    +----------+    +--------+    +--------+    +--------------+    +--------+
| 1 CHECKOUT| -> |2 INSTALL | -> |3 LINT  | -> |4 TEST  | -> |5 BUILD DOCKER| -> |6 DEPLOY|
+-----------+    +----------+    +--------+    +--------+    +--------------+    +--------+
																						 |
																						 v
																				API + MongoDB + Nginx UP
```

Blocs post:

- `always`: affiche le résumé de couverture
- `success`: affiche le message de succès de déploiement
- `failure`: affiche le stage en erreur

Déclenchement automatique:

- Webhook GitHub vers l'endpoint Jenkins `/github-webhook/`

## Infrastructure

- Service `api`: Node.js + Express
- Service `mongodb`: volume persistant `mongo_data`
- Service `nginx`: reverse proxy vers `api:5000`
- Service `jenkins`: orchestration CI/CD avec accès au socket Docker
- Réseau dédié bridge: `taskflow_net`

## Répartition Des Tâches

Complétez cette section avec la répartition finale réelle du binôme avant rendu.

- Yann: développement API, tests unitaires et intégration, conteneurisation, orchestration
- Loris: pipeline jenkins CI/CD,, rédaction du rapport

## Difficultés Rencontrées Et Solutions

- **Déclenchement automatique Jenkins en local**
  - Difficulté: Jenkins était lancé localement et ne pouvait pas être joint directement par GitHub pour recevoir le webhook.
  - Solution: utilisation de ngrok pour exposer temporairement Jenkins via une URL publique et configurer correctement le webhook GitHub.

- **Healthcheck de déploiement dans Jenkins**
  - Difficulté: le contrôle de santé en fin de pipeline utilisait `localhost`, ce qui pointait vers le conteneur Jenkins et non vers le service Nginx.
  - Solution: adaptation du stage Deploy pour vérifier `http://nginx/health` sur le réseau Docker interne avec plusieurs tentatives.

- **Variables d'environnement dans Docker Compose**
  - Difficulté: certaines variables comme `PORT` n'étaient pas toujours disponibles dans le contexte Jenkins, ce qui rendait le healthcheck instable.
  - Solution: ajout de valeurs par défaut dans `docker-compose.yml` et correction de l'évaluation des variables dans le healthcheck.

## Notes De Sécurité

- `.env` est ignoré et non versionné.
- `.env.example` est versionné pour documenter les variables requises.
- Aucun secret n'est écrit en dur dans le Jenkinsfile.

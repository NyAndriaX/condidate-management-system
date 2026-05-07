# Candidate Management System

[![CI](https://github.com/NyAndriaX/condidate-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/NyAndriaX/condidate-management-system/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/NyAndriaX/condidate-management-system/branch/main/graph/badge.svg)](https://codecov.io/gh/NyAndriaX/condidate-management-system)

Application full stack de gestion de candidats développée avec Node.js, Express, MongoDB et React.

---

## Stack technique

| Couche    | Technologie |
|-----------|-------------|
| Backend   | Node.js · Express · TypeScript · MongoDB (Mongoose) |
| Frontend  | React · TypeScript · Ant Design · React Hook Form · Zod |
| Tests     | Jest · Supertest · Playwright · k6 · axe-core · MSW |
| CI/CD     | GitHub Actions · Codecov |
| Conteneurs | Docker · docker-compose |

---

## Installation & démarrage

### Prérequis
- [Docker](https://www.docker.com/) et [docker-compose](https://docs.docker.com/compose/)
- Node.js ≥ 20 (développement local uniquement)

### Démarrage avec Docker (recommandé)

```bash
# 1. Cloner le repo
git clone https://github.com/NyAndriaX/condidate-management-system.git
cd condidate-management-system

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Modifier JWT_SECRET dans backend/.env

# 3. Lancer tous les services
docker-compose up --build

# L'application est disponible sur :
# → Frontend : http://localhost:3000
# → Backend  : http://localhost:5000
# → MongoDB  : localhost:27017
```

### Démarrage en développement local

```bash
# Backend
cd backend
npm install
cp .env.example .env     # Configurer MONGODB_URI et JWT_SECRET
npm run dev              # http://localhost:5000

# Frontend (dans un autre terminal)
cd frontend
yarn install
cp .env.example .env     # REACT_APP_API_URL=http://localhost:5000/api
yarn start               # http://localhost:3000
```

### Seed de la base de données

```bash
cd backend
npm run seed
# Crée 2 utilisateurs + 5 candidats de démonstration

# Comptes disponibles :
# admin@cms.local     / Admin1234!
# recruiter@cms.local / Recruiter1234!
```

---

## API Endpoints

Base URL : `http://localhost:5000/api`

### Auth
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion — retourne un JWT |

### Candidats (JWT requis)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/candidates` | Liste paginée + filtres |
| POST | `/candidates` | Création avec validation Zod |
| GET | `/candidates/:id` | Récupération par ID |
| PUT | `/candidates/:id` | Mise à jour partielle |
| DELETE | `/candidates/:id` | Soft delete |
| POST | `/candidates/:id/validate` | Validation asynchrone (délai 2s simulé) |

---

## Stratégie de tests

### Vue d'ensemble

```
backend/tests/
├── unit/             # Jest — services, modèles, middleware
├── integration/      # Supertest — tous les endpoints avec MongoDB en mémoire
├── e2e/              # Playwright — scénario complet connexion→création→validation→suppression
├── security/         # Injection SQL, brute force JWT, XSS
└── load/             # k6 — 500 requêtes simultanées sur POST /candidates

frontend/src/
├── components/**/*.test.tsx   # Tests composants avec RTL + MSW
├── hooks/useCandidates.test.tsx
├── utils/formatters.test.ts
└── a11y/accessibility.test.tsx  # axe-core
```

### Tests unitaires — Backend

```bash
cd backend
npm run test:unit
# Cible : 100% coverage sur services et modèles
```

Couvre :
- `CandidateService` — create, findById, update, softDelete, validate, findAll
- `UserModel` — hachage bcrypt, comparePassword
- `CandidateModel` — validations schema, softDelete, findActive
- Middleware auth, validation

### Tests unitaires — Frontend

```bash
cd frontend
yarn test --watchAll=false
# Cible : 100% coverage sur hooks et utilitaires
```

Couvre :
- `useCandidates` hook (React Query)
- `formatters.ts` — formatDate, formatStatus, formatPhoneNumber
- Composants CandidateList, CandidateForm, CandidateDetail

### Tests d'intégration — Backend

```bash
cd backend
npm run test:integration
# Supertest + mongodb-memory-server
```

Couvre tous les endpoints avec base réelle en mémoire.

### Tests d'intégration — Frontend (MSW)

Les tests composants utilisent **Mock Service Worker** pour intercepter les appels API :
- `frontend/src/mocks/handlers.ts` — handlers MSW
- `frontend/src/mocks/server.ts` — serveur MSW Node

### Tests E2E (Playwright)

```bash
cd backend
npx playwright install chromium
npm run test:e2e
# Scénario : connexion → création candidat → validation → suppression
# Capture d'écran automatique en cas d'échec
```

### Tests de sécurité

```bash
cd backend
npm run test:security
```

- Injection SQL via les champs de l'API
- Brute force sur `/auth/login` (rate limiting)
- XSS dans les champs candidat
- Sécurité JWT (token invalide, expiré, malformé)

### Tests de charge (k6)

```bash
# Prérequis : k6 installé (https://k6.io/docs/getting-started/installation/)
cd backend/tests/load
k6 run load-test.js
# Simule 500 requêtes simultanées sur POST /api/candidates
```

---

## Rapport de couverture

| Scope | Lignes | Fonctions | Branches |
|-------|--------|-----------|----------|
| Backend services | ≥ 90% | ≥ 90% | ≥ 90% |
| Frontend hooks/utils | ≥ 90% | ≥ 90% | ≥ 90% |

Rapport complet disponible sur [Codecov](https://codecov.io/gh/NyAndriaX/condidate-management-system).

---

## Rapport de performance (k6)

Scénario : 500 VUs simultanés sur `POST /api/candidates` pendant 30 secondes.

| Métrique | Valeur cible |
|----------|-------------|
| Temps de réponse médian (p50) | < 200ms |
| Temps de réponse p95 | < 500ms |
| Taux d'erreur | < 1% |
| Requêtes/s | > 200 req/s |

---

## CI/CD

Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute automatiquement à chaque push/PR :

1. **Lint** ESLint + Prettier
2. **Type check** TypeScript strict
3. **Tests unitaires** avec couverture
4. **Tests d'intégration** avec MongoDB service
5. **Tests de sécurité**
6. **Coverage gate** — bloque le merge si couverture < 90%
7. **Tests E2E** Playwright (après validation des tests unitaires)
8. **Upload coverage** vers Codecov

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/candidates_db?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Architecture

```
candidate-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, env, logger
│   │   ├── controllers/    # Logique des endpoints
│   │   ├── middleware/     # Auth JWT, rate limiter, validation, erreurs
│   │   ├── models/         # Mongoose (User, Candidate)
│   │   ├── routes/         # Définition des routes
│   │   ├── scripts/        # Seed
│   │   ├── services/       # Logique métier
│   │   ├── utils/          # AppError, asyncHandler
│   │   └── validators/     # Schémas Zod
│   └── tests/              # unit / integration / e2e / security / load
├── frontend/
│   └── src/
│       ├── components/     # CandidateList, CandidateForm, CandidateDetail
│       ├── hooks/          # useCandidates (React Query)
│       ├── pages/          # HomePage, LoginPage, RegisterPage, CandidatesPage
│       ├── services/       # api, authService, candidateService
│       ├── types/          # TypeScript types
│       └── utils/          # formatters
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

---

## Déploiement (Render)

Le projet peut être déployé sur [Render](https://render.com) :

1. **Backend** : Web Service → Node.js → `npm run build && npm start`
2. **Frontend** : Static Site → `yarn build` → dossier `build/`
3. **MongoDB** : Utiliser [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuit)

> Lien de démonstration : *(à renseigner après déploiement)*

# 🚀 Horizon AI

**Plateforme d'entreprise pour centraliser, analyser et sécuriser les données avec l'intelligence artificielle.**

Horizon AI est une solution numérique complète permettant aux entreprises de gérer leurs données de manière centralisée, de les analyser grâce à l'IA et de les sécuriser efficacement.

## 🎯 Objectif du Projet

Horizon AI s'inscrit dans le cadre du fil rouge technique visant à concevoir, développer et mettre en production une solution numérique complète et intégrée. La plateforme permet aux entreprises de :

- **📊 Centraliser** leurs données de multiples sources en un seul endroit
- **🤖 Analyser** leurs données avec l'intelligence artificielle pour obtenir des insights
- **🔒 Sécuriser** leurs données avec des mesures de protection avancées

## ✨ Fonctionnalités

### 📈 Tableau de bord
- Vue d'ensemble de la plateforme
- Statistiques en temps réel
- Indicateurs de performance clés (KPI)

### 🤖 Analyse IA
- Analyse de données avec intelligence artificielle
- Génération d'insights et de recommandations
- Interface intuitive pour poser des questions sur vos données

### 📁 Centralisation des données
- Import de fichiers (CSV, JSON, Excel)
- Connexions API pour synchroniser les données
- Stockage cloud sécurisé
- Visualisation des données centralisées

### 🔐 Sécurité & Monitoring
- Monitoring en temps réel de l'infrastructure
- Alertes de sécurité
- Statut de sécurité détaillé
- Rapports et audits

## 🏗️ Architecture

### Frontend
- **React 18** avec Hooks et composants fonctionnels
- **Tailwind CSS** pour un design moderne et responsive
- **Vite** pour le développement et le build
- Interface dashboard professionnelle multi-sections

### Backend
- **Node.js + Express.js** (TypeScript)
- Architecture Clean Code (Router/Controller/Service)
- **MongoDB** pour le stockage des données
- **JWT** pour l'authentification sécurisée
- Intégration **OpenRouter** pour l'IA (Google Gemini)

## 📁 Structure du Projet

```
Horizon IA/
├── back/                    # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── routes/         # Routes Express
│   │   ├── controllers/    # Contrôleurs
│   │   ├── services/       # Services métier
│   │   └── middleware/     # Middleware (JWT)
│   ├── server.ts           # Point d'entrée
│   ├── package.json        # Dépendances backend
│   ├── tsconfig.json       # Config TypeScript
│   └── .env                # Variables d'environnement backend
│
├── front/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx         # Composant principal (Dashboard)
│   │   ├── main.jsx        # Point d'entrée React
│   │   └── index.css       # Styles Tailwind
│   ├── index.html          # HTML principal
│   ├── package.json        # Dépendances frontend
│   ├── vite.config.js      # Config Vite
│   ├── tailwind.config.js  # Config Tailwind
│   └── .env                # Variables d'environnement frontend
│
├── README.md               # Ce fichier
├── DEPLOY.md               # Guide de déploiement
├── MODELS.md               # Guide des modèles LLM
└── .gitignore              # Fichiers à ignorer
```

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- MongoDB (local ou Atlas)
- Compte OpenRouter avec clé API

### Installation du Backend

```bash
cd back
npm install
```

Créez un fichier `.env` dans `back/` :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/horizon-ai
# ou mongodb+srv://user:password@cluster.mongodb.net/horizon-ai
MONGODB_DB_NAME=horizon-ai
OPENROUTER_API_KEY=sk-or-v1-votre_cle_openrouter
JWT_SECRET=votre_cle_secrete_jwt
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:3000
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

### Installation du Frontend

```bash
cd front
npm install
```

Créez un fichier `.env` dans `front/` :
```env
VITE_API_URL=http://localhost:3000
```

## 🏃 Lancement

### Backend (Terminal 1)
```bash
cd back
npm run dev    # Mode développement (avec rechargement automatique)
# ou
npm run build  # Build pour production
npm start      # Lancer en production
```

### Frontend (Terminal 2)
```bash
cd front
npm run dev    # Mode développement (http://localhost:5173)
# ou
npm run build  # Build pour production
npm run preview # Prévisualiser le build
```

L'application sera accessible sur `http://localhost:5173`

## 🔧 Technologies

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB
- JWT (jsonwebtoken)
- bcryptjs
- OpenRouter API (pour l'IA)

### Frontend
- React 18
- Vite
- Tailwind CSS

## 📖 Documentation Complète

Consultez les fichiers dans chaque dossier :
- `DEPLOY.md` - Guide complet de déploiement (Railway, Render, Fly.io, etc.)
- `MODELS.md` - Guide des modèles LLM disponibles et configuration

## 🎨 Interface Utilisateur

L'interface est organisée en plusieurs sections accessibles depuis la sidebar :

1. **Tableau de bord** - Vue d'ensemble avec statistiques et KPIs
2. **Analyse IA** - Interface pour analyser les données avec l'IA
3. **Centralisation** - Gestion et import de données
4. **Sécurité** - Monitoring et sécurité de l'infrastructure

## 🔐 Authentification

- Système d'authentification sécurisé avec JWT
- Inscription et connexion
- Tokens stockés dans le localStorage
- Protection des routes API avec middleware JWT

## 📝 Notes importantes

- **Modèle LLM** : Par défaut `google/gemini-2.0-flash-exp:free` via OpenRouter (configurable via `OPENROUTER_MODEL`)
- **Rate Limiting** : Le modèle gratuit peut être temporairement limité. Le système implémente un retry automatique avec backoff exponentiel
- **Historique** : L'historique de conversation est utilisé comme contexte (10 derniers messages)
- **Persistence** : Tous les messages sont persistés dans MongoDB pour maintenir l'historique
- **Architecture** : Clean Code facilitant les tests et la maintenance
- **Tokens JWT** : Stockés dans le localStorage du navigateur

## 🚀 Déploiement

Consultez le fichier `DEPLOY.md` pour les instructions complètes de déploiement.

**Options recommandées :**
- **Railway** : Simple, gratuit, déploiement automatique
- **Render** : Alternative gratuite avec MongoDB Atlas
- **Fly.io** : Performant avec edge network global

## 📄 Licence

ISC

## 👥 Auteur

Projet développé dans le cadre du fil rouge technique Horizon AI.

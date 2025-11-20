# 🚀 Horizon AI Chat

Application de chat IA avec authentification, similaire à OpenAI Chat. Interface conversationnelle moderne avec historique des messages et authentification JWT.

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
│   │   ├── App.jsx         # Composant principal
│   │   ├── main.jsx        # Point d'entrée React
│   │   └── index.css       # Styles Tailwind
│   ├── index.html          # HTML principal
│   ├── package.json        # Dépendances frontend
│   ├── vite.config.js      # Config Vite
│   ├── tailwind.config.js # Config Tailwind
│   └── .env                # Variables d'environnement frontend
│
├── .env.example            # Template pour back/.env
└── README.md               # Ce fichier
```

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances backend
cd back
npm install

# Installer les dépendances frontend
cd ../front
npm install
```

### 2. Configuration

#### Backend

```bash
cd back
cp .env.example .env
# Éditez .env avec vos valeurs (MongoDB, OpenRouter, JWT)
```

#### Frontend

```bash
cd front
cp .env.example .env
# Éditez .env avec l'URL de l'API backend
```

### 3. Lancer le projet

**Terminal 1 - Backend :**
```bash
cd back
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd front
npm run dev
```

- **Backend API** : `http://localhost:3000`
- **Frontend** : `http://localhost:5173`

## 📝 Commandes

### Backend

```bash
cd back
npm run dev      # Mode développement
npm run build    # Compiler TypeScript
npm start        # Mode production
```

### Frontend

```bash
cd front
npm run dev      # Mode développement
npm run build    # Build pour production
npm run preview  # Prévisualiser le build
```

## 🔧 Technologies

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React 18
- Vite
- Tailwind CSS

## 📖 Documentation Complète

Consultez les fichiers dans chaque dossier :
- `back/README.md` (si créé) - Documentation backend
- `front/README.md` (si créé) - Documentation frontend
- `DEPLOY.md` - Guide complet de déploiement
- `MODELS.md` - Guide des modèles LLM disponibles

## 🚀 Déploiement

Consultez le fichier `DEPLOY.md` pour les instructions complètes de déploiement.

**Options recommandées :**
- **Railway** : Simple, gratuit, déploiement automatique
- **Render** : Alternative gratuite avec MongoDB Atlas
- **Fly.io** : Performant avec edge network global

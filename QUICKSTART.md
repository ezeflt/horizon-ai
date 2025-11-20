# 🚀 Guide de Démarrage Rapide - Horizon AI Chat

## Structure du Projet

Le projet est maintenant organisé en deux dossiers séparés :
- **`back/`** : Backend (Node.js + Express + TypeScript)
- **`front/`** : Frontend (React + Vite)

## Commandes pour lancer le projet

### 1. Installation (première fois uniquement)

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
# Éditez .env avec vos valeurs :
# - MONGODB_URI
# - OPENROUTER_API_KEY
# - JWT_SECRET
```

#### Frontend

```bash
cd front
cp .env.example .env
# Éditez .env avec :
# - VITE_API_URL=http://localhost:3000
```

### 3. Démarrer le projet

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

## Commandes utiles

### Backend

```bash
cd back
npm run dev      # Mode développement (rechargement auto)
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

## Vérification

1. **Backend** : Ouvrez `http://localhost:3000/health`
   - Devrait retourner : `{"status":"ok","message":"Horizon AI API is running"}`

2. **Frontend** : Ouvrez `http://localhost:5173`
   - Vous devriez voir la page de login

## Dépannage

### Erreur "MongoDB n'est pas connecté"
- Vérifiez que MongoDB est démarré (local) ou que votre URI Atlas est correcte
- Vérifiez `MONGODB_URI` dans `back/.env`

### Erreur "OPENROUTER_API_KEY n'est pas définie"
- Vérifiez que le fichier `back/.env` existe
- Vérifiez que `OPENROUTER_API_KEY` est défini
- Redémarrez le serveur backend

### Erreur "JWT_SECRET n'est pas définie"
- Générez une clé : `openssl rand -base64 32`
- Ajoutez-la dans `back/.env` comme `JWT_SECRET=...`
- Redémarrez le serveur backend

### Frontend ne se connecte pas au backend
- Vérifiez que `VITE_API_URL` dans `front/.env` pointe vers `http://localhost:3000`
- Vérifiez que le backend est bien démarré
- Vérifiez la console du navigateur pour les erreurs CORS

### Port déjà utilisé
- Backend : Changez `PORT=3000` dans `back/.env`
- Frontend : Changez le port dans `front/vite.config.js`

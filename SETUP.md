# 🚀 Guide de Configuration Rapide - Horizon AI

## Étapes de démarrage

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration MongoDB

**Option A : MongoDB Local**
```bash
# Installer MongoDB (macOS)
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community
```

**Option B : MongoDB Atlas (Cloud - Gratuit)**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Obtenez la chaîne de connexion

### 3. Configuration des variables d'environnement

Copiez le fichier d'exemple et remplissez-le avec vos valeurs :

```bash
cp .env.example .env
```

Puis éditez le fichier `.env` avec vos vraies valeurs :

```env

# Port du serveur
PORT=3000

# Clé API OpenRouter (obtenez-la sur https://openrouter.ai/)
OPENROUTER_API_KEY=sk-or-v1-votre_cle_ici

# MongoDB (choisir une option)
# Local:
MONGODB_URI=mongodb://localhost:27017
# OU Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=horizon-ai

# JWT (générez une clé secrète aléatoire)
JWT_SECRET=votre_cle_secrete_ici
JWT_EXPIRES_IN=7d

# URLs (optionnel)
APP_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3000
APP_ID=horizon-ai-default
```

**Générer une clé JWT secrète :**
```bash
# Sur macOS/Linux
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Ou utilisez Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Compilation et démarrage

#### Backend uniquement
```bash
npm run build
npm start
# ou en mode développement
npm run dev
```

#### Frontend + Backend
```bash
# Terminal 1 : Backend
npm run dev

# Terminal 2 : Frontend (avec Vite)
npm run dev:frontend
```

Le frontend sera accessible sur `http://localhost:5173`
Le backend API sera accessible sur `http://localhost:3000`

## 🔑 Obtention des clés API

### OpenRouter
1. Créez un compte sur https://openrouter.ai/
2. Allez dans "Keys"
3. Créez une nouvelle clé API
4. Copiez-la dans `.env` comme `OPENROUTER_API_KEY`

### MongoDB
- **Local** : Installez MongoDB et utilisez `mongodb://localhost:27017`
- **Atlas** : Créez un cluster gratuit et récupérez la chaîne de connexion

## ✅ Vérification

1. Backend : `curl http://localhost:3000/health` doit retourner `{"status":"ok",...}`
2. Frontend : Ouvrez `http://localhost:5173` et vérifiez que l'userId s'affiche
3. Test API : Utilisez l'interface pour soumettre une requête

## 🐛 Dépannage

### Erreur "MongoDB n'est pas initialisé"
- Vérifiez que MongoDB est démarré (local) ou que la chaîne de connexion Atlas est correcte
- Vérifiez que `MONGODB_URI` est défini dans `.env`
- Testez la connexion : `mongosh "mongodb://localhost:27017"` (pour local)

### Erreur "OPENROUTER_API_KEY n'est pas définie"
- Vérifiez que le fichier `.env` existe et contient la clé
- Redémarrez le serveur après modification de `.env`

### Erreur "JWT_SECRET n'est pas définie"
- Générez une clé secrète (voir étape 3)
- Ajoutez-la dans `.env` comme `JWT_SECRET`
- Redémarrez le serveur

### Erreur d'authentification (401 Unauthorized)
- Vérifiez que le token JWT est envoyé dans le header `Authorization: Bearer <token>`
- Vérifiez que le token n'est pas expiré
- Le frontend crée automatiquement un token au chargement, vérifiez la console du navigateur

### Erreur CORS
- Le backend inclut déjà `cors()`, mais vérifiez que le frontend pointe vers la bonne URL
- Vérifiez `REACT_APP_API_URL` dans `.env`


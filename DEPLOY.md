# 🚀 Guide de Déploiement - Horizon AI Chat

## Options de Déploiement Backend

### 1. 🟢 Railway (Recommandé - Simple et gratuit)

**Avantages :**
- ✅ Gratuit avec limitations généreuses
- ✅ Déploiement automatique depuis GitHub
- ✅ MongoDB inclus (ou utilisez MongoDB Atlas)
- ✅ Variables d'environnement faciles à configurer
- ✅ HTTPS automatique

**Étapes :**

1. Créez un compte sur [Railway](https://railway.app/)
2. Cliquez sur "New Project" → "Deploy from GitHub repo"
3. Sélectionnez votre repository
4. Railway détectera automatiquement Node.js
5. Configurez les variables d'environnement :
   ```
   PORT (auto-généré)
   MONGODB_URI=votre_uri_mongodb
   MONGODB_DB_NAME=horizon-ai
   OPENROUTER_API_KEY=votre_cle
   JWT_SECRET=votre_cle_secrete
   JWT_EXPIRES_IN=7d
   APP_URL=https://votre-app.railway.app
   ```
6. Railway déploiera automatiquement

**Configuration Railway :**
- Build Command: `cd back && npm install && npm run build`
- Start Command: `cd back && npm start`
- Root Directory: `/` (ou spécifiez `back/`)

---

### 2. 🔵 Render (Gratuit avec limitations)

**Avantages :**
- ✅ Plan gratuit disponible
- ✅ Déploiement depuis GitHub
- ✅ MongoDB Atlas intégré

**Étapes :**

1. Créez un compte sur [Render](https://render.com/)
2. "New" → "Web Service"
3. Connectez votre GitHub repo
4. Configuration :
   - **Name**: `horizon-ai-backend`
   - **Root Directory**: `back`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Ajoutez les variables d'environnement
6. Déployez !

---

### 3. 🟣 Fly.io (Excellent pour la performance)

**Avantages :**
- ✅ Très performant
- ✅ Global edge network
- ✅ Plan gratuit généreux

**Étapes :**

1. Installez Fly CLI : `curl -L https://fly.io/install.sh | sh`
2. Créez un compte : `fly auth signup`
3. Dans le dossier `back/`, créez `fly.toml` :
   ```toml
   app = "horizon-ai-backend"
   primary_region = "cdg"

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0

   [[vm]]
     memory_mb = 512
   ```
4. Déployez : `fly deploy`
5. Configurez les secrets : `fly secrets set MONGODB_URI=... OPENROUTER_API_KEY=...`

---

### 4. 🟠 DigitalOcean App Platform

**Avantages :**
- ✅ Simple et fiable
- ✅ MongoDB géré disponible
- ✅ Bon support

**Étapes :**

1. Créez un compte sur [DigitalOcean](https://www.digitalocean.com/)
2. "Create" → "Apps" → "GitHub"
3. Sélectionnez votre repo
4. Configuration :
   - **Type**: Web Service
   - **Source Directory**: `back`
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
5. Ajoutez les variables d'environnement
6. Déployez !

---

### 5. ⚫ Vercel (Serverless - nécessite ajustements)

**Note**: Vercel est optimisé pour serverless. Il faudra adapter le code.

**Avantages :**
- ✅ Excellent pour le frontend
- ✅ Serverless (pas de serveur à gérer)
- ✅ Gratuit généreux

**Ajustements nécessaires :**
- Convertir en fonctions serverless
- Adapter la connexion MongoDB (connexion par requête)

---

### 6. 🟡 AWS (EC2, Elastic Beanstalk)

**Pour production sérieuse :**

**Option A - EC2 (Serveur dédié) :**
1. Créez une instance EC2 (Ubuntu)
2. SSH dans l'instance
3. Installez Node.js, Git
4. Clonez votre repo
5. Configurez PM2 pour gérer le processus
6. Configurez Nginx comme reverse proxy

**Option B - Elastic Beanstalk :**
1. Créez une application Elastic Beanstalk
2. Uploadez votre code
3. Configurez les variables d'environnement
4. Déployez !

---

## 📋 Checklist de Déploiement

### Avant de déployer :

- [ ] Vérifiez que `npm run build` fonctionne
- [ ] Testez localement avec `npm start`
- [ ] Configurez toutes les variables d'environnement
- [ ] Vérifiez que MongoDB est accessible depuis internet (Atlas)
- [ ] Mettez à jour `APP_URL` avec l'URL de production
- [ ] Vérifiez que le port est configurable (utilise `process.env.PORT`)

### Variables d'environnement requises :

```env
PORT=3000  # Généralement auto-généré par la plateforme
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=horizon-ai
OPENROUTER_API_KEY=sk-or-v1-...
JWT_SECRET=votre_cle_secrete
JWT_EXPIRES_IN=7d
APP_URL=https://votre-backend.railway.app
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free  # Optionnel
```

---

## 🔧 Configuration pour Production

### 1. Optimiser le build

Assurez-vous que `back/package.json` a bien :
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 2. Gérer les erreurs MongoDB

Le code actuel gère déjà les erreurs, mais vous pouvez ajouter un health check endpoint.

### 3. CORS

Le code inclut déjà `cors()`. Pour la production, vous pouvez restreindre :
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://votre-frontend.vercel.app',
  credentials: true
}));
```

---

## 🎯 Recommandation

**Pour commencer rapidement : Railway ou Render**
- Facile à configurer
- Gratuit pour commencer
- Déploiement automatique depuis GitHub

**Pour production sérieuse : Fly.io ou DigitalOcean**
- Meilleure performance
- Plus de contrôle
- Scaling facile

---

## 📝 Exemple de Configuration Railway

1. Créez `railway.json` à la racine (optionnel) :
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd back && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd back && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Ou configurez directement dans l'interface Railway :
   - **Build Command**: `cd back && npm install && npm run build`
   - **Start Command**: `cd back && npm start`

---

## 🔗 Liens Utiles

- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [Fly.io](https://fly.io/)
- [DigitalOcean](https://www.digitalocean.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (pour la base de données)


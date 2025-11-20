# 📊 Guide d'Insertion des Données Simulées

## 🎯 Objectif

Ce guide explique comment insérer des données simulées de transactions dans la base de données MongoDB.

Les données seront **automatiquement chiffrées** dans la base de données (colonnes `client` et `montant`) et **déchiffrées** lors de l'affichage dans l'interface.

## 📋 Données Générées

- **Septembre 2024** : ~100 000 € de CA
- **Octobre 2024** : ~10 000 € de CA
- **Novembre 2024** : ~300 000 € de CA

## 🚀 Installation

### 1. Prérequis

Assurez-vous que :
- MongoDB est démarré (local ou Atlas)
- Les variables d'environnement sont configurées dans `back/.env`
- Les dépendances sont installées : `npm install` dans `back/`

### 2. Variables d'environnement requises

Dans `back/.env`, ajoutez :

```env
MONGODB_URI=mongodb://localhost:27017/horizon-ai
# ou pour Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/horizon-ai

MONGODB_DB_NAME=horizon-ai

# Clé de chiffrement (changez-la en production !)
ENCRYPTION_KEY=votre_cle_de_chiffrement_secrete_2024
```

**⚠️ Important** : La clé `ENCRYPTION_KEY` est cruciale pour chiffrer/déchiffrer les données. Ne la partagez jamais et changez-la en production !

## 📝 Exécution du Script

### Méthode 1 : Via npm script

```bash
cd back
npm run seed
```

### Méthode 2 : Directement avec ts-node

```bash
cd back
npx ts-node scripts/seed-transactions.ts
```

## ✅ Vérification

Après l'exécution, vous devriez voir :

```
✅ Collection vidée
📊 Génération des transactions pour septembre (CA cible: 100,000€)
  ✓ XX transactions générées (CA: 100,000€)
📊 Génération des transactions pour octobre (CA cible: 10,000€)
  ✓ XX transactions générées (CA: 10,000€)
📊 Génération des transactions pour novembre (CA cible: 300,000€)
  ✓ XX transactions générées (CA: 300,000€)
✅ XXX transactions insérées avec succès !
📈 Total de transactions en base: XXX
✅ Connexion fermée
🎉 Script terminé avec succès !
```

## 🔒 Sécurité

### Chiffrement des données

Les données sensibles sont **automatiquement chiffrées** avant l'insertion en base :

- **Colonne `clientEncrypted`** : Client chiffré (AES-256)
- **Colonne `montantEncrypted`** : Montant chiffré (AES-256)
- **Colonne `date`** : Date non chiffrée (pour les requêtes)

### Déchiffrement

Le déchiffrement est effectué **automatiquement** lors de la récupération des données via l'API. L'interface utilisateur affiche toujours les données déchiffrées.

## 🗑️ Réinitialisation

Pour supprimer toutes les transactions et réinsérer les données :

```bash
cd back
npm run seed
```

Le script vide automatiquement la collection avant d'insérer de nouvelles données.

## 🐛 Dépannage

### Erreur : "MONGODB_URI n'est pas définie"

➡️ Vérifiez que le fichier `back/.env` existe et contient `MONGODB_URI`

### Erreur : "Impossible de se connecter à MongoDB"

➡️ Vérifiez que MongoDB est démarré et que l'URI est correcte

### Erreur : "ENCRYPTION_KEY n'est pas définie"

➡️ Ajoutez `ENCRYPTION_KEY=votre_cle` dans `back/.env`

### Les données ne s'affichent pas dans l'interface

1. Vérifiez que le backend est démarré : `cd back && npm run dev`
2. Vérifiez que les transactions sont bien en base (via MongoDB Compass ou CLI)
3. Vérifiez les logs du backend pour voir les erreurs

## 📊 Structure des Données

### Document en base (chiffré)

```json
{
  "_id": "ObjectId(...)",
  "clientEncrypted": "U2FsdGVkX1...",  // Client chiffré
  "montantEncrypted": "U2FsdGVkX1...", // Montant chiffré
  "date": "2024-09-15T10:30:00.000Z",
  "createdAt": "2024-12-20T12:00:00.000Z"
}
```

### Données déchiffrées (via API)

```json
{
  "_id": "...",
  "client": "Client A",      // Déchiffré
  "montant": 1250.50,        // Déchiffré
  "date": "2024-09-15T10:30:00.000Z",
  "createdAt": "2024-12-20T12:00:00.000Z"
}
```

## 🎯 Utilisation

Une fois les données insérées :

1. **Démarrez le backend** : `cd back && npm run dev`
2. **Démarrez le frontend** : `cd front && npm run dev`
3. **Connectez-vous** à l'application
4. **Visualisez** les données dans le dashboard :
   - Graphique du CA mensuel
   - Liste des transactions (déchiffrées)
   - Export CSV disponible
5. **Analysez** avec l'IA : posez des questions sur le CA


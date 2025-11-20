# 🤖 Modèles LLM disponibles - Horizon AI Chat

## Problème de Rate Limiting (429)

Si vous rencontrez l'erreur **429 (Rate Limit)**, cela signifie que le modèle gratuit est temporairement surchargé. Le système implémente maintenant un **retry automatique** avec backoff exponentiel.

## Solutions

### 1. Attendre et réessayer (Recommandé)

Le système retente automatiquement jusqu'à 3 fois avec des délais croissants (2s, 4s, 8s). Attendez simplement quelques secondes.

### 2. Changer de modèle

Vous pouvez utiliser un autre modèle gratuit en modifiant `OPENROUTER_MODEL` dans `back/.env` :

#### Modèles gratuits recommandés :

```env
# Option 1: Meta Llama (gratuit, performant)
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free

# Option 2: Qwen (gratuit, bon pour le français)
OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct:free

# Option 3: Microsoft Phi (gratuit, léger)
OPENROUTER_MODEL=microsoft/phi-3-mini-128k-instruct:free

# Option 4: Gemini (par défaut, mais peut être limité)
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

### 3. Utiliser un modèle payant (plus de limites)

Si vous avez des crédits OpenRouter, vous pouvez utiliser des modèles payants :

```env
# Gemini Pro (payant mais plus stable)
OPENROUTER_MODEL=google/gemini-pro

# GPT-3.5 Turbo (payant)
OPENROUTER_MODEL=openai/gpt-3.5-turbo

# Claude (payant)
OPENROUTER_MODEL=anthropic/claude-3-haiku
```

## Configuration

1. Éditez `back/.env` :
   ```bash
   cd back
   nano .env  # ou votre éditeur préféré
   ```

2. Ajoutez ou modifiez :
   ```env
   OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
   ```

3. Redémarrez le serveur :
   ```bash
   npm run dev
   ```

## Liste complète des modèles

Consultez la liste complète des modèles disponibles sur : https://openrouter.ai/models

Filtrez par "Free" pour voir tous les modèles gratuits.

## Améliorations apportées

✅ **Retry automatique** : Jusqu'à 3 tentatives avec backoff exponentiel  
✅ **Messages d'erreur clairs** : L'utilisateur comprend mieux ce qui se passe  
✅ **Modèle configurable** : Facilement changeable via variable d'environnement  
✅ **Gestion des erreurs réseau** : Retry également pour les erreurs réseau


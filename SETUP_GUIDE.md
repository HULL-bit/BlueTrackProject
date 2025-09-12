# 🚀 Guide de Configuration Complète - Pirogue Connect

## 📋 Prérequis

### 1. Outils Nécessaires
```bash
# Vérifier Node.js (version 18+)
node --version

# Vérifier npm
npm --version

# Installer Git (si pas déjà installé)
git --version
```

### 2. Extensions VSCode Recommandées
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-eslint"
  ]
}
```

## 🗄️ Configuration Supabase

### Option A : Nouveau Projet Supabase (Recommandé)

#### 1. Créer un Compte Supabase
```bash
# 1. Aller sur https://supabase.com
# 2. Créer un compte gratuit
# 3. Cliquer "New Project"
```

#### 2. Configuration du Projet
```bash
# Nom du projet : pirogue-connect
# Mot de passe base : choisir un mot de passe fort (min 12 caractères)
# Région : Europe (West) - plus proche du Sénégal
```

#### 3. Récupérer les Clés API
```bash
# Dans le dashboard Supabase :
# 1. Aller dans Settings > API
# 2. Copier :
#    - Project URL (ex: https://abc123.supabase.co)
#    - anon public key (commence par eyJ...)
```

#### 4. Configuration Locale
```bash
# Créer le fichier de configuration
cp .env.example .env.local

# Éditer .env.local avec vos vraies clés :
# VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
# VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
# VITE_DEMO_MODE=false
```

#### 5. Exécuter les Migrations SQL
```sql
-- ÉTAPE 1 : Dans Supabase Dashboard
-- 1. Aller dans "SQL Editor"
-- 2. Créer une nouvelle query

-- ÉTAPE 2 : Copier-coller le contenu COMPLET du fichier :
-- supabase/migrations/20250702131712_broad_silence.sql
-- Cliquer "Run" pour exécuter

-- ÉTAPE 3 : Créer une nouvelle query
-- Copier-coller le contenu COMPLET du fichier :
-- supabase/migrations/20250702131751_ancient_waterfall.sql
-- Cliquer "Run" pour exécuter
```

### Option B : Mode Démo (Sans Supabase)

#### Configuration Rapide
```bash
# Garder VITE_DEMO_MODE=true dans .env.local
# L'application utilisera des données simulées
```

## 🚀 Commandes de Lancement

### 1. Installation Initiale
```bash
# Installer toutes les dépendances
npm install

# Vérifier l'installation
npm list --depth=0
```

### 2. Démarrage depuis VSCode

#### Terminal Intégré VSCode
```bash
# Ouvrir le terminal intégré (Ctrl+`)
# Ou : Terminal > New Terminal

# Démarrer le serveur de développement
npm run dev

# L'application sera disponible sur :
# http://localhost:5173
```

#### Scripts NPM Disponibles
```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Production
npm run build        # Créer le build de production
npm run preview      # Prévisualiser le build

# Qualité du code
npm run lint         # Vérifier le code avec ESLint
npm run lint:fix     # Corriger automatiquement les erreurs

# TypeScript
npx tsc --noEmit     # Vérifier les types TypeScript
```

### 3. Configuration VSCode

#### Fichier .vscode/settings.json
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### Fichier .vscode/launch.json (Debug)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

## 🧪 Test de l'Application

### 1. Comptes de Test Disponibles

#### Pêcheur
```
Email: amadou@example.com
Mot de passe: password123
Rôle: Pêcheur avec pirogue "Ndakaaru"
```

#### Organisation (GIE)
```
Email: fatou@gie-cayar.sn
Mot de passe: password123
Rôle: Coordinatrice GIE
```

#### Administrateur
```
Email: admin@pirogue-connect.sn
Mot de passe: password123
Rôle: Administrateur système
```

### 2. Scénarios de Test

#### Test Complet
```bash
# 1. Démarrer l'application
npm run dev

# 2. Ouvrir http://localhost:5173

# 3. Tester l'authentification
# - Se connecter avec chaque compte
# - Vérifier les interfaces différentes

# 4. Tester la géolocalisation
# - Autoriser la géolocalisation dans le navigateur
# - Vérifier l'affichage sur la carte

# 5. Tester la communication
# - Ouvrir le chat flottant
# - Envoyer des messages
# - Tester le partage de position

# 6. Tester les alertes
# - Utiliser le bouton SOS (attention : génère une vraie alerte)
# - Vérifier le centre d'alertes
```

## 🔧 Commandes de Développement

### Debug et Diagnostic
```bash
# Vérifier les logs en temps réel
npm run dev

# Ouvrir DevTools du navigateur (F12)
# - Console : voir les logs JavaScript
# - Network : voir les requêtes API
# - Application : vérifier localStorage

# Test de géolocalisation
navigator.geolocation.getCurrentPosition(
  pos => console.log('Position:', pos),
  err => console.error('Erreur:', err)
);
```

### Nettoyage
```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache
npm cache clean --force

# Nettoyer le build
rm -rf dist
```

### Build et Déploiement
```bash
# Créer un build de production
npm run build

# Tester le build localement
npm run preview

# Analyser la taille du bundle
npm run build -- --analyze
```

## 🚨 Résolution de Problèmes

### Problème : Port déjà utilisé
```bash
# Trouver le processus utilisant le port 5173
lsof -i :5173

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
npm run dev -- --port 3000
```

### Problème : Erreur de géolocalisation
```bash
# Vérifier les permissions du navigateur
# Chrome : chrome://settings/content/location
# Firefox : about:preferences#privacy

# La géolocalisation nécessite HTTPS en production
# En développement, localhost fonctionne
```

### Problème : Erreurs TypeScript
```bash
# Vérifier les types
npx tsc --noEmit

# Redémarrer le serveur TypeScript dans VSCode
# Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### Problème : Supabase Connection
```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Tester la connexion dans la console du navigateur
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Test Supabase:', { data, error });
```

## 📊 Monitoring et Performance

### Métriques de Performance
```bash
# Lighthouse audit
# DevTools > Lighthouse > Generate report

# Performance monitoring
# DevTools > Performance > Record

# Analyser le bundle
npm run build
npx vite-bundle-analyzer dist
```

### Logs et Debug
```bash
# Activer les logs détaillés
localStorage.setItem('debug', 'pirogue:*');

# Voir les logs de l'application
# DevTools > Console

# Logs réseau
# DevTools > Network
```

## 🎯 Commandes Rapides

### Démarrage Ultra-Rapide
```bash
# Installation et démarrage en une commande
npm install && npm run dev
```

### Test Complet
```bash
# 1. Ouvrir http://localhost:5173
# 2. Se connecter avec amadou@example.com / password123
# 3. Autoriser la géolocalisation
# 4. Tester le chat et les alertes
# 5. Vérifier la carte interactive
```

### Build et Preview
```bash
# Build et test de production
npm run build && npm run preview
```

## 📞 Support

En cas de problème :
1. Vérifier la console du navigateur (F12)
2. Vérifier l'onglet Network pour les erreurs API
3. Vérifier les permissions de géolocalisation
4. Redémarrer le serveur de développement
5. Vérifier les variables d'environnement

---

**L'application est maintenant prête à être lancée ! 🚢✨**
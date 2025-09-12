# 🚀 Commandes Complètes - Pirogue Connect

## 📋 Prérequis

Assurez-vous d'avoir installé :
- **Node.js 18+** : `node --version`
- **npm** : `npm --version`
- **Git** : `git --version`

## 🔧 Installation et Démarrage

### 1. Installation des Dépendances
```bash
# Installer toutes les dépendances
npm install

# Vérifier l'installation
npm list --depth=0
```

### 2. Démarrage de l'Application
```bash
# Démarrer le serveur de développement
npm run dev

# L'application sera disponible sur :
# http://localhost:5173
```

### 3. Vérification du Fonctionnement
```bash
# Ouvrir dans le navigateur
open http://localhost:5173

# Ou manuellement aller sur :
# Chrome/Firefox/Safari : http://localhost:5173
```

## 🗄️ Configuration Base de Données

### Option A : Mode Démo (Recommandé pour Test)
L'application fonctionne directement avec des données simulées.
**Aucune configuration requise !**

### Option B : PostgreSQL avec Supabase

#### 1. Créer un Compte Supabase
```bash
# Aller sur https://supabase.com
# Créer un compte gratuit
# Créer un nouveau projet
```

#### 2. Récupérer les Clés API
```bash
# Dans Supabase Dashboard :
# Settings > API > Project URL et anon key
```

#### 3. Configuration Locale
```bash
# Créer le fichier .env.local
touch .env.local

# Ajouter les variables (remplacer par vos vraies valeurs) :
echo "VITE_SUPABASE_URL=https://votre-projet.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=votre-clé-anonyme" >> .env.local
```

#### 4. Exécuter les Migrations
```sql
-- Dans l'éditeur SQL de Supabase, exécuter :
-- 1. Copier le contenu de supabase/migrations/20250702131712_broad_silence.sql
-- 2. Coller et exécuter dans l'éditeur SQL
-- 3. Faire de même avec supabase/migrations/20250702131751_ancient_waterfall.sql
```

### Option C : PostgreSQL Local

#### 1. Installation PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib postgis

# macOS avec Homebrew
brew install postgresql postgis

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

#### 2. Configuration Base de Données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE pirogue_connect;

# Activer PostGIS
\c pirogue_connect
CREATE EXTENSION postgis;

# Quitter
\q
```

#### 3. Exécuter les Migrations
```bash
# Exécuter les scripts SQL
psql -d pirogue_connect -f supabase/migrations/20250702131712_broad_silence.sql
psql -d pirogue_connect -f supabase/migrations/20250702131751_ancient_waterfall.sql
```

## 🧪 Tests et Validation

### 1. Comptes de Test Disponibles
```bash
# Pêcheur
Email: amadou@example.com
Mot de passe: password123

# Organisation (GIE)
Email: fatou@gie-cayar.sn
Mot de passe: password123

# Administrateur
Email: admin@pirogue-connect.sn
Mot de passe: password123
```

### 2. Scénarios de Test
```bash
# Test 1 : Authentification
# - Tester la connexion avec chaque compte
# - Vérifier les interfaces différentes par rôle

# Test 2 : Géolocalisation
# - Autoriser la géolocalisation dans le navigateur
# - Vérifier l'affichage sur la carte
# - Tester le bouton SOS

# Test 3 : Communication
# - Ouvrir le chat flottant
# - Envoyer des messages
# - Tester le partage de position

# Test 4 : Alertes
# - Vérifier le centre d'alertes
# - Tester l'acquittement
# - Créer de nouvelles alertes
```

### 3. Commandes de Diagnostic
```bash
# Vérifier les logs de développement
# Ouvrir DevTools (F12) > Console

# Vérifier les requêtes réseau
# DevTools > Network

# Tester la géolocalisation
navigator.geolocation.getCurrentPosition(
  pos => console.log('Position:', pos),
  err => console.error('Erreur:', err)
);
```

## 🔧 Commandes de Développement

### Build et Preview
```bash
# Créer un build de production
npm run build

# Prévisualiser le build
npm run preview

# Analyser le bundle
npm run build -- --analyze
```

### Linting et Formatage
```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint -- --fix

# Vérifier TypeScript
npx tsc --noEmit
```

### Nettoyage
```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache
npm cache clean --force
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

# Tester en HTTPS (requis pour géolocalisation)
# Utiliser ngrok ou servir en HTTPS local
```

### Problème : Base de données
```bash
# Vérifier la connexion Supabase
# DevTools > Console > Vérifier les erreurs

# Tester la connexion
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Test DB:', { data, error });
```

## 📊 Monitoring

### Métriques de Performance
```bash
# Lighthouse audit
# DevTools > Lighthouse > Generate report

# Performance monitoring
# DevTools > Performance > Record
```

### Logs et Debug
```bash
# Logs de l'application
# Voir dans DevTools > Console

# Logs détaillés
localStorage.setItem('debug', 'pirogue:*');
```

## 🎯 Commandes Rapides

```bash
# Démarrage rapide complet
npm install && npm run dev

# Test rapide de toutes les fonctionnalités
# 1. Ouvrir http://localhost:5173
# 2. Se connecter avec amadou@example.com / password123
# 3. Autoriser la géolocalisation
# 4. Tester le chat et les alertes

# Build et déploiement
npm run build && npm run preview
```

## 📞 Support

En cas de problème :
1. Vérifier la console du navigateur (F12)
2. Vérifier l'onglet Network pour les erreurs API
3. Vérifier les permissions de géolocalisation
4. Redémarrer le serveur de développement

---

**L'application est maintenant prête à être testée ! 🚢✨**
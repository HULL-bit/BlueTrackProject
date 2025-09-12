# 🗄️ Instanciation Base de Données - Pirogue Connect

## 📊 Informations Base de Données

**Nom de la base** : `pirogue_connect`
**Type** : PostgreSQL avec extension PostGIS
**Tables principales** : profiles, locations, alerts, messages, zones, trips

## 🚀 Option 1 : Supabase (Recommandé)

### 1. Créer le Projet Supabase
```bash
# 1. Aller sur https://supabase.com
# 2. Créer un compte gratuit
# 3. Cliquer "New Project"
# 4. Nom du projet : "pirogue-connect"
# 5. Mot de passe base : choisir un mot de passe fort
# 6. Région : Europe (West) - plus proche du Sénégal
```

### 2. Récupérer les Clés API
```bash
# Dans le dashboard Supabase :
# Settings > API
# Copier :
# - Project URL (ex: https://abc123.supabase.co)
# - anon public key (commence par eyJ...)
```

### 3. Configuration Locale
```bash
# Créer le fichier de configuration
touch .env.local

# Ajouter vos vraies clés (remplacer les valeurs) :
echo "VITE_SUPABASE_URL=https://votre-projet-id.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici" >> .env.local
```

### 4. Exécuter les Migrations SQL
```sql
-- ÉTAPE 1 : Dans Supabase Dashboard
-- Aller dans "SQL Editor"
-- Créer une nouvelle query

-- ÉTAPE 2 : Copier-coller le contenu COMPLET du fichier :
-- supabase/migrations/20250702131712_broad_silence.sql
-- Cliquer "Run" pour exécuter

-- ÉTAPE 3 : Créer une nouvelle query
-- Copier-coller le contenu COMPLET du fichier :
-- supabase/migrations/20250702131751_ancient_waterfall.sql
-- Cliquer "Run" pour exécuter
```

### 5. Vérification
```bash
# Dans Supabase Dashboard > Table Editor
# Vérifier que ces tables existent :
# - profiles
# - locations  
# - alerts
# - messages
# - zones
# - trips
# - channels
# - weather_data
```

## 🖥️ Option 2 : PostgreSQL Local

### 1. Installation PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib postgis

# macOS avec Homebrew
brew install postgresql postgis

# Démarrer PostgreSQL
sudo systemctl start postgresql  # Ubuntu
brew services start postgresql   # macOS
```

### 2. Création de la Base
```bash
# Se connecter en tant que superuser
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE pirogue_connect;

# Se connecter à la base
\c pirogue_connect

# Activer l'extension PostGIS (obligatoire)
CREATE EXTENSION IF NOT EXISTS postgis;

# Créer un utilisateur pour l'app
CREATE USER pirogue_user WITH PASSWORD 'pirogue_password';
GRANT ALL PRIVILEGES ON DATABASE pirogue_connect TO pirogue_user;

# Quitter
\q
```

### 3. Exécution des Migrations
```bash
# Exécuter le schéma principal
psql -U pirogue_user -d pirogue_connect -f supabase/migrations/20250702131712_broad_silence.sql

# Exécuter les données d'exemple
psql -U pirogue_user -d pirogue_connect -f supabase/migrations/20250702131751_ancient_waterfall.sql
```

### 4. Configuration Application
```bash
# Créer .env.local avec connexion locale
echo "DATABASE_URL=postgresql://pirogue_user:pirogue_password@localhost:5432/pirogue_connect" >> .env.local
```

### 5. Vérification
```bash
# Se connecter et vérifier les tables
psql -U pirogue_user -d pirogue_connect

# Lister les tables
\dt

# Vérifier quelques données
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM zones;

# Quitter
\q
```

## 🧪 Test de la Base de Données

### 1. Démarrer l'Application
```bash
npm run dev
```

### 2. Tester la Connexion
```bash
# Ouvrir http://localhost:5173
# Ouvrir DevTools (F12) > Console
# Chercher des erreurs de connexion DB
```

### 3. Test avec Comptes
```bash
# Se connecter avec :
# Email: amadou@example.com
# Password: password123

# Vérifier que les données s'affichent :
# - Carte avec zones
# - Météo
# - Alertes
```

## 🔧 Commandes de Maintenance

### Backup Base de Données
```bash
# Supabase : Backup automatique inclus

# PostgreSQL Local
pg_dump -U pirogue_user pirogue_connect > backup_$(date +%Y%m%d).sql
```

### Reset Base de Données
```bash
# Supabase : Supprimer et recréer le projet

# PostgreSQL Local
dropdb -U pirogue_user pirogue_connect
createdb -U pirogue_user pirogue_connect
# Puis re-exécuter les migrations
```

## 🚨 Résolution de Problèmes

### Erreur : "relation does not exist"
```bash
# Les migrations ne sont pas exécutées
# Re-exécuter les fichiers SQL dans l'ordre
```

### Erreur : "PostGIS extension"
```bash
# Dans PostgreSQL :
\c pirogue_connect
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Erreur de connexion Supabase
```bash
# Vérifier les clés dans .env.local
# Vérifier que le projet Supabase est actif
# Vérifier la région du projet
```

## ✅ Checklist Finale

- [ ] Base de données créée
- [ ] Extensions PostGIS activées  
- [ ] Migrations exécutées (2 fichiers)
- [ ] Configuration .env.local
- [ ] Application démarrée (npm run dev)
- [ ] Test de connexion réussi
- [ ] Données visibles dans l'interface

---

**La base de données est maintenant opérationnelle ! 🗄️✨**
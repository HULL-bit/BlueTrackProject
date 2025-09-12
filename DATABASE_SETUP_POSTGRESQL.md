# 🗄️ Configuration PostgreSQL pour Pirogue Connect

## 📋 Prérequis

### Installation PostgreSQL avec PostGIS

#### Ubuntu/Debian
```bash
# Mettre à jour les paquets
sudo apt update

# Installer PostgreSQL et PostGIS
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS avec Homebrew
```bash
# Installer PostgreSQL et PostGIS
brew install postgresql postgis

# Démarrer PostgreSQL
brew services start postgresql
```

#### Windows
```bash
# Télécharger et installer depuis :
# https://www.postgresql.org/download/windows/
# Puis installer PostGIS depuis :
# https://postgis.net/windows_downloads/
```

## 🔧 Configuration de la Base de Données

### 1. Créer l'Utilisateur et la Base
```bash
# Se connecter en tant que superuser
sudo -u postgres psql

# Créer l'utilisateur
CREATE USER pirogue_user WITH PASSWORD 'pirogue_password';

# Créer la base de données
CREATE DATABASE pirogue_connect OWNER pirogue_user;

# Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE pirogue_connect TO pirogue_user;

# Se connecter à la nouvelle base
\c pirogue_connect

# Activer l'extension PostGIS (obligatoire)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Donner les permissions sur les extensions
GRANT ALL ON ALL TABLES IN SCHEMA public TO pirogue_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO pirogue_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO pirogue_user;

# Quitter
\q
```

### 2. Exécuter les Migrations
```bash
# Exécuter le schéma principal
psql -U pirogue_user -d pirogue_connect -f supabase/migrations/20250702131712_broad_silence.sql

# Exécuter les données d'exemple
psql -U pirogue_user -d pirogue_connect -f supabase/migrations/20250702131751_ancient_waterfall.sql
```

### 3. Vérifier l'Installation
```bash
# Se connecter à la base
psql -U pirogue_user -d pirogue_connect

# Lister les tables
\dt

# Vérifier les extensions
\dx

# Tester une requête
SELECT COUNT(*) FROM profiles;

# Quitter
\q
```

## 🚀 Configuration de l'Application

### 1. Variables d'Environnement
Créer le fichier `.env.local` :
```env
# Configuration PostgreSQL locale
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXpzb3Fzbnp2a3hsdGdndWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDIwNDksImV4cCI6MjA2NzExODA0OX0.xqtacI98rHl4RbXbrunzV0ayAvxP0ukzTRRirUegsD8

# Configuration base de données PostgreSQL
DATABASE_URL=postgresql://pirogue_user:pirogue_password@localhost:5432/pirogue_connect

# Variables de l'application
VITE_APP_NAME=Pirogue Connect
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Mode démo désactivé pour utiliser la vraie base de données
VITE_DEMO_MODE=false
```

### 2. Démarrage de l'Application
```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm run dev

# Ouvrir http://localhost:5173
```

## 🧪 Test de la Configuration

### 1. Comptes de Test
L'application créera automatiquement des comptes de test :

- **Pêcheur** : amadou@example.com / password123
- **Organisation** : fatou@gie-cayar.sn / password123
- **Admin** : admin@pirogue-connect.sn / password123

### 2. Vérification des Fonctionnalités
```bash
# 1. Se connecter avec un compte de test
# 2. Vérifier la géolocalisation
# 3. Tester le chat en temps réel
# 4. Créer des alertes
# 5. Ajouter des utilisateurs (Admin/GIE)
# 6. Gérer les zones de sécurité
```

## 📊 Données de Test

### Insertion de Données Supplémentaires
```sql
-- Se connecter à la base
psql -U pirogue_user -d pirogue_connect

-- Insérer des utilisateurs de test
INSERT INTO profiles (id, email, full_name, phone, role, boat_name, license_number) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'amadou@example.com', 'Amadou Diallo', '+221771234567', 'fisherman', 'Ndakaaru', 'SN-CAY-001'),
('550e8400-e29b-41d4-a716-446655440002', 'fatou@gie-cayar.sn', 'Fatou Sow', '+221779876543', 'organization', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'admin@pirogue-connect.sn', 'Administrateur Système', '+221775550000', 'admin', NULL, NULL);

-- Insérer des positions de test
INSERT INTO locations (user_id, latitude, longitude, speed, heading) VALUES
('550e8400-e29b-41d4-a716-446655440001', 14.9325, -17.1925, 8.5, 45),
('550e8400-e29b-41d4-a716-446655440001', 14.9335, -17.1935, 12.3, 50);

-- Insérer des messages de test
INSERT INTO messages (sender_id, channel_id, content, message_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Bonjour, conditions de mer excellentes !', 'text'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Merci pour l''information', 'text');
```

## 🔧 Maintenance

### Sauvegarde
```bash
# Sauvegarde complète
pg_dump -U pirogue_user pirogue_connect > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde avec compression
pg_dump -U pirogue_user -Fc pirogue_connect > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restauration
```bash
# Restaurer depuis un fichier SQL
psql -U pirogue_user -d pirogue_connect < backup_file.sql

# Restaurer depuis un dump compressé
pg_restore -U pirogue_user -d pirogue_connect backup_file.dump
```

### Nettoyage
```bash
# Nettoyer les anciennes positions (> 30 jours)
psql -U pirogue_user -d pirogue_connect -c "DELETE FROM locations WHERE created_at < NOW() - INTERVAL '30 days';"

# Nettoyer les anciens messages (> 90 jours)
psql -U pirogue_user -d pirogue_connect -c "DELETE FROM messages WHERE created_at < NOW() - INTERVAL '90 days';"
```

## 🚨 Résolution de Problèmes

### Problème : Connexion refusée
```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Vérifier les connexions
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Problème : Extension PostGIS
```bash
# Se connecter et vérifier les extensions
psql -U pirogue_user -d pirogue_connect -c "\dx"

# Réinstaller PostGIS si nécessaire
psql -U pirogue_user -d pirogue_connect -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Problème : Permissions
```bash
# Donner toutes les permissions à l'utilisateur
sudo -u postgres psql -d pirogue_connect -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pirogue_user;"
sudo -u postgres psql -d pirogue_connect -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pirogue_user;"
```

## ✅ Checklist de Validation

- [ ] PostgreSQL installé et démarré
- [ ] PostGIS installé et activé
- [ ] Base de données `pirogue_connect` créée
- [ ] Utilisateur `pirogue_user` créé avec permissions
- [ ] Migrations exécutées sans erreur
- [ ] Variables d'environnement configurées
- [ ] Application démarrée avec `npm run dev`
- [ ] Connexion réussie avec les comptes de test
- [ ] Fonctionnalités principales testées

---

**La base de données PostgreSQL est maintenant opérationnelle ! 🗄️✨**
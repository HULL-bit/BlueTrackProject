# 🐳 Blue-Track avec Docker

Cette application utilise Docker Compose pour orchestrer tous les services nécessaires.

## 📋 Prérequis

- Docker
- Docker Compose

## 🚀 Démarrage rapide

### Option 1: Script automatique
```bash
./start-docker.sh
```

### Option 2: Commandes manuelles
```bash
# Construire et démarrer tous les services
docker-compose up --build -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 🏗️ Architecture des services

### Services inclus :
- **Frontend React** (port 5000) - Interface utilisateur
- **Backend Django** (port 8000) - API REST
- **PostgreSQL** (port 5432) - Base de données
- **Redis** (port 6379) - Cache et messages
- **Celery** - Traitement asynchrone (optionnel)

## 🔧 Configuration

### Variables d'environnement
Les variables d'environnement sont définies dans `docker-compose.yml` :

```yaml
environment:
  - DEBUG=True
  - SECRET_KEY=django-insecure-change-me-in-production
  - DB_NAME=blue_track
  - DB_USER=postgres
  - DB_PASSWORD=password
  - DB_HOST=postgres
  - DB_PORT=5432
  - REDIS_URL=redis://redis:6379
  - CORS_ALLOW_ALL_ORIGINS=True
```

### Volumes persistants
- `postgres_data` - Données PostgreSQL
- `redis_data` - Données Redis
- `backend_static` - Fichiers statiques Django
- `backend_media` - Fichiers média uploadés

## 📊 Commandes utiles

### Gestion des conteneurs
```bash
# Voir le statut des services
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart backend

# Reconstruire un service
docker-compose up --build backend

# Voir les logs d'un service
docker-compose logs -f frontend
```

### Base de données
```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d blue_track

# Créer un superutilisateur Django
docker-compose exec backend python manage.py createsuperuser

# Appliquer les migrations
docker-compose exec backend python manage.py migrate
```

### Développement
```bash
# Accéder au shell Django
docker-compose exec backend python manage.py shell

# Lancer les tests
docker-compose exec backend python manage.py test

# Collecter les fichiers statiques
docker-compose exec backend python manage.py collectstatic
```

## 🔍 Dépannage

### Problèmes courants

1. **Ports déjà utilisés**
   ```bash
   # Vérifier les ports utilisés
   sudo netstat -tulpn | grep :5000
   sudo netstat -tulpn | grep :8000
   ```

2. **Problèmes de permissions**
   ```bash
   # Donner les bonnes permissions
   sudo chown -R $USER:$USER .
   ```

3. **Nettoyer les conteneurs**
   ```bash
   # Arrêter et supprimer tout
   docker-compose down -v
   docker system prune -a
   ```

### Logs détaillés
```bash
# Voir tous les logs
docker-compose logs

# Suivre les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
```

## 🌐 Accès aux services

Une fois démarré, accédez à :
- **Frontend** : http://localhost:5000
- **Backend API** : http://localhost:8000/api/
- **Admin Django** : http://localhost:8000/admin/

## 🔒 Sécurité

⚠️ **Important** : Cette configuration est pour le développement uniquement.

Pour la production :
1. Changez `SECRET_KEY`
2. Désactivez `DEBUG`
3. Configurez HTTPS
4. Utilisez des mots de passe forts
5. Limitez les accès réseau

## 📝 Notes de développement

- Les volumes permettent le hot-reload
- Les modifications du code sont automatiquement prises en compte
- Les données sont persistantes entre les redémarrages
- Le réseau Docker permet la communication entre services

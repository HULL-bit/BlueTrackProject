# 🚢 BLUE-TRACK Backend Django

## 🚀 Installation et Configuration

### 1. Prérequis
- Python 3.9+
- PostgreSQL avec PostGIS
- Redis (pour Celery et Channels)

### 2. Installation
```bash
# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### 3. Configuration Base de Données
```bash
# Créer la base de données PostgreSQL
sudo -u postgres createdb blue_track
sudo -u postgres psql -d blue_track -c "CREATE EXTENSION postgis;"

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

### 4. Migrations
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Lancement
```bash
# Serveur de développement
python manage.py runserver

# En production avec Gunicorn
gunicorn blue_track.wsgi:application
```

## 📡 API des Traqueurs

### Endpoint Webhook
```
POST /api/tracking/webhook/tracker/
```

### Format des données attendues
```json
{
  "device_id": "TRACKER_001",
  "latitude": 14.9325,
  "longitude": -17.1925,
  "speed": 12.5,
  "heading": 45,
  "altitude": 10.2,
  "accuracy": 5.0,
  "battery_level": 85,
  "signal_strength": 4,
  "timestamp": "2025-01-02T10:30:00Z"
}
```

### Authentification
Les traqueurs peuvent envoyer des données sans authentification sur l'endpoint webhook.
Pour les autres endpoints, utiliser Token Authentication.

## 🔧 Administration
Accéder à l'interface d'administration Django : http://localhost:8000/admin/

## 📊 Monitoring
- Logs : `logs/blue_track.log`
- Métriques : Intégrées dans l'interface admin
- WebSockets : Channels avec Redis

## 🚀 Déploiement
Voir le guide de déploiement dans `docs/DEPLOYMENT.md`
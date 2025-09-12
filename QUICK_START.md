# ⚡ Démarrage Rapide - BLUE-TRACK

## 🚀 Lancement Immédiat (Mode Démo)

```bash
# 1. Installation des dépendances
npm install

# 2. Démarrage de l'application
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:5173
```

## 🔑 Comptes de Test

### Pêcheur
- **Email :** amadou@example.com
- **Mot de passe :** password123

### Organisation (GIE)
- **Email :** fatou@gie-cayar.sn
- **Mot de passe :** password123

### Administrateur
- **Email :** admin@pirogue-connect.sn
- **Mot de passe :** password123

## 🗄️ Configuration Django Backend (Recommandé)

### 1. Installation du Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configuration
```bash
# Frontend
cp .env.example .env.local
echo "VITE_API_URL=http://localhost:8000/api" >> .env.local

# Backend
cd backend
cp .env.example .env
```

### 3. Lancer les Services
```bash
# Terminal 1 : Backend Django
cd backend
python manage.py runserver

# Terminal 2 : Frontend React
npm run dev
```

## ✅ Test Rapide

1. **Authentification** - Se connecter avec un compte de test
2. **Géolocalisation** - Autoriser la géolocalisation dans le navigateur
3. **Chat** - Ouvrir le widget de chat flottant
4. **Carte** - Vérifier l'affichage de la carte marine
5. **Alertes** - Tester le bouton SOS (génère une alerte)

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer le serveur
npm run build           # Build de production
npm run preview         # Prévisualiser le build

# Qualité du code
npm run lint            # Vérifier le code
npm run lint:fix        # Corriger automatiquement
npm run type-check      # Vérifier TypeScript

# Nettoyage
npm run clean           # Nettoyer node_modules
npm run clean:cache     # Nettoyer le cache npm
npm run clean:build     # Nettoyer le dossier build
```

## 📱 Fonctionnalités Principales

- **🎣 Pêcheurs** : Profil, historique sorties, communication
- **🏢 Organisations** : Gestion flotte, supervision, alertes
- **⚙️ Admin** : Gestion utilisateurs, monitoring système
- **🗺️ Carte** : Géolocalisation temps réel, zones sécurité
- **💬 Chat** : Communication multi-canaux
- **🚨 Alertes** : Système SOS et notifications

---

**L'application est prête ! Bon développement ! 🚢**
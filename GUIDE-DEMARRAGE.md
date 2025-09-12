# 🚀 Guide de Démarrage Rapide - Blue-Track

## 📋 Prérequis
- Docker installé
- Docker Compose installé
- VSCode ou autre éditeur

## 🎯 Démarrage depuis VSCode

### **Option 1 : Script automatique (Recommandé)**
```bash
# Dans le terminal VSCode (Ctrl+Shift+`)
./start-project.sh
```

### **Option 2 : Tâches VSCode**
1. **Ctrl+Shift+P** → "Tasks: Run Task"
2. Sélectionner **"🚀 Démarrer Blue-Track"**

### **Option 3 : Docker Compose direct**
```bash
sudo docker-compose up -d
```

## 🌐 Accès aux services

Une fois démarré, accédez à :
- **📱 Frontend** : http://localhost:5000
- **🔧 Backend API** : http://localhost:8000/api/
- **🗄️ Base de données** : localhost:5432
- **🔴 Redis** : localhost:6379

## 🛠️ Commandes utiles

### **Gestion des conteneurs**
```bash
# Voir le statut
sudo docker-compose ps

# Voir les logs
sudo docker-compose logs -f

# Arrêter
sudo docker-compose down

# Redémarrer
sudo docker-compose restart
```

### **Développement**
```bash
# Reconstruire après modifications
sudo docker-compose up --build -d

# Logs d'un service spécifique
sudo docker-compose logs -f frontend
sudo docker-compose logs -f backend

# Accéder au shell d'un conteneur
sudo docker-compose exec backend bash
sudo docker-compose exec frontend sh
```

## 🔧 Configuration VSCode

### **Extensions recommandées**
- Docker
- Python
- JavaScript and TypeScript
- React Developer Tools

### **Raccourcis utiles**
- **Ctrl+Shift+P** → "Tasks: Run Task" → Démarrer/Arrêter
- **Ctrl+Shift+`** → Terminal intégré
- **F5** → Déboguer

## 🐛 Dépannage

### **Problèmes courants**

1. **Ports déjà utilisés**
   ```bash
   sudo netstat -tulpn | grep :5000
   sudo netstat -tulpn | grep :8000
   ```

2. **Docker non démarré**
   ```bash
   sudo systemctl start docker
   ```

3. **Permissions Docker**
   ```bash
   sudo usermod -aG docker $USER
   # Puis se reconnecter
   ```

4. **Nettoyer les conteneurs**
   ```bash
   sudo docker-compose down -v
   sudo docker system prune -a
   ```

## 📁 Structure du projet
```
PlatformWagadou/
├── docker-compose.yml          # Configuration Docker
├── start-project.sh            # Script de démarrage
├── .vscode/                    # Configuration VSCode
│   ├── launch.json            # Débogage
│   └── tasks.json             # Tâches
├── project/                    # Code source
│   ├── src/                   # Frontend React
│   ├── backend/               # Backend Django
│   └── Dockerfile             # Images Docker
└── README-DOCKER.md           # Documentation complète
```

## 🎉 C'est parti !

1. Ouvrez le projet dans VSCode
2. Lancez `./start-project.sh` dans le terminal
3. Attendez que tous les services démarrent
4. Ouvrez http://localhost:5000 dans votre navigateur

**Votre application Blue-Track est prête !** 🌊

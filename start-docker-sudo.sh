#!/bin/bash

echo "🐳 Démarrage de Blue-Track avec Docker Compose (sudo)..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Démarrer Docker si nécessaire
if ! sudo systemctl is-active --quiet docker; then
    echo "🚀 Démarrage du service Docker..."
    sudo systemctl start docker
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
sudo docker-compose down

# Construire et démarrer les services
echo "🔨 Construction et démarrage des services..."
sudo docker-compose up --build -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérifier le statut des services
echo "🔍 Vérification du statut des services..."
sudo docker-compose ps

echo ""
echo "🎉 Blue-Track est maintenant démarré !"
echo ""
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:8000"
echo "🗄️  Base de données: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Commandes utiles:"
echo "  - Voir les logs: sudo docker-compose logs -f"
echo "  - Arrêter: sudo docker-compose down"
echo "  - Redémarrer: sudo docker-compose restart"
echo "  - Reconstruire: sudo docker-compose up --build"

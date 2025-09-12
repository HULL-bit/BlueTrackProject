#!/bin/bash

echo "🚀 Démarrage des serveurs Blue-Track..."

# Arrêter les processus existants
echo "🛑 Arrêt des processus existants..."
pkill -f "python manage.py runserver" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Démarrer Django
echo "🐍 Démarrage du serveur Django (port 8000)..."
cd backend
source env/bin/activate
nohup python manage.py runserver 0.0.0.0:8000 > ../django.log 2>&1 &
DJANGO_PID=$!
cd ..

# Démarrer React
echo "⚛️  Démarrage du serveur React (port 5000)..."
nohup npm run dev > react.log 2>&1 &
REACT_PID=$!

# Attendre que les serveurs démarrent
echo "⏳ Attente du démarrage des serveurs..."
sleep 5

# Vérifier que les serveurs fonctionnent
echo "🔍 Vérification des serveurs..."

if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
    echo "✅ Serveur Django: http://localhost:8000"
else
    echo "❌ Serveur Django: ERREUR"
fi

if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Serveur React: http://localhost:5000"
else
    echo "❌ Serveur React: ERREUR"
fi

echo ""
echo "🎉 Serveurs démarrés !"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:8000"
echo ""
echo "Pour arrêter les serveurs: Ctrl+C"
echo "Logs Django: tail -f django.log"
echo "Logs React: tail -f react.log"

# Attendre l'interruption
wait

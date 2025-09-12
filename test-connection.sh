#!/bin/bash

echo "🔍 Test de connectivité Blue-Track..."

echo ""
echo "1. Test du Frontend (React)..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Frontend: http://localhost:5000 - OK"
else
    echo "❌ Frontend: http://localhost:5000 - ERREUR"
fi

echo ""
echo "2. Test du Backend (Django)..."
if curl -s http://localhost:8000/api/users/login/ > /dev/null; then
    echo "✅ Backend: http://localhost:8000 - OK"
else
    echo "❌ Backend: http://localhost:8000 - ERREUR"
fi

echo ""
echo "3. Test CORS..."
CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:5000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:8000/api/users/login/ -w "%{http_code}")
if [[ $CORS_RESPONSE == *"200"* ]]; then
    echo "✅ CORS: Configuration OK"
else
    echo "❌ CORS: Problème de configuration"
fi

echo ""
echo "4. Test de la base de données..."
DB_STATUS=$(sudo docker-compose exec -T postgres pg_isready -U postgres 2>/dev/null | grep -c "accepting connections")
if [ $DB_STATUS -eq 1 ]; then
    echo "✅ Base de données: PostgreSQL OK"
else
    echo "❌ Base de données: PostgreSQL ERREUR"
fi

echo ""
echo "5. Test Redis..."
REDIS_STATUS=$(sudo docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -c "PONG")
if [ $REDIS_STATUS -eq 1 ]; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: ERREUR"
fi

echo ""
echo "6. Statut des conteneurs..."
sudo docker-compose ps

echo ""
echo "🎉 Test terminé !"
echo ""
echo "Si tous les tests sont OK, votre application devrait fonctionner sur :"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:8000"

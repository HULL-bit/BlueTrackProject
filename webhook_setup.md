# Configuration des Webhooks pour vos Traqueurs

## URLs des Webhooks

Vos traqueurs doivent envoyer leurs données GPS à ces URLs :

### 1. Webhook Principal (Recommandé)
```
https://c99fc6123332.ngrok-free.app/api/tracking/webhook/tracker/
```

### 2. Webhook ToTarget (Alternative)
```
https://c99fc6123332.ngrok-free.app/api/tracking/webhook/totarget/
```

## Format des Données

### Pour le webhook tracker :
```json
{
  "device_id": "015024020236",
  "latitude": 14.7233,
  "longitude": -17.4605,
  "speed": 5.5,
  "heading": 180,
  "timestamp": "2025-09-07T14:30:00Z"
}
```

### Pour le webhook totarget :
```json
{
  "device_id": "015024020877",
  "lat": 14.7250,
  "lng": -17.4620,
  "speed": 4.8,
  "heading": 185,
  "timestamp": "2025-09-07T14:31:00Z"
}
```

## Test des Webhooks

Les webhooks ont été testés avec succès :
- ✅ Position 135 créée pour le traqueur 015024020236
- ✅ Position 136 créée pour le traqueur 015024020877
- ✅ Total de 136 positions GPS disponibles

## Configuration des Traqueurs

Configurez vos traqueurs avec :
- **URL :** `https://c99fc6123332.ngrok-free.app/api/tracking/webhook/tracker/`
- **Méthode :** POST
- **Content-Type :** application/json
- **Fréquence :** Toutes les 30 secondes (recommandé)

## Vérification

Pour vérifier que vos traqueurs envoient des données :
1. Connectez-vous à l'application avec `admin@blue-track.com`
2. Allez dans "Carte Marine"
3. Vous devriez voir vos traqueurs sur la carte OSM
4. Les positions se mettront à jour en temps réel

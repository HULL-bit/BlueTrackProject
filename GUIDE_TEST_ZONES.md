# Guide de Test - Zones Circulaires

## 🎯 Objectif
Tester la création de zones circulaires avec les nouveaux champs de position centre et rayon.

## 🔧 Prérequis
1. **Serveur Django** : Doit être démarré sur le port 8000
2. **Serveur Frontend** : Doit être démarré sur le port 5001
3. **Utilisateur connecté** : Vous devez être connecté avec un compte valide

## 👤 Utilisateur de Test
Un utilisateur de test a été créé avec les identifiants suivants :
- **Nom d'utilisateur** : `admin_test`
- **Mot de passe** : `admin123`
- **Rôle** : `admin` (permissions complètes)

## 🚀 Étapes de Test

### 1. Connexion à l'Application
1. Ouvrez votre navigateur et allez sur `http://localhost:5001`
2. Cliquez sur "Se connecter" ou allez sur `/login`
3. Utilisez les identifiants :
   - Nom d'utilisateur : `admin_test`
   - Mot de passe : `admin123`

### 2. Accès à la Gestion des Zones
1. Une fois connecté, naviguez vers la section "Gestion des Zones"
2. Vous devriez voir l'interface de gestion des zones

### 3. Création d'une Zone Circulaire
1. Cliquez sur le bouton "Ajouter une zone"
2. Remplissez le formulaire avec les données suivantes :

#### Données de Test Recommandées
```
Nom de la zone : Zone de Test Sécurité
Description : Zone de test pour les cercles colorés
Type de zone : Zone de sécurité
Latitude Centre : 14.7167
Longitude Centre : -17.4677
Latitude Rayon : 14.7267
Longitude Rayon : -17.4677
```

### 4. Vérification du Résultat
1. Après avoir cliqué sur "Créer la zone", vous devriez voir :
   - Un message de succès
   - La zone apparaître dans la liste
   - La zone s'afficher sur la carte comme un cercle vert

## 🎨 Couleurs des Zones
- 🟢 **Vert** : Zones de sécurité
- 🔵 **Bleu** : Zones de pêche
- 🔴 **Rouge** : Zones restreintes
- 🟣 **Violet** : Zones de navigation

## 🔍 Vérifications
1. **Calcul automatique du rayon** : Le rayon doit être calculé automatiquement (environ 1111 mètres pour les coordonnées de test)
2. **Affichage sur la carte** : La zone doit apparaître comme un cercle coloré
3. **Persistance** : La zone doit être sauvegardée en base de données

## ❌ Résolution de Problèmes

### Erreur 400 (Bad Request)
- Vérifiez que vous êtes bien connecté
- Vérifiez que tous les champs sont remplis
- Vérifiez que le serveur Django fonctionne

### Erreur 403 (Forbidden)
- Vérifiez que vous êtes connecté avec un compte valide
- Vérifiez que votre compte a les permissions nécessaires

### Zone ne s'affiche pas sur la carte
- Vérifiez que les coordonnées sont valides
- Vérifiez que la zone est active
- Actualisez la page de la carte

## 📊 Données de Test Alternatives

### Zone de Pêche
```
Nom : Zone de Pêche Test
Type : Zone de pêche
Centre : 14.7000, -17.4500
Rayon : 14.7100, -17.4500
```

### Zone Restreinte
```
Nom : Zone Restreinte Test
Type : Zone restreinte
Centre : 14.7500, -17.5000
Rayon : 14.7600, -17.5000
```

## ✅ Test Réussi
Si tout fonctionne correctement, vous devriez voir :
1. ✅ Zone créée avec succès
2. ✅ Zone affichée dans la liste
3. ✅ Zone visible sur la carte comme un cercle coloré
4. ✅ Rayon calculé automatiquement
5. ✅ Couleur correcte selon le type de zone

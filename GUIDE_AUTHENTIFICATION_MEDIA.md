# 📸 Guide d'upload de médias

## Problème résolu

L'erreur `403 (Forbidden)` lors de l'upload de médias a été résolue en permettant l'upload anonyme. Maintenant, tous les utilisateurs peuvent ajouter des photos et vidéos sans restriction d'authentification.

## ✅ Solutions implémentées

### 1. **Upload anonyme activé**
- Suppression des restrictions d'authentification
- Token optionnel dans les requêtes (ajouté seulement si disponible)
- Tous les utilisateurs peuvent uploader des médias

### 2. **Interface utilisateur simplifiée**
- Bouton "Ajouter" accessible à tous les utilisateurs
- Gestion des utilisateurs anonymes dans les descriptions
- Messages d'erreur simplifiés

## 🚀 Comment utiliser l'upload de médias

### Upload simple
1. Allez sur la galerie média
2. Cliquez sur le bouton "Ajouter"
3. Sélectionnez vos photos ou vidéos
4. L'upload se fait automatiquement

### Types de fichiers supportés
- **Images** : JPG, PNG, GIF, WebP
- **Vidéos** : MP4, AVI, MOV, WebM
- **Taille maximale** : Selon la configuration du serveur

### Utilisateurs connectés vs anonymes
- **Utilisateurs connectés** : Le nom d'utilisateur apparaît dans la description
- **Utilisateurs anonymes** : "Utilisateur anonyme" apparaît dans la description

## 🔧 Messages d'erreur et solutions

| Message d'erreur | Solution |
|------------------|----------|
| "Erreur HTTP: 500" | Problème serveur, réessayez plus tard |
| "Fichier trop volumineux" | Réduisez la taille du fichier |
| "Type de fichier non supporté" | Utilisez un format supporté (JPG, PNG, MP4, etc.) |
| "Erreur réseau" | Vérifiez votre connexion internet |

## 🎯 Fonctionnalités maintenant disponibles

- ✅ **Upload anonyme** : Tous les utilisateurs peuvent uploader des médias
- ✅ **Interface simplifiée** : Bouton d'ajout accessible à tous
- ✅ **Gestion des utilisateurs** : Support des utilisateurs connectés et anonymes
- ✅ **Messages d'erreur clairs** : Gestion des erreurs de serveur et de réseau

## 📱 Interface utilisateur

### Tous les utilisateurs
- Bouton bleu "Ajouter" pour uploader des fichiers
- Fonctionnalité complète d'upload
- Support des photos et vidéos
- Gestion automatique des erreurs

## 🔍 Dépannage

Si l'upload ne fonctionne pas :

1. **Vérifiez la console du navigateur** pour d'autres erreurs
2. **Vérifiez que le backend fonctionne** : `http://localhost:8000/api/`
3. **Vérifiez la taille du fichier** (ne doit pas dépasser la limite)
4. **Vérifiez le format du fichier** (JPG, PNG, MP4, etc.)
5. **Contactez le support** avec les détails de l'erreur

## 📞 Support

Pour toute question ou problème persistant, contactez l'équipe de développement avec :
- Le message d'erreur exact
- Les étapes pour reproduire le problème
- Les informations de votre navigateur

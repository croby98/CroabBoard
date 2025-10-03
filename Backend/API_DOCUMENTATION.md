# CroabBoard API Documentation

## Table des Matières
- [Authentification](#authentification)
- [Boutons et Sons](#boutons-et-sons)
- [Favoris](#favoris)
- [Historique](#historique)
- [Volume](#volume)
- [Statistiques](#statistiques)
- [Admin](#admin)

---

## Authentification

### POST /api/login
Connexion utilisateur
```json
Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "user1",
    "btnSize": 150
  }
}
```

### POST /api/register
Création de compte
```json
Request:
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": { ... }
}
```

### POST /api/logout
Déconnexion

### GET /api/me
Obtenir l'utilisateur actuel (authentifié)

### POST /api/reset_password
Changer le mot de passe (authentifié)
```json
Request:
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

---

## Boutons et Sons

### GET /api/linked
Obtenir les boutons liés à l'utilisateur (authentifié)

### GET /api/uploaded
Obtenir tous les boutons uploadés

### POST /api/buttons
Uploader un nouveau bouton (authentifié)
```
FormData:
- image: File
- sound: File
- ButtonName: string
- CategoryName: string (optionnel)
```

### POST /api/bulk-operations
Opérations en masse (authentifié)
```json
Request:
{
  "operation": "delete|link",
  "buttonIds": [1, 2, 3]
}
```

---

## Favoris

### GET /api/favorites
Obtenir les favoris de l'utilisateur (authentifié)
```json
Response:
{
  "success": true,
  "favorites": [
    {
      "id": 1,
      "button_name": "Sound 1",
      "imageUrl": "/uploads/images/...",
      "soundUrl": "/uploads/audio/...",
      "category_name": "Music",
      "category_color": "#3B82F6",
      "favorited_at": "2025-10-03T12:00:00Z"
    }
  ]
}
```

### GET /api/favorite/:uploadedId
Vérifier si un bouton est favori (authentifié)
```json
Response:
{
  "success": true,
  "isFavorite": true
}
```

### POST /api/favorite/:uploadedId
Ajouter aux favoris (authentifié)

### DELETE /api/favorite/:uploadedId
Retirer des favoris (authentifié)

### PUT /api/favorite/:uploadedId/toggle
Basculer favori (authentifié)
```json
Response:
{
  "success": true,
  "isFavorite": true,
  "message": "Added to favorites"
}
```

---

## Historique

### POST /api/play/:uploadedId
Enregistrer la lecture d'un son (authentifié)
```json
Response:
{
  "success": true,
  "message": "Play recorded"
}
```

### GET /api/history?limit=50
Obtenir l'historique complet (authentifié)
```json
Response:
{
  "success": true,
  "history": [
    {
      "id": 1,
      "button_name": "Sound 1",
      "imageUrl": "/uploads/images/...",
      "soundUrl": "/uploads/audio/...",
      "played_at": "2025-10-03T12:00:00Z"
    }
  ]
}
```

### GET /api/recently-played?limit=10
Obtenir les sons récemment joués (dédupliqués) (authentifié)
```json
Response:
{
  "success": true,
  "recentlyPlayed": [
    {
      "id": 1,
      "button_name": "Sound 1",
      "last_played": "2025-10-03T12:00:00Z"
    }
  ]
}
```

### DELETE /api/history
Effacer tout l'historique (authentifié)

---

## Volume

### GET /api/button-volume/:uploadedId
Obtenir le volume d'un bouton (authentifié)
```json
Response:
{
  "success": true,
  "volume": 0.75
}
```

### POST /api/button-volume/:uploadedId
Définir le volume d'un bouton (authentifié)
```json
Request:
{
  "volume": 0.75  // Entre 0.0 et 1.0
}

Response:
{
  "success": true,
  "message": "Volume updated successfully"
}
```

### GET /api/button-volumes
Obtenir tous les volumes de l'utilisateur (authentifié)
```json
Response:
{
  "success": true,
  "volumes": {
    "1": 0.75,
    "2": 0.50,
    "3": 1.00
  }
}
```

---

## Statistiques

### GET /api/stats/most-played?limit=20
Obtenir les sons les plus joués (public)
```json
Response:
{
  "success": true,
  "mostPlayed": [
    {
      "id": 1,
      "button_name": "Popular Sound",
      "play_count": 1523,
      "last_played": "2025-10-03T12:00:00Z",
      "imageUrl": "/uploads/images/...",
      "soundUrl": "/uploads/audio/..."
    }
  ]
}
```

### GET /api/stats/button/:uploadedId
Obtenir les statistiques d'un bouton spécifique
```json
Response:
{
  "success": true,
  "stats": {
    "play_count": 42,
    "last_played": "2025-10-03T12:00:00Z"
  }
}
```

### GET /api/stats/all
Obtenir toutes les statistiques (admin uniquement)

---

## Admin

### GET /api/users
Obtenir tous les utilisateurs (admin uniquement)

### GET /api/deleted_history
Historique des suppressions (admin uniquement)

### POST /api/restore_from_history/:id
Restaurer un bouton supprimé (admin uniquement)

---

## Configuration Requise

### Headers
```
Content-Type: application/json
Cookie: connect.sid=... (pour les requêtes authentifiées)
```

### Codes d'Erreur
- 200: Succès
- 201: Créé
- 400: Requête invalide
- 401: Non authentifié
- 403: Accès interdit (admin requis)
- 404: Ressource introuvable
- 500: Erreur serveur

### Installation des Tables SQL

Exécutez les scripts SQL suivants :

```bash
# Table de volume
mysql -u root -p croabboard < Backend/database/create_volume_table.sql

# Tables favoris, historique et statistiques
mysql -u root -p croabboard < Backend/database/create_favorites_and_history.sql
```

---

## Fonctionnalités Implémentées ✅

- ✅ Système de favoris complet
- ✅ Historique de lecture avec statistiques
- ✅ Contrôle de volume individuel par bouton
- ✅ Statistiques d'utilisation (most played)
- ✅ API admin sécurisée
- ✅ Authentification par sessions
- ✅ Reset de mot de passe

## Prochaines Fonctionnalités 🚧

- [ ] Système de playlists
- [ ] Partage de boutons entre utilisateurs
- [ ] Notifications en temps réel
- [ ] Export de données

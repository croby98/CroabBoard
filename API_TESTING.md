# Guide de test des API

## Configuration requise

Avant de tester, assurez-vous que :
1. La migration SQL a été exécutée
2. Le backend est démarré (`cd Backend && npm start`)
3. Vous avez un compte Super Admin (is_admin = 2)

## Tests des endpoints admin

### 1. Test de connexion et vérification du rôle

```bash
# Connexion
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "votre_username", "password": "votre_password"}' \
  -c cookies.txt

# Vérifier le profil
curl http://localhost:5000/api/me \
  -b cookies.txt
```

**Résultat attendu** : `isAdmin` devrait être `2` (Super Admin) ou `1` (Light Admin)

### 2. Test de la gestion des rôles (Super Admin uniquement)

#### Promouvoir un utilisateur en Light Admin

```bash
curl -X POST http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -d '{"role": 1}' \
  -b cookies.txt
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "User USERNAME role updated to light admin",
  "role": 1
}
```

#### Promouvoir un utilisateur en Super Admin

```bash
curl -X POST http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -d '{"role": 2}' \
  -b cookies.txt
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "User USERNAME role updated to super admin",
  "role": 2
}
```

#### Révoquer les privilèges admin

```bash
curl -X POST http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -d '{"role": 0}' \
  -b cookies.txt
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "User USERNAME role updated to user",
  "role": 0
}
```

### 3. Test des restrictions Light Admin

Connectez-vous en tant que Light Admin (is_admin = 1) :

#### Test 1 : Accès à la liste des utilisateurs (devrait échouer)

```bash
curl http://localhost:5000/api/admin/users \
  -b cookies_light_admin.txt
```

**Résultat attendu** : Erreur 403 ou redirection

#### Test 2 : Accès aux boutons supprimés (devrait échouer)

```bash
curl http://localhost:5000/api/admin/deleted-buttons \
  -b cookies_light_admin.txt
```

**Résultat attendu** :
```json
{
  "success": false,
  "message": "Super admin access required"
}
```

#### Test 3 : Éditer un bouton (devrait réussir)

```bash
curl -X PUT http://localhost:5000/api/admin/buttons/BUTTON_ID \
  -H "Content-Type: application/json" \
  -d '{"button_name": "Nouveau nom", "category_id": "1"}' \
  -b cookies_light_admin.txt
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Button updated successfully"
}
```

#### Test 4 : Supprimer un bouton (devrait échouer)

```bash
curl -X DELETE http://localhost:5000/api/admin/buttons/BUTTON_ID \
  -b cookies_light_admin.txt
```

**Résultat attendu** :
```json
{
  "success": false,
  "message": "Super admin access required"
}
```

### 4. Test de la récupération des boutons avec date

```bash
curl http://localhost:5000/api/admin/buttons \
  -b cookies.txt
```

**Résultat attendu** : Chaque bouton devrait avoir un champ `created_at` :
```json
{
  "success": true,
  "buttons": [
    {
      "id": 1,
      "button_name": "Exemple",
      "image_filename": "example.png",
      "sound_filename": "example.mp3",
      "uploaded_by_username": "Admin",
      "created_at": "2025-10-07T10:30:00.000Z",
      ...
    }
  ]
}
```

### 5. Test de sécurité : Modifier son propre rôle (devrait échouer)

```bash
# En tant que Super Admin, essayer de modifier son propre rôle
curl -X POST http://localhost:5000/api/admin/users/YOUR_USER_ID/role \
  -H "Content-Type: application/json" \
  -d '{"role": 0}' \
  -b cookies.txt
```

**Résultat attendu** :
```json
{
  "success": false,
  "message": "Cannot modify your own admin role"
}
```

## Tests du frontend

### Test manuel dans le navigateur

1. **Test Super Admin** :
   - Connectez-vous avec un compte Super Admin
   - Vérifiez le badge "Super Admin" (rouge) dans la navbar
   - Accédez à Admin Dashboard
   - Vérifiez que tous les onglets sont visibles
   - Testez le changement de rôle d'un utilisateur

2. **Test Light Admin** :
   - Créez ou promouvoir un utilisateur en Light Admin
   - Connectez-vous avec ce compte
   - Vérifiez le badge "Light Admin" (orange) dans la navbar
   - Accédez à Admin Dashboard
   - Vérifiez que les onglets "Users", "Deleted Items" et "Audit Logs" ne sont pas visibles
   - Testez l'édition d'un bouton (devrait fonctionner)
   - Vérifiez qu'aucun bouton "Delete" n'est visible

3. **Test des dates d'upload** :
   - Allez dans Admin Dashboard > Buttons
   - Vérifiez la colonne "Upload Date"
   - Uploadez un nouveau bouton
   - Vérifiez qu'il apparaît avec la date actuelle

## Checklist de vérification

### Backend
- [ ] Migration SQL exécutée sans erreur
- [ ] Les anciens admins sont convertis en Super Admins (is_admin = 2)
- [ ] La colonne created_at existe dans la table uploaded
- [ ] L'API /api/admin/users/:userId/role fonctionne
- [ ] Les restrictions pour Light Admin sont appliquées
- [ ] Les logs d'audit enregistrent les changements de rôle

### Frontend
- [ ] Badge "Super Admin" (rouge) affiché correctement
- [ ] Badge "Light Admin" (orange) affiché correctement
- [ ] Menu déroulant de rôle visible pour Super Admin uniquement
- [ ] Onglet "Users" visible pour Super Admin uniquement
- [ ] Onglet "Deleted Items" visible pour Super Admin uniquement
- [ ] Colonne "Upload Date" visible dans la liste des boutons
- [ ] Les dates s'affichent correctement ou "N/A" pour les anciens boutons

### Sécurité
- [ ] Light Admin ne peut pas accéder à /api/admin/users
- [ ] Light Admin ne peut pas accéder à /api/admin/deleted-buttons
- [ ] Light Admin ne peut pas supprimer de boutons
- [ ] Aucun utilisateur ne peut modifier son propre rôle
- [ ] Les actions sensibles nécessitent Super Admin

## Dépannage des tests

### Erreur 401 (Non authentifié)

Vérifiez que vous utilisez les cookies de session :
```bash
curl -X POST http://localhost:5000/api/login ... -c cookies.txt
curl http://localhost:5000/api/me -b cookies.txt
```

### Erreur 403 (Accès refusé)

Vérifiez le rôle de l'utilisateur :
```sql
SELECT id, username, is_admin FROM user WHERE username = 'votre_username';
```

### Dates affichent "N/A"

C'est normal pour les anciens boutons créés avant la migration. Pour tester :
1. Uploadez un nouveau bouton
2. Vérifiez qu'il a une date

### Frontend affiche toujours l'ancien badge

1. Videz le cache du navigateur (Ctrl+Shift+R)
2. Déconnectez-vous et reconnectez-vous
3. Vérifiez que le backend retourne le bon rôle dans /api/me

## Logs utiles

### Backend logs

```bash
# Voir les logs en temps réel
tail -f Backend/logs/access.log

# Chercher les erreurs
grep "ERROR" Backend/logs/error.log
```

### Console navigateur

Ouvrez F12 > Console pour voir :
- Les requêtes API
- Les erreurs JavaScript
- L'état de l'authentification

## Commandes SQL utiles pour les tests

```sql
-- Voir tous les utilisateurs et leurs rôles
SELECT id, username, is_admin,
  CASE
    WHEN is_admin = 2 THEN 'Super Admin'
    WHEN is_admin = 1 THEN 'Light Admin'
    ELSE 'User'
  END as role
FROM user;

-- Créer un utilisateur de test Light Admin
INSERT INTO user (username, password, btn_size, is_admin)
VALUES ('light_admin_test', '$2b$12$...', 150, 1);

-- Voir les boutons avec dates
SELECT id, button_name, uploaded_by, created_at
FROM uploaded
ORDER BY created_at DESC
LIMIT 10;

-- Voir les logs d'audit des changements de rôle
SELECT * FROM audit_log
WHERE action = 'admin_role_changed'
ORDER BY created_at DESC;
```

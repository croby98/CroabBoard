# Guide de Migration - Système de Rôles Admin

## Vue d'ensemble

Cette migration met à jour le système d'administration pour supporter deux niveaux d'accès admin :
- **Super Admin** (niveau 2) : Accès complet à toutes les fonctionnalités
- **Light Admin** (niveau 1) : Accès limité, peut voir et modifier mais pas supprimer

## Étapes de migration

### 1. Backup de la base de données

**IMPORTANT** : Effectuez toujours un backup avant de modifier la structure :

```bash
mysqldump -u root -p crobboard > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Exécution de la migration

#### Option A : Via ligne de commande MySQL

```bash
mysql -u root -p crobboard < migration-admin-roles.sql
```

#### Option B : Via MySQL Workbench

1. Ouvrez MySQL Workbench
2. Connectez-vous à votre serveur
3. Ouvrez le fichier `migration-admin-roles.sql`
4. Exécutez le script (⚡ Execute icon ou Ctrl+Shift+Enter)

#### Option C : Via phpMyAdmin

1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base de données `crobboard`
3. Cliquez sur l'onglet "SQL"
4. Copiez/collez le contenu de `migration-admin-roles.sql`
5. Cliquez sur "Exécuter"

### 3. Vérification de la migration

Vérifiez que la migration s'est bien déroulée :

```sql
-- Vérifier que les admins ont été convertis en super admins
SELECT id, username, is_admin FROM user WHERE is_admin > 0;

-- Vérifier que la colonne created_at existe
DESCRIBE uploaded;
```

Résultats attendus :
- Tous les anciens admins (is_admin = 1) sont maintenant à `2` (Super Admin)
- La table `uploaded` contient une nouvelle colonne `created_at`

### 4. Configuration des rôles

#### Promouvoir un utilisateur en Super Admin

```sql
UPDATE user SET is_admin = 2 WHERE username = 'nom_utilisateur';
```

#### Créer un Light Admin

```sql
UPDATE user SET is_admin = 1 WHERE username = 'nom_utilisateur';
```

#### Révoquer les privilèges admin

```sql
UPDATE user SET is_admin = 0 WHERE username = 'nom_utilisateur';
```

### 5. Redémarrage des services

#### Backend

```bash
cd Backend
npm install  # Au cas où de nouvelles dépendances seraient nécessaires
npm start
```

#### Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Rollback (en cas de problème)

Si vous rencontrez des problèmes, vous pouvez restaurer votre backup :

```bash
mysql -u root -p crobboard < backup_before_migration_YYYYMMDD_HHMMSS.sql
```

## Test de la migration

### Test 1 : Connexion Super Admin

1. Connectez-vous avec un compte qui était admin avant la migration
2. Allez dans Admin Dashboard
3. Vérifiez que le badge affiche "Super Admin" (rouge)
4. Vérifiez l'accès à tous les onglets : Users, Buttons, Categories, Deleted Items, Audit Logs

### Test 2 : Créer un Light Admin

1. Dans Admin Dashboard > Users (en tant que Super Admin)
2. Sélectionnez "Light Admin" dans le menu déroulant pour un utilisateur
3. Déconnectez-vous et reconnectez-vous avec cet utilisateur
4. Vérifiez que :
   - Le badge affiche "Light Admin" (orange)
   - L'onglet "Users" n'est pas visible
   - L'onglet "Deleted Items" n'est pas visible
   - Les boutons "Delete" ne sont pas visibles

### Test 3 : Dates d'upload

1. Allez dans Admin Dashboard > Buttons
2. Vérifiez que la colonne "Upload Date" est visible
3. Pour les anciens boutons : devrait afficher "N/A"
4. Uploadez un nouveau bouton et vérifiez qu'il a une date

## Dépannage

### Problème : "Column 'created_at' already exists"

Si vous exécutez la migration plusieurs fois, ignorez cette erreur. MySQL utilise `ADD COLUMN IF NOT EXISTS`.

### Problème : Aucun admin ne peut se connecter

Vérifiez que les admins existent :

```sql
SELECT id, username, is_admin FROM user WHERE is_admin > 0;
```

Si vide, créez un super admin manuellement :

```sql
UPDATE user SET is_admin = 2 WHERE id = 1;  -- Remplacez 1 par l'ID de votre utilisateur
```

### Problème : Frontend affiche toujours "Admin" au lieu de "Super Admin"

1. Videz le cache du navigateur (Ctrl+Shift+R)
2. Vérifiez que le frontend a été rebuild
3. Déconnectez-vous et reconnectez-vous

### Problème : Light Admin peut voir l'onglet "Deleted Items"

1. Vérifiez que le frontend a été mis à jour
2. Déconnectez-vous et reconnectez-vous pour rafraîchir la session
3. Vérifiez que `user.isAdmin` est bien `1` dans la session

## Support

En cas de problème :

1. Consultez les logs du backend : `Backend/logs/`
2. Ouvrez la console du navigateur (F12) pour voir les erreurs frontend
3. Vérifiez que tous les fichiers ont été correctement mis à jour

## Modifications de la structure

### Table `user`

```sql
-- Avant
is_admin TINYINT(1) DEFAULT 0  -- 0 ou 1

-- Après
is_admin TINYINT(1) DEFAULT 0 COMMENT '0=user, 1=light_admin, 2=super_admin'  -- 0, 1 ou 2
```

### Table `uploaded`

```sql
-- Nouvelle colonne ajoutée
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload date/time of the button'
```

## Prochaines étapes

Après la migration réussie :

1. ✅ Testez toutes les fonctionnalités admin
2. ✅ Configurez les rôles pour vos utilisateurs
3. ✅ Informez les utilisateurs des nouveaux niveaux d'accès
4. ✅ Documentez les responsabilités de chaque rôle dans votre organisation

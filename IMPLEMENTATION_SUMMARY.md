# Implémentation du système de rôles admin et améliorations

## Résumé des changements

Cette mise à jour implémente un système de rôles admin à deux niveaux (Super Admin et Light Admin) et ajoute la date d'upload aux boutons.

### 1. Système de rôles admin

#### Base de données
- **Fichier**: `migration-admin-roles.sql`
- Le champ `is_admin` de la table `user` supporte maintenant 3 valeurs :
  - `0` : Utilisateur normal
  - `1` : Light Admin (accès limité)
  - `2` : Super Admin (accès complet)
- Ajout de la colonne `created_at` à la table `uploaded` pour la date d'upload

#### Backend

**Modèle User** (`Backend/models/mysql-models.js`)
- Nouvelles méthodes :
  - `updateAdminRole(userId, adminRole)` : Met à jour le rôle admin
  - `isSuperAdmin(userId)` : Vérifie si super admin
  - `isLightAdmin(userId)` : Vérifie si light admin
  - `isAnyAdmin(userId)` : Vérifie si admin (1 ou 2)

**Middlewares** (`Backend/middleware/auth.js`)
- Middleware `requireSuperAdmin` : Restreint l'accès aux super admins uniquement
- Middleware `requireAdmin` : Permet l'accès aux light admin et super admin

**Routes Admin** (`Backend/routes/admin.js`)
- Nouvelle route `POST /api/admin/users/:userId/role` : Gestion des rôles (super admin seulement)
- Routes restreintes aux super admins :
  - `DELETE /api/admin/users/:userId` : Suppression d'utilisateurs
  - `GET /api/admin/deleted-buttons` : Liste des boutons supprimés
  - `POST /api/admin/deleted-buttons/:id/restore` : Restauration de boutons

#### Frontend

**AuthContext** (`Frontend/src/context/AuthContext.tsx`)
- Déjà configuré avec :
  - `isSuperAdmin` : Vérifie si l'utilisateur est super admin (isAdmin === 2)
  - `isLightAdmin` : Vérifie si l'utilisateur est light admin (isAdmin === 1)
  - `isAdmin` : Vérifie si l'utilisateur a un rôle admin quelconque

**AdminDashboard** (`Frontend/src/components/AdminDashboard.tsx`)
- Badges de rôle :
  - Super Admin : Badge rouge
  - Light Admin : Badge orange/warning
  - Utilisateur : Badge gris
- Header du dashboard affiche le rôle actuel
- Sélecteur de rôle dans la gestion des utilisateurs (super admin seulement)
- Restrictions pour Light Admin :
  - Pas d'accès à l'onglet "Users"
  - Pas d'accès à l'onglet "Deleted Items"
  - Pas de bouton "Delete" pour les utilisateurs
  - Pas de bouton "Delete" pour les boutons (sauf s'ils sont super admin)
- Affichage de la date d'upload dans la liste des boutons

**Navbar** (`Frontend/src/components/Navbar.tsx`)
- Badge approprié dans le menu dropdown :
  - "Super Admin" (rouge) pour les super admins
  - "Light Admin" (orange) pour les light admins

### 2. Date d'upload des boutons

- Ajout du champ `created_at` dans les requêtes du modèle `Uploaded`
- Affichage dans l'AdminDashboard avec gestion du cas où la date n'existe pas (N/A)
- Tri des boutons par date de création décroissante

## Instructions d'installation

### 1. Exécuter la migration SQL

```bash
mysql -u root -p crobboard < migration-admin-roles.sql
```

Ou via MySQL Workbench / phpMyAdmin en copiant le contenu du fichier `migration-admin-roles.sql`.

### 2. Redémarrer le backend

```bash
cd Backend
npm install
npm start
```

### 3. Redémarrer le frontend

```bash
cd Frontend
npm install
npm run dev
```

## Permissions des rôles

| Fonctionnalité | Utilisateur | Light Admin | Super Admin |
|----------------|-------------|-------------|-------------|
| Voir dashboard admin | ❌ | ✅ | ✅ |
| Voir statistiques | ❌ | ✅ | ✅ |
| Gérer catégories | ❌ | ✅ | ✅ |
| Éditer boutons | ❌ | ✅ | ✅ |
| Supprimer boutons | ❌ | ❌ | ✅ |
| Voir liste utilisateurs | ❌ | ❌ | ✅ |
| Gérer rôles utilisateurs | ❌ | ❌ | ✅ |
| Supprimer utilisateurs | ❌ | ❌ | ✅ |
| Voir boutons supprimés | ❌ | ❌ | ✅ |
| Restaurer boutons | ❌ | ❌ | ✅ |
| Voir audit logs | ❌ | ❌ | ✅ |

## Notes importantes

1. **Migration automatique** : Tous les admins existants (is_admin = 1) seront automatiquement convertis en Super Admins (is_admin = 2)

2. **Rétrocompatibilité** : L'ancienne route `toggle-admin` est conservée mais deprecated, utilisez maintenant la route `/role`

3. **Sécurité** :
   - Un utilisateur ne peut pas modifier son propre rôle
   - Seuls les super admins peuvent gérer les rôles
   - Les light admins ne peuvent pas supprimer de données critiques

4. **Date d'upload** :
   - Les boutons existants n'auront pas de date jusqu'à migration
   - Affichera "N/A" pour les anciens boutons
   - Les nouveaux boutons auront automatiquement la date actuelle

## Migration des utilisateurs existants

Pour promouvoir un utilisateur en Super Admin via SQL :

```sql
UPDATE user SET is_admin = 2 WHERE username = 'nom_utilisateur';
```

Pour créer un Light Admin :

```sql
UPDATE user SET is_admin = 1 WHERE username = 'nom_utilisateur';
```

Pour révoquer les privilèges admin :

```sql
UPDATE user SET is_admin = 0 WHERE username = 'nom_utilisateur';
```

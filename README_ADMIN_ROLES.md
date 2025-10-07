# Système de Rôles Admin - Guide Utilisateur

## 🎯 Vue d'ensemble

Le système CroabBoard dispose maintenant de **trois niveaux d'accès** :

1. **👤 Utilisateur** - Accès standard aux fonctionnalités de base
2. **🟠 Light Admin** - Accès modéré pour la modération de contenu
3. **🔴 Super Admin** - Accès complet pour l'administration du site

## 🔐 Niveaux d'accès

### 👤 Utilisateur (Niveau 0)

**Peut** :
- Parcourir et jouer les boutons sonores
- Ajouter des boutons à ses favoris
- Gérer sa collection personnelle
- Modifier son profil

**Ne peut pas** :
- Accéder au panneau d'administration
- Modifier le contenu global
- Gérer les utilisateurs

---

### 🟠 Light Admin (Niveau 1)

**Badge** : Orange "Light Admin"

**Peut tout ce qu'un utilisateur peut faire, plus** :
- ✅ Accéder au panneau d'administration
- ✅ Voir les statistiques globales
- ✅ Éditer les noms et catégories des boutons
- ✅ Créer et modifier les catégories
- ✅ Organiser le contenu du site

**Limitations** :
- ❌ Ne peut pas supprimer de boutons
- ❌ Ne peut pas gérer les utilisateurs
- ❌ Ne peut pas voir les boutons supprimés
- ❌ Ne peut pas accéder aux logs d'audit
- ❌ Ne peut pas supprimer de catégories

**Idéal pour** : Modérateurs de contenu, assistants d'administration

---

### 🔴 Super Admin (Niveau 2)

**Badge** : Rouge "Super Admin"

**Peut tout ce qu'un Light Admin peut faire, plus** :
- ✅ Supprimer des boutons définitivement
- ✅ Gérer tous les utilisateurs
- ✅ Promouvoir/révoquer les rôles admin
- ✅ Restaurer les boutons supprimés
- ✅ Consulter les logs d'audit
- ✅ Supprimer des catégories
- ✅ Accès complet à toutes les fonctionnalités

**Idéal pour** : Propriétaire du site, administrateurs de confiance

## 📊 Tableau comparatif des permissions

| Fonctionnalité | Utilisateur | Light Admin | Super Admin |
|----------------|:-----------:|:-----------:|:-----------:|
| **Contenu** |
| Jouer les sons | ✅ | ✅ | ✅ |
| Gérer ses favoris | ✅ | ✅ | ✅ |
| Uploader des boutons | ✅ | ✅ | ✅ |
| **Administration** |
| Voir le dashboard admin | ❌ | ✅ | ✅ |
| Voir les statistiques | ❌ | ✅ | ✅ |
| Éditer les boutons | ❌ | ✅ | ✅ |
| Supprimer les boutons | ❌ | ❌ | ✅ |
| Créer des catégories | ❌ | ✅ | ✅ |
| Éditer des catégories | ❌ | ✅ | ✅ |
| Supprimer des catégories | ❌ | ❌ | ✅ |
| **Gestion** |
| Voir la liste des utilisateurs | ❌ | ❌ | ✅ |
| Gérer les rôles | ❌ | ❌ | ✅ |
| Supprimer des utilisateurs | ❌ | ❌ | ✅ |
| Voir les éléments supprimés | ❌ | ❌ | ✅ |
| Restaurer des éléments | ❌ | ❌ | ✅ |
| Voir les logs d'audit | ❌ | ❌ | ✅ |

## 🎨 Identification visuelle

### Badges dans la navbar

Lorsque vous êtes connecté, votre rôle s'affiche dans le menu profil :

- **Pas de badge** = Utilisateur standard
- **Badge orange "Light Admin"** = Accès modérateur
- **Badge rouge "Super Admin"** = Accès administrateur complet

### Dashboard admin

Le titre du dashboard affiche votre niveau :
- Header orange = Light Admin
- Header rouge = Super Admin

### Liste des utilisateurs

Dans l'onglet Users (Super Admin uniquement) :
- Badge gris "User" = Utilisateur normal
- Badge orange "Light Admin" = Administrateur limité
- Badge rouge "Super Admin" = Administrateur complet

## 🚀 Comment devenir admin ?

### Pour les utilisateurs

Contactez un **Super Admin** actuel du site pour demander des privilèges.

### Pour les Super Admins

1. Allez dans **Admin Dashboard** > **Users**
2. Trouvez l'utilisateur dans la liste
3. Utilisez le menu déroulant pour sélectionner :
   - **User** : Révoquer les privilèges admin
   - **Light Admin** : Donner accès modéré
   - **Super Admin** : Donner accès complet

⚠️ **Note** : Vous ne pouvez pas modifier votre propre rôle pour des raisons de sécurité.

## 📋 Bonnes pratiques

### Pour les Super Admins

1. **Principe du moindre privilège** : Donnez le niveau minimum nécessaire
   - Modérateurs de contenu → Light Admin
   - Administrateurs de confiance → Super Admin

2. **Rotation des rôles** : Révisez régulièrement les permissions
   - Vérifiez que les Light Admins sont toujours actifs
   - Révoquez les accès inutilisés

3. **Sauvegarde** : Ayez toujours au moins 2 Super Admins actifs
   - En cas d'oubli de mot de passe
   - Pour assurer la continuité

### Pour les Light Admins

1. **Focus sur l'organisation** : Votre rôle est d'organiser et améliorer
   - Catégorisez les boutons correctement
   - Renommez les éléments mal nommés
   - Créez des catégories pertinentes

2. **Signalement** : Vous ne pouvez pas supprimer
   - Signalez les contenus problématiques aux Super Admins
   - Documentez vos observations

3. **Communication** : Coordonnez-vous avec les Super Admins
   - Suggérez des améliorations
   - Partagez vos idées d'organisation

## 🆕 Nouvelles fonctionnalités

### Date d'upload des boutons

Tous les boutons affichent maintenant leur date de création :
- Visible dans **Admin Dashboard** > **Buttons**
- Colonne "Upload Date"
- Tri par date (plus récents en premier)

📝 **Note** : Les boutons créés avant cette mise à jour afficheront "N/A"

### Gestion avancée des rôles

Les Super Admins peuvent maintenant :
- Choisir précisément le niveau d'accès
- Voir d'un coup d'œil le rôle de chaque utilisateur
- Gérer les permissions de manière granulaire

## ❓ FAQ

### Puis-je être Light Admin et Super Admin en même temps ?

Non, chaque utilisateur n'a qu'un seul rôle. Super Admin inclut déjà toutes les permissions de Light Admin.

### Comment savoir quel est mon rôle actuel ?

Regardez votre badge dans la navbar (menu en haut à droite avec votre avatar).

### Que se passe-t-il si je perds mes privilèges admin ?

Contactez un Super Admin actuel pour les restaurer si nécessaire.

### Puis-je voir qui a supprimé un bouton ?

Seuls les Super Admins peuvent voir l'historique des suppressions dans l'onglet "Deleted Items" et les logs d'audit.

### Les Light Admins peuvent-ils voir qui a uploadé un bouton ?

Oui, cette information est visible dans la liste des boutons.

## 🛡️ Sécurité

### Protections en place

1. **Auto-modification interdite** : Vous ne pouvez pas changer votre propre rôle
2. **Authentification requise** : Toutes les actions admin nécessitent une connexion
3. **Logs d'audit** : Tous les changements de rôle sont enregistrés
4. **Validation côté serveur** : Impossible de contourner les restrictions depuis le client

### Recommandations

- 🔒 Utilisez des mots de passe forts
- 🚪 Déconnectez-vous après usage sur un ordinateur partagé
- 👀 Surveillez les actions suspectes dans les logs (Super Admin)
- 📧 Activez la double authentification si disponible

## 📞 Support

En cas de problème :

1. **Vérifiez votre badge** dans la navbar pour confirmer votre rôle
2. **Déconnectez-vous et reconnectez-vous** pour rafraîchir votre session
3. **Contactez un Super Admin** si vous pensez qu'il y a une erreur
4. **Consultez les logs** (Super Admin uniquement) pour voir l'historique

## 🎉 Conclusion

Ce système de rôles permet une **gestion flexible** et **sécurisée** de votre communauté :
- Les Light Admins peuvent aider à organiser sans risque de suppression accidentelle
- Les Super Admins gardent le contrôle total
- Tous les utilisateurs bénéficient d'un contenu mieux organisé

Bonne administration ! 🚀

# ⚡ CroabBoard - Démarrage Rapide

Guide de démarrage ultra-rapide pour CroabBoard.

---

## 🎯 Choisissez votre scénario

### Option 1: Développement Local

```bash
# 1. Cloner le projet
git clone https://github.com/croby98/croabboard.git
cd croabboard

# 2. Démarrer avec Docker
docker-compose up -d

# 3. Accéder à l'application
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

**C'est tout ! 🎉**

---

### Option 2: Production Simple (Accès par IP)

```bash
# 1. Cloner et configurer
git clone https://github.com/croby98/croabboard.git
cd croabboard
cp .env.example .env
nano .env  # Modifier les mots de passe

# 2. Copier vos fichiers existants (optionnel)
./copy-uploads-to-docker.sh  # Linux/Mac
# ou
copy-uploads-to-docker.bat   # Windows

# 3. Démarrer en mode host
docker-compose -f docker-compose.simple.yml up -d

# 4. Accéder à l'application
# http://VOTRE-IP:3000
```

**Fini ! 🚀**

---

### Option 3: Production avec Proxy (Recommandé)

```bash
# 1. Cloner et configurer
git clone https://github.com/croby98/croabboard.git
cd croabboard
cp .env.example .env
nano .env  # Modifier les mots de passe

# 2. Copier vos fichiers existants (optionnel)
./copy-uploads-to-docker.sh  # Linux/Mac
# ou
copy-uploads-to-docker.bat   # Windows

# 3. Démarrer avec proxy
docker-compose -f docker-compose.proxy.yml up -d

# 4. Accéder à l'application
# http://VOTRE-IP
# ou
# http://votre-domaine.com
```

**Terminé ! 🎊**

---

## 📝 Configuration Minimale

Modifiez `.env` avec vos propres valeurs :

```env
# Mots de passe (IMPORTANT: changez-les !)
MYSQL_ROOT_PASSWORD=votre_mot_de_passe_root_super_securise
MYSQL_PASSWORD=votre_mot_de_passe_mysql_securise
SESSION_SECRET=votre_secret_session_minimum_64_caracteres_aleatoires
REDIS_PASSWORD=votre_mot_de_passe_redis_securise

# URLs (modifiez selon votre cas)
FRONTEND_URL=http://localhost
# Pour accès par IP: http://192.168.1.100
# Pour domaine: https://croabboard.com
```

---

## ✅ Vérification

```bash
# Vérifier que tout fonctionne
docker ps

# Vous devriez voir 4 conteneurs en cours d'exécution:
# - croabboard-database
# - croabboard-api
# - croabboard-web
# - croabboard-cache
```

---

## 🔐 Premier Compte

1. Ouvrez l'application dans votre navigateur
2. Créez votre premier compte utilisateur
3. Le premier compte créé est automatiquement **administrateur**

---

## 📖 Documentation Complète

- **Guide de Déploiement** : [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Configuration Docker** : [DOCKER.md](./DOCKER.md)
- **Gestion des Uploads** : [UPLOADS.md](./UPLOADS.md)
- **README Complet** : [README.md](./README.md)

---

## 🆘 Problèmes Courants

### Port déjà utilisé

```bash
# Arrêter le service existant
docker-compose down

# Ou changer le port dans docker-compose.yml
```

### Mot de passe MySQL incorrect

```bash
# Supprimer le volume de la base de données
docker volume rm croabboard_database_data

# Redémarrer
docker-compose up -d
```

### Les uploads ne s'affichent pas

```bash
# Copier vos fichiers dans le volume Docker
./copy-uploads-to-docker.sh
```

---

## 🚀 Commandes Utiles

```bash
# Arrêter tous les services
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f

# Sauvegarder la base de données
docker-compose exec croabboard-db mysqldump -u root -p croabboard > backup.sql
```

---

**Besoin d'aide ? Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails !**

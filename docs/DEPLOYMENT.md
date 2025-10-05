# 🚀 CroabBoard - Guide de Déploiement

Guide complet pour déployer CroabBoard avec différentes configurations Docker.

---

## 📋 Table des Matières

1. [Choix de Configuration](#-choix-de-configuration)
2. [Déploiement Simple (Host Mode)](#-déploiement-simple-host-mode)
3. [Déploiement avec Proxy](#-déploiement-avec-proxy)
4. [Accès par IP vs Nom de Domaine](#-accès-par-ip-vs-nom-de-domaine)
5. [Configuration SSL/HTTPS](#-configuration-sslhttps)
6. [Exemples de Déploiement](#-exemples-de-déploiement)

---

## 🎯 Choix de Configuration

CroabBoard propose 3 configurations Docker selon vos besoins :

### 1. **docker-compose.yml** - Développement
- ✅ Configuration par défaut
- ✅ Ports exposés directement
- ✅ Facile à déboguer
- ✅ Accès direct à la base de données
- ❌ Non recommandé pour la production

**Accès :**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Database: `localhost:3306`

### 2. **docker-compose.simple.yml** - Production Simple (Host Mode)
- ✅ Mode réseau `host` pour simplicité
- ✅ Pas de mapping de ports
- ✅ Performances optimales
- ✅ Accès par IP directement
- ⚠️ Moins d'isolation réseau

**Accès :**
- Application: `http://VOTRE-IP:3000`
- API: `http://VOTRE-IP:5000`

### 3. **docker-compose.proxy.yml** - Production avec Proxy
- ✅ Nginx reverse proxy
- ✅ Un seul port exposé (80/443)
- ✅ Meilleure sécurité
- ✅ Support SSL facile
- ✅ Fonctionne avec IP ou domaine

**Accès :**
- Application: `http://VOTRE-IP` ou `http://VOTRE-DOMAINE`

---

## 🔧 Déploiement Simple (Host Mode)

### Recommandé pour :
- Serveur dédié sans autres services
- Accès par IP uniquement
- Pas besoin de SSL
- Maximum de performances

### Installation

1. **Préparer l'environnement**
   ```bash
   cd CroabBoard-Rework
   cp .env.example .env
   nano .env
   ```

2. **Configurer les variables d'environnement**
   ```env
   # .env
   MYSQL_ROOT_PASSWORD=votre_mot_de_passe_root_securise
   MYSQL_USER=croabboard_user
   MYSQL_PASSWORD=votre_mot_de_passe_securise
   MYSQL_DATABASE=croabboard
   SESSION_SECRET=votre_secret_session_tres_securise_et_long
   REDIS_PASSWORD=votre_mot_de_passe_redis_securise
   ```

3. **Copier les uploads existants (optionnel)**
   ```bash
   # Windows
   copy-uploads-to-docker.bat

   # Linux/Mac
   ./copy-uploads-to-docker.sh
   ```

4. **Démarrer les services**
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

5. **Vérifier les services**
   ```bash
   # Vérifier que tous les services tournent
   docker ps

   # Vérifier les logs
   docker-compose -f docker-compose.simple.yml logs -f
   ```

6. **Accéder à l'application**
   - Ouvrez `http://VOTRE-IP:3000` dans votre navigateur

### Avantages
- ✅ Pas de configuration réseau complexe
- ✅ Performances maximales
- ✅ Facile à installer

### Inconvénients
- ❌ Ports multiples exposés (3000, 5000, 3306, 6379)
- ❌ Pas de proxy pour SSL
- ❌ Moins sécurisé en production

---

## 🌐 Déploiement avec Proxy

### Recommandé pour :
- Production avec SSL/HTTPS
- Accès par nom de domaine
- Besoin de sécurité renforcée
- Multiple applications sur le même serveur

### Installation

1. **Préparer l'environnement**
   ```bash
   cd CroabBoard-Rework
   cp .env.example .env
   nano .env
   ```

2. **Configurer les variables d'environnement**
   ```env
   # .env
   MYSQL_ROOT_PASSWORD=votre_mot_de_passe_root_securise
   MYSQL_USER=croabboard_user
   MYSQL_PASSWORD=votre_mot_de_passe_securise
   MYSQL_DATABASE=croabboard
   SESSION_SECRET=votre_secret_session_tres_securise_et_long
   REDIS_PASSWORD=votre_mot_de_passe_redis_securise
   PROXY_PORT=80
   # PROXY_SSL_PORT=443  # Si vous voulez activer HTTPS
   ```

3. **Copier les uploads existants (optionnel)**
   ```bash
   # Windows
   copy-uploads-to-docker.bat

   # Linux/Mac
   ./copy-uploads-to-docker.sh
   ```

4. **Démarrer les services**
   ```bash
   docker-compose -f docker-compose.proxy.yml up -d
   ```

5. **Vérifier les services**
   ```bash
   # Vérifier que tous les services tournent
   docker ps

   # Vérifier le proxy
   curl http://localhost/health
   ```

6. **Accéder à l'application**
   - Par IP: `http://VOTRE-IP`
   - Par domaine: `http://votre-domaine.com`

### Avantages
- ✅ Un seul port exposé (80 ou 443)
- ✅ Support SSL/HTTPS facile
- ✅ Meilleure sécurité
- ✅ Fonctionne avec IP ou domaine

### Inconvénients
- ❌ Configuration légèrement plus complexe
- ❌ Overhead minimal du proxy

---

## 🔍 Accès par IP vs Nom de Domaine

### Accès par IP (sans domaine)

**Avec Host Mode :**
```bash
# Démarrer
docker-compose -f docker-compose.simple.yml up -d

# Accéder
http://192.168.1.100:3000  # Frontend
http://192.168.1.100:5000  # API
```

**Avec Proxy :**
```bash
# Démarrer
docker-compose -f docker-compose.proxy.yml up -d

# Accéder
http://192.168.1.100  # Application complète via proxy
```

### Accès par Nom de Domaine

**Prérequis :**
- Domaine pointé vers votre IP
- DNS configuré (A record)

**Configuration :**
```bash
# Démarrer avec proxy
docker-compose -f docker-compose.proxy.yml up -d

# Accéder
http://croabboard.votredomaine.com
```

**Aucune modification n'est nécessaire** - Le proxy accepte tous les domaines (`server_name _;`)

---

## 🔐 Configuration SSL/HTTPS

### Avec Let's Encrypt (Recommandé)

1. **Installer Certbot**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtenir un certificat**
   ```bash
   sudo certbot certonly --standalone -d votre-domaine.com
   ```

3. **Copier les certificats**
   ```bash
   mkdir -p ssl
   sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ssl/
   sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ssl/
   ```

4. **Modifier nginx.conf**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name _;

       ssl_certificate /etc/nginx/ssl/fullchain.pem;
       ssl_certificate_key /etc/nginx/ssl/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;

       # ... reste de la configuration
   }

   # Redirection HTTP vers HTTPS
   server {
       listen 80;
       server_name _;
       return 301 https://$host$request_uri;
   }
   ```

5. **Décommenter le port HTTPS dans docker-compose.proxy.yml**
   ```yaml
   croabboard-proxy:
     ports:
       - "80:80"
       - "443:443"  # ← Décommenter cette ligne
   ```

6. **Redémarrer le proxy**
   ```bash
   docker-compose -f docker-compose.proxy.yml restart croabboard-proxy
   ```

### Renouvellement Automatique

```bash
# Ajouter à crontab
sudo crontab -e

# Ajouter cette ligne pour renouveler tous les jours à 3h du matin
0 3 * * * certbot renew --quiet && docker-compose -f /path/to/croabboard/docker-compose.proxy.yml restart croabboard-proxy
```

---

## 📝 Exemples de Déploiement

### Exemple 1: Serveur Perso (IP uniquement, pas de domaine)

**Scénario :** Serveur à la maison, accès par IP locale

```bash
# 1. Configuration
cd CroabBoard-Rework
cp .env.example .env
# Éditer .env avec vos mots de passe

# 2. Copier les uploads
copy-uploads-to-docker.bat  # Windows
# ou
./copy-uploads-to-docker.sh  # Linux

# 3. Démarrer en mode host
docker-compose -f docker-compose.simple.yml up -d

# 4. Accéder
# Ouvrir http://192.168.1.XXX:3000
```

### Exemple 2: VPS avec IP publique (sans domaine)

**Scénario :** VPS OVH/DigitalOcean, accès par IP publique

```bash
# 1. Configuration
cd CroabBoard-Rework
cp .env.example .env
nano .env  # Configurer des mots de passe FORTS

# 2. Copier les uploads
./copy-uploads-to-docker.sh

# 3. Démarrer avec proxy (port 80 uniquement)
docker-compose -f docker-compose.proxy.yml up -d

# 4. Configurer le firewall
sudo ufw allow 80/tcp
sudo ufw enable

# 5. Accéder
# Ouvrir http://51.XX.XX.XX
```

### Exemple 3: VPS avec Domaine et SSL

**Scénario :** VPS avec domaine `croabboard.com` et SSL

```bash
# 1. Configuration DNS
# A record: croabboard.com → 51.XX.XX.XX

# 2. Configuration
cd CroabBoard-Rework
cp .env.example .env
nano .env  # Configurer des mots de passe FORTS

# 3. Copier les uploads
./copy-uploads-to-docker.sh

# 4. Obtenir le certificat SSL
sudo certbot certonly --standalone -d croabboard.com
mkdir -p ssl
sudo cp /etc/letsencrypt/live/croabboard.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/croabboard.com/privkey.pem ssl/

# 5. Modifier nginx.conf pour SSL
nano nginx/nginx.conf  # Ajouter config SSL

# 6. Modifier docker-compose.proxy.yml
nano docker-compose.proxy.yml  # Décommenter port 443

# 7. Démarrer
docker-compose -f docker-compose.proxy.yml up -d

# 8. Configurer le firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 9. Accéder
# Ouvrir https://croabboard.com
```

---

## 🔧 Commandes Utiles

### Gestion des Services

```bash
# Démarrer
docker-compose -f docker-compose.simple.yml up -d
# ou
docker-compose -f docker-compose.proxy.yml up -d

# Arrêter
docker-compose -f docker-compose.simple.yml down
# ou
docker-compose -f docker-compose.proxy.yml down

# Redémarrer un service
docker-compose -f docker-compose.proxy.yml restart croabboard-backend

# Voir les logs
docker-compose -f docker-compose.proxy.yml logs -f

# Voir les logs d'un service
docker-compose -f docker-compose.proxy.yml logs -f croabboard-backend
```

### Sauvegarde

```bash
# Sauvegarder la base de données
docker-compose exec croabboard-db mysqldump -u root -p$MYSQL_ROOT_PASSWORD croabboard > backup_$(date +%Y%m%d).sql

# Sauvegarder les uploads
docker run --rm -v croabboard_file_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### Mise à jour

```bash
# Récupérer les dernières modifications
git pull

# Reconstruire les images
docker-compose -f docker-compose.proxy.yml build --no-cache

# Redémarrer avec les nouvelles images
docker-compose -f docker-compose.proxy.yml up -d
```

---

## 📊 Monitoring

### Vérifier la santé des services

```bash
# Santé globale
docker-compose -f docker-compose.proxy.yml ps

# Backend
curl http://localhost/health

# Proxy (si utilisé)
curl http://localhost/health
```

### Logs en temps réel

```bash
# Tous les services
docker-compose -f docker-compose.proxy.yml logs -f

# Service spécifique
docker-compose -f docker-compose.proxy.yml logs -f croabboard-backend
```

---

## 🆘 Dépannage

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port
netstat -tulpn | grep :80

# Tuer le processus
sudo kill -9 <PID>
```

### Service ne démarre pas

```bash
# Voir les logs détaillés
docker-compose -f docker-compose.proxy.yml logs croabboard-backend

# Redémarrer le service
docker-compose -f docker-compose.proxy.yml restart croabboard-backend
```

### Uploads manquants

```bash
# Vérifier le volume
docker volume inspect croabboard_file_uploads

# Recopier les uploads
./copy-uploads-to-docker.sh
```

---

## 📞 Support

Pour plus d'aide :
- **Documentation Docker** : [DOCKER.md](./DOCKER.md)
- **Gestion des Uploads** : [UPLOADS.md](./UPLOADS.md)
- **GitHub Issues** : [Créer une issue](https://github.com/croby98/croabboard/issues)

---

**Bon déploiement ! 🚀**

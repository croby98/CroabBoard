# 📁 CroabBoard - Guide des Fichiers Docker

Ce document explique le rôle de chaque fichier Docker dans le projet.

---

## 📋 Liste des Fichiers

### Fichiers Docker Compose

| Fichier | Utilisation | Description |
|---------|-------------|-------------|
| `docker-compose.yml` | Développement | Configuration par défaut pour le développement local |
| `docker-compose.simple.yml` | Production simple | Mode host network, accès direct par IP:PORT |
| `docker-compose.proxy.yml` | Production avec proxy | Nginx reverse proxy, accès par IP ou domaine |
| `docker-compose.prod.yml` | Production avancée | Configuration production avec scaling et monitoring |

### Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `.env.example` | Template des variables d'environnement |
| `nginx/nginx.conf` | Configuration Nginx pour le reverse proxy |
| `Frontend/nginx.conf` | Configuration Nginx pour servir le frontend |
| `Frontend/nginx-host.conf` | Configuration Nginx en mode host network |

### Dockerfiles

| Fichier | Description |
|---------|-------------|
| `Backend/Dockerfile` | Image Docker pour l'API Node.js |
| `Frontend/Dockerfile` | Image Docker pour le frontend React |

### Scripts

| Fichier | Plateforme | Description |
|---------|------------|-------------|
| `start.sh` | Linux/Mac | Script de démarrage interactif |
| `start.bat` | Windows | Script de démarrage interactif |
| `deploy.sh` | Linux/Mac | Script de déploiement complet |
| `copy-uploads-to-docker.sh` | Linux/Mac | Copie les uploads vers Docker |
| `copy-uploads-to-docker.bat` | Windows | Copie les uploads vers Docker |

### Documentation

| Fichier | Contenu |
|---------|---------|
| `README.md` | Documentation principale |
| `QUICK-START.md` | Guide de démarrage ultra-rapide |
| `DEPLOYMENT.md` | Guide de déploiement complet |
| `DOCKER.md` | Documentation Docker détaillée |
| `UPLOADS.md` | Gestion des fichiers d'upload |
| `FICHIERS-DOCKER.md` | Ce fichier |

---

## 🎯 Quel Fichier Utiliser ?

### Scénario 1: Je veux juste tester l'application

```bash
# Utilisez le script de démarrage
./start.sh         # Linux/Mac
start.bat          # Windows

# Ou directement
docker-compose up -d
```

**Fichiers utilisés:**
- `docker-compose.yml`
- `.env` (créé depuis `.env.example`)

---

### Scénario 2: Je veux déployer sur un VPS sans nom de domaine

```bash
# Utilisez le mode simple avec host network
docker-compose -f docker-compose.simple.yml up -d
```

**Fichiers utilisés:**
- `docker-compose.simple.yml`
- `.env`
- `Frontend/nginx-host.conf` (si personnalisé)

**Accès:** `http://VOTRE-IP:3000`

---

### Scénario 3: Je veux déployer avec un reverse proxy (IP ou domaine)

```bash
# Utilisez le mode proxy
docker-compose -f docker-compose.proxy.yml up -d
```

**Fichiers utilisés:**
- `docker-compose.proxy.yml`
- `nginx/nginx.conf`
- `.env`

**Accès:** `http://VOTRE-IP` ou `http://votre-domaine.com`

---

### Scénario 4: Je veux une configuration production complète

```bash
# Utilisez le mode production avec monitoring
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Fichiers utilisés:**
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `nginx/nginx.conf`
- `.env`

---

## 📝 Détails des Fichiers Docker Compose

### `docker-compose.yml` - Développement

**Objectif:** Développement local facile

**Caractéristiques:**
- ✅ Ports exposés directement (3000, 5000, 3306, 6379)
- ✅ Volumes pour persistence
- ✅ Réseau bridge
- ✅ Accès direct à la base de données
- ✅ Pas de ressources limitées

**Services:**
- `croabboard-db` (MySQL) → Port 3306
- `croabboard-backend` (Node.js) → Port 5000
- `croabboard-frontend` (Nginx) → Port 3000
- `croabboard-redis` (Redis) → Port 6379

**Quand l'utiliser:**
- Développement local
- Tests
- Debug

---

### `docker-compose.simple.yml` - Production Simple

**Objectif:** Déploiement production simple avec host network

**Caractéristiques:**
- ✅ Mode `network_mode: host`
- ✅ Pas de mapping de ports
- ✅ Performance maximale
- ✅ Configuration simple
- ⚠️ Tous les ports exposés directement

**Services:**
- Tous les services utilisent le réseau de l'hôte
- Accès direct via `localhost` ou IP du serveur

**Quand l'utiliser:**
- Serveur dédié CroabBoard uniquement
- Accès par IP
- Pas besoin de SSL
- Performance maximale requise

---

### `docker-compose.proxy.yml` - Production avec Proxy

**Objectif:** Déploiement production avec Nginx reverse proxy

**Caractéristiques:**
- ✅ Nginx reverse proxy
- ✅ Un seul port exposé (80, optionnel 443)
- ✅ Support SSL/HTTPS
- ✅ Isolation des services
- ✅ Fonctionne avec IP ou domaine

**Services:**
- `croabboard-proxy` (Nginx) → Ports 80/443
- Autres services en réseau interne uniquement

**Quand l'utiliser:**
- Production avec plusieurs applications
- Besoin de SSL/HTTPS
- Sécurité renforcée
- Nom de domaine

---

### `docker-compose.prod.yml` - Production Avancée

**Objectif:** Override pour production avec optimisations

**Caractéristiques:**
- ✅ Limites de ressources CPU/RAM
- ✅ Scaling (replicas)
- ✅ Logs optimisés
- ✅ Monitoring (Prometheus)
- ✅ Configuration MySQL optimisée

**Usage:**
Combine avec `docker-compose.yml`:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Quand l'utiliser:**
- Production à grande échelle
- Besoin de monitoring
- Multiple instances (scaling)

---

## 🔧 Configuration des Variables d'Environnement

### Créer votre `.env`

```bash
# Copier le template
cp .env.example .env

# Éditer
nano .env  # Linux/Mac
notepad .env  # Windows
```

### Variables Importantes

```env
# Base de données
MYSQL_ROOT_PASSWORD=changez_moi_absolument
MYSQL_PASSWORD=changez_moi_absolument

# Sécurité
SESSION_SECRET=minimum_64_caracteres_aleatoires_tres_securises

# Redis
REDIS_PASSWORD=changez_moi_absolument

# URLs (adapter selon votre cas)
FRONTEND_URL=http://localhost
# Pour IP: http://192.168.1.100
# Pour domaine: https://croabboard.com

# Proxy (pour docker-compose.proxy.yml)
PROXY_PORT=80
# PROXY_SSL_PORT=443  # Décommenter pour HTTPS
```

---

## 🚀 Scripts de Démarrage

### `start.sh` / `start.bat`

**Démarrage interactif avec choix du mode**

Le script vous demande:
1. Quel mode de déploiement ?
2. Copier les uploads existants ?
3. Démarre les services
4. Affiche les informations d'accès

**Usage:**
```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# Windows
start.bat
```

---

### `copy-uploads-to-docker.sh` / `.bat`

**Copie les fichiers d'upload dans le volume Docker**

Copie le contenu de `Backend/uploads/` vers le volume Docker `croabboard_file_uploads`.

**Usage:**
```bash
# Linux/Mac
./copy-uploads-to-docker.sh

# Windows
copy-uploads-to-docker.bat
```

---

## 🎓 Exemples de Commandes

### Développement

```bash
# Démarrer
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Production Simple (Host)

```bash
# Démarrer
docker-compose -f docker-compose.simple.yml up -d

# Logs
docker-compose -f docker-compose.simple.yml logs -f

# Arrêter
docker-compose -f docker-compose.simple.yml down
```

### Production avec Proxy

```bash
# Démarrer
docker-compose -f docker-compose.proxy.yml up -d

# Logs du proxy
docker-compose -f docker-compose.proxy.yml logs -f croabboard-proxy

# Redémarrer le proxy
docker-compose -f docker-compose.proxy.yml restart croabboard-proxy

# Arrêter
docker-compose -f docker-compose.proxy.yml down
```

---

## 📚 Documentation Complémentaire

- **Démarrage rapide:** [QUICK-START.md](./QUICK-START.md)
- **Guide de déploiement:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Docker détaillé:** [DOCKER.md](./DOCKER.md)
- **Gestion des uploads:** [UPLOADS.md](./UPLOADS.md)
- **README principal:** [README.md](./README.md)

---

**Questions ? Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails !**

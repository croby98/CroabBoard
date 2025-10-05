# 📁 Structure du Projet CroabBoard

## 🎯 Organisation

```
CroabBoard-Rework/
├── 📄 README.md                    # Documentation principale
├── 📄 LICENSE                      # Licence MIT
├── 📄 .env.example                 # Template de configuration
├── 🐳 docker-compose.yml           # Docker Compose développement
├── 🚀 start.sh / start.bat         # Scripts de démarrage rapide
│
├── 📂 Backend/                     # API Node.js + Express
│   ├── server.js                   # Point d'entrée
│   ├── models/                     # Modèles de données
│   ├── uploads/                    # Fichiers uploadés (local)
│   ├── Dockerfile                  # Image Docker backend
│   └── package.json
│
├── 📂 Frontend/                    # Application React + TypeScript
│   ├── src/                        # Code source
│   ├── public/                     # Assets publics
│   ├── nginx.conf                  # Config Nginx pour conteneur
│   ├── nginx-host.conf             # Config Nginx mode host
│   ├── Dockerfile                  # Image Docker frontend
│   └── package.json
│
├── 📂 database/                    # Base de données
│   ├── init/                       # Scripts d'initialisation
│   │   ├── 00-init-database.sql
│   │   ├── 01-crobboard-schema-and-data.sql
│   │   └── 99-post-init.sql
│   └── README.md
│
├── 📂 docker/                      # Configuration Docker
│   ├── 📂 configs/                 # Fichiers de configuration
│   │   └── nginx/                  # Config Nginx reverse proxy
│   │       └── nginx.conf
│   │
│   ├── 📂 scripts/                 # Scripts de déploiement
│   │   ├── start.sh                # Démarrage interactif (Linux/Mac)
│   │   ├── start.bat               # Démarrage interactif (Windows)
│   │   ├── copy-uploads-to-docker.sh
│   │   ├── copy-uploads-to-docker.bat
│   │   └── deploy.sh               # Déploiement complet
│   │
│   ├── docker-compose.simple.yml   # Mode host network
│   ├── docker-compose.proxy.yml    # Mode reverse proxy
│   ├── docker-compose.prod.yml     # Override production
│   └── README.md                   # Documentation Docker
│
└── 📂 docs/                        # Documentation
    ├── README.md                   # Index de la documentation
    ├── QUICK-START.md              # Démarrage rapide
    ├── DEPLOYMENT.md               # Guide de déploiement
    ├── DOCKER.md                   # Documentation Docker
    ├── UPLOADS.md                  # Gestion des uploads
    ├── FICHIERS-DOCKER.md          # Référence des fichiers
    └── RESUME-DOCKERISATION.md     # Résumé complet
```

---

## 📖 Navigation Rapide

### 🚀 Je Veux Démarrer
- Lire : [`docs/QUICK-START.md`](./docs/QUICK-START.md)
- Exécuter : `./start.sh` (Linux/Mac) ou `start.bat` (Windows)

### 🐳 Je Veux Déployer avec Docker
- Guide : [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- Configurations : [`docker/`](./docker/)
- Scripts : [`docker/scripts/`](./docker/scripts/)

### 📚 Je Veux Comprendre
- Documentation : [`docs/`](./docs/)
- Code Backend : [`Backend/`](./Backend/)
- Code Frontend : [`Frontend/`](./Frontend/)

### 🔧 Je Veux Configurer
- Variables : [`.env.example`](./.env.example)
- Docker : [`docker/`](./docker/)
- Base de données : [`database/`](./database/)

---

## 🎯 Fichiers Principaux

### À la Racine

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale du projet |
| `docker-compose.yml` | Configuration Docker pour développement |
| `.env.example` | Template des variables d'environnement |
| `start.sh` / `start.bat` | Scripts de démarrage rapide |
| `STRUCTURE.md` | Ce fichier - Structure du projet |

### Documentation (`docs/`)

| Fichier | Contenu |
|---------|---------|
| `QUICK-START.md` | Guide ultra-rapide (3 scénarios) |
| `DEPLOYMENT.md` | Guide complet de déploiement |
| `DOCKER.md` | Documentation Docker détaillée |
| `UPLOADS.md` | Gestion des fichiers d'upload |
| `FICHIERS-DOCKER.md` | Référence de tous les fichiers Docker |
| `RESUME-DOCKERISATION.md` | Résumé de la dockerisation |

### Docker (`docker/`)

| Fichier | Usage |
|---------|-------|
| `docker-compose.simple.yml` | Production mode host (IP:PORT) |
| `docker-compose.proxy.yml` | Production avec proxy (IP ou domaine) |
| `docker-compose.prod.yml` | Override production avancé |

### Scripts (`docker/scripts/`)

| Script | Fonction |
|--------|----------|
| `start.sh` / `start.bat` | Démarrage interactif avec menu |
| `copy-uploads-to-docker.sh/bat` | Migration des uploads vers Docker |
| `deploy.sh` | Déploiement complet automatisé |

---

## 🔄 Flux de Travail

### Développement Local

```bash
# 1. Cloner le projet
git clone <repo>
cd CroabBoard-Rework

# 2. Configurer
cp .env.example .env

# 3. Démarrer
docker-compose up -d

# 4. Accéder
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

### Production Simple (IP)

```bash
# 1. Configurer
cp .env.example .env
nano .env  # Modifier les mots de passe

# 2. Copier les uploads (optionnel)
./docker/scripts/copy-uploads-to-docker.sh

# 3. Démarrer
docker-compose -f docker/docker-compose.simple.yml up -d

# 4. Accéder
# http://VOTRE-IP:3000
```

### Production avec Proxy

```bash
# 1. Configurer
cp .env.example .env
nano .env  # Modifier les mots de passe

# 2. Copier les uploads (optionnel)
./docker/scripts/copy-uploads-to-docker.sh

# 3. Démarrer
docker-compose -f docker/docker-compose.proxy.yml up -d

# 4. Accéder
# http://VOTRE-IP ou http://votre-domaine.com
```

---

## 📦 Volumes Docker

Les données persistantes sont stockées dans des volumes Docker :

- `croabboard_database_data` - Base de données MySQL
- `croabboard_file_uploads` - Fichiers uploadés (audio, images, avatars)
- `croabboard_application_logs` - Logs de l'application
- `croabboard_redis_data` - Données Redis (sessions)
- `croabboard_nginx_logs` - Logs Nginx (si proxy utilisé)

---

## 🌐 Ports

### Mode Développement
- `3000` - Frontend (React)
- `5000` - Backend (API)
- `3306` - MySQL
- `6379` - Redis

### Mode Production Simple (Host)
- `3000` - Frontend
- `5000` - Backend
- Autres ports internes

### Mode Production avec Proxy
- `80` - HTTP (Nginx proxy)
- `443` - HTTPS (Nginx proxy, si configuré)
- Autres ports internes uniquement

---

## 🔐 Sécurité

### Fichiers à Ne Pas Commiter
- `.env` - Configuration locale (mots de passe)
- `Backend/uploads/*` - Fichiers uploadés
- `node_modules/` - Dépendances
- `*.log` - Logs

### Fichiers Importants à Modifier
- `.env` - **CHANGER TOUS LES MOTS DE PASSE**
- `docker/configs/nginx/nginx.conf` - Si SSL/domaine

---

## 📞 Aide

- **Documentation complète** : [`docs/`](./docs/)
- **Démarrage rapide** : [`docs/QUICK-START.md`](./docs/QUICK-START.md)
- **Guide Docker** : [`docs/DOCKER.md`](./docs/DOCKER.md)
- **Problèmes** : Ouvrir une issue sur GitHub

---

**Structure organisée pour faciliter le développement et le déploiement ! 🚀**

# 🐳 Docker Configuration

Ce dossier contient toutes les configurations Docker pour CroabBoard.

## 📁 Structure

```
docker/
├── configs/              # Fichiers de configuration
│   └── nginx/           # Configuration Nginx pour reverse proxy
│       └── nginx.conf
├── scripts/             # Scripts de déploiement et utilitaires
│   ├── start.sh        # Démarrage interactif (Linux/Mac)
│   ├── start.bat       # Démarrage interactif (Windows)
│   ├── copy-uploads-to-docker.sh   # Migration uploads (Linux/Mac)
│   ├── copy-uploads-to-docker.bat  # Migration uploads (Windows)
│   └── deploy.sh       # Déploiement complet
├── docker-compose.simple.yml   # Mode host network (IP:PORT)
├── docker-compose.proxy.yml    # Mode reverse proxy (IP ou domaine)
└── docker-compose.prod.yml     # Override production avancé
```

---

## 🚀 Utilisation

### Depuis la Racine du Projet

**Mode Développement:**
```bash
docker-compose up -d
```

**Mode Production Simple:**
```bash
docker-compose -f docker/docker-compose.simple.yml up -d
```

**Mode Production avec Proxy:**
```bash
docker-compose -f docker/docker-compose.proxy.yml up -d
```

### Scripts de Démarrage

Des wrappers sont disponibles à la racine :
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

---

## 📝 Fichiers Docker Compose

### `docker-compose.simple.yml`
- **Mode:** Host network
- **Accès:** `http://IP:3000`
- **Usage:** Production simple, accès par IP avec ports

### `docker-compose.proxy.yml`
- **Mode:** Bridge network + Nginx reverse proxy
- **Accès:** `http://IP` ou `http://domaine.com`
- **Usage:** Production avec proxy, SSL possible

### `docker-compose.prod.yml`
- **Mode:** Override pour production
- **Features:** Scaling, monitoring, limites ressources
- **Usage:** Combine avec les autres fichiers

---

## 🔧 Configuration

Les chemins dans les docker-compose utilisent `..` car ils sont exécutés depuis le dossier `docker/`:

```yaml
build:
  context: ../Backend    # Pointe vers /Backend depuis /docker
  dockerfile: Dockerfile

volumes:
  - ../database/init:/docker-entrypoint-initdb.d:ro  # Pointe vers /database
```

---

## 📖 Documentation

Pour plus de détails, consultez :
- [QUICK-START.md](../docs/QUICK-START.md)
- [DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- [DOCKER.md](../docs/DOCKER.md)

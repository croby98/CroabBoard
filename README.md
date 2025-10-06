# 🐳 CroabBoard - Docker

## 🚀 Démarrage Rapide

### 1. Configuration
```bash
cp .env.example .env
nano .env  # Configurer les variables
```

### 2. Lancer
```bash
chmod +x start-docker.sh
./start-docker.sh
```

### 3. Copier les uploads (optionnel)
```bash
chmod +x copy-uploads.sh
./copy-uploads.sh
```

## 📝 Configuration Proxy

Si derrière un proxy, ajouter dans `.env` :
```env
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1
```

## 📍 Accès

- Frontend : http://localhost
- Backend : http://localhost:3001
- Database : localhost:3306

## 🛠️ Commandes

```bash
./start-docker.sh         # Démarrer
./start-docker.sh stop    # Arrêter
./start-docker.sh logs    # Voir les logs
./start-docker.sh status  # Voir le statut
./start-docker.sh clean   # Nettoyer
```

## ⚙️ Architecture

- **Network mode** : host (pour environnement d'entreprise sans DNS)
- **Database** : MySQL 8.0 sur localhost:3306
- **Backend** : Node.js sur localhost:3001
- **Frontend** : Nginx sur localhost:80
- **Volumes** : mysql_data, backend_uploads

## ⚠️ Important

- Changer tous les mots de passe dans `.env`
- Le fichier `01-crobboard-schema-and-data.sql` doit être présent
- Mode host : tous les conteneurs partagent le réseau de l'hôte

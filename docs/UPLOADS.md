# 📁 CroabBoard - Gestion des Uploads

Guide complet pour la gestion des fichiers d'upload dans CroabBoard avec Docker.

---

## 📂 Structure des Uploads

```
Backend/uploads/
├── audio/          # Fichiers audio (.mp3, .wav, etc.)
├── avatars/        # Avatars des utilisateurs
└── images/         # Images des boutons (.jpg, .png, .gif, etc.)
```

---

## 🐳 Gestion des Uploads avec Docker

### Volume Docker

Les fichiers d'upload sont stockés dans un volume Docker nommé `croabboard_file_uploads` qui persiste les données même après l'arrêt ou la suppression des conteneurs.

### Configuration

Dans tous les fichiers docker-compose :
```yaml
volumes:
  - croabboard_uploads:/app/uploads
```

---

## 🔄 Migration des Fichiers Existants

Si vous avez déjà des fichiers dans `Backend/uploads/` :

### Sur Linux/Mac

```bash
chmod +x copy-uploads-to-docker.sh
./copy-uploads-to-docker.sh
```

### Sur Windows

```cmd
copy-uploads-to-docker.bat
```

### Que fait ce script ?

1. ✅ Vérifie que Docker est en cours d'exécution
2. ✅ Crée le volume Docker s'il n'existe pas
3. ✅ Copie tous les fichiers de `Backend/uploads/`
4. ✅ Préserve la structure (audio/, avatars/, images/)
5. ✅ Configure les permissions appropriées

---

## 📊 Vérification

### Lister les fichiers

```bash
# Tous les fichiers
docker run --rm -v croabboard_file_uploads:/uploads alpine ls -lah /uploads

# Fichiers audio
docker run --rm -v croabboard_file_uploads:/uploads alpine ls -lah /uploads/audio

# Avatars
docker run --rm -v croabboard_file_uploads:/uploads alpine ls -lah /uploads/avatars

# Images
docker run --rm -v croabboard_file_uploads:/uploads alpine ls -lah /uploads/images
```

### Compter les fichiers

```bash
# Audio
docker run --rm -v croabboard_file_uploads:/uploads alpine sh -c "ls -1 /uploads/audio 2>/dev/null | wc -l"

# Avatars
docker run --rm -v croabboard_file_uploads:/uploads alpine sh -c "ls -1 /uploads/avatars 2>/dev/null | wc -l"

# Images
docker run --rm -v croabboard_file_uploads:/uploads alpine sh -c "ls -1 /uploads/images 2>/dev/null | wc -l"
```

---

## 💾 Sauvegarde

### Créer une sauvegarde

```bash
# Linux/Mac
docker run --rm \
  -v croabboard_file_uploads:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /data .

# Windows (PowerShell)
docker run --rm `
  -v croabboard_file_uploads:/data `
  -v ${PWD}:/backup `
  alpine tar czf /backup/uploads_backup_$(Get-Date -Format 'yyyyMMdd').tar.gz -C /data .
```

### Restaurer depuis une sauvegarde

```bash
# Arrêter le backend
docker-compose stop croabboard-backend

# Restaurer
docker run --rm \
  -v croabboard_file_uploads:/data \
  -v $(pwd):/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/uploads_backup_20241005.tar.gz -C /data"

# Redémarrer
docker-compose start croabboard-backend
```

---

## 🔧 Opérations Avancées

### Copier un fichier spécifique

```bash
docker run --rm \
  -v croabboard_file_uploads:/uploads \
  -v $(pwd)/Backend/uploads:/source:ro \
  alpine cp /source/audio/fichier.mp3 /uploads/audio/
```

### Supprimer les fichiers de test

```bash
docker run --rm \
  -v croabboard_file_uploads:/uploads \
  alpine find /uploads -name "test_*" -delete
```

---

## 🚨 Dépannage

### Les fichiers n'apparaissent pas

1. **Vérifier le volume :**
   ```bash
   docker volume ls | grep croabboard_file_uploads
   ```

2. **Vérifier les permissions :**
   ```bash
   docker run --rm -v croabboard_file_uploads:/uploads alpine ls -la /uploads
   ```

3. **Redémarrer le backend :**
   ```bash
   docker-compose restart croabboard-backend
   ```

### Permission denied

```bash
docker run --rm \
  -v croabboard_file_uploads:/uploads \
  alpine chmod -R 755 /uploads
```

### Le volume est plein

```bash
# Vérifier l'espace
docker run --rm -v croabboard_file_uploads:/uploads alpine du -sh /uploads

# Nettoyer les vieux fichiers (>30 jours)
docker run --rm \
  -v croabboard_file_uploads:/uploads \
  alpine find /uploads -type f -mtime +30 -delete
```

---

## 📋 Checklist de Déploiement

Avant de déployer :

- [ ] Fichiers d'upload copiés vers le volume Docker
- [ ] Sauvegarde des uploads créée
- [ ] Permissions correctes (755/644)
- [ ] Volume configuré dans docker-compose
- [ ] Variables `UPLOAD_PATH` et `MAX_FILE_SIZE` définies
- [ ] Système de sauvegarde automatique en place

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Limiter la taille :**
   ```env
   MAX_FILE_SIZE=10485760  # 10MB
   ```

2. **Valider les types :**
   - Audio: .mp3, .wav, .ogg
   - Images: .jpg, .jpeg, .png, .gif

3. **Sauvegardes régulières :**
   ```bash
   # Crontab: tous les jours à 2h
   0 2 * * * /path/to/backup-uploads.sh
   ```

---

Pour plus d'informations, consultez [DOCKER.md](./DOCKER.md) et [DEPLOYMENT.md](./DEPLOYMENT.md).

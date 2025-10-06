# Backend Dockerfile pour CroabBoard
FROM node:18-alpine

# Configuration proxy pour entreprise (optionnel)
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}

# Installer les dépendances système pour bcrypt et build native modules
RUN apk add --no-cache python3 make g++

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package.json yarn.lock* package-lock.json* ./

# Installer les dépendances
RUN npm ci --only=production || npm install --only=production

# Nettoyer les variables proxy après installation
ENV HTTP_PROXY=
ENV HTTPS_PROXY=

# Copier le code source
COPY . .

# Créer le répertoire uploads avec les bonnes permissions
RUN mkdir -p uploads && chmod 755 uploads

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut (à surcharger avec .env)
ENV NODE_ENV=production
ENV PORT=3001

# Commande de démarrage
CMD ["node", "server.js"]

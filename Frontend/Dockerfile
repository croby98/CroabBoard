# Frontend Dockerfile pour CroabBoard

# Stage 1: Build
FROM node:18-alpine AS builder

# Configuration proxy pour entreprise (optionnel)
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}

WORKDIR /app

# Copier les fichiers package
COPY package.json package-lock.json* yarn.lock* ./

# Installer les dépendances
RUN npm ci || npm install

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Stage 2: Production avec nginx
FROM nginx:alpine

# Copier le build depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]

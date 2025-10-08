# Backend/Dockerfile
FROM node:20-alpine

# Support des proxies pour npm/yarn
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ARG http_proxy
ARG https_proxy
ARG no_proxy

# Configuration des proxies pour npm et yarn
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV http_proxy=${http_proxy}
ENV https_proxy=${https_proxy}
ENV no_proxy=${no_proxy}

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Installation des dépendances avec support proxy
RUN \
  if [ -f yarn.lock ]; then \
    yarn config set proxy ${HTTP_PROXY:-} && \
    yarn config set https-proxy ${HTTPS_PROXY:-} && \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm config set proxy ${HTTP_PROXY:-} && \
    npm config set https-proxy ${HTTPS_PROXY:-} && \
    npm ci; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    pnpm config set proxy ${HTTP_PROXY:-} && \
    pnpm config set https-proxy ${HTTPS_PROXY:-} && \
    pnpm i --frozen-lockfile; \
  else \
    npm config set proxy ${HTTP_PROXY:-} && \
    npm config set https-proxy ${HTTPS_PROXY:-} && \
    npm i; \
  fi

COPY . .

# Assure l'existence des dossiers d'upload
RUN mkdir -p uploads/images uploads/audio uploads/avatars

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
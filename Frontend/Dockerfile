# Frontend/Dockerfile
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
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Installation des dépendances avec support proxy conditionnel
RUN \
  if [ -f yarn.lock ]; then \
    if [ -n "${HTTP_PROXY}" ]; then yarn config set proxy "${HTTP_PROXY}"; fi && \
    if [ -n "${HTTPS_PROXY}" ]; then yarn config set https-proxy "${HTTPS_PROXY}"; fi && \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    if [ -n "${HTTP_PROXY}" ]; then npm config set proxy "${HTTP_PROXY}"; fi && \
    if [ -n "${HTTPS_PROXY}" ]; then npm config set https-proxy "${HTTPS_PROXY}"; fi && \
    npm ci; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    if [ -n "${HTTP_PROXY}" ]; then pnpm config set proxy "${HTTP_PROXY}"; fi && \
    if [ -n "${HTTPS_PROXY}" ]; then pnpm config set https-proxy "${HTTPS_PROXY}"; fi && \
    pnpm i --frozen-lockfile; \
  else \
    if [ -n "${HTTP_PROXY}" ]; then npm config set proxy "${HTTP_PROXY}"; fi && \
    if [ -n "${HTTPS_PROXY}" ]; then npm config set https-proxy "${HTTPS_PROXY}"; fi && \
    npm i; \
  fi

COPY . .

# VITE utilisera VITE_API_BASE_URL si fourni au build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

EXPOSE 3000

CMD ["npm", "run", "dev"]
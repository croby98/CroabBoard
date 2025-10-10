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
COPY package.json ./

RUN npm config set registry https://registry.npmjs.org/ && \
    if [ -n "${HTTP_PROXY}" ]; then npm config set proxy "${HTTP_PROXY}"; fi && \
    if [ -n "${HTTPS_PROXY}" ]; then npm config set https-proxy "${HTTPS_PROXY}"; fi && \
    npm install

COPY . .

# VITE utilisera VITE_API_BASE_URL si fourni au build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

EXPOSE 3000

CMD ["npm", "run", "dev"]

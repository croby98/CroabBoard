# Frontend/Dockerfile
FROM node:20-alpine

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ARG http_proxy
ARG https_proxy
ARG no_proxy

ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV http_proxy=${http_proxy}
ENV https_proxy=${https_proxy}
ENV no_proxy=${no_proxy}

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

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

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

EXPOSE 3000

CMD ["npm", "run", "dev"]
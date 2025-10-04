# CroabBoard Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image with Nginx
FROM nginx:alpine AS production

# Install additional tools
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-custom
RUN adduser -S croabboard-web -u 1001 -G nginx-custom

# Set permissions
RUN chown -R croabboard-web:nginx-custom /usr/share/nginx/html
RUN chown -R croabboard-web:nginx-custom /var/cache/nginx
RUN chown -R croabboard-web:nginx-custom /var/log/nginx
RUN chown -R croabboard-web:nginx-custom /etc/nginx/conf.d

# Create nginx PID directory
RUN mkdir -p /var/run/nginx
RUN chown -R croabboard-web:nginx-custom /var/run/nginx

# Switch to non-root user
USER croabboard-web

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
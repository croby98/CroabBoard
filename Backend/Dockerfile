# CroabBoard Backend Dockerfile
FROM node:18-alpine

# Install system dependencies for production
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S croabboard -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads/images uploads/audio uploads/avatars
RUN chown -R croabboard:nodejs uploads
RUN chmod -R 755 uploads

# Switch to non-root user
USER croabboard

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 5000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
        res.statusCode === 200 ? process.exit(0) : process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start application
CMD ["npm", "start"]
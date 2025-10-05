# 🐳 CroabBoard Docker Guide

Complete guide for deploying CroabBoard using Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+ installed and running
- Docker Compose 2.0+ installed
- At least 4GB of available RAM
- At least 10GB of available disk space

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/croabboard.git
cd croabboard

# Copy environment template
cp .env.example .env

# Edit environment variables (important!)
nano .env
```

### 2. Start Development Environment
```bash
# Using the deployment script (recommended)
./deploy.sh development

# Or manually with docker-compose
docker-compose up -d
```

### 3. Start Production Environment
```bash
# Edit .env with production values first!
./deploy.sh production

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:3306 (dev) / internal only (prod)

---

## 📁 Docker Architecture

### Services Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │    Database     │
│   (React+Nginx) │◄──►│   (Node.js)     │◄──►│     (MySQL)     │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   Redis Cache   │
                    │   (Optional)    │
                    │   Port: 6379    │
                    └─────────────────┘
```

### Container Details

#### **croabboard-frontend**
- **Base Image**: nginx:alpine
- **Build Stage**: node:18-alpine (for building React app)
- **Purpose**: Serves static React files and proxies API calls
- **Ports**: 80 (internal) → 3000 (host)
- **Health Check**: HTTP GET /health

#### **croabboard-backend**
- **Base Image**: node:18-alpine
- **Purpose**: Node.js API server with Express
- **Ports**: 5000 (internal) → 5000 (host)
- **Volumes**: uploads/ (persistent file storage)
- **Health Check**: HTTP GET /health

#### **croabboard-db**
- **Base Image**: mysql:8.0
- **Purpose**: MySQL database with optimized configuration
- **Ports**: 3306 (internal) → 3306 (host in dev)
- **Volumes**: Database data persistence
- **Health Check**: mysqladmin ping

#### **croabboard-redis** (Optional)
- **Base Image**: redis:7-alpine
- **Purpose**: Session storage and caching
- **Ports**: 6379 (internal only)
- **Health Check**: redis-cli ping

---

## ⚙️ Configuration

### Environment Variables

#### **Required for Production**
```env
# Database - Change these!
MYSQL_ROOT_PASSWORD=your-super-secure-root-password
MYSQL_PASSWORD=your-secure-user-password
MYSQL_USER=croabboard_user
MYSQL_DATABASE=croabboard

# Security - CRITICAL to change!
SESSION_SECRET=your-minimum-64-character-session-secret-key

# URLs - Update for your domain
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

#### **Optional Configurations**
```env
# Redis (for session scaling)
REDIS_PASSWORD=your-redis-password

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
MAX_UPLOAD_FILES=10

# Performance
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Monitoring
ENABLE_MONITORING=true
PROMETHEUS_PORT=9090
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Database** | Exposed on 3306 | Internal only |
| **Backend** | Exposed on 5000 | Internal only |
| **Frontend** | Single container | Load balanced |
| **Security** | Basic | Enhanced headers |
| **Caching** | Disabled | Redis enabled |
| **Monitoring** | Basic logs | Prometheus metrics |
| **SSL** | HTTP only | HTTPS required |

---

## 🔧 Deployment Scripts

### Using deploy.sh (Recommended)

```bash
# Development mode
./deploy.sh development
./deploy.sh dev

# Production mode
./deploy.sh production
./deploy.sh prod

# Management commands
./deploy.sh stop        # Stop all services
./deploy.sh logs        # View real-time logs
./deploy.sh health      # Check service health
./deploy.sh backup      # Backup database
./deploy.sh cleanup     # Remove all containers/images
```

### Manual Docker Commands

#### **Development**
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

#### **Production**
```bash
# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale frontend and backend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale croabboard-frontend=2 --scale croabboard-backend=2

# Rolling update
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps croabboard-backend
```

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

#### **Backend Health**
```bash
curl http://localhost:5000/health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "environment": "production"
}
```

#### **Frontend Health**
```bash
curl http://localhost:3000/health
```

#### **Database Health**
```bash
docker-compose exec croabboard-db mysqladmin ping -h localhost -u root -p
```

### Container Status
```bash
# Check all containers
docker-compose ps

# Check specific container
docker-compose ps croabboard-backend

# View resource usage
docker stats
```

### Log Management
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f croabboard-backend

# View recent logs
docker-compose logs --tail=50 croabboard-frontend

# Save logs to file
docker-compose logs > croabboard.log
```

---

## 🛠️ Troubleshooting

### Common Issues

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different ports
PORT=3001 docker-compose up -d
```

#### **Database Connection Failed**
```bash
# Check database container
docker-compose logs croabboard-db

# Verify environment variables
docker-compose exec croabboard-backend env | grep MYSQL

# Test connection manually
docker-compose exec croabboard-db mysql -u root -p
```

#### **File Upload Issues**
```bash
# Check upload directory permissions
docker-compose exec croabboard-backend ls -la uploads/

# Fix permissions
docker-compose exec croabboard-backend chown -R croabboard:nodejs uploads/
```

#### **Memory Issues**
```bash
# Check memory usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → Increase limit

# Or use production config with resource limits
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Performance Optimization

#### **Database Optimization**
```sql
-- Connect to database
docker-compose exec croabboard-db mysql -u root -p croabboard

-- Check table sizes
SELECT
    table_name AS 'Table',
    round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'croabboard'
ORDER BY (data_length + index_length) DESC;

-- Add indexes for better performance
CREATE INDEX idx_user_tri ON linked(user_id, tri);
CREATE INDEX idx_uploaded_category ON uploaded(category_id);
```

#### **Container Optimization**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Complete cleanup
docker system prune -a --volumes
```

---

## 📦 Backup & Restore

### Database Backup
```bash
# Using deploy script
./deploy.sh backup

# Manual backup
docker-compose exec -T croabboard-db mysqldump -u root -p$MYSQL_ROOT_PASSWORD croabboard > backup_$(date +%Y%m%d).sql

# Automated daily backup
echo "0 2 * * * /path/to/croabboard/deploy.sh backup" | crontab -
```

### Database Restore
```bash
# Stop backend to prevent conflicts
docker-compose stop croabboard-backend

# Restore from backup
docker-compose exec -T croabboard-db mysql -u root -p$MYSQL_ROOT_PASSWORD croabboard < backup_20240115.sql

# Restart backend
docker-compose start croabboard-backend
```

### File Uploads Backup
```bash
# Backup uploads directory
docker run --rm -v croabboard_file_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /data .

# Restore uploads
docker run --rm -v croabboard_file_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_backup_20240115.tar.gz -C /data
```

---

## 🚀 Production Deployment

### Server Requirements

#### **Minimum Specs**
- 2 CPU cores
- 4 GB RAM
- 20 GB SSD storage
- Ubuntu 20.04+ or similar

#### **Recommended Specs**
- 4 CPU cores
- 8 GB RAM
- 50 GB SSD storage
- Load balancer support

### SSL Configuration

#### **Using Let's Encrypt**
```bash
# Install certbot
sudo apt update && sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project
mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*

# Start with SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

### Reverse Proxy Setup

For production, use a reverse proxy like Nginx or Traefik:

```nginx
# /etc/nginx/sites-available/croabboard
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong session secrets
- [ ] Enable firewall (ufw/iptables)
- [ ] Configure SSL/TLS
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup strategy in place

---

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale frontend (multiple instances)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale croabboard-frontend=3

# Scale backend (with load balancer)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale croabboard-backend=2

# Use external load balancer (nginx, HAProxy, etc.)
```

### Vertical Scaling
```yaml
# In docker-compose.prod.yml
services:
  croabboard-backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

---

## 🤝 Contributing

### Development Workflow
```bash
# Start development environment
./deploy.sh development

# Make changes to code
# Changes are reflected via volumes

# Rebuild specific service
docker-compose build croabboard-backend
docker-compose up -d croabboard-backend

# Run tests
docker-compose exec croabboard-backend npm test
```

### Building Custom Images
```bash
# Build backend only
docker build -t croabboard-backend:latest ./Backend

# Build frontend only
docker build -t croabboard-frontend:latest ./Frontend

# Push to registry
docker tag croabboard-backend:latest your-registry/croabboard-backend:latest
docker push your-registry/croabboard-backend:latest
```

---

## 📞 Support

### Getting Help
- **Documentation**: Check this README and Docker guides
- **Logs**: Always check container logs first
- **Health Checks**: Use built-in health endpoints
- **Community**: Join our Discord/GitHub discussions

### Reporting Issues
When reporting Docker-related issues, please include:
- Docker version: `docker --version`
- Docker Compose version: `docker-compose --version`
- Container logs: `docker-compose logs`
- System specs: OS, RAM, CPU
- Configuration: relevant .env variables (without secrets)

---

<div align="center">

**🐳 Happy Dockerizing! 🎵**

[Back to Main README](README.md) • [Report Issues](https://github.com/yourusername/croabboard/issues)

</div>
# 🎵 CroabBoard

<div align="center">

![CroabBoard Logo](https://img.shields.io/badge/CroabBoard-v2.0-blue?style=for-the-badge&logo=react)

**A Modern, Professional Soundboard Application**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

[Features](#-features) •
[Quick Start](#-quick-start) •
[Docker](#-docker-deployment) •
[API](#-api-reference)

**📖 Documentation:** [Quick Start](./QUICK-START.md) • [Deployment](./DEPLOYMENT.md) • [Docker](./DOCKER.md) • [Uploads](./UPLOADS.md)

</div>

---

## 📖 Overview

**CroabBoard** is a state-of-the-art soundboard application built for creators, streamers, and audio enthusiasts. Featuring a modern React TypeScript frontend and robust Node.js backend, it delivers professional-grade audio management with enterprise-level security and scalability.

### 🎯 Key Statistics
- **🎵 138+ Sound Buttons** - Fully migrated and optimized
- **👥 Multi-User Support** - Secure authentication and user management
- **⚡ Real-time Audio** - Instant playback with volume controls
- **🔐 Enterprise Security** - bcrypt + session-based authentication
- **📱 Responsive Design** - Desktop and mobile optimized

---

## ✨ Features

### 🔐 **Authentication & Security**
- **JWT-like Session Management** - Secure, persistent user sessions
- **bcrypt Password Hashing** - Industry-standard password security
- **Role-based Access Control** - Admin/User permission system
- **CSRF Protection** - Enhanced security against attacks

### 🎵 **Audio Management**
- **Professional Audio Player** - High-quality playback with controls
- **Drag & Drop Upload** - Intuitive file management
- **Category Organization** - Color-coded button categories
- **Bulk Operations** - Efficient multi-button management
- **Volume Controls** - Individual and master volume settings

### 🎨 **User Experience**
- **Modern UI/UX** - Clean, responsive interface with TailwindCSS
- **Customizable Layouts** - Adjustable button sizes and arrangements
- **Drag & Drop Sorting** - Reorganize buttons with persistence
- **Live Previews** - Real-time feedback for all changes
- **Context Menus** - Right-click functionality for power users

### 👑 **Admin Dashboard**
- **System Analytics** - User activity and system statistics
- **User Management** - Account oversight and controls
- **Content Moderation** - Review and manage uploaded content
- **Audit Logging** - Complete action tracking and history

### 🔧 **Developer Experience**
- **RESTful API** - Well-documented endpoints
- **TypeScript Support** - Type-safe development
- **Hot Reload** - Fast development workflow
- **Docker Ready** - Containerized deployment
- **MySQL Integration** - Robust database layer

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required software
Node.js >= 18.0.0
MySQL >= 8.0
Git
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/croabboard.git
   cd croabboard
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Configure your .env file (see Configuration section)
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Admin Panel**: Login and access via profile menu

### Configuration

Create `Backend/.env`:
```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=croabboard
MYSQL_PORT=3306

# Application Settings
PORT=5000
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-super-secure-session-secret-key
NODE_ENV=development

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads
```

---

## 🐳 Docker Deployment

### Quick Docker Setup

1. **Using Docker Compose (Recommended)**
   ```bash
   # Clone and navigate to project
   git clone https://github.com/yourusername/croabboard.git
   cd croabboard

   # Copy existing uploads (if you have any)
   ./copy-uploads-to-docker.sh  # Linux/Mac
   copy-uploads-to-docker.bat   # Windows

   # Start all services
   docker-compose up -d
   ```

   📖 **See [UPLOADS.md](./UPLOADS.md) for complete upload management guide**

2. **Manual Docker Build**
   ```bash
   # Build backend
   docker build -t croabboard-backend ./Backend

   # Build frontend
   docker build -t croabboard-frontend ./Frontend

   # Run with networking
   docker network create croabboard-network
   docker run -d --name croabboard-db --network croabboard-network mysql:8.0
   docker run -d --name croabboard-api --network croabboard-network croabboard-backend
   docker run -d --name croabboard-web --network croabboard-network -p 3000:80 croabboard-frontend
   ```

### Production Deployment

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide**

```bash
# Simple deployment (host mode, IP access)
docker-compose -f docker-compose.simple.yml up -d

# With reverse proxy (recommended for production)
docker-compose -f docker-compose.proxy.yml up -d
```

**Deployment options:**
- 📦 **Host Mode** - Direct port mapping, access via IP:PORT
- 🌐 **Proxy Mode** - Nginx reverse proxy, access via IP or domain
- 🔒 **SSL/HTTPS** - Complete guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🚀 Deployment Guide

For detailed deployment instructions including:
- ✅ Deployment without domain name (IP-based access)
- ✅ Deployment with reverse proxy
- ✅ SSL/HTTPS configuration
- ✅ Host mode vs Bridge network
- ✅ Production best practices

**See [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🏗️ Architecture

### Technology Stack
```
Frontend    │ React 18 + TypeScript + TailwindCSS + Vite
Backend     │ Node.js + Express.js + TypeScript
Database    │ MySQL 8.0 with optimized schemas
Auth        │ Session-based with bcrypt hashing
Files       │ Multer + Local storage (Docker volumes)
Deployment  │ Docker + Docker Compose
```

### Database Schema
```sql
-- Core Tables
user          │ User accounts and preferences
category      │ Color-coded sound categories
file          │ File metadata and storage
uploaded      │ Sound button definitions
linked        │ User-specific button collections
deleted_button│ Soft delete and restoration
audit_log     │ Admin action tracking
favorites     │ User's favorite sounds
button_stats  │ Usage analytics and metrics
```

### API Architecture
```
Authentication │ Session-based with secure cookies
Authorization  │ Role-based access control (Admin/User)
File Handling  │ Multer middleware with validation
Error Handling │ Centralized error management
Logging        │ Comprehensive audit trails
Validation     │ Input sanitization and validation
```

---

## 📚 Documentation

### User Guide

#### **Getting Started**
1. **Register/Login** - Create account or sign in
2. **Browse Sounds** - Explore available sound buttons
3. **Create Collection** - Link buttons to your personal board
4. **Upload Content** - Add custom sounds with images
5. **Organize** - Drag & drop to arrange your layout

#### **Power User Features**
- **Context Menu** - Right-click buttons for advanced options
- **Bulk Selection** - Select multiple buttons for batch operations
- **Custom Categories** - Create and manage your own categories
- **Volume Controls** - Individual button and master volume
- **Keyboard Shortcuts** - Efficient navigation and controls

#### **Admin Features**
- **User Management** - View and manage user accounts
- **Content Moderation** - Review uploaded content
- **System Analytics** - Monitor usage and performance
- **Audit Logs** - Track all administrative actions

### API Reference

#### **Authentication**
```http
POST   /api/login              # User authentication
POST   /api/logout             # Session termination
GET    /api/me                 # Current user info
POST   /api/register           # New user registration
```

#### **Sound Management**
```http
GET    /api/linked             # User's sound collection
POST   /api/upload             # Upload new sound
PUT    /api/linked             # Reorder user's buttons
DELETE /api/link/:id           # Remove from collection
```

#### **Admin Endpoints**
```http
GET    /api/admin/users        # All users (admin only)
GET    /api/admin/buttons      # All buttons (admin only)
GET    /api/admin/audit-logs   # Audit trail (admin only)
GET    /api/stats/all          # System statistics
```

#### **File Serving**
```http
GET    /uploads/images/:file   # Button images
GET    /uploads/audio/:file    # Audio files
GET    /uploads/avatars/:file  # User avatars
```

---

## 🔧 Development

### Project Structure
```
croabboard/
├── Backend/
│   ├── models/              # Database models and schemas
│   ├── middleware/          # Auth, validation, error handling
│   ├── uploads/            # File storage directory
│   ├── server.js           # Main application server
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── routes/         # Page components and routing
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Global state management
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── docker-compose.yml      # Docker services configuration
└── README.md
```

### Development Workflow

#### **Backend Development**
```bash
cd Backend
npm run dev          # Start with hot reload
npm run test         # Run test suite
npm run lint         # Code quality checks
npm run build        # Production build
```

#### **Frontend Development**
```bash
cd Frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests
```

#### **Database Management**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE croabboard;"

# Run migrations (handled automatically)
npm run migrate

# Seed development data
npm run seed
```

### Code Style & Quality

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks
- **TypeScript** - Type safety and documentation
- **Jest** - Unit and integration testing

---

## 🚀 Deployment

### Production Checklist

#### **Pre-deployment**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] File upload directories created
- [ ] Backup strategies implemented

#### **Security**
- [ ] Strong session secrets
- [ ] HTTPS enforcement
- [ ] Database credentials secured
- [ ] File upload validation
- [ ] Rate limiting configured

#### **Performance**
- [ ] Static file caching
- [ ] Database indexes optimized
- [ ] Image compression enabled
- [ ] CDN configuration (optional)
- [ ] Monitoring tools setup

### Environment Variables

#### **Backend (.env)**
```env
# Database
MYSQL_HOST=your-db-host
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-secure-password
MYSQL_DATABASE=croabboard
MYSQL_PORT=3306

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
SESSION_SECRET=your-super-secure-session-secret

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400000
```

---

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd Backend && npm test

# Frontend tests
cd Frontend && npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
- **Unit Tests** - Component and function level
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Performance Tests** - Load and stress testing

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Submit** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📊 Performance & Monitoring

### System Requirements

#### **Minimum**
- **CPU**: 2 cores @ 2.0 GHz
- **RAM**: 2 GB
- **Storage**: 10 GB
- **Network**: 100 Mbps

#### **Recommended**
- **CPU**: 4 cores @ 2.5 GHz+
- **RAM**: 8 GB+
- **Storage**: 50 GB SSD
- **Network**: 1 Gbps

### Monitoring
- **Application Metrics** - Response times, error rates
- **System Metrics** - CPU, memory, disk usage
- **User Analytics** - Usage patterns, popular content
- **Security Monitoring** - Failed login attempts, suspicious activity

---

## 🔍 Troubleshooting

### Common Issues

#### **Backend Issues**
```bash
# Port already in use
lsof -ti:5000 | xargs kill -9

# Database connection failed
mysql -u root -p -e "SHOW DATABASES;"

# File upload permissions
chmod 755 Backend/uploads/
```

#### **Frontend Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Build issues
npm run build -- --verbose
```

#### **Docker Issues**
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Getting Help
- **Documentation** - Check this README, [DEPLOYMENT.md](./DEPLOYMENT.md), [DOCKER.md](./DOCKER.md), and [UPLOADS.md](./UPLOADS.md)
- **Issues** - Search existing GitHub issues
- **Community** - Join our Discord/Slack community
- **Support** - Contact the development team

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 CroabBoard Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **React Team** - For the amazing frontend framework
- **Node.js Community** - For the robust backend platform
- **TailwindCSS** - For the beautiful and efficient styling
- **MySQL** - For reliable data persistence
- **Contributors** - For their valuable contributions and feedback

---

<div align="center">

**Built with ❤️ by the CroabBoard Team**

[⭐ Star us on GitHub](https://github.com/croby98/croabboard) •
[🐛 Report Bug](https://github.com/croby98/croabboard/issues) •
[💡 Request Feature](https://github.com/croby98/croabboard/issues)

</div>
# CroabBoard-Rework

A modern, interactive soundboard application built with React TypeScript and Node.js, featuring MySQL database for persistent storage.

## 🚀 Overview

CroabBoard-Rework is a modern, full-featured soundboard application built for seamless audio management and playback. This complete rewrite transforms the original concept into a robust web application with professional-grade features including user authentication, file upload system, category management, and admin controls.

**Key Highlights:**
- 🎵 **138+ Migrated Sound Buttons** from legacy system  
- 👥 **9 Active Users** with personalized collections
- 🔐 **Secure Authentication** with session management
- 📤 **Complete Upload System** for custom sounds
- 🎯 **Owner-Only Admin Dashboard** for system management
- 💾 **MySQL Database** for reliable data persistence

---

## ✨ Core Features (Implementation Status)

### 🔐 Authentication & User Management
- [x] **User authentication** (Username/Password with bcrypt)
- [x] **Session management** (Express sessions with persistence)
- [x] **MySQL user storage** (9 existing users migrated)
- [x] **Password reset functionality** (✅ Complete in profile page)
- [x] **User registration system** (✅ Complete with validation and database integration)
- [x] **Button size preferences** (✅ Customizable per user)

### 🎵 Sound Management
- [x] **Sound button storage** (100+ buttons migrated from Firebase)
- [x] **Category system** (Test, VASY categories with auto-creation)
- [x] **File serving** (Images & Audio from `/uploads/` folder)
- [x] **Upload new sounds** (✅ Full upload system with categories) 🔥
- [x] **File processing** (✅ Multer middleware with proper storage)
- [x] **Bulk sound operations** (✅ Bulk delete/link operations via API)
- [x] **Sound quality controls** (✅ User-adjustable volume control)

### 🏠 Core Pages & UI
- [x] **Login page** (✅ Username/Password with session persistence)
- [x] **Home page with draggable user button** (✅ Displays user's linked buttons)
- [x] **Buttons page to view all sound buttons** (✅ View all + Link/Unlink functionality)  
- [x] **User profile page** (✅ View uploaded buttons, change password, button size)
- [x] **Context menu for sound playback** (✅ AK47 spam feature & Remove button)
- [x] **Upload new sounds** (✅ Modal with image+audio+category upload) 🔥
- [x] **Admin dashboard** (✅ Integrated in profile dropdown, owner-only access)

### 🎯 Recent Major Implementations
- ✅ **Complete upload system** (Image+Audio+Category with file processing)
- ✅ **User profile management** (View uploads, change password, button sizing)
- ✅ **Owner-only admin dashboard** (Secure access control, user management, deleted items)
- ✅ **Streamlined navigation** (Removed unused search, clean interface)
- ✅ **Session-based authentication** (Secure login/logout with persistence)  
- ✅ **File serving system** (Proper paths: `/uploads/images/` & `/uploads/audio/`)
- ✅ **MySQL backend integration** (All APIs working with database)

### 🔧 Technical Foundation
- [x] **MySQL Database** (Users, Categories, Files, Uploaded, Linked tables)
- [x] **Express.js Backend** (REST API with session auth)
- [x] **React Frontend** (TypeScript with Vite)
- [x] **File Upload System** (Multer middleware configured)
- [x] **CORS Configuration** (Frontend-backend communication)

### 🎯 Potential Features to Add

#### 🎵 Audio & Playback Features
- [ ] Volume control for individual buttons
- [ ] Audio fade in/out effects
- [ ] Audio visualization (waveform display)
- [ ] Crossfade between sounds
- [ ] Audio recording directly in browser

#### 🎨 UI/UX Enhancements
- [ ] Better design
- [ ] Dark/Light theme toggle
- [ ] Custom color themes
- [ ] Button animations and effects
- [ ] Keyboard shortcuts for buttons
- [ ] Grid/List view toggle
- [ ] Button preview on hover
- [ ] Fullscreen mode
- [ ] Compact/expanded view modes
- [ ] Custom button shapes (circle, square, rounded)
- [ ] Button glow effects
- [ ] Drag & drop file upload
- [ ] Bulk operations (select multiple buttons)

#### 🔧 Organization & Management
- [ ] Favorites/Bookmarks system
- [ ] Recently played sounds
- [ ] Sound history tracking
- [ ] Advanced search filters (by date, size, duration)
- [ ] Bulk category assignment
- [ ] Category color customization
- [ ] Nested categories/subcategories
- [ ] Tags system for buttons
- [ ] Smart playlists/collections
- [ ] Button usage statistics
- [ ] Duplicate sound detection
- [ ] Auto-categorization using AI

#### 📊 Analytics & Insights
- [ ] Usage analytics dashboard
- [ ] Most played sounds statistics
- [ ] User activity heatmaps
- [ ] Performance metrics
- [ ] Storage usage tracking
- [ ] Popular categories insights
- [ ] User engagement metrics
- [ ] Export analytics data

#### 🔧 Technical Improvements
- [ ] Caching improvements
- [ ] Database optimization
- [ ] Performance monitoring
- [ ] Error tracking and reporting
- [ ] Automated testing suite
- [ ] Docker containerization

##### FUTURE 
  #### 👥 Social & Sharing
  - [ ] Share buttons with other users
  - [ ] Public/Private button collections
  - [ ] User profiles and following system
  - [ ] Community soundboard marketplace
  - [ ] Rate and review sounds
  - [ ] Social media integration
  - [ ] Export soundboard as shareable link
  - [ ] Collaborative soundboards
  - [ ] User comments on sounds
  - [ ] Sound of the day/week features
---

### 🎯 How to Request Features

To request implementation of any of these features:
1. Copy the feature name from the list above
2. Create an issue or mention it in your request
3. Specify any particular requirements or preferences
4. Features will be implemented based on complexity and priority

**Priority Levels:**
- 🔥 **High Priority**: Core functionality improvements
- ⚡ **Medium Priority**: User experience enhancements  
- 💡 **Low Priority**: Nice-to-have features
- 🚀 **Future**: Advanced/complex features for later versions
---

## 🖥️ Tech Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MySQL 8.0 (Local)
- **Authentication:** bcrypt + Express Sessions
- **File Upload:** Multer
- **API:** RESTful endpoints with JSON

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** TailwindCSS
- **Routing:** TanStack Router
- **Package Manager:** Bun (Recommended) or npm

### Database Schema
```sql
-- Core Tables
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    btn_size INT DEFAULT 150
);

CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(50) DEFAULT '#3B82F6'
);

CREATE TABLE file (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL -- 'image' or 'sound'
);

CREATE TABLE uploaded (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_id INT,
    sound_id INT,
    uploaded_by INT,
    button_name VARCHAR(50) NOT NULL,
    category_id INT,
    FOREIGN KEY (image_id) REFERENCES file(id),
    FOREIGN KEY (sound_id) REFERENCES file(id),
    FOREIGN KEY (uploaded_by) REFERENCES user(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE linked (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    uploaded_id INT,
    tri INT NOT NULL, -- Position/order
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (uploaded_id) REFERENCES uploaded(id)
);

CREATE TABLE deleted_button (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delete_date DATETIME NOT NULL,
    owner_id INT,
    button_name VARCHAR(50),
    sound_filename VARCHAR(255),
    image_filename VARCHAR(255),
    status ENUM('deleted', 'restored') DEFAULT 'deleted',
    FOREIGN KEY (owner_id) REFERENCES user(id)
);
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Bun (recommended) or npm

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/croby98/CroabBoard-Rework.git
   cd CroabBoard-Rework
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   bun install  # or npm install
   cp .env.example .env
   # Configure your MySQL connection in .env
   bun run start  # or npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd Frontend
   bun install  # or npm install
   bun run dev  # or npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables
Create `.env` in Backend folder:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=croabboard
DB_PORT=3306

# Session Configuration
SESSION_SECRET=your-secure-session-secret-key

# Application Configuration
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE croabboard;

# Run the application - it will create tables automatically
# Or manually execute the schema from Database Schema section above
```

### File Structure
```
CroabBoard-Rework/
├── Backend/
│   ├── models/           # Database models
│   ├── uploads/          # File storage (images/audio)
│   ├── server.js         # Main server file
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── routes/       # Page routes
│   │   ├── context/      # Auth context
│   │   └── api/          # API utilities
│   ├── public/
│   └── package.json
└── README.md
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/logout` - User logout  
- `GET /api/me` - Get current user info
- `GET /api/profil` - Get user profile data

### Button Management
- `GET /api/linked` - Get user's linked buttons
- `POST /api/buttons` - Upload new sound button
- `GET /api/uploaded` - Get all uploaded buttons
- `GET /api/user/uploaded` - Get user's uploaded buttons
- `DELETE /api/delete_image/:id` - Remove button from user's collection

### Admin Endpoints (Owner Only)
- `GET /api/users` - Get all users
- `GET /api/deleted_history` - Get deletion history
- `POST /api/restore_from_history/:id` - Restore deleted button

### Settings
- `POST /api/button_size/:size` - Update user's button size preference
- `POST /api/reset_password` - Update user password

### File Serving
- `GET /uploads/images/:filename` - Serve button images
- `GET /uploads/audio/:filename` - Serve button audio files

## 🔧 Usage Guide

### For Users
1. **Login** with your username and password
2. **Browse Buttons** - View all available sound buttons
3. **Link Buttons** - Add buttons to your personal collection
4. **Upload Sounds** - Create custom buttons (image + audio + category)
5. **Manage Profile** - Change password, adjust button size, view uploads
6. **Play Sounds** - Click buttons to play audio, use context menu for spam mode

### For Admins (Owner Only)
1. **Access Admin** - Click profile picture → Admin (only visible to owner)
2. **Overview** - View system statistics  
3. **User Management** - Monitor user accounts and activity
4. **Deleted Items** - View deletion history and restore items if needed

### Keyboard Shortcuts
- `Click` - Play sound once
- `Right Click` - Open context menu (spam mode, remove button)
- `Escape` - Close modals/menus

## 🚀 Deployment

### Production Setup
1. **Environment Variables:**
   ```env
   NODE_ENV=production
   DB_HOST=your-production-db-host
   SESSION_SECRET=your-super-secure-session-secret
   ```

2. **Build Frontend:**
   ```bash
   cd Frontend
   bun run build
   ```

3. **Serve Static Files:**
   - Configure nginx/apache to serve built frontend
   - Point API requests to backend server

4. **SSL Certificate:**
   - Set up HTTPS for production
   - Update CORS settings accordingly

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-documented
- Test with both Bun and npm package managers

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Provide clear reproduction steps
- Include system information and error logs
- Search existing issues before creating new ones

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check MySQL connection
mysql -u root -p -e "SHOW DATABASES;"

# Verify environment variables
cat Backend/.env

# Check port availability
netstat -an | findstr 5000  # Windows
lsof -i :5000  # macOS/Linux
```

**Frontend can't connect to backend:**
```bash
# Verify CORS settings in server.js
# Check if backend is running on port 5000
curl http://localhost:5000/health
```

**File upload not working:**
```bash
# Check uploads directory permissions
chmod 755 Backend/uploads/
mkdir -p Backend/uploads/{images,audio}

# Verify multer configuration
# Check file size limits (default 10MB)
```

**Session/Login issues:**
```bash
# Clear browser cookies and localStorage
# Check session secret in .env
# Verify bcrypt installation
npm list bcrypt
```

**Database connection failed:**
```sql
-- Check user permissions
SHOW GRANTS FOR 'your_user'@'localhost';
GRANT ALL PRIVILEGES ON croabboard.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Performance Optimization

- **Database Indexing**: Add indexes for frequently queried columns
- **File Caching**: Implement browser caching for audio/image files
- **Image Optimization**: Compress images before upload
- **Audio Format**: Use compressed audio formats (MP3, AAC)

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 2 GB
- **Storage**: 5 GB (for files and database)
- **Network**: 100 Mbps (for file uploads)

### Recommended Specifications
- **CPU**: 4 cores, 2.5 GHz+
- **RAM**: 4 GB+
- **Storage**: 20 GB+ SSD
- **Network**: 500 Mbps+

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Made with ❤️ by the CroabBoard team.

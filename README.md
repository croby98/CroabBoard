# CroabBoard-Rework

A modern, interactive soundboard application built with React TypeScript and Node.js, featuring MySQL database for persistent storage.

## 🚀 Overview
CroabBoard-Rework is a feature-rich soundboard designed for easy sound management and playback. Its primary function is to let users search, organize, and play sound buttons by categories. Enjoy a draggable user button, context menus for interval playback, and a dedicated buttons management page for a seamless audio experience.

---

## ✨ Core Features (Implementation Status)

### 🔐 Authentication & User Management
- [x] **User authentication** (Username/Password with bcrypt)
- [x] **Session management** (Express sessions with persistence)
- [x] **MySQL user storage** (9 existing users migrated)
- [x] **Password reset functionality** (✅ Complete in profile page)
- [ ] User registration system
- [x] **Button size preferences** (✅ Customizable per user)

### 🎵 Sound Management
- [x] **Sound button storage** (100+ buttons migrated from Firebase)
- [x] **Category system** (Test, VASY categories with auto-creation)
- [x] **File serving** (Images & Audio from `/uploads/` folder)
- [x] **Upload new sounds** (✅ Full upload system with categories) 🔥
- [x] **File processing** (✅ Multer middleware with proper storage)
- [ ] Bulk sound operations
- [ ] Sound quality controls

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
-- Users: id, username, password, btn_size
-- Categories: id, name, color
-- Files: id, filename, uploaded_by, file_type
-- Uploaded: id, image_id, sound_id, button_name, category_id, uploaded_by
-- Linked: id, user_id, uploaded_id
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Bun (recommended) or npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/croby98/CroabBoard-Rework.git
   cd CroabBoard-Rework
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   bun install
   # Configure your MySQL connection in .env
   bun run start
   ```

3. **Setup Frontend:**
   ```bash
   cd Frontend
   bun install
   bun run dev
   ```

4. **Database Setup:**
   - Create MySQL database `croabboard`
   - Import existing schema (if available)
   - Backend will connect on startup

### Environment Variables
Create `.env` in Backend folder:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=croabboard
SESSION_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

---

## 🤝 Contributing

Contributions are welcome! Please open issues and submit pull requests for new features or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Made with ❤️ by the CroabBoard team.

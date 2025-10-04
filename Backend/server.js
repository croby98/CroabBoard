import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';

// Import MySQL models
import {
  User,
  Category,
  File,
  Uploaded,
  Linked,
  ButtonVolume,
  Favorite,
  PlayHistory,
  ButtonStats,
  DeleteHistory,
  testConnection
} from './models/mysql-models.js';

// Import audit log
import AuditLog from './models/AuditLog.js';
import { logAction } from './middleware/auditLogger.js';

// Import auth middleware
import { authenticateUser, requireAdmin } from './middleware/auth.js';

// Import route modules
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory structure exists
const uploadsDir = 'uploads';
const uploadsImagesDir = path.join(uploadsDir, 'images');
const uploadsAudioDir = path.join(uploadsDir, 'audio');
const uploadsAvatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(uploadsImagesDir)) {
  fs.mkdirSync(uploadsImagesDir, { recursive: true });
}
if (!fs.existsSync(uploadsAudioDir)) {
  fs.mkdirSync(uploadsAudioDir, { recursive: true });
}
if (!fs.existsSync(uploadsAvatarsDir)) {
  fs.mkdirSync(uploadsAvatarsDir, { recursive: true });
}

// Session configuration (MUST be before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'croabboard-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Serve frontend test file
app.use('/test', express.static('../Frontend'));

// Mount route modules
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Route images to uploads/images and audio to uploads/audio
      if (file.fieldname === 'image') {
        cb(null, uploadsImagesDir);
      } else if (file.fieldname === 'sound') {
        cb(null, uploadsAudioDir);
      } else {
        cb(new Error('Unexpected field'));
      }
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image field'));
      }
    } else if (file.fieldname === 'sound') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for sound field'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// ===== ROUTES =====

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      // Log failed login attempt
      await logAction(req, 'login_failed', { reason: 'missing_credentials', username: username || 'unknown' });
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user in MySQL
    const user = await User.findByUsername(username);

    if (!user) {
      // Log failed login attempt
      await logAction(req, 'login_failed', { reason: 'invalid_username', username });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Log failed login attempt
      await logAction(req, 'login_failed', { reason: 'invalid_password', username, userId: user.id });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Store user info in session including admin status and avatar
    req.session.user = {
      id: user.id,
      username: user.username,
      btnSize: user.btn_size,
      isAdmin: user.is_admin || false,
      avatar: user.avatar || null
    };

    // Save session before responding to ensure it's persistent
    req.session.save(async (err) => {
      if (err) {
        console.error('Session save error:', err);
        await logAction(req, 'login_failed', { reason: 'session_error', username, userId: user.id });
        return res.status(500).json({ success: false, message: 'Session save failed' });
      }

      // Log successful login
      await logAction(req, 'login_success', { username, userId: user.id, isAdmin: user.is_admin });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          btnSize: user.btn_size,
          isAdmin: user.is_admin || false,
          avatar: user.avatar || null
        }
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
app.get('/api/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        btnSize: user.btn_size,
        isAdmin: user.is_admin || false,
        avatar: user.avatar || null
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Validation
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, password, and password confirmation are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      btnSize: 150 // Default button size
    });


    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        btnSize: newUser.btnSize
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Profile endpoint - matches Python Flask /api/profil
app.get('/api/profil', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's linked buttons (their collection)
    const linked = await Linked.findByUser(req.user.id);

    // Transform to match Python response format
    const buttons = linked.map(item => ({
      uploaded_id: item.uploaded_id,
      image_id: item.image_id,
      sound_id: item.sound_id,
      button_name: item.button_name,
      image_filename: item.image_filename,
      sound_filename: item.sound_filename,
      category_color: item.category_color || null
    }));

    res.json({
      success: true,
      buttons: buttons,
      btn_size: user.btn_size
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get user's linked buttons
app.get('/api/linked', authenticateUser, async (req, res) => {
  try {
    const linked = await Linked.findByUser(req.user.id);
    
    // Transform the data to match expected format
    const transformedLinked = linked.map(item => ({
      image_id: item.id,
      uploaded_id: item.uploaded_id,
      button_name: item.button_name,
      image_filename: item.image_filename,
      sound_filename: item.sound_filename,
      category_color: item.category_color || '#3B82F6'
    }));
    
    res.json({ success: true, linked: transformedLinked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reorder user's linked buttons
app.put('/api/linked', authenticateUser, async (req, res) => {
  try {
    const { positions } = req.body;
    
    if (!positions || !Array.isArray(positions)) {
      return res.status(400).json({ success: false, message: 'Invalid positions data' });
    }
    
    // Update each button's position
    for (const pos of positions) {
      await Linked.updatePosition(req.user.id, pos.id, pos.new_position);
    }
    
    res.json({ success: true, message: 'Button order updated successfully' });
  } catch (error) {
    console.error('Error reordering buttons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Button size endpoint - matches Python Flask /api/button_size/<btn_size>
app.post('/api/button_size/:btn_size', authenticateUser, async (req, res) => {
  try {
    const btnSize = parseInt(req.params.btn_size);

    if (isNaN(btnSize) || btnSize < 50 || btnSize > 500) {
      return res.status(400).json({
        success: false,
        message: 'Invalid button size. Must be between 50 and 500.'
      });
    }

    // Update user's button size
    const user = await User.findByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update button size in database
    await User.updateButtonSize(user.id, btnSize);

    // Update session
    req.session.user.btnSize = btnSize;

    res.json({ success: true, message: 'Button size updated successfully' });
  } catch (error) {
    console.error('Error updating button size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update button size'
    });
  }
});

// Reset password endpoint
app.post('/api/reset_password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await User.updatePassword(user.id, hashedPassword);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

// Search endpoint - matches Python Flask /api/search
app.get('/api/search', authenticateUser, async (req, res) => {
  try {
    const categoryName = req.query.category;
    
    if (!categoryName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category name is required' 
      });
    }

    // Get user's linked buttons filtered by category (matches Python query)
    const buttons = await Linked.searchByCategory(req.user.id, categoryName);
    
    if (!buttons.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'No matching buttons found' 
      });
    }

    res.json({ 
      success: true, 
      buttons: buttons 
    });
  } catch (error) {
    console.error('Error searching buttons:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Upload/Buttons management endpoint - matches Python Flask /api/buttons
app.post('/api/buttons', authenticateUser, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'sound', maxCount: 1 }
]), async (req, res) => {
  try {
    const { ButtonName, CategoryName } = req.body;
    const imageFile = req.files.image?.[0];
    const soundFile = req.files.sound?.[0];

    if (!imageFile || !soundFile || !ButtonName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image, sound, and button name are required' 
      });
    }


    // Create File entries
    const imageFileEntry = await File.create({
      filename: imageFile.filename,
      type: 'image'
    });

    const soundFileEntry = await File.create({
      filename: soundFile.filename,
      type: 'sound'
    });

    // Handle category
    let categoryId = null;
    if (CategoryName) {
      let category = await Category.findByName(CategoryName);
      if (!category) {
        category = await Category.create({ name: CategoryName });
      }
      categoryId = category.id;
    }

    // Get max tri for this user
    const maxTri = await Linked.getMaxTri(req.user.id);

    // Create Uploaded entry
    const uploaded = await Uploaded.create({
      imageId: imageFileEntry.id,
      soundId: soundFileEntry.id,
      uploadedBy: req.user.id,
      buttonName: ButtonName,
      categoryId: categoryId
    });

    // Create Linked entry (auto-link uploaded buttons to user)
    await Linked.createOrUpdate(req.user.id, uploaded.id, maxTri + 1);

    res.status(201).json({
      success: true,
      message: 'Button uploaded and linked successfully',
      imageUrl: `/uploads/images/${imageFile.filename}`,
      soundUrl: `/uploads/audio/${soundFile.filename}`
    });

  } catch (error) {
    console.error('Error uploading button:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

// Bulk operations endpoint
app.post('/api/bulk-operations', authenticateUser, async (req, res) => {
  try {
    const { operation, buttonIds } = req.body;

    if (!operation || !buttonIds || !Array.isArray(buttonIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Operation and buttonIds array are required' 
      });
    }

    switch (operation) {
      case 'delete':
        // Bulk delete linked buttons
        for (const buttonId of buttonIds) {
          await Linked.delete(req.user.id, buttonId);
        }
        break;
      
      case 'link':
        // Bulk link buttons
        const maxTri = await Linked.getMaxTri(req.user.id);
        for (let i = 0; i < buttonIds.length; i++) {
          await Linked.createOrUpdate(req.user.id, buttonIds[i], maxTri + i + 1);
        }
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid operation. Supported: delete, link' 
        });
    }

    res.json({
      success: true,
      message: `Bulk ${operation} completed for ${buttonIds.length} buttons`
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bulk operation failed' 
    });
  }
});

// Admin routes - Get all users (admin only)
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Admin - Get deleted history (admin only)
app.get('/api/deleted_history', requireAdmin, async (req, res) => {
  try {
    const deletedButtons = await Uploaded.getDeletedHistory();
    res.json({ success: true, deleted: deletedButtons });
  } catch (error) {
    console.error('Error getting deleted history:', error);
    res.status(500).json({ error: 'Failed to get deleted history' });
  }
});

// Admin - Restore button from history (admin only)
app.post('/api/restore_from_history/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Uploaded.restoreFromHistory(id);
    res.json({ success: true, message: 'Button restored successfully' });
  } catch (error) {
    console.error('Error restoring button:', error);
    res.status(500).json({ error: 'Failed to restore button' });
  }
});

app.put('/api/users/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { btnSize } = req.body;
    
    // Only allow users to update themselves
    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }
    
    const user = await User.update(id, { username: req.user.username, btnSize });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Category routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

app.post('/api/categories', authenticateUser, async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await Category.create({ name, color });
    res.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// File upload route
app.post('/api/upload', authenticateUser, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'sound', maxCount: 1 }
]), async (req, res) => {
  try {
    const { buttonName, categoryId } = req.body;
    const imageFile = req.files.image?.[0];
    const soundFile = req.files.sound?.[0];
    
    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Save file records to database
    const imageRecord = await File.create({
      filename: imageFile.filename,
      type: 'image'
    });
    
    let soundRecord = null;
    if (soundFile) {
      soundRecord = await File.create({
        filename: soundFile.filename,
        type: 'sound'
      });
    }
    
    // Create uploaded button record
    const uploaded = await Uploaded.create({
      imageId: imageRecord.id,
      soundId: soundRecord?.id,
      uploadedBy: req.user.id,
      buttonName: buttonName || 'Unnamed Button',
      categoryId: categoryId || null
    });
    
    res.json({
      success: true,
      uploaded: {
        id: uploaded.id,
        buttonName: uploaded.button_name,
        imageUrl: `/uploads/${imageFile.filename}`,
        soundUrl: soundFile ? `/uploads/${soundFile.filename}` : null
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all uploaded buttons
app.get('/api/uploaded', async (req, res) => {
  try {
    const uploaded = await Uploaded.getAll();
    
    // Add file URLs
    const uploadedWithUrls = uploaded.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/images/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/audio/${item.sound_filename}` : null
    }));
    
    res.json({ success: true, uploaded: uploadedWithUrls });
  } catch (error) {
    console.error('Error getting uploaded buttons:', error);
    res.status(500).json({ error: 'Failed to get uploaded buttons' });
  }
});

// Get buttons uploaded by current user
app.get('/api/user/uploaded', authenticateUser, async (req, res) => {
  try {
    const uploaded = await Uploaded.getByUser(req.user.id);
    
    // Add file URLs
    const uploadedWithUrls = uploaded.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/images/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/audio/${item.sound_filename}` : null
    }));
    
    res.json({ success: true, uploaded: uploadedWithUrls });
  } catch (error) {
    console.error('Error getting user uploaded buttons:', error);
    res.status(500).json({ error: 'Failed to get user uploaded buttons' });
  }
});


// Link/unlink button to user
app.post('/api/link', authenticateUser, async (req, res) => {
  try {
    const { uploadedId, tri } = req.body;
    
    await Linked.create({
      userId: req.user.id,
      uploadedId,
      tri: tri || 0
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error linking button:', error);
    res.status(500).json({ error: 'Failed to link button' });
  }
});

app.delete('/api/link/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;

    // Get button data before deleting
    const linked = await Linked.findByUser(req.user.id);
    const button = linked.find(b => b.uploaded_id === parseInt(uploadedId));

    if (!button) {
      return res.status(404).json({ error: 'Button not found' });
    }

    // Create deleted_button entry (files stay on disk for restore)
    await DeleteHistory.create({
      ownerId: req.user.id,
      uploadedId: button.uploaded_id,
      buttonName: button.button_name,
      soundFilename: button.sound_filename,
      imageFilename: button.image_filename,
      imageId: button.image_id,
      soundId: button.sound_id,
      categoryId: null, // Add if you track category_id
      status: 'deleted'
    });

    // Remove from linked table (unlink from user's collection)
    await Linked.delete(req.user.id, uploadedId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error unlinking button:', error);
    res.status(500).json({ error: 'Failed to unlink button' });
  }
});

// Volume control endpoints
// Get volume for a specific button
app.get('/api/button-volume/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const volume = await ButtonVolume.getVolume(req.user.id, uploadedId);
    res.json({ success: true, volume });
  } catch (error) {
    console.error('Error getting button volume:', error);
    res.status(500).json({ error: 'Failed to get button volume' });
  }
});

// Set volume for a specific button
app.post('/api/button-volume/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const { volume } = req.body;

    if (typeof volume !== 'number' || volume < 0 || volume > 1) {
      return res.status(400).json({
        success: false,
        error: 'Volume must be a number between 0 and 1'
      });
    }

    await ButtonVolume.setVolume(req.user.id, uploadedId, volume);
    res.json({ success: true, message: 'Volume updated successfully' });
  } catch (error) {
    console.error('Error setting button volume:', error);
    res.status(500).json({ error: 'Failed to set button volume' });
  }
});

// Get all button volumes for current user
app.get('/api/button-volumes', authenticateUser, async (req, res) => {
  try {
    const volumes = await ButtonVolume.getUserVolumes(req.user.id);

    // Convert to object with uploadedId as key
    const volumeMap = {};
    volumes.forEach(v => {
      volumeMap[v.uploaded_id] = v.volume;
    });

    res.json({ success: true, volumes: volumeMap });
  } catch (error) {
    console.error('Error getting button volumes:', error);
    res.status(500).json({ error: 'Failed to get button volumes' });
  }
});

// ===== FAVORITES ENDPOINTS =====

// Get user's favorites
app.get('/api/favorites', authenticateUser, async (req, res) => {
  try {
    const favorites = await Favorite.getUserFavorites(req.user.id);

    const favoritesWithUrls = favorites.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/images/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/audio/${item.sound_filename}` : null
    }));

    res.json({ success: true, favorites: favoritesWithUrls });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Check if button is favorite
app.get('/api/favorite/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const isFavorite = await Favorite.isFavorite(req.user.id, uploadedId);
    res.json({ success: true, isFavorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

// Add to favorites
app.post('/api/favorite/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const added = await Favorite.addFavorite(req.user.id, uploadedId);

    if (added) {
      res.json({ success: true, message: 'Added to favorites' });
    } else {
      res.json({ success: false, message: 'Already in favorites' });
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
app.delete('/api/favorite/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const removed = await Favorite.removeFavorite(req.user.id, uploadedId);

    if (removed) {
      res.json({ success: true, message: 'Removed from favorites' });
    } else {
      res.json({ success: false, message: 'Not in favorites' });
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Toggle favorite
app.put('/api/favorite/:uploadedId/toggle', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const isFav = await Favorite.isFavorite(req.user.id, uploadedId);

    if (isFav) {
      await Favorite.removeFavorite(req.user.id, uploadedId);
      res.json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.addFavorite(req.user.id, uploadedId);
      res.json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// ===== PLAY HISTORY ENDPOINTS =====

// Track button play
app.post('/api/play/:uploadedId', authenticateUser, async (req, res) => {
  try {
    const { uploadedId } = req.params;
    await PlayHistory.addPlay(req.user.id, uploadedId);
    res.json({ success: true, message: 'Play recorded' });
  } catch (error) {
    console.error('Error recording play:', error);
    res.status(500).json({ error: 'Failed to record play' });
  }
});

// Get user's play history
app.get('/api/history', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await PlayHistory.getUserHistory(req.user.id, limit);

    const historyWithUrls = history.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/images/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/audio/${item.sound_filename}` : null
    }));

    res.json({ success: true, history: historyWithUrls });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get recently played buttons
app.get('/api/recently-played', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentlyPlayed = await PlayHistory.getRecentlyPlayed(req.user.id, limit);

    const recentWithUrls = recentlyPlayed.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/images/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/audio/${item.sound_filename}` : null
    }));

    res.json({ success: true, recentlyPlayed: recentWithUrls });
  } catch (error) {
    console.error('Error getting recently played:', error);
    res.status(500).json({ error: 'Failed to get recently played' });
  }
});

// Clear user's play history
app.delete('/api/history', authenticateUser, async (req, res) => {
  try {
    await PlayHistory.clearUserHistory(req.user.id);
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// ===== STATISTICS ENDPOINTS =====

// Get most played buttons (public or admin)
app.get('/api/stats/most-played', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const mostPlayed = await ButtonStats.getMostPlayed(limit);

    const mostPlayedWithUrls = mostPlayed.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/images/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/audio/${item.sound_filename}` : null
    }));

    res.json({ success: true, mostPlayed: mostPlayedWithUrls });
  } catch (error) {
    console.error('Error getting most played:', error);
    res.status(500).json({ error: 'Failed to get most played' });
  }
});

// Get button statistics (admin only)
app.get('/api/stats/all', requireAdmin, async (req, res) => {
  try {
    const stats = await ButtonStats.getAllStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get specific button stats
app.get('/api/stats/button/:uploadedId', async (req, res) => {
  try {
    const { uploadedId } = req.params;
    const stats = await ButtonStats.getButtonStats(uploadedId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting button stats:', error);
    res.status(500).json({ error: 'Failed to get button stats' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your MySQL configuration.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 CroabBoard MySQL Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🗄️  Database: MySQL (${process.env.MYSQL_HOST || 'localhost'}:${process.env.MYSQL_PORT || 3306})`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

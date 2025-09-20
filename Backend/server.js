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
  testConnection 
} from './models/mysql-models.js';

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

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Serve frontend test file
app.use('/test', express.static('../Frontend'));

// Session configuration (simple for development)
app.use(session({
  secret: process.env.SESSION_SECRET || 'croabboard-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
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

// Simple auth middleware
const authenticateUser = (req, res, next) => {
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  req.user = {
    id: req.session.user.id,
    username: req.session.user.username,
    btnSize: req.session.user.btnSize
  };
  next();
};

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
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user in MySQL
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Store user info in session
    req.session.user = {
      id: user.id,
      username: user.username,
      btnSize: user.btn_size
    };

    // Save session before responding to ensure it's persistent
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session save failed' });
      }
      
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          btnSize: user.btn_size
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
        btnSize: user.btn_size
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Profile endpoint - matches Python Flask /api/profil
app.get('/api/profil', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's uploaded buttons (matching Python query)
    const uploaded = await Uploaded.getByUser(req.user.id);
    
    // Transform to match Python response format
    const buttons = uploaded.map(item => ({
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

    // Update button size in database (need to add this method to User model)
    await User.updateButtonSize(user.id, btnSize);
    
    res.json({ success: true, message: 'Button size updated successfully' });
  } catch (error) {
    console.error('Error updating button size:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update button size' 
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

    console.log('Upload request:', {
      ButtonName,
      CategoryName,
      imageFile: imageFile.filename,
      soundFile: soundFile.filename
    });

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
      message: 'Button uploaded and linked successfully'
    });

  } catch (error) {
    console.error('Error uploading button:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
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

// Get user's linked buttons
app.get('/api/linked', authenticateUser, async (req, res) => {
  try {
    const linked = await Linked.findByUser(req.user.id);
    
    // Add file URLs
    const linkedWithUrls = linked.map(item => ({
      ...item,
      imageUrl: item.image_filename ? `/uploads/${item.image_filename}` : null,
      soundUrl: item.sound_filename ? `/uploads/${item.sound_filename}` : null
    }));
    
    res.json({ success: true, linked: linkedWithUrls });
  } catch (error) {
    console.error('Error getting linked buttons:', error);
    res.status(500).json({ error: 'Failed to get linked buttons' });
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
    
    await Linked.delete(req.user.id, uploadedId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unlinking button:', error);
    res.status(500).json({ error: 'Failed to unlink button' });
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

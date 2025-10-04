import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/mysql-models.js';
import { authenticateUser } from '../middleware/auth.js';
import { logAction } from '../middleware/auditLogger.js';

const router = express.Router();

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload avatar
router.post('/avatar', authenticateUser, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Delete old avatar if exists
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const oldAvatarPath = path.join('uploads/avatars', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar in database
    await User.updateAvatar(req.user.id, req.file.filename);

    // Update session
    req.session.user.avatar = req.file.filename;

    // Log the action
    await logAction(req, 'avatar_updated', {
      filename: req.file.filename
    });

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: req.file.filename,
      avatarUrl: `/uploads/avatars/${req.file.filename}`
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    // Delete uploaded file if database update failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// Delete avatar
router.delete('/avatar', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No avatar to delete'
      });
    }

    // Delete avatar file
    const avatarPath = path.join('uploads/avatars', user.avatar);
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }

    // Update database
    await User.updateAvatar(req.user.id, null);

    // Update session
    req.session.user.avatar = null;

    // Log the action
    await logAction(req, 'avatar_deleted', {
      filename: user.avatar
    });

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete avatar'
    });
  }
});

export default router;

import express from 'express';
import { User, DeleteHistory, Linked } from '../models/mysql-models.js';
import AuditLog from '../models/AuditLog.js';
import { requireAdmin } from '../middleware/auth.js';
import { logAction } from '../middleware/auditLogger.js';

const router = express.Router();

// Get all users with stats (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.getAllWithStats();

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        btn_size: u.btn_size,
        is_admin: u.is_admin || false,
        avatar: u.avatar,
        button_count: u.button_count || 0
      }))
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Toggle user admin status (admin only)
router.post('/users/:userId/toggle-admin', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent removing own admin rights
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own admin status'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAdminStatus = !user.is_admin;
    await User.updateAdminStatus(userId, newAdminStatus);

    // Log the action
    await logAction(req, 'admin_status_changed', {
      targetUserId: userId,
      targetUsername: user.username,
      newStatus: newAdminStatus
    });

    res.json({
      success: true,
      message: `User ${user.username} ${newAdminStatus ? 'granted' : 'revoked'} admin privileges`,
      is_admin: newAdminStatus
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin status' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.delete(userId);

    // Log the action
    await logAction(req, 'user_deleted', {
      deletedUserId: userId,
      deletedUsername: user.username
    });

    res.json({
      success: true,
      message: `User ${user.username} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Get audit logs (admin only)
router.get('/audit-logs', requireAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0, action, userId, startDate, endDate } = req.query;

    let logs;

    if (action) {
      logs = await AuditLog.getByAction(action, limit);
    } else if (userId) {
      logs = await AuditLog.getByUser(userId, limit);
    } else if (startDate && endDate) {
      logs = await AuditLog.getByDateRange(new Date(startDate), new Date(endDate), limit);
    } else {
      logs = await AuditLog.getAll(limit, offset);
    }

    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to get audit logs' });
  }
});

// Get audit log statistics (admin only)
router.get('/audit-logs/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await AuditLog.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting audit stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get audit stats' });
  }
});

// Get failed login attempts (admin only)
router.get('/audit-logs/failed-logins', requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const failedLogins = await AuditLog.getFailedLogins(limit);

    res.json({
      success: true,
      failed_logins: failedLogins,
      count: failedLogins.length
    });
  } catch (error) {
    console.error('Error getting failed logins:', error);
    res.status(500).json({ success: false, error: 'Failed to get failed logins' });
  }
});

// Clean old audit logs (admin only)
router.delete('/audit-logs/cleanup', requireAdmin, async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const deletedCount = await AuditLog.deleteOld(days);

    await logAction(req, 'audit_cleanup', { days, deletedCount });

    res.json({
      success: true,
      message: `Deleted ${deletedCount} old audit log entries (older than ${days} days)`
    });
  } catch (error) {
    console.error('Error cleaning audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to clean audit logs' });
  }
});

// Get all deleted buttons (admin only)
router.get('/deleted-buttons', requireAdmin, async (req, res) => {
  try {
    const deletedButtons = await DeleteHistory.getAll();

    res.json({
      success: true,
      buttons: deletedButtons
    });
  } catch (error) {
    console.error('Error getting deleted buttons:', error);
    res.status(500).json({ success: false, error: 'Failed to get deleted buttons' });
  }
});

// Restore deleted button (admin only)
router.post('/deleted-buttons/:id/restore', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get deleted button data
    const deletedButton = await DeleteHistory.restore(id);

    // Recreate the link in the user's collection
    await Linked.create({
      userId: deletedButton.owner_id,
      uploadedId: deletedButton.uploaded_id,
      tri: 0 // Add at beginning, or calculate max tri
    });

    // Log the action
    await logAction(req, 'button_restored', {
      deletedButtonId: id,
      buttonName: deletedButton.button_name,
      ownerId: deletedButton.owner_id
    });

    res.json({
      success: true,
      message: `Button "${deletedButton.button_name}" restored successfully`
    });
  } catch (error) {
    console.error('Error restoring button:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to restore button' });
  }
});

export default router;

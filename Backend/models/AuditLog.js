import { pool } from './mysql-models.js';

class AuditLog {
  /**
   * Create an audit log entry
   * @param {number|null} userId - User ID (null for anonymous)
   * @param {string|null} username - Username
   * @param {string} action - Action performed (e.g., 'login', 'logout', 'upload', 'delete')
   * @param {string|null} details - Additional details (JSON string)
   * @param {string|null} ipAddress - IP address
   * @param {string|null} userAgent - User agent string
   */
  static async create(userId, username, action, details = null, ipAddress = null, userAgent = null) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO audit_log (user_id, username, action, details, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, username, action, details, ipAddress, userAgent]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Get all audit logs with pagination
   * @param {number} limit - Number of logs to retrieve
   * @param {number} offset - Offset for pagination
   */
  static async getAll(limit = 100, offset = 0) {
    try {
      const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 100, 1000));
      const validOffset = Math.max(0, parseInt(offset, 10) || 0);

      const [rows] = await pool.query(
        `SELECT * FROM audit_log
         ORDER BY created_at DESC
         LIMIT ${validLimit} OFFSET ${validOffset}`
      );
      return rows;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   * @param {number} userId - User ID
   * @param {number} limit - Number of logs to retrieve
   */
  static async getByUser(userId, limit = 50) {
    try {
      const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 50, 500));

      const [rows] = await pool.query(
        `SELECT * FROM audit_log
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ${validLimit}`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by action type
   * @param {string} action - Action type
   * @param {number} limit - Number of logs to retrieve
   */
  static async getByAction(action, limit = 50) {
    try {
      const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 50, 500));

      const [rows] = await pool.query(
        `SELECT * FROM audit_log
         WHERE action = ?
         ORDER BY created_at DESC
         LIMIT ${validLimit}`,
        [action]
      );
      return rows;
    } catch (error) {
      console.error('Error getting action audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs within a time range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} limit - Number of logs to retrieve
   */
  static async getByDateRange(startDate, endDate, limit = 100) {
    try {
      const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 100, 1000));

      const [rows] = await pool.query(
        `SELECT * FROM audit_log
         WHERE created_at BETWEEN ? AND ?
         ORDER BY created_at DESC
         LIMIT ${validLimit}`,
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      console.error('Error getting date range audit logs:', error);
      throw error;
    }
  }

  /**
   * Get failed login attempts
   * @param {number} limit - Number of logs to retrieve
   */
  static async getFailedLogins(limit = 50) {
    try {
      const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 50, 500));

      const [rows] = await pool.query(
        `SELECT * FROM audit_log
         WHERE action = 'login_failed'
         ORDER BY created_at DESC
         LIMIT ${validLimit}`
      );
      return rows;
    } catch (error) {
      console.error('Error getting failed logins:', error);
      throw error;
    }
  }

  /**
   * Get statistics about audit logs
   */
  static async getStats() {
    try {
      const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM audit_log');
      const [actionStats] = await pool.query(
        `SELECT action, COUNT(*) as count
         FROM audit_log
         GROUP BY action
         ORDER BY count DESC`
      );
      const [recentActivity] = await pool.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM audit_log
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date DESC`
      );

      return {
        total: totalRows[0].total,
        by_action: actionStats,
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error getting audit stats:', error);
      throw error;
    }
  }

  /**
   * Delete old audit logs (older than specified days)
   * @param {number} days - Number of days to keep
   */
  static async deleteOld(days = 90) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM audit_log
         WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [days]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting old audit logs:', error);
      throw error;
    }
  }
}

export default AuditLog;

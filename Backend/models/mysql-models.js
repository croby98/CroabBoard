/**
 * MySQL Database Models
 * Direct connection to your existing MySQL database
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'croabboard',
  port: process.env.MYSQL_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(mysqlConfig);

// User Model
export class User {
  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM user WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM user WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async create(userData) {
    const { username, password, btnSize = 150 } = userData;
    const [result] = await pool.execute(
      'INSERT INTO user (username, password, btn_size) VALUES (?, ?, ?)',
      [username, password, btnSize]
    );
    return { id: result.insertId, username, password, btnSize };
  }

  static async updateButtonSize(userId, btnSize) {
    await pool.execute(
      'UPDATE user SET btn_size = ? WHERE id = ?',
      [btnSize, userId]
    );
    return await this.findById(userId);
  }

  static async update(id, updateData) {
    const { username, btnSize } = updateData;
    await pool.execute(
      'UPDATE user SET username = ?, btn_size = ? WHERE id = ?',
      [username, btnSize, id]
    );
    return await this.findById(id);
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM user ORDER BY username');
    return rows;
  }

  static async updatePassword(userId, hashedPassword) {
    await pool.execute(
      'UPDATE user SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    return await this.findById(userId);
  }

  static async updateAvatar(userId, avatarFilename) {
    await pool.execute(
      'UPDATE user SET avatar = ? WHERE id = ?',
      [avatarFilename, userId]
    );
    return await this.findById(userId);
  }

  static async updateAdminStatus(userId, isAdmin) {
    await pool.execute(
      'UPDATE user SET is_admin = ? WHERE id = ?',
      [isAdmin, userId]
    );
    return await this.findById(userId);
  }

  static async getAllWithStats() {
    const [rows] = await pool.execute(`
      SELECT u.*,
             COUNT(DISTINCT l.uploaded_id) as button_count
      FROM user u
      LEFT JOIN linked l ON u.id = l.user_id
      GROUP BY u.id
      ORDER BY u.username
    `);
    return rows;
  }

  static async delete(userId) {
    const [result] = await pool.execute('DELETE FROM user WHERE id = ?', [userId]);
    return result.affectedRows > 0;
  }
}

// Category Model
export class Category {
  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM category WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(categoryData) {
    const { name, color } = categoryData;
    const [result] = await pool.execute(
      'INSERT INTO category (name, color) VALUES (?, ?)',
      [name, color]
    );
    return { id: result.insertId, name, color };
  }

  static async update(id, updateData) {
    const { name, color } = updateData;
    await pool.execute(
      'UPDATE category SET name = ?, color = ? WHERE id = ?',
      [name, color, id]
    );
    return await this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM category WHERE id = ?', [id]);
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM category ORDER BY name');
    return rows;
  }

  static async getAllWithButtonCount() {
    const [rows] = await pool.execute(`
      SELECT c.*, COUNT(u.id) as button_count
      FROM category c
      LEFT JOIN uploaded u ON c.id = u.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    return rows;
  }

  static async findByName(name) {
    const [rows] = await pool.execute(
      'SELECT * FROM category WHERE name = ?',
      [name]
    );
    return rows[0] || null;
  }
}

// File Model
export class File {
  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM file WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(fileData) {
    const { filename, type } = fileData;
    const [result] = await pool.execute(
      'INSERT INTO file (filename, type) VALUES (?, ?)',
      [filename, type]
    );
    return { id: result.insertId, filename, type };
  }

  static async delete(id) {
    await pool.execute('DELETE FROM file WHERE id = ?', [id]);
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM file ORDER BY filename');
    return rows;
  }

  static async getByType(type) {
    const [rows] = await pool.execute('SELECT * FROM file WHERE type = ? ORDER BY filename', [type]);
    return rows;
  }
}

// Uploaded Model
export class Uploaded {
  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT u.*, 
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name, cat.color as category_color,
             usr.username as uploaded_by_username
      FROM uploaded u
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id  
      LEFT JOIN category cat ON u.category_id = cat.id
      LEFT JOIN user usr ON u.uploaded_by = usr.id
      WHERE u.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create(uploadedData) {
    const { imageId, soundId, uploadedBy, buttonName, categoryId } = uploadedData;
    const [result] = await pool.execute(
      'INSERT INTO uploaded (image_id, sound_id, uploaded_by, button_name, category_id) VALUES (?, ?, ?, ?, ?)',
      [imageId, soundId, uploadedBy, buttonName, categoryId]
    );
    return { id: result.insertId, ...uploadedData };
  }

  static async update(id, updateData) {
    const { buttonName, categoryId } = updateData;
    await pool.execute(
      'UPDATE uploaded SET button_name = ?, category_id = ? WHERE id = ?',
      [buttonName, categoryId, id]
    );
    return await this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM uploaded WHERE id = ?', [id]);
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT u.*,
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name, cat.color as category_color,
             usr.username as uploaded_by_username
      FROM uploaded u
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      LEFT JOIN user usr ON u.uploaded_by = usr.id
      ORDER BY u.id DESC
    `);
    return rows;
  }

  static async getAllWithLinkedStatus(userId) {
    const [rows] = await pool.execute(`
      SELECT u.*,
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name, cat.color as category_color,
             usr.username as uploaded_by_username,
             CASE WHEN l.uploaded_id IS NOT NULL THEN 1 ELSE 0 END as is_linked
      FROM uploaded u
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      LEFT JOIN user usr ON u.uploaded_by = usr.id
      LEFT JOIN linked l ON u.id = l.uploaded_id AND l.user_id = ?
      ORDER BY u.id DESC
    `, [userId]);
    return rows;
  }

  static async getByUser(userId) {
    const [rows] = await pool.execute(`
      SELECT u.*,
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.color as category_color
      FROM uploaded u
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      WHERE u.uploaded_by = ?
      ORDER BY u.button_name
    `, [userId]);
    return rows;
  }

  static async getDeletedHistory() {
    const [rows] = await pool.execute(
      'SELECT * FROM deleted_button ORDER BY delete_date DESC'
    );
    return rows;
  }

  static async restoreFromHistory(id) {
    await pool.execute(
      "UPDATE deleted_button SET status = 'restored' WHERE id = ?",
      [id]
    );
  }
}

// Linked Model
export class Linked {
  static async findByUser(userId) {
    const [rows] = await pool.execute(`
      SELECT l.*, u.button_name, u.image_id, u.sound_id,
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name, cat.color as category_color
      FROM linked l
      JOIN uploaded u ON l.uploaded_id = u.id
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      WHERE l.user_id = ?
      ORDER BY l.tri
    `, [userId]);
    return rows;
  }

  static async create(linkedData) {
    const { userId, uploadedId, tri } = linkedData;
    
    // Check if link already exists
    const [existing] = await pool.execute(
      'SELECT * FROM linked WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );
    
    if (existing.length > 0) {
      // Update existing tri position
      await pool.execute(
        'UPDATE linked SET tri = ? WHERE user_id = ? AND uploaded_id = ?',
        [tri, userId, uploadedId]
      );
    } else {
      // Create new link
      await pool.execute(
        'INSERT INTO linked (user_id, uploaded_id, tri) VALUES (?, ?, ?)',
        [userId, uploadedId, tri]
      );
    }
  }

  static async updatePosition(userId, uploadedId, newTri) {
    await pool.execute(
      'UPDATE linked SET tri = ? WHERE user_id = ? AND uploaded_id = ?',
      [newTri, userId, uploadedId]
    );
  }

  static async delete(userId, uploadedId) {
    await pool.execute(
      'DELETE FROM linked WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );
  }

  static async searchByCategory(userId, categoryName) {
    const [rows] = await pool.execute(`
      SELECT u.*, 
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name,
             cat.color as category_color,
             l.tri
      FROM linked l
      JOIN uploaded u ON l.uploaded_id = u.id
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      WHERE l.user_id = ? AND cat.name LIKE ?
      ORDER BY l.tri ASC
    `, [userId, `%${categoryName}%`]);
    
    return rows.map(row => ({
      image_id: row.image_id,
      image_filename: row.image_filename,
      sound_id: row.sound_id,
      sound_filename: row.sound_filename,
      button_name: row.button_name,
      tri: row.tri,
      category: row.category_name
    }));
  }

  static async getMaxTri(userId) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(MAX(tri), 0) as max_tri FROM linked WHERE user_id = ?',
      [userId]
    );
    return rows[0].max_tri;
  }

  static async createOrUpdate(userId, uploadedId, tri) {
    // Check if link already exists
    const [existing] = await pool.execute(
      'SELECT * FROM linked WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );

    if (existing.length > 0) {
      // Update existing tri position
      await pool.execute(
        'UPDATE linked SET tri = ? WHERE user_id = ? AND uploaded_id = ?',
        [tri, userId, uploadedId]
      );
    } else {
      // Create new link
      await pool.execute(
        'INSERT INTO linked (user_id, uploaded_id, tri) VALUES (?, ?, ?)',
        [userId, uploadedId, tri]
      );
    }
  }
}



// Delete History Model (if needed)
export class DeleteHistory {
  static async create(historyData) {
    const { ownerId, uploadedId, buttonName, soundFilename, imageFilename, imageId, soundId, categoryId, status = 'deleted' } = historyData;
    const [result] = await pool.execute(
      `INSERT INTO deleted_button
       (owner_id, uploaded_id, button_name, sound_filename, image_filename, image_id, sound_id, category_id, status, delete_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [ownerId, uploadedId, buttonName, soundFilename, imageFilename, imageId, soundId, categoryId, status]
    );
    return { id: result.insertId, ...historyData };
  }

  static async getByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM deleted_button WHERE owner_id = ? ORDER BY delete_date DESC',
      [userId]
    );
    return rows;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM deleted_button ORDER BY delete_date DESC'
    );
    return rows;
  }

  static async restore(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM deleted_button WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Deleted button not found');
    }
    const deletedButton = rows[0];

    // Mark as restored
    await pool.execute(
      "UPDATE deleted_button SET status = 'restored' WHERE id = ?",
      [id]
    );

    return deletedButton;
  }
}

// ButtonVolume Model - Track individual button volume preferences per user
export class ButtonVolume {
  static async getVolume(userId, uploadedId) {
    const [rows] = await pool.execute(
      'SELECT volume FROM button_volume WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );
    return rows[0]?.volume ?? 1.0; // Default to 1.0 (100%)
  }

  static async setVolume(userId, uploadedId, volume) {
    // First check if record exists
    const [existing] = await pool.execute(
      'SELECT * FROM button_volume WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );

    if (existing.length > 0) {
      // Update existing volume
      await pool.execute(
        'UPDATE button_volume SET volume = ? WHERE user_id = ? AND uploaded_id = ?',
        [volume, userId, uploadedId]
      );
    } else {
      // Insert new volume preference
      await pool.execute(
        'INSERT INTO button_volume (user_id, uploaded_id, volume) VALUES (?, ?, ?)',
        [userId, uploadedId, volume]
      );
    }
  }

  static async getUserVolumes(userId) {
    const [rows] = await pool.execute(
      'SELECT uploaded_id, volume FROM button_volume WHERE user_id = ?',
      [userId]
    );
    return rows;
  }
}

// Favorite Model - Manage user's favorite buttons
export class Favorite {
  static async isFavorite(userId, uploadedId) {
    const [rows] = await pool.execute(
      'SELECT * FROM favorite WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );
    return rows.length > 0;
  }

  static async addFavorite(userId, uploadedId) {
    try {
      await pool.execute(
        'INSERT INTO favorite (user_id, uploaded_id) VALUES (?, ?)',
        [userId, uploadedId]
      );
      return true;
    } catch (error) {
      // Ignore duplicate entry errors
      if (error.code === 'ER_DUP_ENTRY') {
        return false;
      }
      throw error;
    }
  }

  static async removeFavorite(userId, uploadedId) {
    const [result] = await pool.execute(
      'DELETE FROM favorite WHERE user_id = ? AND uploaded_id = ?',
      [userId, uploadedId]
    );
    return result.affectedRows > 0;
  }
  

  static async getUserFavorites(userId) {
   
    const [rows] = await pool.execute(`
      SELECT u.*,
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name, cat.color as category_color,
             f.created_at as favorited_at
      FROM favorite f
      JOIN uploaded u ON f.uploaded_id = u.id
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    return rows;
  }

  static async getFavoriteCount(uploadedId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM favorite WHERE uploaded_id = ?',
      [uploadedId]
    );
    return rows[0].count;
  }
}

// PlayHistory Model - Track recently played sounds
// NOTE: This model is commented out because play_history table doesn't exist
// Only incrementing button stats for now
export class PlayHistory {
  static async addPlay(userId, uploadedId) {
    // Just update button stats for now
    await ButtonStats.incrementPlayCount(uploadedId);
  }

  static async getUserHistory(userId, limit = 50) {
    // Return empty array since play_history table doesn't exist
    return [];
  }

  static async getRecentlyPlayed(userId, limit = 100) {
    // Return empty array since play_history table doesn't exist
    return [];
  }

  static async clearUserHistory(userId) {
    // No-op since play_history table doesn't exist
    return;
  }
}

// ButtonStats Model - Track button usage statistics
export class ButtonStats {
  static async incrementPlayCount(uploadedId) {
    const [existing] = await pool.execute(
      'SELECT * FROM button_stats WHERE uploaded_id = ?',
      [uploadedId]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE button_stats SET play_count = play_count + 1, last_played = NOW() WHERE uploaded_id = ?',
        [uploadedId]
      );
    } else {
      await pool.execute(
        'INSERT INTO button_stats (uploaded_id, play_count, last_played) VALUES (?, 1, NOW())',
        [uploadedId]
      );
    }
  }

  static async getButtonStats(uploadedId) {
    const [rows] = await pool.execute(
      'SELECT * FROM button_stats WHERE uploaded_id = ?',
      [uploadedId]
    );
    return rows[0] || { play_count: 0, last_played: null };
  }

  static async getMostPlayed(limit = 20) {
    // Ensure limit is a valid integer and sanitize it (prevent SQL injection)
    const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 1000));

    // Use query() instead of execute() and interpolate LIMIT directly (it's safe since we validated it)
    const [rows] = await pool.query(`
      SELECT u.*,
             img.filename as image_filename,
             snd.filename as sound_filename,
             cat.name as category_name, cat.color as category_color,
             bs.play_count, bs.last_played
      FROM button_stats bs
      JOIN uploaded u ON bs.uploaded_id = u.id
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      LEFT JOIN category cat ON u.category_id = cat.id
      ORDER BY bs.play_count DESC, bs.last_played DESC
      LIMIT ${validLimit}
    `);
    return rows;
  }

  static async getAllStats() {
    // Get all statistics for admin dashboard
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM user');
    const [totalButtons] = await pool.execute('SELECT COUNT(*) as count FROM uploaded');
    const [totalCategories] = await pool.execute('SELECT COUNT(*) as count FROM category');
    const [totalDeleted] = await pool.execute('SELECT COUNT(*) as count FROM deleted_button WHERE status = "deleted"');
    const [totalPlays] = await pool.execute('SELECT COALESCE(SUM(play_count), 0) as count FROM button_stats');

    // Get active users today (simplified version - count total users for now)
    // TODO: Implement proper tracking of daily active users
    const [activeUsersToday] = await pool.execute(`
      SELECT 0 as count
    `);

    return {
      total_users: totalUsers[0].count,
      total_buttons: totalButtons[0].count,
      total_categories: totalCategories[0].count,
      total_deleted: totalDeleted[0].count,
      total_plays: totalPlays[0].count,
      active_users_today: activeUsersToday[0].count,
    };
  }
}

// Test database connection
export async function testConnection() {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ MySQL connection successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

// Audit Log Model
export class AuditLog {
  static async create(logData) {
    const { userId, username, action, ipAddress, userAgent, details } = logData;
    try {
      const [result] = await pool.execute(
        `INSERT INTO audit_log (user_id, username, action, ip_address, user_agent, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, username, action, ipAddress, userAgent, JSON.stringify(details)]
      );
      return { id: result.insertId, ...logData };
    } catch (error) {
      // Create table if it doesn't exist
      await this.createTable();
      // Retry the insert
      const [result] = await pool.execute(
        `INSERT INTO audit_log (user_id, username, action, ip_address, user_agent, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, username, action, ipAddress, userAgent, JSON.stringify(details)]
      );
      return { id: result.insertId, ...logData };
    }
  }

  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        username VARCHAR(255) DEFAULT NULL,
        action VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        details JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_user (user_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  static async getAll(limit = 50) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM audit_log
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit]
      );
      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : null
      }));
    } catch (error) {
      await this.createTable();
      return [];
    }
  }

  static async getByUser(userId, limit = 50) {
    const [rows] = await pool.execute(
      `SELECT * FROM audit_log
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows.map(row => ({
      ...row,
      details: row.details ? JSON.parse(row.details) : null
    }));
  }

  static async deleteOldLogs(daysOld = 90) {
    await pool.execute(
      `DELETE FROM audit_log
       WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );
  }
}

// Export the pool for direct queries if needed
export { pool };

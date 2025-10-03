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

  static async getByUser(userId) {
    const [rows] = await pool.execute(`
      SELECT u.*, 
             img.filename as image_filename,
             snd.filename as sound_filename
      FROM uploaded u
      LEFT JOIN file img ON u.image_id = img.id
      LEFT JOIN file snd ON u.sound_id = snd.id
      WHERE u.uploaded_by = ?
      ORDER BY u.button_name
    `, [userId]);
    return rows;
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
}



// Delete History Model (if needed)
export class DeleteHistory {
  static async create(historyData) {
    const { ownerId, buttonName, soundFilename, imageFilename, status = 'deleted' } = historyData;
    const [result] = await pool.execute(
      'INSERT INTO deleted_button (owner_id, button_name, sound_filename, image_filename, status, delete_date) VALUES (?, ?, ?, ?, ?, NOW())',
      [ownerId, buttonName, soundFilename, imageFilename, status]
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

// Export the pool for direct queries if needed
export { pool };

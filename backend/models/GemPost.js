const { pool } = require('../config/db');

class GemPost {
  // Create gem_posts table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS gem_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        posted_date DATE NOT NULL,
        gem_type ENUM('Diamond', 'Ruby', 'Sapphire', 'Emerald') NOT NULL,
        gem_color ENUM('Red', 'Blue', 'White', 'Green') NOT NULL,
        gem_weight DECIMAL(10,2) NOT NULL,
        gem_weight_unit ENUM('mg', 'g') NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        other_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await pool.execute(query);
    console.log('✅ Gem posts table created/verified');
  }

  static async create(gemPostData) {
    const {
      user_id,
      posted_date,
      gem_type,
      gem_color,
      gem_weight,
      gem_weight_unit,
      owner_name,
      contact_number,
      address,
      other_info
    } = gemPostData;

    const query = `
      INSERT INTO gem_posts 
        (user_id, posted_date, gem_type, gem_color, gem_weight, gem_weight_unit, owner_name, contact_number, address, other_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      user_id,
      posted_date,
      gem_type,
      gem_color,
      gem_weight,
      gem_weight_unit,
      owner_name,
      contact_number,
      address,
      other_info
    ]);

    return {
      id: result.insertId,
      ...gemPostData
    };
  }

  static async findAll() {
    const query = `
      SELECT 
        gp.*,
        u.name as user_name
      FROM gem_posts gp
      INNER JOIN users u ON gp.user_id = u.id
      ORDER BY gp.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async findByFilters(filters) {
    let query = `
      SELECT 
        gp.*,
        u.name as user_name
      FROM gem_posts gp
      INNER JOIN users u ON gp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.color) {
      query += ' AND gem_color = ?';
      params.push(filters.color);
    }

    if (filters.type) {
      query += ' AND gem_type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY gp.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM gem_posts WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  // ADD THIS DELETE METHOD
  static async delete(id) {
    const query = 'DELETE FROM gem_posts WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = GemPost;
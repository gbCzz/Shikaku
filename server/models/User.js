import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // 创建用户
  static async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
      username,
      email,
      hashedPassword,
    ]);

    return this.findById(result.insertId);
  }

  // 通过ID查找用户
  static async findById(id) {
    const [rows] = await pool.query('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  // 通过用户名查找用户
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  // 通过邮箱查找用户
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // 验证密码
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

export default User;

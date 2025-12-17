import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // 直接导入 bcryptjs

dotenv.config();

async function initializeDatabase() {
  let connection;

  try {
    // 创建连接（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('正在初始化数据库...');

    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`数据库 ${process.env.DB_NAME} 创建/验证成功`);

    // 切换到新数据库
    await connection.query(`USE ${process.env.DB_NAME}`);

    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('用户表创建/验证成功');

    // 检查是否有管理员用户，没有则创建默认用户
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      // 使用 bcrypt.hash 而不是 bcrypt.hash
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
        'admin',
        'admin@shikaku.com',
        hashedPassword,
      ]);
      console.log('默认管理员用户创建成功: admin/admin123');
    }

    console.log('数据库初始化完成');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  } finally {
    // 确保连接关闭
    if (connection) {
      await connection.end();
    }
  }
}

export { initializeDatabase };

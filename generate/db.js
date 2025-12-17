// db.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); 

/**
 * 数据库连接配置 (请修改密码！)
 */
const dbConfig = {
    host: 'localhost',      
    user: 'puzzle_user',    
    password: '142857Zmh***mysql', // 👈 替换为您设置的实际密码
    database: 'puzzle_site_db', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

class DBManager {
    constructor() {
        this.pool = mysql.createPool(dbConfig);
        console.log("数据库连接池已创建。");
    }

    async query(sql, values = []) {
        try {
            const [rows] = await this.pool.execute(sql, values);
            return rows;
        } catch (error) {
            console.error("数据库查询出错:", error.message);
            // 生产环境中不应直接暴露错误信息
            throw new Error('数据库操作失败'); 
        }
    }

    /**
     * 实现注册账号功能
     */
    async registerUser(username, password, nickname) {
        // 检查用户是否已存在
        const existingUsers = await this.query(
            'SELECT id FROM users WHERE username = ?', 
            [username]
        );
        if (existingUsers.length > 0) {
            return { success: false, message: '用户名已存在' };
        }

        // 密码哈希加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO users (username, password, nickname) 
            VALUES (?, ?, ?)
        `;
        try {
            await this.query(sql, [username, hashedPassword, nickname]);
            return { success: true, message: '注册成功' };
        } catch (e) {
            console.error(e);
            return { success: false, message: '数据库内部错误' };
        }
    }

    /**
     * 实现登录功能
     */
    async loginUser(username, password) {
        const users = await this.query(
            'SELECT id, username, password, nickname FROM users WHERE username = ?', 
            [username]
        );

        if (users.length === 0) {
            return null; // 用户不存在
        }

        const user = users[0];
        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // 更新登录时间
            await this.query('UPDATE users SET last_login = CURRENT_TIMESTAMP() WHERE id = ?', [user.id]);
            delete user.password; // 移除密码哈希，不发送给前端
            return user;
        } else {
            return null; // 密码不匹配
        }
    }

    /**
     * 实现记录游戏历史功能
     */
    async recordSolve(userId) {
        // 记录解谜逻辑：更新总解题数和打卡记录
        const updateSql = `
            UPDATE users SET 
                total_solves = total_solves + 1,
                current_streak = current_streak + 1,
                max_streak = GREATEST(max_streak, current_streak + 1)
            WHERE id = ?;
        `;
        await this.query(updateSql, [userId]);
    }
}

module.exports = DBManager;
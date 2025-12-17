// server.js

const express = require('express');
const DBManager = require('./db'); // 导入您的数据库包

const app = express();
const PORT = 3000;

// 引入 CORS，允许前端页面跨域访问 API
const cors = require('cors');
app.use(cors()); 

// 初始化数据库管理器
const dbManager = new DBManager();

// 中间件：解析请求体 JSON
app.use(express.json());

// --- 注册 API 接口 ---
app.post('/api/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    
    if (!username || !password || !nickname) {
        return res.status(400).json({ success: false, message: '缺少用户名、密码或昵称' });
    }
    
    try {
        const result = await dbManager.registerUser(username, password, nickname);
        
        if (result.success) {
            res.json({ success: true, message: '注册成功！' });
        } else {
            // 用户名已存在等错误
            res.status(409).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("注册 API 错误:", error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});


// --- 登录 API 接口 ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '缺少用户名或密码' });
    }

    try {
        const user = await dbManager.loginUser(username, password);

        if (user) {
            // 登录成功
            res.json({ 
                success: true, 
                message: '登录成功', 
                user: { id: user.id, username: user.username, nickname: user.nickname } 
            });
        } else {
            res.status(401).json({ success: false, message: '用户名或密码不正确' });
        }
    } catch (error) {
        console.error("登录 API 错误:", error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`🚀 API 服务器正在运行于 http://localhost:${PORT}`);
});
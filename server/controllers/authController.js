import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

class AuthController {
  // 用户注册
  static async register(ctx) {
    try {
      const { username, email, password } = ctx.request.body;

      // 验证输入
      if (!username || !email || !password) {
        ctx.status = 400;
        ctx.body = { error: '请填写所有必填字段' };
        return;
      }

      // 检查用户名是否已存在
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        ctx.status = 409;
        ctx.body = { error: '用户名已存在' };
        return;
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        ctx.status = 409;
        ctx.body = { error: '邮箱已被注册' };
        return;
      }

      // 创建用户
      const user = await User.create({ username, email, password });

      // 生成JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      ctx.status = 201;
      ctx.body = {
        message: '注册成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('注册错误:', error);
      ctx.status = 500;
      ctx.body = { error: '服务器内部错误' };
    }
  }

  // 用户登录
  static async login(ctx) {
    try {
      const { username, password } = ctx.request.body;

      if (!username || !password) {
        ctx.status = 400;
        ctx.body = { error: '请输入用户名和密码' };
        return;
      }

      // 查找用户
      const user = await User.findByUsername(username);
      if (!user) {
        ctx.status = 401;
        ctx.body = { error: '用户名或密码错误' };
        return;
      }

      // 验证密码
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        ctx.status = 401;
        ctx.body = { error: '用户名或密码错误' };
        return;
      }

      // 生成JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      ctx.status = 200;
      ctx.body = {
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('登录错误:', error);
      ctx.status = 500;
      ctx.body = { error: '服务器内部错误' };
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(ctx) {
    try {
      const user = await User.findById(ctx.state.user.userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: '用户不存在' };
        return;
      }

      ctx.status = 200;
      ctx.body = { user };
    } catch (error) {
      console.error('获取用户信息错误:', error);
      ctx.status = 500;
      ctx.body = { error: '服务器内部错误' };
    }
  }
}

export default AuthController;

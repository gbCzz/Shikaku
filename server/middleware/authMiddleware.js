import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// JWT认证中间件
const authMiddleware = async (ctx, next) => {
  try {
    // 从请求头获取token
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: '未提供认证令牌' };
      return;
    }

    const token = authHeader.split(' ')[1];

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 将用户信息存入上下文
    ctx.state.user = decoded;

    await next();
  } catch (error) {
    console.error('认证错误:', error.message);

    if (error.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = { error: '无效的认证令牌' };
    } else if (error.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = { error: '认证令牌已过期' };
    } else {
      ctx.status = 500;
      ctx.body = { error: '认证失败' };
    }
  }
};

export default authMiddleware;

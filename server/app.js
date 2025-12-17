import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = new Koa();

// 中间件
app.use(
  cors({
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(bodyParser());

// 路由
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('服务器错误:', error);
    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message || '服务器内部错误',
    };
  }
});

// 404处理
app.use(async (ctx) => {
  if (ctx.status === 404) {
    ctx.status = 404;
    ctx.body = { error: '路由不存在' };
  }
});

export default app;

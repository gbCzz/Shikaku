import Router from 'koa-router';
import AuthController from '../controllers/authController.js';
import InitController from '../controllers/initController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = new Router({ prefix: '/api' });

// 初始化检查
router.get('/init', InitController.checkInit);

// 认证相关路由
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// 需要认证的路由
router.get('/auth/me', authMiddleware, AuthController.getCurrentUser);

export default router;


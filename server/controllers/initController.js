import { testConnection } from '../config/database.js';
import { initializeDatabase } from '../utils/databaseInit.js';

class InitController {
  // 检查并初始化应用
  static async checkInit(ctx) {
    try {
      // 测试数据库连接
      const isConnected = await testConnection();

      if (!isConnected) {
        // 尝试初始化数据库
        const initSuccess = await initializeDatabase();

        if (initSuccess) {
          // 再次测试连接
          const reconnected = await testConnection();
          ctx.status = 200;
          ctx.body = {
            initialized: reconnected,
            message: reconnected ? '数据库初始化成功' : '数据库连接失败',
          };
        } else {
          ctx.status = 500;
          ctx.body = { error: '数据库初始化失败' };
        }
      } else {
        ctx.status = 200;
        ctx.body = { initialized: true, message: '数据库连接正常' };
      }
    } catch (error) {
      console.error('初始化检查错误:', error);
      ctx.status = 500;
      ctx.body = { error: '初始化检查失败' };
    }
  }
}

export default InitController;

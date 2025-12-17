import app from './app.js';
import { testConnection } from './config/database.js';
import { initializeDatabase } from './utils/databaseInit.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('正在启动服务器...');

    // 检查数据库连接
    console.log('检查数据库连接...');
    const isConnected = await testConnection();

    if (!isConnected) {
      console.log('数据库连接失败，尝试初始化数据库...');
      const initSuccess = await initializeDatabase();

      if (!initSuccess) {
        console.error('数据库初始化失败，请检查MySQL服务是否运行');
        process.exit(1);
      }
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();

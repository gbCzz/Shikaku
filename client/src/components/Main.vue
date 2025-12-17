<template>
  <div class="main-container">
    <header class="main-header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">Shikaku 数方游戏</div>
          <div class="user-info">
            <span>欢迎，{{ authStore.user?.username }}</span>
            <button @click="handleLogout" class="btn-logout">退出登录</button>
          </div>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <!-- 数方游戏组件 -->
        <ShikakuGame />
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="main-footer">
      <div class="container">
        <div class="footer-content">
          <p class="copyright">© 2025 Shikaku 数方游戏. All rights reserved.</p>
          <div class="footer-links">
            <a href="#" @click.prevent="showInstructions" class="footer-link">
              游戏说明
            </a>
            <a href="#" @click.prevent="showAbout" class="footer-link">
              关于数方
            </a>
            <a href="#" @click.prevent="showShortcuts" class="footer-link">
              快捷键
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ShikakuGame from './ShikakuGame.vue';

const authStore = useAuthStore();

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout();
  }
}

function showInstructions() {
  alert(`
数方游戏规则：

游戏目标：
将网格分割成矩形块，使得每个矩形块恰好包含一个数字，
且矩形块的大小（格子数）等于该数字。

游戏规则：
1. 每个矩形块必须恰好包含一个数字
2. 矩形块的大小必须等于该数字
3. 矩形块之间不能重叠
4. 必须覆盖网格中的所有格子

操作方法：
• 点击并拖拽鼠标选择矩形区域
• 松开鼠标添加方块
• 点击已添加的方块可以删除
• 使用按钮进行游戏控制

获胜条件：
正确分割整个网格，满足所有规则！
  `);
}

function showAbout() {
  alert(`
关于数方游戏：

数方（Shikaku）是一种逻辑谜题，也称为"矩形拼图"或"四边形拼图"。
起源于日本，是一种流行的逻辑推理游戏。

游戏特点：
• 锻炼逻辑思维能力
• 培养空间想象力
• 适合所有年龄段的玩家
• 有无穷多种关卡变化

本项目基于 Vue3 + Koa2 + MySQL 技术栈开发，
提供了一个完整的在线数方游戏体验。
  `);
}

function showShortcuts() {
  alert(`
键盘快捷键：

ESC - 取消当前选择
R    - 重置游戏（需要按住 Ctrl 键）
鼠标操作：
• 左键拖拽 - 选择矩形区域
• 左键点击 - 快速选择数字为1的格子
• 右键点击 - 取消选择

使用快捷键可以让游戏操作更加流畅！
  `);
}

onMounted(() => {
  console.log('Main 页面加载完成');
});
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: #1e293b;
  color: white;
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info span {
  font-weight: 500;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  padding: 20px 0;
  background: #f5f7fa;
}

.main-footer {
  background: #1e293b;
  color: white;
  padding: 20px 0;
  text-align: center;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 6px;
  justify-content: center;
}

.footer-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.footer-links {
  justify-content: center;
  display: flex;
}

.footer-content {
    flex-direction: column;
    text-align: center;
  }
</style>
<template>
  <div class="main-container">
    <header class="main-header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">Shikaku</div>
          <div class="user-info">
            <span>欢迎，{{ authStore.user?.username }}</span>
            <button @click="handleLogout" class="btn-logout">退出登录</button>
          </div>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <div class="welcome-card">
          <h1>Hello World!</h1>
          <p class="subtitle">欢迎来到 Shikaku 主页面</p>
          <div class="user-details">
            <p><strong>用户名：</strong> {{ authStore.user?.username }}</p>
            <p><strong>邮箱：</strong> {{ authStore.user?.email }}</p>
            <p><strong>用户ID：</strong> {{ authStore.user?.id }}</p>
          </div>
          <div class="actions">
            <button @click="refreshUser" class="btn btn-secondary">刷新用户信息</button>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="main-footer">
      <div class="container">
        <p>© 2023 Shikaku. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
}

async function refreshUser() {
  await authStore.getCurrentUser();
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
  
  span {
    font-weight: 500;
  }
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.main-content {
  flex: 1;
  padding: 40px 0;
}

.welcome-card {
  background: white;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  
  h1 {
    font-size: 48px;
    color: var(--primary-color);
    margin-bottom: 20px;
  }
  
  .subtitle {
    font-size: 20px;
    color: var(--gray-color);
    margin-bottom: 40px;
  }
  
  .user-details {
    background: var(--light-color);
    border-radius: 8px;
    padding: 30px;
    margin: 40px 0;
    text-align: left;
    
    p {
      margin: 10px 0;
      font-size: 18px;
      
      strong {
        color: var(--dark-color);
        min-width: 100px;
        display: inline-block;
      }
    }
  }
  
  .actions {
    margin-top: 30px;
  }
}

.main-footer {
  background: var(--dark-color);
  color: white;
  padding: 20px 0;
  text-align: center;
}
</style>
<template>
  <div class="login-container">
    <div class="card">
      <h2 class="card-title">登录 Shikaku</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="form.username" placeholder="请输入用户名" required />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="form.password" placeholder="请输入密码" required />
        </div>

        <!-- 错误消息 -->
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="auth-links">
        <p>还没有账号？ <router-link to="/register">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

onMounted(() => {
  // 进入登录页面时清除错误
  authStore.clearError();
});

async function handleLogin() {
  if (!form.username.trim() || !form.password) {
    authStore.error = '请输入用户名和密码';
    return;
  }

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    });
  } catch (error) {
    // 错误已经在 store 中设置
    console.error('登录失败:', error);
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 30px;
  text-align: center;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
  color: var(--gray-color);
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.auth-links a:hover {
  text-decoration: underline;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--dark-color);
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin: 10px 0;
  padding: 10px;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  border-left: 4px solid var(--danger-color);
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: darken(#4a6ee0, 10%);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}
</style>

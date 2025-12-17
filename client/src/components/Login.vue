<template>
  <div class="login-container">
    <div class="card">
      <h2 class="card-title">登录 Shikaku</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            :class="{ error: errors.username }"
            placeholder="请输入用户名"
            required
          />
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            :class="{ error: errors.password }"
            placeholder="请输入密码"
            required
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div v-if="authStore.error" class="error-message" style="margin-bottom: 20px;">
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: ''
});

const errors = reactive({
  username: '',
  password: ''
});

function validateForm() {
  let isValid = true;
  
  // 重置错误信息
  Object.keys(errors).forEach(key => errors[key] = '');
  
  if (!form.username.trim()) {
    errors.username = '请输入用户名';
    isValid = false;
  }
  
  if (!form.password) {
    errors.password = '请输入密码';
    isValid = false;
  }
  
  return isValid;
}

async function handleLogin() {
  if (!validateForm()) return;
  
  try {
    await authStore.login({
      username: form.username,
      password: form.password
    });
  } catch (error) {
    console.error('登录失败:', error);
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
  color: var(--gray-color);
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.form-group {
  margin-bottom: 24px;
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 5px;
}
</style>
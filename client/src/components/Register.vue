<template>
  <div class="register-container">
    <div class="card">
      <h2 class="card-title">注册 Shikaku 账号</h2>
      
      <form @submit.prevent="handleRegister">
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
          <label for="email">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            :class="{ error: errors.email }"
            placeholder="请输入邮箱"
            required
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
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
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            :class="{ error: errors.confirmPassword }"
            placeholder="请再次输入密码"
            required
          />
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>
        
        <div v-if="authStore.error" class="error-message" style="margin-bottom: 20px;">
          {{ authStore.error }}
        </div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="auth-links">
        <p>已有账号？ <router-link to="/login">立即登录</router-link></p>
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
  email: '',
  password: '',
  confirmPassword: ''
});

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

function validateForm() {
  let isValid = true;
  
  // 重置错误信息
  Object.keys(errors).forEach(key => errors[key] = '');
  
  if (!form.username.trim()) {
    errors.username = '请输入用户名';
    isValid = false;
  }
  
  if (!form.email.trim()) {
    errors.email = '请输入邮箱';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  if (!form.password) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少为6位';
    isValid = false;
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码';
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }
  
  return isValid;
}

async function handleRegister() {
  if (!validateForm()) return;
  
  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    });
  } catch (error) {
    console.error('注册失败:', error);
  }
}
</script>

<style scoped>
.register-container {
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
</style>
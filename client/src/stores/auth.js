import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref(null);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  
  // API配置
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 请求拦截器 - 添加token
  api.interceptors.request.use(
    config => {
      if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // 响应拦截器 - 处理token过期
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // token过期或无效
        logout();
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );

  // 检查初始化状态
  async function checkInit() {
    try {
      const response = await api.get('/init');
      isInitialized.value = true;
      return response.data;
    } catch (err) {
      console.error('初始化检查失败:', err);
      throw err;
    }
  }

  function clearError() {
	error.value = null;
  }

  // 登录
  async function login(credentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await api.post('/auth/login', credentials);
      
      // 保存token和用户信息
      token.value = response.data.token;
      user.value = response.data.user;
      
      // 存储到localStorage
      localStorage.setItem('token', token.value);
      
      // 跳转到主页面
      router.push('/main');
      
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || '登录失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // 注册
  async function register(userData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await api.post('/auth/register', userData);
      
      // 自动登录
      await login({
        username: userData.username,
        password: userData.password
      });
      
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || '注册失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // 获取当前用户信息
  async function getCurrentUser() {
    if (!token.value) return;
    
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.user;
    } catch (err) {
      console.error('获取用户信息失败:', err);
      logout();
    }
  }

  // 登出
  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    router.push('/login');
  }

  // 初始化时检查token
  if (token.value) {
    getCurrentUser();
  }

  return {
    user,
    token,
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    checkInit,
	clearError,
    login,
    register,
    getCurrentUser,
    logout
  };
});
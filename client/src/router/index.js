import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/Register.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/components/Main.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 确保 store 已初始化
  if (!authStore.token && localStorage.getItem('token')) {
    authStore.init();
  }

  // 在路由切换时清除错误状态
  authStore.clearError();

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  // 检查是否要求未登录状态（如登录/注册页面）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/main');
    return;
  }

  next();
});

export default router;

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  // 初始化 auth store
  authStore.init();

  // 应用加载时检查初始化状态
  authStore.checkInit().catch((err) => {
    console.error('初始化检查失败:', err);
  });
});
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>


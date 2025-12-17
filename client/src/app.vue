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
  // 应用加载时检查初始化状态
  authStore.checkInit();
});
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
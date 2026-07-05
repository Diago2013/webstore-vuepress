<script setup lang="ts">
// 自定义布局 - 自动包裹导航栏与页脚
import WsNavbar from '../components/WsNavbar.vue'
import WsFooter from '../components/WsFooter.vue'
</script>

<template>
  <div class="ws-custom-layout">
    <WsNavbar />
    <main class="ws-main">
      <Content />
    </main>
    <WsFooter />
  </div>
</template>

<style scoped>
.ws-custom-layout {
  min-height: 100vh;
  background: var(--color-base);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.ws-main {
  flex: 1;
  width: 100%;
}
</style>

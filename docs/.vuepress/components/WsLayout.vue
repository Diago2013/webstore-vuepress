<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WsNavbar from './WsNavbar.vue'
import WsFooter from './WsFooter.vue'

const route = useRoute()
const router = useRouter()
const current = computed(() => {
  const path = route.path
  if (path === '/' || path === '') return 'home'
  if (path.startsWith('/category')) return 'category'
  if (path.startsWith('/tool')) return 'tool'
  if (path.startsWith('/profile')) return 'profile'
  if (path.startsWith('/developer')) return 'developer'
  if (path.startsWith('/co-creation')) return 'co-creation'
  if (path.startsWith('/community')) return 'community'
  if (path.startsWith('/incentive')) return 'incentive'
  return 'home'
})

const navigate = (link: string) => {
  router.push(link)
}
</script>

<template>
  <div class="ws-app">
    <WsNavbar :current="current" @navigate="navigate" />
    <main class="ws-main">
      <slot />
    </main>
    <WsFooter />
  </div>
</template>

<style scoped>
.ws-app {
  min-height: 100vh;
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

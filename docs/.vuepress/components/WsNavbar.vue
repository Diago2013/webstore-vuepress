<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import WsIcon from './shared/WsIcon.vue'
import { tools } from '../data/tools.ts'
import { communityTopics, developers } from '../data/community.ts'
import { userPoints, addSearchHistory, searchHistory } from '../store/useStore.ts'

const props = defineProps<{ current: string }>()
const router = useRouter()

const navItems = [
  { key: 'home', text: '首页', link: '/' },
  { key: 'category', text: '分类', link: '/category/' },
  { key: 'tool', text: '工具', link: '/tool/' },
  { key: 'profile', text: '我的', link: '/profile/' },
  { key: 'developer', text: '开发者', link: '/developer/' },
  { key: 'co-creation', text: '共创', link: '/co-creation/' },
  { key: 'community', text: '社区', link: '/community/' },
  { key: 'incentive', text: '激励', link: '/incentive/' }
]

const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const notiOpen = ref(false)
const voiceListening = ref(false)

const onlineCount = ref(12847)

// 通知列表
const notifications = ref([
  { id: 'n1', icon: '◆', title: 'PixelForge 发布新版本 v3.2.1', time: '2分钟前', read: false, color: '#00E5FF' },
  { id: 'n2', icon: '❤', title: '林深时见鹿 关注了您', time: '1小时前', read: false, color: '#FF6B6B' },
  { id: 'n3', icon: '✦', title: '您的话题被精选展示', time: '3小时前', read: false, color: '#C6FF3D' },
  { id: 'n4', icon: '▣', title: 'DataPulse 限时8折优惠', time: '昨天', read: true, color: '#FFB84D' },
  { id: 'n5', icon: '◈', title: '每周激励积分已发放 +120', time: '2天前', read: true, color: '#B794F4' }
])
const unreadNotiCount = computed(() => notifications.value.filter(n => !n.read).length)

// 搜索建议
const searchSuggestions = ['AI作图', '数据可视化', '语音克隆', 'Markdown编辑器', '零代码ML', '像素画', '录屏']

// 搜索结果（实时）
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return null
  const toolHits = tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.slogan.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q)) ||
    t.category.toLowerCase().includes(q)
  ).slice(0, 5).map(t => ({ type: '工具', id: t.id, title: t.name, desc: t.slogan, icon: t.icon, link: `/tool/?id=${t.id}` }))
  const devHits = developers.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.bio.toLowerCase().includes(q)
  ).slice(0, 3).map(d => ({ type: '开发者', id: d.id, title: d.name, desc: d.bio, icon: d.avatar, link: `/developer/` }))
  const topicHits = communityTopics.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.content.toLowerCase().includes(q)
  ).slice(0, 3).map(t => ({ type: '话题', id: t.id, title: t.title, desc: t.content.slice(0, 40), icon: '◉', link: `/community/` }))
  return [...toolHits, ...devHits, ...topicHits]
})

const onScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  setInterval(() => {
    onlineCount.value += Math.floor(Math.random() * 11) - 5
  }, 4000)
  // Esc 关闭浮层
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    searchOpen.value = false
    notiOpen.value = false
    mobileMenuOpen.value = false
  }
}

const emit = defineEmits<{ (e: 'navigate', link: string): void }>()
const go = (link: string) => {
  mobileMenuOpen.value = false
  emit('navigate', link)
}

// 执行搜索
const executeSearch = (q?: string) => {
  const query = (q ?? searchQuery.value).trim()
  if (!query) return
  addSearchHistory(query)
  // 直接跳到分类页并用 query 过滤
  searchOpen.value = false
  searchQuery.value = ''
  router.push({ path: '/category/', query: { q } })
}

// 点击提示词
const clickHint = (s: string) => {
  searchQuery.value = s
  executeSearch(s)
}

// 语音搜索
const startVoice = () => {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) {
    alert('当前浏览器不支持语音搜索，请使用 Chrome / Edge')
    return
  }
  const rec = new SR()
  rec.lang = 'zh-CN'
  rec.interimResults = false
  voiceListening.value = true
  rec.onresult = (e: any) => {
    const text = e.results[0][0].transcript
    searchQuery.value = text
    voiceListening.value = false
    executeSearch(text)
  }
  rec.onerror = () => { voiceListening.value = false }
  rec.onend = () => { voiceListening.value = false }
  rec.start()
}

// 图片搜索（Logo 识别模拟）
const startImageSearch = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    alert(`已上传图片：${file.name}\n[模拟] Logo识别引擎匹配中…已找到 3 个相似工具`)
    searchQuery.value = 'AI作图'
    executeSearch('AI作图')
  }
  input.click()
}

// 通知操作
const markAllNotiRead = () => {
  notifications.value.forEach(n => n.read = true)
}
const clickNoti = (n: any) => {
  n.read = true
  notiOpen.value = false
  go('/profile/')
}

// 跳转工具详情
const goResult = (link: string) => {
  searchOpen.value = false
  go(link)
}
</script>

<template>
  <header class="ws-navbar" :class="{ scrolled }">
    <div class="ws-navbar-inner">
      <!-- Logo -->
      <a class="ws-logo" @click="go('/')" aria-label="WebStore">
        <span class="ws-logo-mark">
          <span class="ws-logo-dot dot-cyan"></span>
          <span class="ws-logo-dot dot-lime"></span>
        </span>
        <span class="ws-logo-text">WebStore</span>
        <span class="ws-logo-badge">V3.0</span>
      </a>

      <!-- 桌面导航 -->
      <nav class="ws-nav-desktop">
        <a
          v-for="item in navItems"
          :key="item.key"
          class="ws-nav-item"
          :class="{ active: current === item.key }"
          @click="go(item.link)"
        >
          {{ item.text }}
          <span v-if="current === item.key" class="ws-nav-indicator"></span>
        </a>
      </nav>

      <!-- 右侧操作 -->
      <div class="ws-nav-actions">
        <button class="ws-icon-btn" @click="searchOpen = !searchOpen; notiOpen = false" aria-label="搜索">
          <WsIcon name="search" :size="18" />
        </button>
        <button class="ws-icon-btn ws-notification" @click="notiOpen = !notiOpen; searchOpen = false" aria-label="通知">
          <WsIcon name="bell" :size="18" />
          <span v-if="unreadNotiCount > 0" class="ws-badge-dot"></span>
        </button>
        <div class="ws-points-pill" @click="go('/incentive/')" title="我的积分">
          <WsIcon name="star" :size="13" color="var(--color-accent-amber)" />
          <span class="font-mono">{{ userPoints.toLocaleString() }}</span>
        </div>
        <div class="ws-online-count">
          <span class="ws-online-pulse"></span>
          <span class="ws-online-text">{{ onlineCount.toLocaleString() }}</span>
        </div>
        <button class="ws-avatar-btn" aria-label="个人中心" @click="go('/profile/')">
          <span class="ws-avatar">✿</span>
          <span class="ws-avatar-level">L7</span>
        </button>
        <button class="ws-icon-btn ws-mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="菜单">
          <WsIcon :name="mobileMenuOpen ? 'x' : 'menu'" :size="20" />
        </button>
      </div>
    </div>

    <!-- 搜索浮层 -->
    <Transition name="ws-search-slide">
      <div v-if="searchOpen" class="ws-search-overlay">
        <div class="ws-search-box">
          <WsIcon name="search" :size="20" color="var(--color-text-muted)" />
          <input
            v-model="searchQuery"
            class="ws-search-input"
            placeholder="搜索工具、开发者、分类…  支持文字 / 语音 / 图片Logo"
            autofocus
            @keydown.enter="executeSearch()"
          />
          <button class="ws-search-mode" :class="{ listening: voiceListening }" @click="startVoice" aria-label="语音搜索">
            <WsIcon name="mic" :size="18" />
            <span v-if="voiceListening" class="ws-voice-wave"></span>
          </button>
          <button class="ws-search-mode" @click="startImageSearch" aria-label="图片搜索">
            <WsIcon name="image" :size="18" />
          </button>
        </div>

        <!-- 实时搜索结果 -->
        <div v-if="searchResults && searchResults.length" class="ws-search-results">
          <div class="ws-results-list">
            <div
              v-for="r in searchResults"
              :key="r.type + r.id"
              class="ws-result-item"
              @click="goResult(r.link)"
            >
              <span class="ws-result-icon" :style="{ background: 'var(--color-surface-light)' }">{{ r.icon }}</span>
              <div class="ws-result-meta">
                <div class="ws-result-title">{{ r.title }}</div>
                <div class="ws-result-desc">{{ r.desc }}</div>
              </div>
              <span class="ws-result-type">{{ r.type }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="searchResults && searchResults.length === 0" class="ws-search-empty">
          未找到匹配结果，按回车查看全部
        </div>

        <!-- 历史 + 热搜 -->
        <div v-if="!searchQuery" class="ws-search-hints">
          <div v-if="searchHistory.length" class="ws-hint-row">
            <span class="ws-search-hint-label">最近搜索</span>
            <button v-for="h in searchHistory.slice(0, 5)" :key="h" class="ws-chip ws-chip-history" @click="clickHint(h)">{{ h }}</button>
          </div>
          <div class="ws-hint-row">
            <span class="ws-search-hint-label">大家在搜</span>
            <button v-for="s in searchSuggestions" :key="s" class="ws-chip" @click="clickHint(s)">{{ s }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 通知面板 -->
    <Transition name="ws-search-slide">
      <div v-if="notiOpen" class="ws-noti-overlay">
        <div class="ws-noti-header">
          <span class="ws-noti-title">通知中心</span>
          <button class="ws-noti-markall" @click="markAllNotiRead">全部已读</button>
        </div>
        <div class="ws-noti-list">
          <div
            v-for="n in notifications"
            :key="n.id"
            class="ws-noti-item"
            :class="{ unread: !n.read }"
            @click="clickNoti(n)"
          >
            <span class="ws-noti-icon" :style="{ background: n.color + '22', color: n.color }">{{ n.icon }}</span>
            <div class="ws-noti-body">
              <div class="ws-noti-text">{{ n.title }}</div>
              <div class="ws-noti-time font-mono">{{ n.time }}</div>
            </div>
            <span v-if="!n.read" class="ws-noti-dot"></span>
          </div>
        </div>
        <button class="ws-noti-viewall" @click="notiOpen = false; go('/profile/')">查看全部消息</button>
      </div>
    </Transition>

    <!-- 移动菜单 -->
    <Transition name="ws-mobile-menu">
      <nav v-if="mobileMenuOpen" class="ws-mobile-menu">
        <a
          v-for="item in navItems"
          :key="item.key"
          class="ws-mobile-item"
          :class="{ active: current === item.key }"
          @click="go(item.link)"
        >
          {{ item.text }}
          <WsIcon name="arrow-right" :size="16" />
        </a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.ws-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--transition-base);
  border-bottom: 1px solid transparent;
}

.ws-navbar.scrolled {
  background: linear-gradient(180deg, rgba(10, 14, 39, 0.85), rgba(10, 14, 39, 0.7));
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-bottom-color: var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* 顶部高光线 */
.ws-navbar.scrolled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), rgba(198, 255, 61, 0.3), transparent);
  pointer-events: none;
}

.ws-navbar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 14px var(--space-page);
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Logo - 带光晕动画 */
.ws-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform var(--transition-base);
}

.ws-logo:hover {
  transform: translateY(-1px);
}

.ws-logo-mark {
  position: relative;
  width: 30px;
  height: 30px;
}

.ws-logo-mark::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.3), transparent 70%);
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: -1;
}

.ws-logo:hover .ws-logo-mark::before {
  opacity: 1;
}

.ws-logo-dot {
  position: absolute;
  width: 19px;
  height: 19px;
  border-radius: 7px;
  transition: transform var(--transition-spring);
}

.ws-logo:hover .dot-cyan { transform: translate(-2px, -2px) rotate(-8deg); }
.ws-logo:hover .dot-lime { transform: translate(2px, 2px) rotate(8deg); }

.dot-cyan {
  background: linear-gradient(135deg, #00E5FF, #00B8D4);
  top: 0;
  left: 0;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.dot-lime {
  background: linear-gradient(135deg, #C6FF3D, #9EE830);
  bottom: 0;
  right: 0;
  mix-blend-mode: screen;
  box-shadow: 0 0 16px rgba(198, 255, 61, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.ws-logo-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.02em;
  color: var(--color-text);
  background: linear-gradient(135deg, #FFFFFF 0%, #B8BEDA 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ws-logo-badge {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-accent-cyan-soft);
  color: var(--color-accent-cyan);
  border: 1px solid rgba(0, 229, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.ws-logo-badge::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent);
  animation: ws-liquid-sheen 3s ease-in-out infinite;
  animation-delay: 1s;
}

/* 桌面导航 - 磁性悬停 */
.ws-nav-desktop {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0 auto;
  padding: 4px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ws-nav-item {
  position: relative;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
  white-space: nowrap;
  z-index: 1;
}

.ws-nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.04);
  opacity: 0;
  transition: opacity var(--transition-fast);
  z-index: -1;
}

.ws-nav-item:hover::before {
  opacity: 1;
}

.ws-nav-item:hover {
  color: var(--color-text);
}

.ws-nav-item.active {
  color: var(--color-base);
  font-weight: 600;
}

.ws-nav-item.active::before {
  opacity: 1;
  background: var(--gradient-cyan-lime);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
}

.ws-nav-indicator {
  display: none;
}

/* 右侧操作 */
.ws-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ws-icon-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.ws-icon-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 229, 255, 0.15), transparent 70%);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.ws-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan-soft);
  transform: translateY(-1px);
}

.ws-icon-btn:hover::before {
  opacity: 1;
}

.ws-icon-btn svg {
  position: relative;
  z-index: 1;
}

.ws-badge-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: var(--color-accent-coral);
  border-radius: 50%;
  border: 2px solid var(--color-base);
  box-shadow: 0 0 8px var(--color-accent-coral);
  z-index: 2;
}

.ws-badge-dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid var(--color-accent-coral);
  animation: ws-ripple 2s ease-out infinite;
}

.ws-online-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: linear-gradient(135deg, rgba(198, 255, 61, 0.08), rgba(198, 255, 61, 0.03));
  border: 1px solid rgba(198, 255, 61, 0.2);
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
}

.ws-online-count:hover {
  border-color: rgba(198, 255, 61, 0.4);
  box-shadow: 0 0 16px rgba(198, 255, 61, 0.15);
}

.ws-online-pulse {
  width: 8px;
  height: 8px;
  background: var(--color-accent-lime);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent-lime);
  animation: ws-blink 2s ease-in-out infinite;
  position: relative;
}

.ws-online-pulse::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid var(--color-accent-lime);
  opacity: 0.5;
  animation: ws-ripple 2s ease-out infinite;
}

.ws-online-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-accent-lime);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.ws-avatar-btn {
  position: relative;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  transition: transform var(--transition-base);
}

.ws-avatar-btn:hover {
  transform: scale(1.05);
}

.ws-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C8EEF, #B794F4);
  font-size: 18px;
  border: 2px solid var(--color-accent-cyan);
  box-shadow: var(--shadow-glow-cyan);
  position: relative;
  overflow: hidden;
}

.ws-avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  animation: ws-liquid-sheen 4s ease-in-out infinite;
}

.ws-avatar-level {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  background: var(--color-accent-lime);
  color: var(--color-base);
  border-radius: var(--radius-pill);
  border: 2px solid var(--color-base);
  box-shadow: 0 0 8px rgba(198, 255, 61, 0.5);
}

.ws-mobile-toggle {
  display: none;
}

/* 搜索浮层 - 升级 */
.ws-search-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(10, 14, 39, 0.95), rgba(10, 14, 39, 0.85));
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border-bottom: 1px solid var(--color-border);
  padding: 24px var(--space-page);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.ws-search-box {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(180deg, var(--color-surface), var(--color-base-elevated));
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
  position: relative;
}

.ws-search-box::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--color-accent-cyan), transparent, var(--color-accent-lime));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.ws-search-box:focus-within {
  border-color: transparent;
  box-shadow: var(--shadow-glow-cyan), 0 8px 24px rgba(0, 229, 255, 0.2);
  transform: translateY(-1px);
}

.ws-search-box:focus-within::before {
  opacity: 1;
}

.ws-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 15px;
  font-family: var(--font-body);
}

.ws-search-input::placeholder {
  color: var(--color-text-muted);
}

.ws-search-mode {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-search-mode:hover {
  color: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan-soft);
}

.ws-search-hints {
  max-width: 720px;
  margin: 14px auto 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ws-search-hint-label {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.ws-chip {
  padding: 5px 12px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-chip:hover {
  background: var(--color-accent-cyan-soft);
  color: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan-soft);
}

/* 移动菜单 */
.ws-mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(10, 14, 39, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  padding: 12px var(--space-page);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ws-mobile-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 15px;
  transition: all var(--transition-fast);
}

.ws-mobile-item.active,
.ws-mobile-item:hover {
  background: var(--color-accent-cyan-soft);
  color: var(--color-accent-cyan);
}

/* 过渡 */
.ws-search-slide-enter-active,
.ws-search-slide-leave-active,
.ws-mobile-menu-enter-active,
.ws-mobile-menu-leave-active {
  transition: all 0.3s var(--ease-out);
}

.ws-search-slide-enter-from,
.ws-search-slide-leave-to,
.ws-mobile-menu-enter-from,
.ws-mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (max-width: 1024px) {
  .ws-nav-desktop {
    display: none;
  }
  .ws-mobile-toggle {
    display: flex;
  }
  .ws-online-count {
    display: none;
  }
}

@media (max-width: 640px) {
  .ws-logo-badge {
    display: none;
  }
  .ws-icon-btn:not(.ws-mobile-toggle) {
    display: none;
  }
  .ws-points-pill { display: none; }
}

/* ===== 积分胶囊 ===== */
.ws-points-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  background: linear-gradient(135deg, rgba(255, 184, 77, 0.12), rgba(255, 107, 107, 0.06));
  border: 1px solid rgba(255, 184, 77, 0.3);
  border-radius: var(--radius-pill);
  color: var(--color-accent-amber);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-points-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(255, 184, 77, 0.25);
  background: linear-gradient(135deg, rgba(255, 184, 77, 0.2), rgba(255, 107, 107, 0.1));
}

/* ===== 语音波形 ===== */
.ws-voice-wave {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--color-accent-cyan);
  animation: ws-voice-pulse 1.2s ease-out infinite;
  pointer-events: none;
}

.ws-search-mode.listening {
  color: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan);
  background: var(--color-accent-cyan-soft);
}

@keyframes ws-voice-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* ===== 搜索结果 ===== */
.ws-search-results {
  max-width: 720px;
  margin: 12px auto 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card-hover);
}

.ws-results-list {
  max-height: 380px;
  overflow-y: auto;
}

.ws-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.ws-result-item:last-child { border-bottom: none; }

.ws-result-item:hover {
  background: var(--color-accent-cyan-soft);
}

.ws-result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.ws-result-meta { flex: 1; min-width: 0; }

.ws-result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
}

.ws-result-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ws-result-type {
  font-size: 10px;
  font-family: var(--font-mono);
  padding: 3px 8px;
  background: rgba(0, 229, 255, 0.1);
  color: var(--color-accent-cyan);
  border-radius: var(--radius-pill);
  border: 1px solid rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}

.ws-search-empty {
  max-width: 720px;
  margin: 12px auto 0;
  padding: 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

/* 搜索历史行 */
.ws-hint-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.ws-chip-history {
  background: rgba(198, 255, 61, 0.06) !important;
  color: var(--color-accent-lime) !important;
  border-color: rgba(198, 255, 61, 0.2) !important;
}

/* ===== 通知面板 ===== */
.ws-noti-overlay {
  position: absolute;
  top: 100%;
  right: var(--space-page);
  width: 380px;
  max-width: calc(100vw - 32px);
  margin-top: 8px;
  background: linear-gradient(180deg, rgba(20, 26, 60, 0.95), rgba(10, 14, 39, 0.95));
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 200;
}

.ws-noti-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
}

.ws-noti-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text);
}

.ws-noti-markall {
  font-size: 12px;
  color: var(--color-accent-cyan);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast);
}

.ws-noti-markall:hover {
  background: var(--color-accent-cyan-soft);
}

.ws-noti-list {
  max-height: 380px;
  overflow-y: auto;
}

.ws-noti-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
  position: relative;
}

.ws-noti-item:hover { background: rgba(255, 255, 255, 0.03); }

.ws-noti-item.unread {
  background: rgba(0, 229, 255, 0.04);
}

.ws-noti-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 16px;
  flex-shrink: 0;
}

.ws-noti-body { flex: 1; min-width: 0; }

.ws-noti-text {
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.4;
  margin-bottom: 4px;
}

.ws-noti-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.ws-noti-dot {
  position: absolute;
  top: 18px;
  right: 14px;
  width: 8px;
  height: 8px;
  background: var(--color-accent-coral);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent-coral);
}

.ws-noti-viewall {
  display: block;
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  border-top: 1px solid var(--color-border);
  color: var(--color-accent-cyan);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.ws-noti-viewall:hover {
  background: var(--color-accent-cyan-soft);
}
</style>

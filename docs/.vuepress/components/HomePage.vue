<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WsIcon from './shared/WsIcon.vue'
import WsToolCard from './shared/WsToolCard.vue'
import { tools, categories } from '../data/tools.ts'
import { pinnedTools, togglePin, isPinned } from '../store/useStore.ts'

const router = useRouter()

// AI对话向导
const aiMessages = ref([
  { role: 'ai', text: '你好，我是WebStore智能向导 ✨ 告诉我你想做什么，我来帮你找最合适的工具。' }
])
const aiInput = ref('')
const aiTyping = ref(false)

const aiSuggestions = [
  '我想做像素画游戏',
  '帮我找数据可视化工具',
  '需要语音合成工具',
  '零代码训练ML模型'
]

const sendAi = (text?: string) => {
  const content = (text ?? aiInput.value).trim()
  if (!content) return
  aiMessages.value.push({ role: 'user', text: content })
  aiInput.value = ''
  aiTyping.value = true
  setTimeout(() => {
    const reply = generateAiReply(content)
    aiMessages.value.push({ role: 'ai', text: reply })
    aiTyping.value = false
  }, 1200)
}

const generateAiReply = (q: string) => {
  if (q.includes('像素') || q.includes('游戏')) return '为你匹配到 PixelForge —— AI驱动的像素艺术工坊，免费且支持骨骼动画，非常适合独立游戏开发。还推荐 MarkdownFlow 用于编写游戏文档。'
  if (q.includes('数据') || q.includes('可视化')) return '推荐 DataPulse，拖拽式实时数据看板，支持数据库/API/Excel，30秒搭建专业看板。搭配 AutoMLKit 可实现智能数据分析。'
  if (q.includes('语音') || q.includes('合成')) return 'VoiceCraft 是最佳选择，3秒语音克隆，支持40+语种与情感控制，适合有声书与视频配音。'
  if (q.includes('ML') || q.includes('机器学习') || q.includes('模型')) return 'AutoMKit 零代码训练机器学习模型，上传数据自动选型，一键部署API，还有可解释性报告。'
  return `根据"${q}"，我为你筛选了 ${tools.length} 款相关工具。可以在下方分类中继续探索，或告诉我更具体的需求。`
}

// 心情主题板
const moods = [
  { id: 'focus', name: '专注创作', icon: '◈', time: '上午', color: 'linear-gradient(135deg, #00E5FF, #6C8EEF)', desc: '适合设计、写作、编码' },
  { id: 'explore', name: '探索发现', icon: '✦', time: '下午', color: 'linear-gradient(135deg, #C6FF3D, #00E5FF)', desc: '尝试新工具与新玩法' },
  { id: 'relax', name: '轻松效率', icon: '◐', time: '傍晚', color: 'linear-gradient(135deg, #FFB84D, #FF6B6B)', desc: '自动化与提效工具' },
  { id: 'deep', name: '深度学习', icon: '◢', time: '夜晚', color: 'linear-gradient(135deg, #B794F4, #6C8EEF)', desc: 'AI与数据深度工具' }
]
const currentMood = ref('focus')
const hour = new Date().getHours()
const autoMood = computed(() => {
  if (hour < 12) return 'focus'
  if (hour < 17) return 'explore'
  if (hour < 21) return 'relax'
  return 'deep'
})
onMounted(() => { currentMood.value = autoMood.value })

// 场景化专题
const scenes = [
  { id: 's1', title: '独立开发者全栈工具箱', desc: '从设计到部署，5款工具覆盖独立开发全流程', tools: ['t1', 't2', 't5', 't7', 't8'], gradient: 'linear-gradient(135deg, #00E5FF, #C6FF3D)' },
  { id: 's2', title: '数据分析师的早晨', desc: '30分钟从数据到洞察的完整工作流', tools: ['t3', 't6'], gradient: 'linear-gradient(135deg, #FF6B6B, #FFB84D)' },
  { id: 's3', title: '内容创作者AI装备', desc: 'AI语音+图像+写作，内容生产效率翻倍', tools: ['t4', 't1', 't5'], gradient: 'linear-gradient(135deg, #B794F4, #FF6B6B)' }
]
const activeScene = ref('s1')

// 置顶工具（持久化到 store）
const pinnedToolIds = pinnedTools

// 快捷筛选
const quickFilter = ref('all')
const filteredTools = computed(() => {
  if (quickFilter.value === 'free') return tools.filter(t => t.isFree)
  if (quickFilter.value === 'hot') return tools.filter(t => t.isHot)
  if (quickFilter.value === 'new') return tools.filter(t => t.isNew)
  return tools
})

// 跳转工具详情（带 ID）
const goTool = (id?: string) => {
  if (id) router.push({ path: '/tool/', query: { id } })
  else router.push('/tool/')
}

// 分类导航
const goCategory = (catId: string) => {
  if (catId === 'all') router.push('/category/')
  else router.push({ path: '/category/', query: { cat: catId } })
}

// 心情切换 - 影响推荐
const moodFilterMap: Record<string, string> = {
  focus: 'all',
  explore: 'new',
  relax: 'free',
  deep: 'hot'
}
const applyMood = (moodId: string) => {
  currentMood.value = moodId
  quickFilter.value = moodFilterMap[moodId] || 'all'
}
</script>

<template>
  <div class="ws-home">
    <!-- ===== Hero 区 ===== -->
    <section class="ws-hero">
      <div class="ws-hero-bg">
        <div class="ws-hero-grid"></div>
        <div class="ws-hero-glow glow-1"></div>
        <div class="ws-hero-glow glow-2"></div>
        <div class="ws-hero-glow glow-3"></div>
      </div>

      <div class="ws-container ws-hero-inner">
        <!-- 左侧文案 + AI向导 -->
        <div class="ws-hero-left">
          <span class="ws-section-eyebrow ws-anim-fade-up">网页版 APP STORE · V3.0</span>
          <h1 class="ws-hero-title ws-anim-fade-up ws-delay-1">
            找到好工具<br/>
            <span class="ws-gradient-animate">不如遇见好开发者</span>
          </h1>
          <p class="ws-hero-sub ws-anim-fade-up ws-delay-2">
            聚合全网工具、资源、服务类网页。智能发现 · 深度互动 · 生态互联 ——<br/>
            搭建用户与优质开发者的核心连接枢纽。
          </p>

          <!-- AI 对话向导 -->
          <div class="ws-ai-guide ws-anim-fade-up ws-delay-3">
            <div class="ws-ai-header">
              <span class="ws-ai-avatar"><WsIcon name="bulb" :size="16" color="var(--color-base)" /></span>
              <div>
                <div class="ws-ai-name">AI 智能向导</div>
                <div class="ws-ai-status"><span class="ws-online-pulse"></span>对话记录云端保存 · 可复用</div>
              </div>
            </div>

            <div class="ws-ai-messages">
              <div
                v-for="(msg, i) in aiMessages"
                :key="i"
                class="ws-ai-msg"
                :class="msg.role"
              >
                {{ msg.text }}
              </div>
              <div v-if="aiTyping" class="ws-ai-msg ai typing">
                <span class="ws-typing-dot"></span>
                <span class="ws-typing-dot"></span>
                <span class="ws-typing-dot"></span>
              </div>
            </div>

            <div class="ws-ai-suggestions">
              <button v-for="s in aiSuggestions" :key="s" class="ws-ai-chip" @click="sendAi(s)">{{ s }}</button>
            </div>

            <div class="ws-ai-input-row">
              <input
                v-model="aiInput"
                class="ws-ai-input"
                placeholder="用自然语言描述你的需求…"
                @keydown.enter="sendAi()"
              />
              <button class="ws-ai-send" @click="sendAi()" :disabled="!aiInput.trim()">
                <WsIcon name="send" :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧心情主题板 -->
        <div class="ws-hero-right ws-anim-scale-in ws-delay-2">
          <div class="ws-mood-board">
            <div class="ws-mood-header">
              <span class="ws-section-eyebrow" style="margin:0">动态心情主题板</span>
              <span class="ws-mood-time font-mono">{{ hour }}:00 · {{ moods.find(m => m.id === currentMood)?.time }}</span>
            </div>
            <div class="ws-mood-grid">
              <button
                v-for="mood in moods"
                :key="mood.id"
                class="ws-mood-card"
                :class="{ active: currentMood === mood.id, auto: autoMood === mood.id }"
                :style="{ background: mood.color }"
                @click="applyMood(mood.id)"
              >
                <span class="ws-mood-icon">{{ mood.icon }}</span>
                <span class="ws-mood-name">{{ mood.name }}</span>
                <span class="ws-mood-desc">{{ mood.desc }}</span>
                <span v-if="autoMood === mood.id" class="ws-mood-auto-tag">当前时段</span>
              </button>
            </div>
            <div class="ws-mood-footer">
              <WsIcon name="sparkles" :size="14" color="var(--color-accent-cyan)" v-if="false" />
              <span class="font-mono" style="font-size:11px;color:var(--color-text-muted)">切换主题板将调整首页风格与推荐工具</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 分类导航 + 置顶栏 ===== -->
    <section class="ws-section ws-container">
      <div class="ws-section-head">
        <div>
          <span class="ws-section-eyebrow">CATEGORIES</span>
          <h2 class="ws-section-title">分类导航</h2>
        </div>
        <div class="ws-quick-filters">
          <button class="ws-filter-chip" :class="{ active: quickFilter === 'all' }" @click="quickFilter = 'all'">全部</button>
          <button class="ws-filter-chip" :class="{ active: quickFilter === 'free' }" @click="quickFilter = 'free'">
            <WsIcon name="zap" :size="12" /> 免费
          </button>
          <button class="ws-filter-chip" :class="{ active: quickFilter === 'hot' }" @click="quickFilter = 'hot'">
            <WsIcon name="flame" :size="12" /> 热门
          </button>
          <button class="ws-filter-chip" :class="{ active: quickFilter === 'new' }" @click="quickFilter = 'new'">
            <WsIcon name="star" :size="12" /> 新上线
          </button>
        </div>
      </div>

      <!-- 分类胶囊 -->
      <div class="ws-category-row">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="ws-category-pill"
          @click="goCategory(cat.id)"
        >
          <span class="ws-cat-icon">{{ cat.icon }}</span>
          <span class="ws-cat-name">{{ cat.name }}</span>
          <span class="ws-cat-count font-mono">{{ cat.count }}</span>
        </button>
      </div>

      <!-- 置顶栏 -->
      <div class="ws-pinned-bar">
        <span class="ws-pinned-label"><WsIcon name="bookmark" :size="14" color="var(--color-accent-cyan)" /> 常用工具置顶</span>
        <div class="ws-pinned-list">
          <button
            v-for="id in pinnedToolIds"
            :key="id"
            class="ws-pinned-item"
            @click="goTool(id)"
          >
            <span class="ws-pinned-icon">{{ tools.find(t => t.id === id)?.icon }}</span>
            <span>{{ tools.find(t => t.id === id)?.name }}</span>
            <span class="ws-unpin" @click.stop="togglePin(id)" title="取消固定">×</span>
          </button>
          <span v-if="!pinnedToolIds.length" class="ws-pinned-empty">点击工具卡片星标即可置顶</span>
        </div>
      </div>
    </section>

    <!-- ===== 场景化专题轮播 ===== -->
    <section class="ws-section ws-container">
      <div class="ws-section-head">
        <div>
          <span class="ws-section-eyebrow">SCENARIO</span>
          <h2 class="ws-section-title">场景化专题</h2>
        </div>
        <p class="ws-section-desc">配套工具组合使用指南，一站式解决工作流</p>
      </div>

      <div class="ws-scene-tabs">
        <button
          v-for="scene in scenes"
          :key="scene.id"
          class="ws-scene-tab"
          :class="{ active: activeScene === scene.id }"
          @click="activeScene = scene.id"
        >
          {{ scene.title }}
        </button>
      </div>

      <div class="ws-scene-panel">
        <div class="ws-scene-info">
          <h3 class="ws-scene-title">{{ scenes.find(s => s.id === activeScene)?.title }}</h3>
          <p class="ws-scene-desc">{{ scenes.find(s => s.id === activeScene)?.desc }}</p>
          <div class="ws-scene-flow">
            <div v-for="(id, i) in scenes.find(s => s.id === activeScene)?.tools" :key="id" class="ws-scene-step">
              <span class="ws-step-num">{{ i + 1 }}</span>
              <span class="ws-step-name">{{ tools.find(t => t.id === id)?.name }}</span>
              <WsIcon v-if="i < (scenes.find(s => s.id === activeScene)?.tools.length || 0) - 1" name="arrow-right" :size="14" color="var(--color-text-muted)" />
            </div>
          </div>
        </div>
        <div class="ws-scene-visual" :style="{ background: scenes.find(s => s.id === activeScene)?.gradient }">
          <span class="ws-scene-icon">{{ scenes.find(s => s.id === activeScene)?.tools.length }} 款工具组合</span>
        </div>
      </div>
    </section>

    <!-- ===== 工具推荐网格 ===== -->
    <section class="ws-section ws-container">
      <div class="ws-section-head">
        <div>
          <span class="ws-section-eyebrow">DISCOVERY</span>
          <h2 class="ws-section-title">{{ quickFilter === 'hot' ? '热门推荐' : quickFilter === 'new' ? '新锐登场' : quickFilter === 'free' ? '免费精选' : '为你推荐' }}</h2>
        </div>
        <button class="ws-btn ws-btn-ghost" @click="goTool">查看全部 <WsIcon name="arrow-right" :size="14" /></button>
      </div>

      <div class="ws-tool-grid">
        <WsToolCard
          v-for="(tool, i) in filteredTools"
          :key="tool.id"
          :tool="tool"
          :class="`ws-anim-fade-up ws-delay-${(i % 8) + 1}`"
          @click="goTool(tool.id)"
        />
      </div>
    </section>

    <!-- ===== 平台价值 ===== -->
    <section class="ws-section ws-container ws-value-section">
      <div class="ws-value-head">
        <span class="ws-section-eyebrow">WHY WEBSTORE</span>
        <h2 class="ws-section-title">不只是工具目录<br/>而是<span class="text-gradient">双向共创社区</span></h2>
      </div>
      <div class="ws-value-grid">
        <div class="ws-value-card">
          <span class="ws-value-icon"><WsIcon name="shield" :size="22" color="var(--color-accent-cyan)" /></span>
          <h3>全链路信任体系</h3>
          <p>隐私检测 · 可用性监控 · 灰度风险管控，每个工具都有透明健康报告</p>
        </div>
        <div class="ws-value-card">
          <span class="ws-value-icon"><WsIcon name="users" :size="22" color="var(--color-accent-lime)" /></span>
          <h3>深度互动生态</h3>
          <p>私信 · 共创 · 答疑 · 社群，用户与开发者直接对话，反馈驱动迭代</p>
        </div>
        <div class="ws-value-card">
          <span class="ws-value-icon"><WsIcon name="bulb" :size="22" color="var(--color-accent-amber)" /></span>
          <h3>开发者赋能</h3>
          <p>竞品分析 · A/B 测试 · 自动化检测 · 用户触达，数据驱动产品增长</p>
        </div>
        <div class="ws-value-card">
          <span class="ws-value-icon"><WsIcon name="search" :size="22" color="var(--color-accent-violet)" /></span>
          <h3>多模态智能检索</h3>
          <p>文字 · 方言语音 · 图片Logo，三种方式找到心仪工具，降低查找门槛</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ws-home {
  position: relative;
  z-index: 2;
}

/* ===== Hero ===== */
.ws-hero {
  position: relative;
  padding: 80px 0 60px;
  overflow: hidden;
}

.ws-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.ws-hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%);
}

/* 升级的光球 - 多层渐变 + 动画 */
.ws-hero-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  mix-blend-mode: screen;
}

.glow-1 {
  background: radial-gradient(circle, var(--color-accent-cyan), transparent 70%);
  top: -200px;
  left: -100px;
  animation: ws-orb-float 18s ease-in-out infinite;
}

.glow-2 {
  background: radial-gradient(circle, var(--color-accent-lime), transparent 70%);
  top: -100px;
  right: -100px;
  opacity: 0.2;
  animation: ws-orb-float 22s ease-in-out infinite reverse;
}

.glow-3 {
  background: radial-gradient(circle, var(--color-accent-violet), transparent 70%);
  top: 40%;
  left: 30%;
  width: 400px;
  height: 400px;
  opacity: 0.15;
  filter: blur(140px);
  animation: ws-orb-float 28s ease-in-out infinite;
  animation-delay: -8s;
}

.ws-hero-inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 48px;
  align-items: start;
}

.ws-hero-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 5.5vw, 72px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 16px 0 20px;
  color: var(--color-text);
  position: relative;
}

.ws-hero-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--gradient-cyan-lime);
  border-radius: 2px;
  box-shadow: 0 0 16px var(--color-accent-cyan);
}

.ws-hero-sub {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
  max-width: 520px;
}

/* AI 向导 - 液态玻璃升级 */
.ws-ai-guide {
  background: linear-gradient(180deg, rgba(0, 229, 255, 0.06) 0%, rgba(255,255,255,0.015) 100%);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: 22px;
  max-width: 560px;
  box-shadow: var(--shadow-liquid);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  position: relative;
  overflow: hidden;
}

.ws-ai-guide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), transparent);
}

.ws-ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 14px;
}

.ws-ai-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-cyan-lime);
  border-radius: 12px;
  box-shadow: var(--shadow-glow-cyan);
  position: relative;
  overflow: hidden;
  animation: ws-breathe 4s ease-in-out infinite;
}

.ws-ai-avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  animation: ws-liquid-sheen 3s ease-in-out infinite;
}

.ws-ai-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text);
}

.ws-ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.ws-online-pulse {
  width: 6px;
  height: 6px;
  background: var(--color-accent-lime);
  border-radius: 50%;
  animation: ws-blink 2s ease-in-out infinite;
  box-shadow: 0 0 6px var(--color-accent-lime);
}

.ws-ai-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
  padding: 4px 0;
}

.ws-ai-msg {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  max-width: 88%;
  animation: ws-blur-up 0.5s var(--ease-out) both;
}

.ws-ai-msg.ai {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(0, 229, 255, 0.03));
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: var(--color-text);
  border-top-left-radius: 4px;
  align-self: flex-start;
  position: relative;
}

.ws-ai-msg.user {
  background: linear-gradient(135deg, var(--color-surface-light), var(--color-surface));
  color: var(--color-text);
  border-top-right-radius: 4px;
  align-self: flex-end;
  border: 1px solid var(--color-border);
}

.ws-ai-msg.typing {
  display: flex;
  gap: 4px;
  align-items: center;
}

.ws-typing-dot {
  width: 6px;
  height: 6px;
  background: var(--color-accent-cyan);
  border-radius: 50%;
  animation: ws-blink 1.4s infinite;
}

.ws-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.ws-typing-dot:nth-child(3) { animation-delay: 0.4s; }

.ws-ai-suggestions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.ws-ai-chip {
  font-size: 11px;
  padding: 5px 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-ai-chip:hover {
  background: var(--color-accent-cyan-soft);
  color: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 229, 255, 0.2);
}

.ws-ai-input-row {
  position: relative;
  display: flex;
  gap: 8px;
  padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
}

.ws-ai-input-row:focus-within {
  border-color: var(--color-accent-cyan);
  box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.1), 0 4px 16px rgba(0, 229, 255, 0.15);
}

.ws-ai-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 13px;
  padding: 8px 12px;
  font-family: var(--font-body);
}

.ws-ai-input::placeholder { color: var(--color-text-muted); }

.ws-ai-send {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-cyan-lime);
  color: var(--color-base);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-ai-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ws-ai-send:not(:disabled):hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-glow-cyan);
}

/* 心情主题板 - 液态玻璃 */
.ws-mood-board {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-liquid), var(--shadow-card);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  overflow: hidden;
}

.ws-mood-board::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5), rgba(198, 255, 61, 0.4), transparent);
  pointer-events: none;
}

.ws-mood-board::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 60%;
  height: 80%;
  background: radial-gradient(circle, rgba(183, 148, 244, 0.12), transparent 60%);
  pointer-events: none;
  animation: ws-orb-float 22s ease-in-out infinite;
}

.ws-mood-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.ws-mood-time {
  font-size: 11px;
  color: var(--color-accent-lime);
}

.ws-mood-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ws-mood-card {
  position: relative;
  padding: 18px 14px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer;
  transition: transform var(--transition-spring), box-shadow var(--transition-base), border-color var(--transition-fast);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 110px;
  color: var(--color-base);
  overflow: hidden;
  isolation: isolate;
}

.ws-mood-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.35));
  z-index: 0;
}

/* 流光扫过 */
.ws-mood-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  z-index: 2;
  pointer-events: none;
  transition: left 0.8s var(--ease-spring);
}

.ws-mood-card:hover::before { left: 130%; }

.ws-mood-card > * { z-index: 1; }

.ws-mood-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 0 0 24px rgba(0, 229, 255, 0.2);
}

.ws-mood-card.active {
  box-shadow: 0 0 0 2px var(--color-accent-cyan), var(--shadow-glow-cyan), 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: var(--color-accent-cyan);
}

.ws-mood-card.active::after {
  background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.45));
}

.ws-mood-icon {
  font-size: 26px;
  color: white;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
  transition: transform 0.5s var(--ease-spring);
}

.ws-mood-card:hover .ws-mood-icon {
  transform: scale(1.15) rotate(-6deg);
}

.ws-mood-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.ws-mood-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.85);
}

.ws-mood-auto-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 9px;
  font-family: var(--font-mono);
  padding: 2px 6px;
  background: rgba(0,0,0,0.4);
  color: white;
  border-radius: var(--radius-pill);
  z-index: 2;
}

.ws-mood-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ===== Section 通用 ===== */
.ws-section {
  padding: 56px 0;
  position: relative;
  z-index: 2;
}

.ws-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.ws-section-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 360px;
  text-align: right;
}

/* 快捷筛选 */
.ws-quick-filters {
  display: flex;
  gap: 6px;
}

.ws-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  font-size: 13px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.ws-filter-chip:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
  transform: translateY(-1px);
  background: rgba(255,255,255,0.06);
}

.ws-filter-chip.active {
  background: var(--gradient-cyan-lime);
  color: var(--color-base);
  border-color: transparent;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0, 229, 255, 0.25), 0 0 0 1px rgba(198, 255, 61, 0.3);
}

/* 分类行 */
.ws-category-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.ws-category-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text);
  cursor: pointer;
  transition: transform var(--transition-spring), border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-base);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

.ws-category-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-cyan-lime);
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: -1;
}

.ws-category-pill:hover {
  border-color: var(--color-accent-cyan);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 229, 255, 0.2), 0 0 0 1px rgba(0, 229, 255, 0.3);
  background: rgba(0, 229, 255, 0.08);
}

.ws-category-pill:hover .ws-cat-icon {
  transform: scale(1.2) rotate(8deg);
}

.ws-cat-icon {
  font-size: 16px;
  color: var(--color-accent-cyan);
  transition: transform var(--transition-spring);
  display: inline-block;
}

.ws-cat-name { font-size: 14px; font-weight: 500; }

.ws-cat-count {
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 7px;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  transition: all var(--transition-fast);
}

.ws-category-pill:hover .ws-cat-count {
  background: rgba(0, 229, 255, 0.15);
  color: var(--color-accent-cyan);
  border-color: rgba(0, 229, 255, 0.3);
}

/* 置顶栏 - 流光渐变 */
.ws-pinned-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.08), rgba(198, 255, 61, 0.04), transparent);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-cyan);
  border-radius: var(--radius-md);
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ws-pinned-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent);
  animation: ws-liquid-sheen 6s ease-in-out infinite;
  pointer-events: none;
}

.ws-pinned-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-accent-cyan);
  white-space: nowrap;
}

.ws-pinned-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ws-pinned-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-pinned-item:hover {
  border-color: var(--color-accent-cyan);
  background: rgba(0, 229, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 229, 255, 0.15);
}

.ws-pinned-item:hover .ws-pinned-icon {
  transform: scale(1.15);
}

.ws-pinned-icon {
  font-size: 14px;
  color: var(--color-accent-cyan);
  transition: transform var(--transition-spring);
}

.ws-unpin {
  margin-left: 4px;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.ws-unpin:hover { color: var(--color-accent-coral); }

.ws-pinned-empty {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
}

/* 场景专题 */
.ws-scene-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.ws-scene-tab {
  position: relative;
  padding: 10px 18px;
  font-size: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.ws-scene-tab:hover {
  color: var(--color-text);
  border-color: var(--color-border-strong);
  background: rgba(255,255,255,0.06);
  transform: translateY(-1px);
}

.ws-scene-tab.active {
  background: var(--color-base);
  color: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan);
  box-shadow: var(--shadow-glow-cyan), 0 8px 20px rgba(0, 229, 255, 0.25);
  font-weight: 600;
}

.ws-scene-tab.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: var(--color-accent-cyan);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent-cyan);
}

.ws-scene-panel {
  position: relative;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  align-items: center;
  min-height: 240px;
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow: var(--shadow-liquid);
  overflow: hidden;
}

.ws-scene-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), rgba(198, 255, 61, 0.3), transparent);
  pointer-events: none;
}

.ws-scene-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  margin: 0 0 10px;
  color: var(--color-text);
}

.ws-scene-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

.ws-scene-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ws-scene-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  transition: all var(--transition-fast);
}

.ws-scene-step:hover {
  background: rgba(0, 229, 255, 0.08);
  border-color: var(--color-accent-cyan-soft);
  transform: translateY(-1px);
}

.ws-step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--gradient-cyan-lime);
  color: var(--color-base);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono);
  box-shadow: 0 4px 10px rgba(0, 229, 255, 0.3);
}

.ws-step-name {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
}

.ws-scene-visual {
  height: 180px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform var(--transition-base);
}

.ws-scene-visual:hover {
  transform: scale(1.02);
}

.ws-scene-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35), transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0,0,0,0.2), transparent 60%);
  mix-blend-mode: overlay;
  pointer-events: none;
}

.ws-scene-visual::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
  animation: ws-liquid-sheen 5s ease-in-out infinite;
  pointer-events: none;
}

.ws-scene-icon {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 32px;
  color: rgba(255,255,255,0.98);
  z-index: 1;
  text-shadow: 0 4px 16px rgba(0,0,0,0.4);
  letter-spacing: 0.02em;
}

/* 工具网格 */
.ws-tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 价值区 */
.ws-value-section {
  padding-top: 80px;
}

.ws-value-head {
  text-align: center;
  margin-bottom: 48px;
}

.ws-value-head .ws-section-eyebrow {
  justify-content: center;
}

.ws-value-head .ws-section-title {
  font-size: clamp(32px, 4vw, 48px);
}

.ws-value-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.ws-value-card {
  position: relative;
  padding: 28px 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: transform var(--transition-spring), border-color var(--transition-base), box-shadow var(--transition-base);
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
}

/* 顶部高光线 */
.ws-value-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5), transparent);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.ws-value-card:hover {
  transform: translateY(-6px);
  border-color: var(--color-accent-cyan-soft);
  box-shadow: var(--shadow-liquid), 0 0 24px rgba(0, 229, 255, 0.15);
}

.ws-value-card:hover::before {
  opacity: 1;
}

.ws-value-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(198, 255, 61, 0.04));
  border: 1px solid rgba(0, 229, 255, 0.2);
  margin-bottom: 18px;
  transition: all var(--transition-spring);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.ws-value-card:hover .ws-value-icon {
  transform: scale(1.08) rotate(-4deg);
  box-shadow: 0 8px 20px rgba(0, 229, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.ws-value-card h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--color-text);
}

.ws-value-card p {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .ws-hero-inner { grid-template-columns: 1fr; }
  .ws-tool-grid { grid-template-columns: repeat(2, 1fr); }
  .ws-value-grid { grid-template-columns: repeat(2, 1fr); }
  .ws-scene-panel { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .ws-hero { padding: 40px 0 32px; }
  .ws-tool-grid { grid-template-columns: 1fr; }
  .ws-value-grid { grid-template-columns: 1fr; }
  .ws-section-desc { text-align: left; }
  .ws-mood-grid { grid-template-columns: 1fr 1fr; }
}
</style>

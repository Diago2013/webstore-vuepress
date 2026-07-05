<script setup lang="ts">
import { computed, ref } from 'vue'
import WsIcon from './WsIcon.vue'
import { gradients } from '../data/tools.ts'
import { isFavorited, toggleFavorite, isPinned, togglePin } from '../../store/useStore.ts'

const props = withDefaults(defineProps<{
  tool: any
  variant?: 'default' | 'compact' | 'featured'
  selectable?: boolean
  selected?: boolean
}>(), {
  variant: 'default',
  selectable: false,
  selected: false
})

const coverGradient = computed(() => gradients[props.tool.cover] || gradients['gradient-1'])

const formatHeat = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

const emit = defineEmits<{ (e: 'click', id: string): void; (e: 'select', id: string): void }>()

// 收藏与置顶（持久化）
const favorited = computed(() => isFavorited(props.tool.id))
const pinned = computed(() => isPinned(props.tool.id))
const onFav = (e: MouseEvent) => {
  e.stopPropagation()
  toggleFavorite(props.tool.id)
}
const onPin = (e: MouseEvent) => {
  e.stopPropagation()
  togglePin(props.tool.id)
}

// 3D 倾斜跟随鼠标
const cardRef = ref<HTMLElement | null>(null)
const tiltX = ref(0)
const tiltY = ref(0)
const spotX = ref(50)
const spotY = ref(50)
const isHovering = ref(false)

const onMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  spotX.value = x * 100
  spotY.value = y * 100
  tiltY.value = (x - 0.5) * 8
  tiltX.value = -(y - 0.5) * 8
}

const onEnter = () => {
  isHovering.value = true
}

const onLeave = () => {
  isHovering.value = false
  tiltX.value = 0
  tiltY.value = 0
  spotX.value = 50
  spotY.value = 50
}
</script>

<template>
  <article
    ref="cardRef"
    class="ws-tool-card"
    :class="[`variant-${variant}`, { selectable, selected, hovering: isHovering }]"
    :style="{
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${isHovering ? -6 : 0}px)`,
      '--spot-x': spotX + '%',
      '--spot-y': spotY + '%'
    }"
    @click="emit('click', tool.id)"
    @mousemove="onMove"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <!-- 封面 -->
    <div class="ws-card-cover" :style="{ background: coverGradient }">
      <span class="ws-card-icon">{{ tool.icon }}</span>
      <!-- 跟随光斑 -->
      <div class="ws-card-spotlight" :style="{ background: `radial-gradient(circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.3), transparent 50%)` }"></div>
      <!-- 状态标记 -->
      <div class="ws-card-badges">
        <span v-if="tool.isHot" class="ws-flag flag-hot">
          <WsIcon name="flame" :size="11" /> 热门
        </span>
        <span v-if="tool.isNew" class="ws-flag flag-new">
          <WsIcon name="zap" :size="11" /> 新上线
        </span>
        <span v-if="tool.isFree" class="ws-flag flag-free">免费</span>
      </div>

      <!-- 收藏 + 置顶 按钮组 -->
      <div class="ws-card-actions">
        <button class="ws-card-act" :class="{ active: favorited }" :title="favorited ? '取消收藏' : '收藏'" @click="onFav">
          <WsIcon name="heart" :size="14" :color="favorited ? '#FF6B6B' : 'rgba(255,255,255,0.85)'" />
        </button>
        <button class="ws-card-act" :class="{ active: pinned }" :title="pinned ? '取消置顶' : '置顶'" @click="onPin">
          <WsIcon name="bookmark" :size="14" :color="pinned ? '#00E5FF' : 'rgba(255,255,255,0.85)'" />
        </button>
      </div>
      <!-- 选择框 -->
      <label v-if="selectable" class="ws-card-check" @click.stop>
        <input type="checkbox" :checked="selected" @change="emit('select', tool.id)" />
        <span class="ws-check-box"></span>
      </label>
      <!-- 在线人数 -->
      <div class="ws-card-online">
        <span class="ws-online-pulse"></span>
        {{ tool.onlineUsers }} 在线
      </div>
      <!-- 底部渐变遮罩 -->
      <div class="ws-cover-fade"></div>
    </div>

    <!-- 内容 -->
    <div class="ws-card-body">
      <div class="ws-card-header">
        <h3 class="ws-card-name">{{ tool.name }}</h3>
        <span class="ws-card-version font-mono">{{ tool.version }}</span>
      </div>
      <p class="ws-card-slogan">{{ tool.slogan }}</p>

      <div class="ws-card-tags">
        <span v-for="tag in tool.tags.slice(0, 3)" :key="tag" class="ws-card-tag">{{ tag }}</span>
      </div>

      <!-- 评分与热度 -->
      <div class="ws-card-meta">
        <div class="ws-card-rating">
          <WsIcon name="star" :size="13" color="var(--color-accent-amber)" />
          <span class="ws-rating-num">{{ tool.rating }}</span>
          <span class="ws-rating-count">({{ tool.ratingCount }})</span>
        </div>
        <div class="ws-card-heat">
          <WsIcon name="trending-up" :size="13" color="var(--color-accent-lime)" />
          <span class="font-mono">{{ formatHeat(tool.heat24h) }}</span>
        </div>
      </div>

      <!-- 开发者 -->
      <div class="ws-card-dev">
        <span class="ws-dev-avatar">{{ tool.developerAvatar }}</span>
        <span class="ws-dev-name">{{ tool.developerName }}</span>
        <span v-if="tool.privacyScore === 5" class="ws-dev-trust">
          <WsIcon name="shield" :size="11" color="var(--color-accent-lime)" /> 隐私五星
        </span>
      </div>
    </div>

    <!-- 流光边框 -->
    <div class="ws-flow-border-layer"></div>
  </article>
</template>

<style scoped>
.ws-tool-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s var(--ease-out), box-shadow var(--transition-base), border-color var(--transition-base);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: var(--shadow-card);
  will-change: transform;
}

.ws-tool-card:hover {
  border-color: var(--color-accent-cyan-soft);
  box-shadow: var(--shadow-card-hover), var(--shadow-glow-cyan);
}

.ws-tool-card.selectable.selected {
  border-color: var(--color-accent-cyan);
  box-shadow: 0 0 0 2px var(--color-accent-cyan-soft);
}

/* 流光边框层 */
.ws-flow-border-layer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg,
    transparent 0%,
    var(--color-accent-cyan) 30%,
    transparent 50%,
    var(--color-accent-lime) 70%,
    transparent 100%
  );
  background-size: 200% 200%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
  animation: ws-border-flow 4s linear infinite;
}

.ws-tool-card:hover .ws-flow-border-layer {
  opacity: 0.8;
}

/* 封面 */
.ws-card-cover {
  position: relative;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ws-card-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 60%);
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* 跟随光斑 */
.ws-card-spotlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-base);
  mix-blend-mode: soft-light;
  z-index: 1;
}

.ws-tool-card.hovering .ws-card-spotlight {
  opacity: 1;
}

/* 底部渐变 */
.ws-cover-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.4));
  pointer-events: none;
}

.ws-card-icon {
  font-size: 56px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 200;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3));
  z-index: 2;
  transition: transform 0.4s var(--ease-spring);
}

.ws-tool-card:hover .ws-card-icon {
  transform: scale(1.08) translateY(-2px);
}

.ws-card-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  z-index: 3;
}

.ws-flag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

/* 收藏 + 置顶 按钮组 */
.ws-card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 3;
}

.ws-card-act {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0;
  transform: translateY(-4px);
}

.ws-tool-card:hover .ws-card-act {
  opacity: 1;
  transform: translateY(0);
}

.ws-card-act:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.ws-card-act.active {
  opacity: 1;
  transform: translateY(0);
  background: rgba(0, 0, 0, 0.6);
  border-color: currentColor;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
}

.flag-hot { background: rgba(255, 107, 107, 0.9); color: white; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3); }
.flag-new { background: rgba(198, 255, 61, 0.9); color: var(--color-base); box-shadow: 0 4px 12px rgba(198, 255, 61, 0.3); }
.flag-free { background: rgba(0, 229, 255, 0.9); color: var(--color-base); box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3); }

.ws-card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  cursor: pointer;
}

.ws-card-check input {
  display: none;
}

.ws-check-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all var(--transition-fast);
}

.ws-card-check input:checked + .ws-check-box {
  background: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan);
}

.ws-card-check input:checked + .ws-check-box::after {
  content: '✓';
  color: var(--color-base);
  font-weight: 700;
  font-size: 14px;
}

.ws-card-online {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-family: var(--font-mono);
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ws-online-pulse {
  width: 6px;
  height: 6px;
  background: var(--color-accent-lime);
  border-radius: 50%;
  animation: ws-blink 2s ease-in-out infinite;
  box-shadow: 0 0 6px var(--color-accent-lime);
}

/* 内容 */
.ws-card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  position: relative;
  z-index: 2;
}

.ws-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ws-card-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  margin: 0;
  color: var(--color-text);
  letter-spacing: -0.01em;
  transition: color var(--transition-fast);
}

.ws-tool-card:hover .ws-card-name {
  color: var(--color-accent-cyan);
}

.ws-card-version {
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.ws-card-slogan {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ws-card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ws-card-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.ws-tool-card:hover .ws-card-tag {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.ws-card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.ws-card-rating,
.ws-card-heat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.ws-rating-num {
  color: var(--color-accent-amber);
  font-weight: 600;
}

.ws-rating-count {
  color: var(--color-text-muted);
  font-size: 11px;
}

.ws-card-heat {
  color: var(--color-accent-lime);
  margin-left: auto;
}

.ws-card-dev {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.ws-dev-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-surface-light), var(--color-surface));
  font-size: 11px;
  border: 1px solid var(--color-border);
}

.ws-dev-name {
  color: var(--color-text-secondary);
}

.ws-dev-trust {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  color: var(--color-accent-lime);
  font-size: 10px;
  font-family: var(--font-mono);
}

/* 紧凑变体 */
.variant-compact .ws-card-cover {
  height: 96px;
}

.variant-compact .ws-card-icon {
  font-size: 36px;
}

.variant-compact .ws-card-slogan {
  -webkit-line-clamp: 1;
}

/* 精选变体 */
.variant-featured {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(198, 255, 61, 0.04));
  border-color: var(--color-border-strong);
}

.variant-featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-cyan-lime);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* 包容性 - 触屏设备禁用 3D 倾斜 */
@media (hover: none) and (pointer: coarse) {
  .ws-tool-card {
    transform: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ws-tool-card {
    transition: none !important;
    transform: none !important;
  }
}
</style>

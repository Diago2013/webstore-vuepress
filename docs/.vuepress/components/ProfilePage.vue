<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import WsIcon from './shared/WsIcon.vue'
import { currentUser, messages } from '../data/community.ts'
import { tools, getTool } from '../data/tools.ts'
import {
  isRead, markRead, markAllRead,
  toggleFavorite, isFavorited,
  userPoints, memberDays,
  addToolbox, removeToolbox, toolboxes as storeToolboxes,
  addNote, myNotes,
  isJoinedGroup, joinGroup
} from '../store/useStore.ts'

const router = useRouter()
const user = ref(currentUser)
const activeSection = ref<'overview' | 'toolbox' | 'messages' | 'interaction'>('overview')

// 用 store 中的积分 / 会员天数覆盖 mock 数据
const displayPoints = computed(() => userPoints.value)
const displayMemberDays = computed(() => memberDays.value)

// 等级进度
const levelProgress = computed(() => (user.value.exp / user.value.expToNext * 100))
const levelBenefits = [
  { level: 7, name: '内测优先审核', unlocked: true },
  { level: 7, name: '共创专属标识', unlocked: true },
  { level: 8, name: '高级测评权益', unlocked: false },
  { level: 9, name: '社区版主权限', unlocked: false },
  { level: 10, name: '年度大会投票权', unlocked: false }
]

// 工具箱：合并 store 与 mock 数据（store 优先）
const mergedToolboxes = computed(() => {
  // store 中的工具箱
  const storeTbs = storeToolboxes.value.map(tb => ({
    id: tb.id,
    name: tb.name,
    tools: tb.tools,
    reminder: tb.reminder,
    shareCode: 'WS-' + tb.id.toUpperCase().slice(-6),
    isCustom: true
  }))
  // mock 数据中的工具箱（仅保留 store 没有的）
  const mockTbs = user.value.toolboxes.map(tb => ({
    ...tb,
    tools: tb.tools.map(id => tools.find(t => t.id === id)).filter(Boolean).map((t: any) => t.id),
    isCustom: false
  }))
  return [...storeTbs, ...mockTbs]
})

const toolboxTools = computed(() => {
  return mergedToolboxes.value.map(tb => ({
    ...tb,
    tools: tb.tools.map((id: string) => getTool(id)).filter(Boolean)
  }))
})

const showShareCode = ref<string | null>(null)
const copiedCode = ref(false)
const copyShareCode = (code: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(code)
  }
  copiedCode.value = true
  setTimeout(() => copiedCode.value = false, 1500)
}

// 新建分组弹窗
const showNewGroup = ref(false)
const newGroupName = ref('')
const submitNewGroup = () => {
  if (!newGroupName.value.trim()) return
  addToolbox(newGroupName.value.trim())
  newGroupName.value = ''
  showNewGroup.value = false
}
const removeTb = (id: string) => {
  if (!confirm('确定删除此分组？')) return
  removeToolbox(id)
}

// 消息分类 — 使用 store 的已读状态
const messageFilter = ref<'all' | 'developer' | 'update' | 'interaction' | 'system' | 'unread'>('all')
const filteredMessages = computed(() => {
  if (messageFilter.value === 'all') return messages
  if (messageFilter.value === 'unread') return messages.filter(m => !isRead(m.id))
  return messages.filter(m => m.type === messageFilter.value)
})

const messageStats = computed(() => ({
  all: messages.length,
  unread: messages.filter(m => !isRead(m.id)).length,
  developer: messages.filter(m => m.type === 'developer').length,
  update: messages.filter(m => m.type === 'update').length,
  interaction: messages.filter(m => m.type === 'interaction').length,
  system: messages.filter(m => m.type === 'system').length
}))

const unreadCount = computed(() => messages.filter(m => !isRead(m.id)).length)

const clickMsg = (msg: any) => {
  if (!isRead(msg.id)) markRead(msg.id)
}
const markMsgRead = (msg: any) => {
  markRead(msg.id)
}
const markAllMessagesRead = () => {
  markAllRead(messages.map(m => m.id))
}

// 使用习惯数据
const weeklyData = user.value.usageStats.weeklyActivity
const maxWeekly = Math.max(...weeklyData)
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 推荐工具（基于用户未收藏的、不同分类）
const recommended = computed(() => {
  const favIds = [...new Set([
    ...user.value.toolboxes.flatMap(tb => tb.tools),
    ...user.value.following
  ])]
  // 简单推荐：用户未收藏的工具中评分高的
  return tools
    .filter(t => !isFavorited(t.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
})

const recAdded = ref<string[]>([])
const addRecToFavorites = (id: string) => {
  if (isFavorited(id)) return
  toggleFavorite(id)
  recAdded.value.push(id)
  setTimeout(() => {
    const idx = recAdded.value.indexOf(id)
    if (idx >= 0) recAdded.value.splice(idx, 1)
  }, 2000)
}
const goToolDetail = (id: string) => router.push({ path: '/tool/', query: { id } })

// 关注的开发者动态
const devFeed = [
  { dev: 'NovaStudio', avatar: '◆', action: '发布了新版本', target: 'PixelForge v3.2.1', time: '2小时前' },
  { dev: 'QuantumVue', avatar: '◢', action: '创建了答疑直播', target: 'DataPulse数据故事专场', time: '5小时前' },
  { dev: 'InkWell', avatar: '✦', action: '发布了开发者专栏', target: '我们如何设计MarkdownFlow', time: '昨天' },
  { dev: 'EchoAI', avatar: '◈', action: '开启了共创投票', target: '多人对话合成功能', time: '2天前' }
]

// 推送设置（持久化到 localStorage）
const pushSettingsKey = 'webstore_push_settings'
const loadPushSettings = () => {
  if (typeof window === 'undefined') return { version: true, live: true, daily: false }
  try {
    const raw = localStorage.getItem(pushSettingsKey)
    return raw ? JSON.parse(raw) : { version: true, live: true, daily: false }
  } catch { return { version: true, live: true, daily: false } }
}
const pushSettings = ref(loadPushSettings())
const savePushSettings = () => {
  try { localStorage.setItem(pushSettingsKey, JSON.stringify(pushSettings.value)) } catch {}
}

// 新建笔记
const showNewNote = ref(false)
const newNoteTool = ref('')
const newNoteType = ref<'bug' | 'tip'>('tip')
const newNoteText = ref('')
const submitNewNote = () => {
  if (!newNoteTool.value || !newNoteText.value.trim()) return
  addNote({
    tool: newNoteTool.value,
    type: newNoteType.value,
    text: newNoteText.value.trim(),
    status: 'pending'
  })
  newNoteTool.value = ''
  newNoteText.value = ''
  newNoteType.value = 'tip'
  showNewNote.value = false
}

// 笔记列表（store + mock 默认笔记）
const mockNotes = [
  { id: 'mn1', tool: 'PixelForge', type: 'bug', text: '大尺寸画布(4000x4000)拖动时偶发卡顿，Mac M1 Pro', status: '已采纳', isMock: true },
  { id: 'mn2', tool: 'DataPulse', type: 'tip', text: '用SQL变量参数化看板，能复用同一图表组件展示多维度', status: 'pending', isMock: true }
]
const allNotes = computed(() => {
  const storeNotes = myNotes.value.map(n => ({
    id: n.id,
    tool: n.tool,
    type: n.type,
    text: n.text,
    status: n.status || 'pending',
    isMock: false,
    createdAt: n.createdAt
  }))
  return [...storeNotes, ...mockNotes]
})

const shareNoteToDev = (note: any) => {
  alert(`已将笔记分享给 ${note.tool} 的开发者`)
  note.status = '已发送'
}

// 专属社群
const communities = [
  { id: 'c1', icon: '◈', name: 'PixelForge创作者社群', desc: '342人 · 活跃 · @NovaStudio 常驻', toolId: 't1' },
  { id: 'c2', icon: '◢', name: '数据可视化行业群', desc: '1.2k人 · 活跃 · 多开发者常驻', toolId: 't3' },
  { id: 'c3', icon: '✦', name: '独立开发者交流群', desc: '856人 · 活跃', toolId: '' }
]
const enterCommunity = (c: any) => {
  if (c.toolId) {
    joinGroup(c.id)
    router.push({ path: '/community/', query: { group: c.id } })
  } else {
    router.push('/community/')
  }
}
const joinedCommunities = computed(() => communities.map(c => ({ ...c, joined: isJoinedGroup(c.id) })))
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 用户头部卡片 -->
      <div class="ws-profile-hero ws-anim-fade-up">
        <div class="ws-profile-bg"></div>
        <div class="ws-profile-content">
          <div class="ws-profile-avatar-area">
            <span class="ws-profile-avatar">{{ user.avatar }}</span>
            <span v-if="user.isCoCreator" class="ws-cocreator-badge"><WsIcon name="star" :size="10" /> 共建</span>
          </div>
          <div class="ws-profile-info">
            <h1 class="ws-profile-name">{{ user.name }}</h1>
            <div class="ws-profile-meta">
              <span class="ws-level-badge">Lv.{{ user.level }}</span>
              <span class="ws-join-time font-mono">加入于 {{ user.joinDate }}</span>
              <span class="ws-points"><WsIcon name="zap" :size="12" color="var(--color-accent-lime)" /> {{ displayPoints.toLocaleString() }} 积分</span>
              <span class="ws-member-days font-mono">会员剩 {{ displayMemberDays }} 天</span>
            </div>
            <!-- 等级进度 -->
            <div class="ws-level-progress">
              <div class="ws-level-bar">
                <div class="ws-level-fill" :style="{ width: levelProgress + '%' }"></div>
              </div>
              <span class="ws-level-text font-mono">{{ user.exp }} / {{ user.expToNext }} XP</span>
              <span class="ws-level-next">距 Lv.{{ user.level + 1 }} 还需 {{ user.expToNext - user.exp }} XP</span>
            </div>
          </div>
          <div class="ws-profile-stats">
            <div class="ws-stat-block">
              <span class="ws-stat-num">{{ mergedToolboxes.reduce((s, t) => s + t.tools.length, 0) }}</span>
              <span class="ws-stat-label">收藏工具</span>
            </div>
            <div class="ws-stat-block">
              <span class="ws-stat-num">{{ user.following.length }}</span>
              <span class="ws-stat-label">关注开发者</span>
            </div>
            <div class="ws-stat-block">
              <span class="ws-stat-num">{{ user.badges.length }}</span>
              <span class="ws-stat-label">成就徽章</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 切换 -->
      <div class="ws-section-tabs">
        <button class="ws-section-tab" :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">
          <WsIcon name="grid" :size="14" /> 概览看板
        </button>
        <button class="ws-section-tab" :class="{ active: activeSection === 'toolbox' }" @click="activeSection = 'toolbox'">
          <WsIcon name="bookmark" :size="14" /> 工具箱
        </button>
        <button class="ws-section-tab" :class="{ active: activeSection === 'messages' }" @click="activeSection = 'messages'">
          <WsIcon name="bell" :size="14" /> 消息中心
          <span v-if="unreadCount" class="ws-unread-dot">{{ unreadCount }}</span>
        </button>
        <button class="ws-section-tab" :class="{ active: activeSection === 'interaction' }" @click="activeSection = 'interaction'">
          <WsIcon name="users" :size="14" /> 互动工具
        </button>
      </div>

      <!-- ===== 概览看板 ===== -->
      <div v-show="activeSection === 'overview'" class="ws-overview">
        <div class="ws-overview-grid">
          <!-- 使用习惯看板 -->
          <div class="ws-panel ws-usage-panel">
            <h3><WsIcon name="trending-up" :size="16" color="var(--color-accent-cyan)" /> 使用习惯数据看板</h3>
            <div class="ws-usage-stats">
              <div class="ws-usage-stat">
                <span class="ws-usage-num text-gradient">{{ user.usageStats.totalUsed }}</span>
                <span class="ws-usage-label">已使用工具</span>
              </div>
              <div class="ws-usage-stat">
                <span class="ws-usage-num font-mono">{{ user.usageStats.totalTime }}</span>
                <span class="ws-usage-label">总使用时长</span>
              </div>
              <div class="ws-usage-stat">
                <span class="ws-usage-num">{{ user.usageStats.favoriteCategory }}</span>
                <span class="ws-usage-label">最爱分类</span>
              </div>
            </div>
            <!-- 周活跃图 -->
            <div class="ws-weekly-chart">
              <div class="ws-weekly-bars">
                <div v-for="(v, i) in weeklyData" :key="i" class="ws-weekly-bar-wrap">
                  <div class="ws-weekly-bar" :style="{ height: (v / maxWeekly * 100) + '%' }" :title="`${v}次`"></div>
                  <span class="ws-weekly-day">{{ weekDays[i] }}</span>
                </div>
              </div>
              <p class="ws-weekly-summary">本周活跃度 <strong class="text-gradient">+18%</strong> · 个性化推荐已更新</p>
            </div>
          </div>

          <!-- 个性化推荐 -->
          <div class="ws-panel">
            <h3><WsIcon name="bulb" :size="16" color="var(--color-accent-lime)" /> 为你推荐</h3>
            <div class="ws-rec-list">
              <div v-for="t in recommended" :key="t.id" class="ws-rec-item">
                <span class="ws-rec-icon" @click="goToolDetail(t.id)">{{ t.icon }}</span>
                <div class="ws-rec-info" @click="goToolDetail(t.id)">
                  <h4>{{ t.name }}</h4>
                  <p>{{ t.slogan }}</p>
                </div>
                <button class="ws-rec-add" :class="{ added: recAdded.includes(t.id) }" @click="addRecToFavorites(t.id)">
                  <WsIcon :name="recAdded.includes(t.id) ? 'check' : 'plus'" :size="12" />
                </button>
              </div>
              <div v-if="!recommended.length" class="ws-rec-empty">已收藏全部工具，先去发现新工具吧！</div>
            </div>
          </div>

          <!-- 等级权益 -->
          <div class="ws-panel ws-benefits-panel">
            <h3><WsIcon name="trophy" :size="16" color="var(--color-accent-amber)" /> 等级权益 · Lv.{{ user.level }}</h3>
            <div class="ws-benefits-list">
              <div v-for="(b, i) in levelBenefits" :key="i" class="ws-benefit-item" :class="{ unlocked: b.unlocked }">
                <WsIcon :name="b.unlocked ? 'check-circle' : 'lock'" :size="14" :color="b.unlocked ? 'var(--color-accent-lime)' : 'var(--color-text-muted)'" />
                <span>{{ b.name }}</span>
                <span class="ws-benefit-level font-mono">Lv.{{ b.level }}</span>
              </div>
            </div>
          </div>

          <!-- 成就徽章 -->
          <div class="ws-panel ws-badges-panel">
            <h3><WsIcon name="star" :size="16" color="var(--color-accent-violet)" /> 成就徽章 · {{ user.badges.length }}枚</h3>
            <div class="ws-badges-grid">
              <div v-for="badge in user.badges" :key="badge.id" class="ws-badge-item" :class="badge.rarity">
                <span class="ws-badge-icon">{{ badge.icon }}</span>
                <span class="ws-badge-name">{{ badge.name }}</span>
                <span class="ws-badge-desc">{{ badge.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 工具箱管理 ===== -->
      <div v-show="activeSection === 'toolbox'" class="ws-toolbox">
        <div class="ws-toolbox-head">
          <div>
            <h2 class="ws-panel-title">工具箱项目分组管理</h2>
            <p class="ws-panel-sub">支持设置到期提醒 · 一键分享 · 共创笔记</p>
          </div>
          <button class="ws-btn ws-btn-primary" @click="showNewGroup = true"><WsIcon name="plus" :size="14" /> 新建分组</button>
        </div>

        <div class="ws-toolbox-grid">
          <div v-for="tb in toolboxTools" :key="tb.id" class="ws-toolbox-card" :class="{ 'ws-tb-custom': tb.isCustom }">
            <div class="ws-toolbox-card-head">
              <h3>{{ tb.name }} <span v-if="tb.isCustom" class="ws-tb-tag">自建</span></h3>
              <label class="ws-reminder-toggle">
                <input type="checkbox" v-model="tb.reminder" />
                <WsIcon name="bell" :size="13" :color="tb.reminder ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)'" />
                <span>{{ tb.reminder ? '提醒开' : '提醒关' }}</span>
              </label>
            </div>
            <div class="ws-toolbox-tools">
              <div v-for="t in tb.tools" :key="t.id" class="ws-toolbox-tool" @click="goToolDetail(t.id)">
                <span class="ws-tool-icon">{{ t.icon }}</span>
                <div>
                  <div class="ws-tool-name">{{ t.name }}</div>
                  <div class="ws-tool-ver font-mono">{{ t.version }}</div>
                </div>
              </div>
              <div v-if="!tb.tools.length" class="ws-tb-empty">暂无工具，去收藏一些吧</div>
            </div>
            <div class="ws-toolbox-actions">
              <button class="ws-tb-action" @click="showShareCode = tb.id">
                <WsIcon name="share" :size="13" /> 分享
              </button>
              <button class="ws-tb-action"><WsIcon name="file" :size="13" /> 共创笔记</button>
              <button v-if="tb.isCustom" class="ws-tb-action ws-tb-danger" @click="removeTb(tb.id)"><WsIcon name="trash" :size="13" /> 删除</button>
              <button v-else class="ws-tb-action"><WsIcon name="settings" :size="13" /> 管理</button>
            </div>
            <Transition name="ws-slide-down">
              <div v-if="showShareCode === tb.id" class="ws-share-code">
                <span>分享码</span>
                <code class="font-mono">{{ tb.shareCode }}</code>
                <button @click="copyShareCode(tb.shareCode)">
                  <WsIcon :name="copiedCode ? 'check' : 'copy'" :size="12" :color="copiedCode ? 'var(--color-accent-lime)' : 'var(--color-accent-cyan)'" />
                </button>
                <span v-if="copiedCode" class="ws-copied-tip">已复制</span>
              </div>
            </Transition>
          </div>
        </div>

        <!-- 新建分组弹窗 -->
        <Transition name="ws-fade">
          <div v-if="showNewGroup" class="ws-modal-mask" @click.self="showNewGroup = false">
            <div class="ws-modal-box">
              <h3>新建工具箱分组</h3>
              <input v-model="newGroupName" class="ws-modal-input" placeholder="如：写作工具 / 数据分析 / 学习笔记…" autofocus
                @keydown.enter="submitNewGroup" />
              <div class="ws-modal-actions">
                <button class="ws-btn ws-btn-ghost" @click="showNewGroup = false">取消</button>
                <button class="ws-btn ws-btn-primary" @click="submitNewGroup"><WsIcon name="check" :size="13" /> 创建</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ===== 消息中心 ===== -->
      <div v-show="activeSection === 'messages'" class="ws-messages">
        <div class="ws-msg-head">
          <div>
            <h2 class="ws-panel-title">消息智能分类</h2>
            <p class="ws-panel-sub">{{ unreadCount }} 条未读 · 自定义推送渠道</p>
          </div>
          <div class="ws-msg-actions">
            <button class="ws-btn ws-btn-ghost" :disabled="!unreadCount" @click="markAllMessagesRead"><WsIcon name="check" :size="13" /> 全部已读</button>
            <button class="ws-btn ws-btn-ghost"><WsIcon name="settings" :size="13" /> 推送设置</button>
          </div>
        </div>

        <div class="ws-msg-filters">
          <button class="ws-msg-filter" :class="{ active: messageFilter === 'all' }" @click="messageFilter = 'all'">全部 {{ messageStats.all }}</button>
          <button class="ws-msg-filter" :class="{ active: messageFilter === 'unread' }" @click="messageFilter = 'unread'">未读 {{ messageStats.unread }}</button>
          <button class="ws-msg-filter" :class="{ active: messageFilter === 'developer' }" @click="messageFilter = 'developer'">开发者动态 {{ messageStats.developer }}</button>
          <button class="ws-msg-filter" :class="{ active: messageFilter === 'update' }" @click="messageFilter = 'update'">工具更新 {{ messageStats.update }}</button>
          <button class="ws-msg-filter" :class="{ active: messageFilter === 'interaction' }" @click="messageFilter = 'interaction'">互动通知 {{ messageStats.interaction }}</button>
          <button class="ws-msg-filter" :class="{ active: messageFilter === 'system' }" @click="messageFilter = 'system'">系统公告 {{ messageStats.system }}</button>
        </div>

        <div class="ws-msg-list">
          <div
            v-for="msg in filteredMessages"
            :key="msg.id"
            class="ws-msg-item"
            :class="{ unread: !isRead(msg.id), [msg.priority]: true }"
            @click="clickMsg(msg)"
          >
            <span class="ws-msg-avatar" :class="msg.type">{{ msg.avatar }}</span>
            <div class="ws-msg-body">
              <div class="ws-msg-head-row">
                <span class="ws-msg-from">{{ msg.from }}</span>
                <span class="ws-msg-priority" :class="msg.priority">{{ msg.priority === 'high' ? '重要' : msg.priority === 'medium' ? '一般' : '通知' }}</span>
                <span class="ws-msg-time font-mono">{{ msg.time }}</span>
              </div>
              <h4>{{ msg.title }}</h4>
              <p>{{ msg.desc }}</p>
            </div>
            <button v-if="!isRead(msg.id)" class="ws-msg-read-btn" @click.stop="markMsgRead(msg)" title="标记已读">
              <WsIcon name="check" :size="12" />
            </button>
            <WsIcon v-else name="check-circle" :size="14" color="var(--color-text-muted)" />
          </div>
          <div v-if="!filteredMessages.length" class="ws-msg-empty">
            <WsIcon name="check-circle" :size="32" color="var(--color-text-muted)" />
            <p>暂无消息</p>
          </div>
        </div>
      </div>

      <!-- ===== 互动工具 ===== -->
      <div v-show="activeSection === 'interaction'" class="ws-interaction-tools">
        <div class="ws-interaction-grid">
          <!-- 关注动态 -->
          <div class="ws-panel">
            <h3><WsIcon name="users" :size="16" color="var(--color-accent-cyan)" /> 关注精细化推送</h3>
            <p class="ws-panel-sub">独立信息流聚合开发者全部更新、活动</p>
            <div class="ws-follow-feed">
              <div v-for="(f, i) in devFeed" :key="i" class="ws-follow-item">
                <span class="ws-follow-avatar">{{ f.avatar }}</span>
                <div class="ws-follow-content">
                  <span class="ws-follow-text"><strong>{{ f.dev }}</strong> {{ f.action }} <span class="ws-follow-target">{{ f.target }}</span></span>
                  <span class="ws-follow-time font-mono">{{ f.time }}</span>
                </div>
              </div>
            </div>
            <div class="ws-push-toggles">
              <label class="ws-toggle"><input type="checkbox" v-model="pushSettings.version" @change="savePushSettings" /><span>新版本发布</span></label>
              <label class="ws-toggle"><input type="checkbox" v-model="pushSettings.live" @change="savePushSettings" /><span>直播活动</span></label>
              <label class="ws-toggle"><input type="checkbox" v-model="pushSettings.daily" @change="savePushSettings" /><span>日常动态</span></label>
            </div>
          </div>

          <!-- 共创笔记 -->
          <div class="ws-panel">
            <h3><WsIcon name="file" :size="16" color="var(--color-accent-lime)" /> 收藏夹共创笔记</h3>
            <p class="ws-panel-sub">记录BUG、使用技巧 · 一键分享对应开发者</p>
            <div class="ws-notes-list">
              <div v-for="note in allNotes" :key="note.id" class="ws-note-item">
                <div class="ws-note-head">
                  <span class="ws-note-tag" :class="note.type">{{ note.type === 'bug' ? 'BUG' : '技巧' }}</span>
                  <span class="ws-note-tool">{{ note.tool }}</span>
                  <span v-if="!note.isMock" class="ws-note-new-tag">新建</span>
                </div>
                <p class="ws-note-text">{{ note.text }}</p>
                <div class="ws-note-actions">
                  <button class="ws-note-btn" @click="shareNoteToDev(note)"><WsIcon name="share" :size="11" /> 分享给开发者</button>
                  <span class="ws-note-status" :class="{ adopted: note.status === '已采纳' }">{{ note.status === '已采纳' ? '已采纳' : note.status === '已发送' ? '已发送' : '待处理' }}</span>
                </div>
              </div>
            </div>
            <button class="ws-btn ws-btn-ghost ws-full-btn" @click="showNewNote = true"><WsIcon name="plus" :size="13" /> 新建笔记</button>
          </div>

          <!-- 专属社群 -->
          <div class="ws-panel ws-community-panel">
            <h3><WsIcon name="chat" :size="16" color="var(--color-accent-violet)" /> 工具/行业专属社群</h3>
            <p class="ws-panel-sub">自动生成 · 可@开发者答疑 · 优质问答同步FAQ</p>
            <div class="ws-community-list">
              <div v-for="c in joinedCommunities" :key="c.id" class="ws-community-item">
                <span class="ws-comm-icon">{{ c.icon }}</span>
                <div>
                  <h4>{{ c.name }}</h4>
                  <span class="ws-comm-meta">{{ c.desc }}</span>
                </div>
                <button class="ws-comm-enter" :class="{ joined: c.joined }" @click="enterCommunity(c)">
                  {{ c.joined ? '进入' : '加入' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 新建笔记弹窗 -->
        <Transition name="ws-fade">
          <div v-if="showNewNote" class="ws-modal-mask" @click.self="showNewNote = false">
            <div class="ws-modal-box ws-modal-box-lg">
              <h3>新建共创笔记</h3>
              <div class="ws-form-row">
                <label>工具名称</label>
                <select v-model="newNoteTool" class="ws-modal-input">
                  <option value="">选择工具</option>
                  <option v-for="t in tools" :key="t.id" :value="t.name">{{ t.name }}</option>
                </select>
              </div>
              <div class="ws-form-row">
                <label>类型</label>
                <div class="ws-radio-group">
                  <label class="ws-radio"><input type="radio" v-model="newNoteType" value="tip" /><span>技巧</span></label>
                  <label class="ws-radio"><input type="radio" v-model="newNoteType" value="bug" /><span>BUG</span></label>
                </div>
              </div>
              <div class="ws-form-row">
                <label>内容</label>
                <textarea v-model="newNoteText" class="ws-modal-textarea" placeholder="详细描述您发现的技巧或问题…" rows="4"></textarea>
              </div>
              <div class="ws-modal-actions">
                <button class="ws-btn ws-btn-ghost" @click="showNewNote = false">取消</button>
                <button class="ws-btn ws-btn-primary" @click="submitNewNote"><WsIcon name="check" :size="13" /> 提交（+3 积分）</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ws-page { padding: 32px 0 80px; position: relative; z-index: 2; }

/* 用户头部 */
.ws-profile-hero { position: relative; padding: 32px; background: linear-gradient(180deg, rgba(0,229,255,0.06), rgba(255,255,255,0.01)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-lg); margin-bottom: 24px; overflow: hidden; }
.ws-profile-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at top right, rgba(0,229,255,0.12), transparent 60%), radial-gradient(ellipse at bottom left, rgba(198,255,61,0.08), transparent 60%); pointer-events: none; }
.ws-profile-content { position: relative; display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: center; }
.ws-profile-avatar-area { position: relative; }
.ws-profile-avatar { display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #6C8EEF, #B794F4); font-size: 40px; border: 3px solid var(--color-accent-cyan); box-shadow: var(--shadow-glow-cyan); }
.ws-cocreator-badge { position: absolute; bottom: -6px; right: -6px; display: inline-flex; align-items: center; gap: 2px; font-size: 9px; padding: 3px 7px; background: var(--color-accent-lime); color: var(--color-base); border-radius: var(--radius-pill); font-family: var(--font-mono); font-weight: 700; border: 2px solid var(--color-base); }
.ws-profile-name { font-family: var(--font-display); font-weight: 700; font-size: 28px; margin: 0 0 8px; }
.ws-profile-meta { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; font-size: 13px; color: var(--color-text-muted); margin-bottom: 14px; }
.ws-level-badge { font-family: var(--font-mono); font-weight: 700; padding: 3px 10px; background: var(--gradient-cyan-lime); color: var(--color-base); border-radius: var(--radius-pill); font-size: 12px; }
.ws-points { display: inline-flex; align-items: center; gap: 4px; color: var(--color-accent-lime); }
.ws-level-progress { max-width: 480px; }
.ws-level-bar { height: 8px; background: var(--color-surface); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
.ws-level-fill { height: 100%; background: var(--gradient-cyan-lime); border-radius: 4px; box-shadow: 0 0 12px rgba(0,229,255,0.4); }
.ws-level-text { font-size: 12px; color: var(--color-text-secondary); }
.ws-level-next { font-size: 11px; color: var(--color-text-muted); margin-left: 8px; }
.ws-profile-stats { display: flex; gap: 20px; }
.ws-stat-block { display: flex; flex-direction: column; align-items: center; padding: 12px 18px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-stat-num { font-family: var(--font-display); font-weight: 700; font-size: 24px; color: var(--color-accent-cyan); }
.ws-stat-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); margin-top: 2px; }

/* Section Tab */
.ws-section-tabs { display: flex; gap: 6px; margin-bottom: 28px; border-bottom: 1px solid var(--color-border); overflow-x: auto; }
.ws-section-tab { display: inline-flex; align-items: center; gap: 6px; padding: 12px 18px; font-size: 14px; background: none; border: none; color: var(--color-text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--transition-fast); white-space: nowrap; position: relative; }
.ws-section-tab:hover { color: var(--color-text); }
.ws-section-tab.active { color: var(--color-accent-cyan); border-bottom-color: var(--color-accent-cyan); }
.ws-unread-dot { font-size: 10px; padding: 1px 6px; background: var(--color-accent-coral); color: white; border-radius: var(--radius-pill); font-family: var(--font-mono); }

/* 概览 */
.ws-overview-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
.ws-panel { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-panel h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 16px; margin: 0 0 14px; }
.ws-panel-title { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin: 0; }
.ws-panel-sub { font-size: 13px; color: var(--color-text-muted); margin: 4px 0 0; }

.ws-usage-stats { display: flex; gap: 24px; margin-bottom: 20px; }
.ws-usage-stat { display: flex; flex-direction: column; }
.ws-usage-num { font-family: var(--font-display); font-weight: 700; font-size: 28px; }
.ws-usage-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); margin-top: 2px; }
.ws-weekly-chart { padding: 16px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); }
.ws-weekly-bars { display: flex; gap: 8px; align-items: flex-end; height: 100px; margin-bottom: 10px; }
.ws-weekly-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ws-weekly-bar { width: 100%; background: var(--gradient-cyan-lime); border-radius: 4px 4px 0 0; min-height: 8px; opacity: 0.85; transition: opacity 0.2s; }
.ws-weekly-bar:hover { opacity: 1; }
.ws-weekly-day { font-size: 10px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-weekly-summary { font-size: 12px; color: var(--color-text-secondary); margin: 8px 0 0; text-align: center; }

.ws-rec-list { display: flex; flex-direction: column; gap: 10px; }
.ws-rec-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast); }
.ws-rec-item:hover { border-color: var(--color-accent-cyan-soft); transform: translateX(2px); }
.ws-rec-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--color-surface-light); border-radius: 10px; font-size: 20px; color: var(--color-accent-cyan); }
.ws-rec-info { flex: 1; }
.ws-rec-info h4 { font-size: 14px; margin: 0 0 2px; font-weight: 600; }
.ws-rec-info p { font-size: 12px; color: var(--color-text-muted); margin: 0; }
.ws-rec-add { width: 28px; height: 28px; background: var(--color-accent-cyan-soft); border: 1px solid var(--color-accent-cyan-soft); border-radius: 50%; color: var(--color-accent-cyan); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
.ws-rec-add:hover { background: var(--color-accent-cyan); color: var(--color-base); }
.ws-rec-add.added { background: var(--color-accent-lime); border-color: var(--color-accent-lime); color: var(--color-base); }
.ws-rec-empty { padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 13px; }

.ws-benefits-list { display: flex; flex-direction: column; gap: 10px; }
.ws-benefit-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; color: var(--color-text-muted); }
.ws-benefit-item.unlocked { color: var(--color-text); border-color: rgba(198,255,61,0.2); background: rgba(198,255,61,0.04); }
.ws-benefit-level { margin-left: auto; font-size: 11px; }

.ws-badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ws-badge-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-align: center; }
.ws-badge-item.gold { border-color: rgba(255,184,77,0.3); background: rgba(255,184,77,0.05); }
.ws-badge-item.silver { border-color: rgba(139,146,176,0.25); }
.ws-badge-icon { font-size: 28px; }
.ws-badge-item.gold .ws-badge-icon { color: var(--color-accent-amber); }
.ws-badge-name { font-size: 12px; font-weight: 600; color: var(--color-text); }
.ws-badge-desc { font-size: 10px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 工具箱 */
.ws-toolbox-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
.ws-toolbox-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.ws-toolbox-card { padding: 20px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-toolbox-card.ws-tb-custom { border-color: rgba(198,255,61,0.2); }
.ws-toolbox-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ws-toolbox-card-head h3 { font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 0; display: flex; align-items: center; gap: 8px; }
.ws-tb-tag { font-size: 9px; padding: 2px 6px; background: var(--color-accent-lime-soft); color: var(--color-accent-lime); border-radius: var(--radius-pill); font-family: var(--font-mono); font-weight: 700; }
.ws-reminder-toggle { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-muted); cursor: pointer; font-family: var(--font-mono); }
.ws-reminder-toggle input { display: none; }
.ws-toolbox-tools { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ws-toolbox-tool { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast); }
.ws-toolbox-tool:hover { background: rgba(0,229,255,0.06); }
.ws-tool-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--color-surface-light); border-radius: 8px; font-size: 16px; color: var(--color-accent-cyan); }
.ws-tool-name { font-size: 13px; color: var(--color-text); }
.ws-tool-ver { font-size: 10px; color: var(--color-text-muted); }
.ws-tb-empty { padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 12px; }
.ws-toolbox-actions { display: flex; gap: 6px; }
.ws-tb-action { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 7px; font-size: 11px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-secondary); cursor: pointer; }
.ws-tb-action:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-tb-danger:hover { color: var(--color-accent-coral); border-color: rgba(255,107,107,0.3); }
.ws-share-code { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 8px 12px; background: var(--color-accent-cyan-soft); border: 1px dashed var(--color-accent-cyan-soft); border-radius: var(--radius-sm); font-size: 12px; }
.ws-share-code code { flex: 1; color: var(--color-accent-cyan); font-weight: 600; }
.ws-share-code button { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
.ws-copied-tip { font-size: 10px; color: var(--color-accent-lime); font-family: var(--font-mono); }

/* 消息 */
.ws-msg-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; }
.ws-msg-actions { display: flex; gap: 8px; }
.ws-msg-filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.ws-msg-filter { padding: 7px 14px; font-size: 13px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); cursor: pointer; }
.ws-msg-filter.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-msg-list { display: flex; flex-direction: column; gap: 8px; }
.ws-msg-item { display: flex; gap: 14px; padding: 16px 18px; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); transition: all var(--transition-fast); cursor: pointer; }
.ws-msg-item:hover { background: linear-gradient(180deg, rgba(0,229,255,0.04), rgba(255,255,255,0.01)); }
.ws-msg-item.unread { border-left: 3px solid var(--color-accent-cyan); background: linear-gradient(180deg, rgba(0,229,255,0.04), rgba(255,255,255,0.01)); }
.ws-msg-item.high { border-left-color: var(--color-accent-coral); }
.ws-msg-avatar { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--color-surface-light); border-radius: 12px; font-size: 18px; flex-shrink: 0; }
.ws-msg-avatar.developer { background: rgba(0,229,255,0.1); color: var(--color-accent-cyan); }
.ws-msg-avatar.update { background: rgba(198,255,61,0.1); color: var(--color-accent-lime); }
.ws-msg-avatar.interaction { background: rgba(183,148,244,0.1); color: var(--color-accent-violet); }
.ws-msg-avatar.system { background: rgba(139,146,176,0.15); color: var(--color-text-secondary); }
.ws-msg-body { flex: 1; }
.ws-msg-head-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ws-msg-from { font-size: 13px; font-weight: 600; color: var(--color-text); }
.ws-msg-priority { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); }
.ws-msg-priority.high { background: rgba(255,107,107,0.15); color: var(--color-accent-coral); }
.ws-msg-priority.medium { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-msg-priority.low { background: rgba(139,146,176,0.15); color: var(--color-text-muted); }
.ws-msg-time { font-size: 11px; color: var(--color-text-muted); margin-left: auto; }
.ws-msg-body h4 { font-size: 14px; margin: 0 0 4px; font-weight: 600; }
.ws-msg-body p { font-size: 13px; color: var(--color-text-secondary); margin: 0; }
.ws-msg-read-btn { width: 28px; height: 28px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: 50%; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; align-self: center; }
.ws-msg-read-btn:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-msg-empty { text-align: center; padding: 40px; color: var(--color-text-muted); }
.ws-msg-empty p { margin: 12px 0 0; font-size: 13px; }

/* 互动工具 */
.ws-interaction-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.ws-follow-feed { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.ws-follow-item { display: flex; gap: 10px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); }
.ws-follow-avatar { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--color-surface-light); border-radius: 50%; font-size: 15px; flex-shrink: 0; }
.ws-follow-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ws-follow-text { font-size: 13px; color: var(--color-text-secondary); }
.ws-follow-text strong { color: var(--color-text); }
.ws-follow-target { color: var(--color-accent-cyan); }
.ws-follow-time { font-size: 10px; color: var(--color-text-muted); }
.ws-push-toggles { display: flex; gap: 12px; flex-wrap: wrap; padding-top: 14px; border-top: 1px solid var(--color-border); }
.ws-toggle { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--color-text-secondary); cursor: pointer; }
.ws-toggle input { accent-color: var(--color-accent-cyan); }

.ws-notes-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; max-height: 360px; overflow-y: auto; }
.ws-note-item { padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-note-head { display: flex; gap: 8px; margin-bottom: 6px; align-items: center; }
.ws-note-tag { font-size: 10px; padding: 2px 7px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-note-tag.bug { background: rgba(255,107,107,0.15); color: var(--color-accent-coral); }
.ws-note-tag.tip { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-note-tool { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-note-new-tag { font-size: 9px; padding: 1px 6px; background: var(--color-accent-lime); color: var(--color-base); border-radius: var(--radius-pill); font-weight: 700; }
.ws-note-text { font-size: 13px; color: var(--color-text); margin: 0 0 8px; line-height: 1.5; }
.ws-note-actions { display: flex; align-items: center; gap: 10px; }
.ws-note-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 4px 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); cursor: pointer; }
.ws-note-btn:hover { color: var(--color-accent-cyan); }
.ws-note-status { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-note-status.adopted { color: var(--color-accent-lime); }
.ws-full-btn { width: 100%; }

.ws-community-list { display: flex; flex-direction: column; gap: 10px; }
.ws-community-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-comm-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--color-surface-light); border-radius: 12px; font-size: 20px; color: var(--color-accent-violet); }
.ws-community-item h4 { font-size: 14px; margin: 0 0 2px; }
.ws-comm-meta { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-comm-enter { padding: 6px 14px; background: var(--color-accent-cyan-soft); border: 1px solid var(--color-accent-cyan-soft); border-radius: var(--radius-pill); color: var(--color-accent-cyan); font-size: 12px; cursor: pointer; margin-left: auto; transition: all var(--transition-fast); }
.ws-comm-enter:hover { background: var(--color-accent-cyan); color: var(--color-base); }
.ws-comm-enter.joined { background: rgba(198,255,61,0.1); color: var(--color-accent-lime); border-color: rgba(198,255,61,0.3); }

/* 模态弹窗 */
.ws-modal-mask {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.ws-modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-card-hover);
}
.ws-modal-box-lg { max-width: 520px; }
.ws-modal-box h3 { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin: 0 0 16px; }
.ws-modal-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  font-family: inherit;
}
.ws-modal-input:focus { border-color: var(--color-accent-cyan); }
.ws-modal-textarea {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}
.ws-modal-textarea:focus { border-color: var(--color-accent-cyan); }
.ws-form-row { margin-bottom: 14px; }
.ws-form-row label { display: block; font-size: 12px; color: var(--color-text-muted); margin-bottom: 6px; font-family: var(--font-mono); }
.ws-radio-group { display: flex; gap: 14px; }
.ws-radio { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.ws-radio input { accent-color: var(--color-accent-cyan); }
.ws-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

.ws-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px;
  border-radius: var(--radius-sm);
  cursor: pointer; font-family: inherit;
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}
.ws-btn-primary {
  background: var(--gradient-cyan-lime);
  color: var(--color-base);
  border: none;
  font-weight: 600;
}
.ws-btn-primary:hover { box-shadow: var(--shadow-glow-cyan); }
.ws-btn-ghost {
  background: rgba(255,255,255,0.04);
  color: var(--color-text-secondary);
}
.ws-btn-ghost:hover { color: var(--color-text); border-color: var(--color-border-strong); }
.ws-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

/* 过渡 */
.ws-slide-down-enter-active, .ws-slide-down-leave-active { transition: all 0.3s var(--ease-out); }
.ws-slide-down-enter-from, .ws-slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.ws-fade-enter-active, .ws-fade-leave-active { transition: opacity 0.25s; }
.ws-fade-enter-from, .ws-fade-leave-to { opacity: 0; }
.ws-fade-enter-active .ws-modal-box, .ws-fade-leave-active .ws-modal-box { transition: transform 0.25s var(--ease-out); }
.ws-fade-enter-from .ws-modal-box, .ws-fade-leave-to .ws-modal-box { transform: scale(0.92); }

@media (max-width: 1024px) {
  .ws-profile-content { grid-template-columns: 1fr; text-align: left; }
  .ws-profile-stats { justify-content: flex-start; }
  .ws-overview-grid, .ws-toolbox-grid, .ws-interaction-grid { grid-template-columns: 1fr; }
  .ws-badges-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

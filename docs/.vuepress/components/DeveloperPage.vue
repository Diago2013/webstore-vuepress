<script setup lang="ts">
import { ref, computed } from 'vue'
import WsIcon from './shared/WsIcon.vue'
import {
  addBroadcastLog, broadcastLogs,
  toggleUgcLike, isUgcLiked,
  userPoints
} from '../store/useStore.ts'

const activeDevSection = ref<'submit' | 'admin' | 'reach' | 'cocreate' | 'comm'>('submit')

// 提交平台 - iframe 预览
const demoUrl = ref('https://pixelforge.studio')
const previewKey = ref(0)  // 用于强制重新渲染 iframe
const isPreviewing = ref(false)
const complianceChecks = ref([
  { name: '恶意代码检测', status: 'pass', detail: '未发现恶意脚本' },
  { name: '虚假宣传检测', status: 'pass', detail: '描述与功能一致' },
  { name: '无障碍适配', status: 'warn', detail: '缺少ARIA标签，建议补充' },
  { name: '隐私政策合规', status: 'pass', detail: '符合GDPR/CCPA' },
  { name: '性能基线', status: 'pass', detail: '首屏加载 1.2s' }
])

const refreshPreview = () => {
  previewKey.value++
}
const startPreview = () => {
  if (!demoUrl.value.trim()) return
  isPreviewing.value = true
  previewKey.value++
}

// 竞品对比
const competitorData = ref([
  { feature: 'AI辅助', mine: true, compA: true, compB: false },
  { feature: '骨骼动画', mine: true, compA: false, compB: true },
  { feature: '协作编辑', mine: false, compA: true, compB: false },
  { feature: '免费版', mine: true, compA: false, compB: true },
  { feature: 'API开放', mine: true, compA: true, compB: false }
])

// 反馈看板
const feedbackBoard = ref([
  { id: 'f1', title: '希望支持WebP导出', priority: 'high', count: 142, status: 'planned' },
  { id: 'f2', title: '大画布性能优化', priority: 'critical', count: 89, status: 'doing' },
  { id: 'f3', title: '增加更多调色板预设', priority: 'medium', count: 67, status: 'planned' },
  { id: 'f4', title: '快捷键自定义', priority: 'low', count: 45, status: 'done' },
  { id: 'f5', title: '图层混合模式', priority: 'high', count: 842, status: 'voting' }
])

// 反馈状态推进
const advanceFeedbackStatus = (f: any) => {
  const flow = ['voting', 'planned', 'doing', 'done']
  const idx = flow.indexOf(f.status)
  if (idx < 0 || idx >= flow.length - 1) return
  f.status = flow[idx + 1]
  const statusNameMap: Record<string, string> = { voting: '投票中', planned: '已规划', doing: '开发中', done: '已完成' }
  alert(`「${f.title}」状态更新为：${statusNameMap[f.status]}`)
}

// 用户触达
const userSegments = ref([
  { name: '高活跃用户', desc: '近7天每日使用', count: 2840, selected: true },
  { name: '付费用户', desc: '当前有效订阅', count: 1240, selected: false },
  { name: '互动用户', desc: '近30天有反馈', count: 892, selected: true },
  { name: '沉默用户', desc: '30天未活跃', count: 4210, selected: false }
])

const pushTypes = ref([
  { type: '版本更新', icon: 'refresh', selected: true },
  { type: '内测邀请', icon: 'flame', selected: true },
  { type: '福利发放', icon: 'gift', selected: false },
  { type: '调研问卷', icon: 'file', selected: true }
])

// UGC管理 - 加入点赞 / 筛选 / 回复
const ugcFilter = ref<'all' | '测评' | '打卡' | '社群问答'>('all')
const ugcList = ref([
  { id: 'u1', type: '测评', author: '林深时见鹿', avatar: '✿', title: 'PixelForge深度使用30天报告', likes: 1284, status: 'featured', replies: [] as { user: string; text: string; time: string }[] },
  { id: 'u2', type: '打卡', author: '设计师小K', avatar: '◈', title: '今日用AI风格迁移做了个赛博朋克角色', likes: 89, status: 'normal', replies: [] },
  { id: 'u3', type: '社群问答', author: '代码诗人', avatar: '✦', title: '骨骼动画如何绑定多个部位？', likes: 42, status: 'pinned', replies: [] },
  { id: 'u4', type: '测评', author: '数据矿工', avatar: '◢', title: '与Aseprite的全方位对比', likes: 768, status: 'normal', replies: [] }
])

const filteredUgc = computed(() => {
  if (ugcFilter.value === 'all') return ugcList.value
  return ugcList.value.filter(u => u.type === ugcFilter.value)
})

const ugcLike = (u: any) => {
  toggleUgcLike('devugc_' + u.id)
}
const ugcLiked = (u: any) => isUgcLiked('devugc_' + u.id)
const ugcLikeCount = (u: any) => u.likes + (ugcLiked(u) ? 1 : 0)

// UGC 状态切换（精选 / 置顶 / 普通）
const toggleUgcStatus = (u: any, target: 'featured' | 'pinned' | 'normal') => {
  u.status = u.status === target ? 'normal' : target
}

// UGC 回复
const replyingUgc = ref<string | null>(null)
const replyText = ref('')
const openReply = (u: any) => {
  replyingUgc.value = u.id
  replyText.value = ''
}
const submitReply = (u: any) => {
  if (!replyText.value.trim()) return
  u.replies.push({ user: 'NovaStudio', text: replyText.value.trim(), time: '刚刚' })
  replyText.value = ''
  replyingUgc.value = null
}

// 消息工作台
const msgChannels = ref([
  { channel: '私信', count: 28, color: 'cyan' },
  { channel: '评论', count: 142, color: 'lime' },
  { channel: '需求投票', count: 842, color: 'amber' },
  { channel: '故障反馈', count: 12, color: 'coral' }
])

// 快捷回复
const quickReplies = [
  '感谢反馈，已收到并将尽快处理',
  '该功能已在开发计划中，预计下版本上线',
  '已复现问题，正在修复',
  '感谢支持，详见开发者专栏'
]
const copiedReply = ref<string | null>(null)
const useQuickReply = (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
  copiedReply.value = text
  setTimeout(() => { copiedReply.value = null }, 1500)
}

// 互动数据
const monthlyStats = ref({
  consultations: 423,
  voteHeat: 2340,
  communityActive: 87,
  reviewsOutput: 56,
  growth: '+18%'
})

// 推送内容 - 持久化到 store
const broadcastContent = ref('')
const broadcastAudience = ref('all')
const broadcastResult = ref<{ msg: string; ok: boolean } | null>(null)

const submitBroadcast = () => {
  if (!broadcastContent.value.trim()) {
    broadcastResult.value = { msg: '请输入推送内容', ok: false }
    setTimeout(() => { broadcastResult.value = null }, 2500)
    return
  }
  if (broadcastContent.value.length > 200) {
    broadcastResult.value = { msg: '推送内容超过200字，需平台审核', ok: false }
    setTimeout(() => { broadcastResult.value = null }, 2500)
    return
  }
  const audienceMap: Record<string, string> = { all: '全部选中分群', active: '仅高活跃', paid: '仅付费用户' }
  addBroadcastLog({
    content: broadcastContent.value.trim(),
    audience: audienceMap[broadcastAudience.value] || broadcastAudience.value,
    types: pushTypes.value.filter(p => p.selected).map(p => p.type),
    reach: userSegments.value.filter(s => s.selected).reduce((a, b) => a + b.count, 0)
  })
  broadcastResult.value = { msg: '推送已提交审核，预计1小时内触达', ok: true }
  broadcastContent.value = ''
  setTimeout(() => { broadcastResult.value = null }, 2800)
}

const recentBroadcasts = computed(() => broadcastLogs.value.slice(0, 3))

const displayPoints = computed(() => userPoints.value)
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 开发者头部 -->
      <div class="ws-dev-hero ws-anim-fade-up">
        <div class="ws-dev-hero-left">
          <span class="ws-dev-hero-avatar">◆</span>
          <div>
            <div class="ws-dev-hero-name-row">
              <h1>NovaStudio <WsIcon name="check-circle" :size="18" color="var(--color-accent-cyan)" /></h1>
              <span class="ws-verified-tag">已认证开发者</span>
            </div>
            <p class="ws-dev-hero-bio">专注创作工具的独立工作室 · 2款工具 · 28,400 关注</p>
            <div class="ws-dev-hero-stats">
              <span>互动分 <strong class="text-gradient">92</strong></span>
              <span>响应率 <strong>98%</strong></span>
              <span>平均响应 <strong>2小时</strong></span>
              <span>分成比例 <strong>12%</strong></span>
            </div>
          </div>
        </div>
        <div class="ws-dev-hero-right">
          <div class="ws-hero-stat">
            <span class="ws-hero-stat-num">187K</span>
            <span class="ws-hero-stat-label">本月触达</span>
          </div>
          <div class="ws-hero-stat">
            <span class="ws-hero-stat-num">4.8</span>
            <span class="ws-hero-stat-label">平均口碑</span>
          </div>
        </div>
      </div>

      <!-- Section Tab -->
      <div class="ws-dev-tabs">
        <button class="ws-dev-tab" :class="{ active: activeDevSection === 'submit' }" @click="activeDevSection = 'submit'"><WsIcon name="plus" :size="13" /> 网页提交</button>
        <button class="ws-dev-tab" :class="{ active: activeDevSection === 'admin' }" @click="activeDevSection = 'admin'"><WsIcon name="grid" :size="13" /> 管理后台</button>
        <button class="ws-dev-tab" :class="{ active: activeDevSection === 'reach' }" @click="activeDevSection = 'reach'"><WsIcon name="send" :size="13" /> 用户触达</button>
        <button class="ws-dev-tab" :class="{ active: activeDevSection === 'cocreate' }" @click="activeDevSection = 'cocreate'"><WsIcon name="bulb" :size="13" /> 内容共创</button>
        <button class="ws-dev-tab" :class="{ active: activeDevSection === 'comm' }" @click="activeDevSection = 'comm'"><WsIcon name="message" :size="13" /> 沟通活动</button>
      </div>

      <!-- ===== 网页提交平台 ===== -->
      <div v-show="activeDevSection === 'submit'" class="ws-submit-platform">
        <div class="ws-submit-grid">
          <!-- Demo预览 -->
          <div class="ws-submit-card ws-demo-card">
            <h3><WsIcon name="eye" :size="16" color="var(--color-accent-cyan)" /> iframe 交互式 Demo 预览</h3>
            <div class="ws-demo-url-row">
              <input v-model="demoUrl" class="ws-demo-input" placeholder="输入网页URL" @keydown.enter="startPreview" />
              <button class="ws-btn ws-btn-ghost" @click="refreshPreview" title="刷新预览"><WsIcon name="refresh" :size="13" /></button>
              <button class="ws-btn ws-btn-primary" @click="startPreview">预览</button>
            </div>
            <div class="ws-demo-frame">
              <iframe
                v-if="isPreviewing"
                :key="previewKey"
                :src="demoUrl"
                class="ws-demo-iframe"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
                @error="isPreviewing = false"
              ></iframe>
              <div v-else class="ws-demo-placeholder">
                <WsIcon name="video" :size="40" color="var(--color-text-muted)" />
                <p>实时预览您的网页工具</p>
                <span class="font-mono">{{ demoUrl }}</span>
                <p class="ws-demo-tip">点击「预览」开始加载</p>
              </div>
            </div>
          </div>

          <!-- 合规检测 -->
          <div class="ws-submit-card">
            <h3><WsIcon name="shield" :size="16" color="var(--color-accent-lime)" /> 自动化合规检测</h3>
            <div class="ws-compliance-list">
              <div v-for="c in complianceChecks" :key="c.name" class="ws-compliance-item" :class="c.status">
                <WsIcon :name="c.status === 'pass' ? 'check-circle' : c.status === 'warn' ? 'alert' : 'x'" :size="14"
                  :color="c.status === 'pass' ? 'var(--color-accent-lime)' : c.status === 'warn' ? 'var(--color-accent-amber)' : 'var(--color-accent-coral)'" />
                <div>
                  <div class="ws-comp-name">{{ c.name }}</div>
                  <div class="ws-comp-detail">{{ c.detail }}</div>
                </div>
                <span class="ws-comp-status" :class="c.status">{{ c.status === 'pass' ? '通过' : c.status === 'warn' ? '警告' : '失败' }}</span>
              </div>
            </div>
          </div>

          <!-- 竞品对比 -->
          <div class="ws-submit-card ws-compete-card">
            <h3><WsIcon name="trending-up" :size="16" color="var(--color-accent-amber)" /> 自动竞品对比 · 优化建议</h3>
            <table class="ws-compete-table">
              <thead>
                <tr><th>功能</th><th>我的工具</th><th>竞品A</th><th>竞品B</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in competitorData" :key="row.feature">
                  <td>{{ row.feature }}</td>
                  <td><WsIcon :name="row.mine ? 'check' : 'x'" :size="14" :color="row.mine ? 'var(--color-accent-lime)' : 'var(--color-text-muted)'" /></td>
                  <td><WsIcon :name="row.compA ? 'check' : 'x'" :size="14" :color="row.compA ? 'var(--color-accent-lime)' : 'var(--color-text-muted)'" /></td>
                  <td><WsIcon :name="row.compB ? 'check' : 'x'" :size="14" :color="row.compB ? 'var(--color-accent-lime)' : 'var(--color-text-muted)'" /></td>
                </tr>
              </tbody>
            </table>
            <div class="ws-suggest-box">
              <WsIcon name="bulb" :size="13" color="var(--color-accent-amber)" />
              <span>建议：补充协作编辑功能可形成差异化优势，竞品A此功能为其核心卖点</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 管理后台 ===== -->
      <div v-show="activeDevSection === 'admin'" class="ws-admin">
        <div class="ws-admin-grid">
          <!-- 反馈智能看板 -->
          <div class="ws-admin-card ws-feedback-board">
            <div class="ws-card-head">
              <h3><WsIcon name="grid" :size="16" color="var(--color-accent-cyan)" /> 用户反馈智能看板</h3>
              <span class="ws-auto-tag">自动划分优先级</span>
            </div>
            <div class="ws-feedback-columns">
              <div class="ws-fb-col">
                <div class="ws-fb-col-head"><span class="ws-dot critical"></span>紧急 · {{ feedbackBoard.filter(f => f.priority === 'critical').length }}</div>
                <div v-for="f in feedbackBoard.filter(f => f.priority === 'critical')" :key="f.id" class="ws-fb-card critical">
                  <h4>{{ f.title }}</h4>
                  <div class="ws-fb-meta">
                    <WsIcon name="users" :size="11" /> {{ f.count }} ·
                    <span class="ws-fb-status" :class="f.status">{{ f.status }}</span>
                  </div>
                  <button v-if="f.status !== 'done'" class="ws-fb-advance" @click="advanceFeedbackStatus(f)">推进状态 →</button>
                </div>
              </div>
              <div class="ws-fb-col">
                <div class="ws-fb-col-head"><span class="ws-dot high"></span>高优</div>
                <div v-for="f in feedbackBoard.filter(f => f.priority === 'high')" :key="f.id" class="ws-fb-card high">
                  <h4>{{ f.title }}</h4>
                  <div class="ws-fb-meta">
                    <WsIcon name="users" :size="11" /> {{ f.count }} ·
                    <span class="ws-fb-status" :class="f.status">{{ f.status }}</span>
                  </div>
                  <button v-if="f.status !== 'done'" class="ws-fb-advance" @click="advanceFeedbackStatus(f)">推进状态 →</button>
                </div>
              </div>
              <div class="ws-fb-col">
                <div class="ws-fb-col-head"><span class="ws-dot medium"></span>一般</div>
                <div v-for="f in feedbackBoard.filter(f => f.priority === 'medium' || f.priority === 'low')" :key="f.id" class="ws-fb-card">
                  <h4>{{ f.title }}</h4>
                  <div class="ws-fb-meta">
                    <WsIcon name="users" :size="11" /> {{ f.count }} ·
                    <span class="ws-fb-status" :class="f.status">{{ f.status }}</span>
                  </div>
                  <button v-if="f.status !== 'done'" class="ws-fb-advance" @click="advanceFeedbackStatus(f)">推进状态 →</button>
                </div>
              </div>
            </div>
          </div>

          <!-- A/B测试 -->
          <div class="ws-admin-card">
            <h3><WsIcon name="trending-up" :size="16" color="var(--color-accent-lime)" /> A/B 测试与转化分析</h3>
            <div class="ws-ab-test">
              <div class="ws-ab-variant">
                <span class="ws-ab-label">方案 A</span>
                <span class="ws-ab-rate">12.4%</span>
                <span class="ws-ab-desc">原详情页</span>
              </div>
              <div class="ws-ab-variant winner">
                <span class="ws-ab-label">方案 B <WsIcon name="trophy" :size="11" color="var(--color-accent-amber)" /></span>
                <span class="ws-ab-rate text-gradient">18.7%</span>
                <span class="ws-ab-desc">突出开发者故事</span>
              </div>
            </div>
            <div class="ws-ab-conclusion">
              <WsIcon name="check-circle" :size="13" color="var(--color-accent-lime)" />
              <span>方案B转化率提升 <strong>50.8%</strong>，建议全量发布</span>
            </div>
          </div>

          <!-- 团队权限 -->
          <div class="ws-admin-card">
            <h3><WsIcon name="users" :size="16" color="var(--color-accent-violet)" /> 多角色团队权限 · 操作日志</h3>
            <div class="ws-team-list">
              <div class="ws-team-row"><span class="ws-team-avatar">◆</span>凌川 <span class="ws-team-role-tag">超级管理员</span></div>
              <div class="ws-team-row"><span class="ws-team-avatar">◈</span>青木 <span class="ws-team-role-tag">内容运营</span></div>
              <div class="ws-team-row"><span class="ws-team-avatar">◇</span>砚白 <span class="ws-team-role-tag">社区运营</span></div>
            </div>
            <div class="ws-log-list">
              <div class="ws-log-item"><span class="font-mono">14:23</span> 凌川 发布了 v3.2.1</div>
              <div class="ws-log-item"><span class="font-mono">13:05</span> 砚白 回复了 12 条私信</div>
              <div class="ws-log-item"><span class="font-mono">11:42</span> 青木 更新了工具描述</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 用户定向触达 ===== -->
      <div v-show="activeDevSection === 'reach'" class="ws-reach">
        <div class="ws-reach-grid">
          <!-- 用户分群 -->
          <div class="ws-reach-card">
            <h3><WsIcon name="users" :size="16" color="var(--color-accent-cyan)" /> 用户分群定向触达</h3>
            <p class="ws-reach-desc">按活跃度、付费、互动行为筛选用户，定向推送</p>
            <div class="ws-segment-list">
              <label v-for="s in userSegments" :key="s.name" class="ws-segment-item" :class="{ selected: s.selected }">
                <input type="checkbox" v-model="s.selected" />
                <div>
                  <div class="ws-seg-name">{{ s.name }}</div>
                  <div class="ws-seg-desc">{{ s.desc }}</div>
                </div>
                <span class="ws-seg-count font-mono">{{ s.count.toLocaleString() }}</span>
              </label>
            </div>
            <div class="ws-reach-summary">
              预计触达 <strong class="text-gradient">{{ userSegments.filter(s => s.selected).reduce((a, b) => a + b.count, 0).toLocaleString() }}</strong> 用户
            </div>
          </div>

          <!-- 推送内容 -->
          <div class="ws-reach-card ws-push-card">
            <h3><WsIcon name="send" :size="16" color="var(--color-accent-lime)" /> 推送内容配置</h3>
            <div class="ws-push-types">
              <label v-for="p in pushTypes" :key="p.type" class="ws-push-type" :class="{ selected: p.selected }">
                <input type="checkbox" v-model="p.selected" />
                <WsIcon :name="p.icon" :size="14" />
                <span>{{ p.type }}</span>
              </label>
            </div>
            <div class="ws-broadcast-box">
              <textarea v-model="broadcastContent" placeholder="输入推送内容…批量推送内容需平台审核（建议≤200字）" rows="4" maxlength="500"></textarea>
              <div class="ws-broadcast-row">
                <select v-model="broadcastAudience" class="ws-broadcast-select">
                  <option value="all">全部选中分群</option>
                  <option value="active">仅高活跃</option>
                  <option value="paid">仅付费用户</option>
                </select>
                <button class="ws-btn ws-btn-primary" @click="submitBroadcast">提交审核并推送</button>
              </div>
              <Transition name="ws-fade">
                <div v-if="broadcastResult" class="ws-bc-result" :class="broadcastResult.ok ? 'ok' : 'fail'">
                  <WsIcon :name="broadcastResult.ok ? 'check-circle' : 'alert'" :size="13" />
                  <span>{{ broadcastResult.msg }}</span>
                </div>
              </Transition>
            </div>
            <!-- 最近推送记录 -->
            <div v-if="recentBroadcasts.length" class="ws-bc-history">
              <span class="ws-bc-history-label">最近推送</span>
              <div v-for="b in recentBroadcasts" :key="b.id" class="ws-bc-history-item">
                <span class="ws-bc-h-text">{{ b.content }}</span>
                <span class="ws-bc-h-meta font-mono">{{ b.audience }} · 触达 {{ b.reach?.toLocaleString() || 0 }}</span>
              </div>
            </div>
            <div class="ws-audit-note">
              <WsIcon name="shield" :size="12" color="var(--color-text-muted)" />
              <span>批量推送需平台审核 · 无法导出用户私人联系方式 · 仅查看匿名化数据</span>
            </div>
          </div>

          <!-- 调研问卷 -->
          <div class="ws-reach-card">
            <h3><WsIcon name="file" :size="16" color="var(--color-accent-amber)" /> 内置调研问卷 · 自动报表</h3>
            <div class="ws-survey-list">
              <div class="ws-survey-item">
                <div class="ws-survey-info">
                  <h4>v3.2新功能满意度调研</h4>
                  <span>已回收 423 / 发放 500</span>
                </div>
                <div class="ws-survey-rate">84.6%</div>
              </div>
              <div class="ws-survey-item">
                <div class="ws-survey-info">
                  <h4>下版本功能优先级</h4>
                  <span>已回收 612 / 发放 800</span>
                </div>
                <div class="ws-survey-rate">76.5%</div>
              </div>
            </div>
            <button class="ws-btn ws-btn-ghost ws-full-btn"><WsIcon name="plus" :size="13" /> 创建新调研</button>
          </div>
        </div>
      </div>

      <!-- ===== 内容共创运营 ===== -->
      <div v-show="activeDevSection === 'cocreate'" class="ws-cocreate-admin">
        <!-- UGC管理 -->
        <div class="ws-admin-panel">
          <div class="ws-card-head">
            <h3><WsIcon name="grid" :size="16" color="var(--color-accent-cyan)" /> 统一 UGC 管理</h3>
            <div class="ws-ugc-filters">
              <button class="ws-ugc-filter" :class="{ active: ugcFilter === 'all' }" @click="ugcFilter = 'all'">全部</button>
              <button class="ws-ugc-filter" :class="{ active: ugcFilter === '测评' }" @click="ugcFilter = '测评'">测评</button>
              <button class="ws-ugc-filter" :class="{ active: ugcFilter === '打卡' }" @click="ugcFilter = '打卡'">打卡</button>
              <button class="ws-ugc-filter" :class="{ active: ugcFilter === '社群问答' }" @click="ugcFilter = '社群问答'">问答</button>
            </div>
          </div>
          <div class="ws-ugc-list">
            <div v-for="ugc in filteredUgc" :key="ugc.id" class="ws-ugc-item">
              <span class="ws-ugc-avatar">{{ ugc.avatar }}</span>
              <div class="ws-ugc-body">
                <div class="ws-ugc-meta">
                  <span class="ws-ugc-type" :class="ugc.type">{{ ugc.type }}</span>
                  <span v-if="ugc.status === 'featured'" class="ws-ugc-flag featured">精选</span>
                  <span v-if="ugc.status === 'pinned'" class="ws-ugc-flag pinned">置顶</span>
                  <span class="ws-ugc-author">{{ ugc.author }}</span>
                </div>
                <h4>{{ ugc.title }}</h4>
                <div class="ws-ugc-stats">
                  <button class="ws-ugc-like" :class="{ liked: ugcLiked(ugc) }" @click="ugcLike(ugc)">
                    <WsIcon name="heart" :size="11" :color="ugcLiked(ugc) ? 'var(--color-accent-coral)' : 'var(--color-text-muted)'" />
                    {{ ugcLikeCount(ugc) }}
                  </button>
                  <span><WsIcon name="message" :size="11" /> {{ ugc.replies.length }}</span>
                </div>
                <!-- 回复列表 -->
                <div v-if="ugc.replies.length" class="ws-ugc-replies">
                  <div v-for="(r, i) in ugc.replies" :key="i" class="ws-ugc-reply">
                    <span class="ws-reply-user">{{ r.user }}：</span>
                    <span>{{ r.text }}</span>
                    <span class="ws-reply-time font-mono">{{ r.time }}</span>
                  </div>
                </div>
                <!-- 回复输入 -->
                <div v-if="replyingUgc === ugc.id" class="ws-reply-input-row">
                  <input v-model="replyText" class="ws-reply-input" placeholder="@{{ ugc.author }} 回复…" @keydown.enter="submitReply(ugc)" />
                  <button class="ws-btn ws-btn-primary ws-reply-send" @click="submitReply(ugc)">发送</button>
                  <button class="ws-btn ws-btn-ghost ws-reply-cancel" @click="replyingUgc = null">取消</button>
                </div>
              </div>
              <div class="ws-ugc-actions">
                <button class="ws-ugc-btn" :class="{ active: ugcLiked(ugc) }" @click="ugcLike(ugc)">
                  <WsIcon name="heart" :size="12" /> {{ ugcLiked(ugc) ? '已赞' : '点赞' }}
                </button>
                <button class="ws-ugc-btn" :class="{ active: ugc.status === 'featured' }" @click="toggleUgcStatus(ugc, 'featured')">
                  <WsIcon name="star" :size="12" /> {{ ugc.status === 'featured' ? '取消精选' : '精选' }}
                </button>
                <button class="ws-ugc-btn" :class="{ active: ugc.status === 'pinned' }" @click="toggleUgcStatus(ugc, 'pinned')">
                  <WsIcon name="bookmark" :size="12" /> {{ ugc.status === 'pinned' ? '取消置顶' : '置顶' }}
                </button>
                <button class="ws-ugc-btn" @click="openReply(ugc)">
                  <WsIcon name="message" :size="12" /> 回复
                </button>
              </div>
            </div>
            <div v-if="!filteredUgc.length" class="ws-ugc-empty">暂无该类型 UGC 内容</div>
          </div>
        </div>

        <div class="ws-cocreate-side-grid">
          <!-- 开发者专栏 -->
          <div class="ws-admin-panel">
            <h3><WsIcon name="file" :size="16" color="var(--color-accent-lime)" /> 开发者专属专栏</h3>
            <p class="ws-panel-sub">发布更新计划、教程、感谢信 · 附带评论互动区</p>
            <div class="ws-column-list">
              <div class="ws-column-item">
                <span class="ws-col-tag">更新计划</span>
                <h4>v3.3 路线图：协作编辑与AI生成3D</h4>
                <span class="ws-col-meta">328 赞 · 142 评论</span>
              </div>
              <div class="ws-column-item">
                <span class="ws-col-tag">教程</span>
                <h4>骨骼动画入门：5分钟让角色动起来</h4>
                <span class="ws-col-meta">892 赞 · 67 评论</span>
              </div>
            </div>
            <button class="ws-btn ws-btn-ghost ws-full-btn"><WsIcon name="plus" :size="13" /> 发布新专栏</button>
          </div>

          <!-- 福利活动 -->
          <div class="ws-admin-panel">
            <h3><WsIcon name="gift" :size="16" color="var(--color-accent-amber)" /> 福利活动 · 完整发放数据</h3>
            <div class="ws-welfare-list">
              <div class="ws-welfare-item">
                <h4>周年庆高级权限抽奖</h4>
                <span class="ws-welfare-data">发放 50 / 100</span>
              </div>
              <div class="ws-welfare-item">
                <h4>内测用户兑换码</h4>
                <span class="ws-welfare-data">发放 200 / 200</span>
              </div>
            </div>
            <button class="ws-btn ws-btn-ghost ws-full-btn"><WsIcon name="plus" :size="13" /> 创建福利活动</button>
          </div>
        </div>
      </div>

      <!-- ===== 沟通活动管理 ===== -->
      <div v-show="activeDevSection === 'comm'" class="ws-comm-admin">
        <div class="ws-comm-grid">
          <!-- 消息统一工作台 -->
          <div class="ws-comm-panel ws-inbox-panel">
            <h3><WsIcon name="message" :size="16" color="var(--color-accent-cyan)" /> 多渠道消息统一工作台</h3>
            <div class="ws-channel-row">
              <div v-for="ch in msgChannels" :key="ch.channel" class="ws-channel-card" :class="ch.color">
                <span class="ws-ch-name">{{ ch.channel }}</span>
                <span class="ws-ch-count font-mono">{{ ch.count }}</span>
              </div>
            </div>
            <div class="ws-quick-replies">
              <span class="ws-qr-label">快捷回复模板（点击复制）</span>
              <button
                v-for="r in quickReplies"
                :key="r"
                class="ws-qr-chip"
                :class="{ copied: copiedReply === r }"
                @click="useQuickReply(r)"
              >
                {{ copiedReply === r ? '✓ 已复制' : r }}
              </button>
            </div>
          </div>

          <!-- 互动数据看板 -->
          <div class="ws-comm-panel">
            <h3><WsIcon name="trending-up" :size="16" color="var(--color-accent-lime)" /> 互动数据看板 · 月度报告</h3>
            <div class="ws-data-grid">
              <div class="ws-data-item">
                <span class="ws-data-num text-gradient">{{ monthlyStats.consultations }}</span>
                <span class="ws-data-label">咨询量</span>
              </div>
              <div class="ws-data-item">
                <span class="ws-data-num font-mono">{{ monthlyStats.voteHeat.toLocaleString() }}</span>
                <span class="ws-data-label">投票热度</span>
              </div>
              <div class="ws-data-item">
                <span class="ws-data-num font-mono">{{ monthlyStats.communityActive }}%</span>
                <span class="ws-data-label">社群活跃</span>
              </div>
              <div class="ws-data-item">
                <span class="ws-data-num font-mono">{{ monthlyStats.reviewsOutput }}</span>
                <span class="ws-data-label">测评产出</span>
              </div>
            </div>
            <div class="ws-growth-note">
              <WsIcon name="trending-up" :size="13" color="var(--color-accent-lime)" />
              <span>本月互动增长 <strong class="text-gradient">{{ monthlyStats.growth }}</strong> · 月度报告已自动生成</span>
            </div>
          </div>

          <!-- 活动管理 -->
          <div class="ws-comm-panel ws-activity-panel">
            <h3><WsIcon name="video" :size="16" color="var(--color-accent-violet)" /> 答疑直播 · 教学沙龙 · 共创活动</h3>
            <div class="ws-activity-list">
              <div class="ws-activity-item">
                <div class="ws-act-info">
                  <span class="ws-act-type live">直播</span>
                  <h4>v3.2新功能答疑专场</h4>
                  <span class="ws-act-meta">本周六 20:00 · 已报名 142</span>
                </div>
                <button class="ws-act-btn">复盘</button>
              </div>
              <div class="ws-activity-item">
                <div class="ws-act-info">
                  <span class="ws-act-type salon">沙龙</span>
                  <h4>独立开发者变现经验谈</h4>
                  <span class="ws-act-meta">下周三 19:30 · 已报名 89</span>
                </div>
                <button class="ws-act-btn">管理</button>
              </div>
            </div>
            <button class="ws-btn ws-btn-primary ws-full-btn"><WsIcon name="plus" :size="13" /> 创建新活动 · 配套报名预约复盘</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ws-page { padding: 32px 0 80px; position: relative; z-index: 2; }

/* 头部 */
.ws-dev-hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px; background: linear-gradient(180deg, rgba(0,229,255,0.06), rgba(255,255,255,0.01)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-lg); margin-bottom: 24px; flex-wrap: wrap; }
.ws-dev-hero-left { display: flex; gap: 20px; align-items: center; }
.ws-dev-hero-avatar { display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; background: var(--color-surface-light); border-radius: 20px; font-size: 36px; color: var(--color-accent-cyan); border: 2px solid var(--color-accent-cyan-soft); }
.ws-dev-hero-name-row { display: flex; align-items: center; gap: 10px; }
.ws-dev-hero-name-row h1 { font-family: var(--font-display); font-weight: 700; font-size: 26px; margin: 0; display: flex; align-items: center; gap: 8px; }
.ws-verified-tag { font-size: 11px; padding: 3px 10px; background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-dev-hero-bio { font-size: 13px; color: var(--color-text-secondary); margin: 4px 0 8px; }
.ws-dev-hero-stats { display: flex; gap: 16px; font-size: 12px; color: var(--color-text-muted); flex-wrap: wrap; }
.ws-dev-hero-stats strong { color: var(--color-text); font-family: var(--font-mono); }
.ws-dev-hero-right { display: flex; gap: 16px; }
.ws-hero-stat { display: flex; flex-direction: column; align-items: center; padding: 14px 24px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-hero-stat-num { font-family: var(--font-display); font-weight: 800; font-size: 28px; color: var(--color-accent-cyan); }
.ws-hero-stat-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* Tab */
.ws-dev-tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid var(--color-border); overflow-x: auto; }
.ws-dev-tab { display: inline-flex; align-items: center; gap: 6px; padding: 12px 18px; font-size: 13px; background: none; border: none; color: var(--color-text-secondary); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }
.ws-dev-tab:hover { color: var(--color-text); }
.ws-dev-tab.active { color: var(--color-accent-cyan); border-bottom-color: var(--color-accent-cyan); }

/* 通用卡片 */
.ws-submit-card, .ws-admin-card, .ws-reach-card, .ws-admin-panel, .ws-comm-panel { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 20px; }
.ws-submit-card h3, .ws-admin-card h3, .ws-reach-card h3, .ws-admin-panel h3, .ws-comm-panel h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 16px; margin: 0 0 16px; }
.ws-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ws-card-head h3 { margin: 0; }
.ws-panel-sub { font-size: 12px; color: var(--color-text-muted); margin: 0 0 14px; }
.ws-full-btn { width: 100%; margin-top: 10px; }

/* 提交平台 */
.ws-submit-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
.ws-demo-url-row { display: flex; gap: 8px; margin-bottom: 14px; }
.ws-demo-input { flex: 1; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 13px; outline: none; }
.ws-demo-frame { height: 240px; background: var(--color-base-deep); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
.ws-demo-placeholder { text-align: center; color: var(--color-text-muted); }
.ws-demo-placeholder p { margin: 8px 0 4px; font-size: 13px; }
.ws-demo-placeholder span { font-size: 11px; color: var(--color-accent-cyan); }
.ws-demo-tip { font-size: 11px !important; color: var(--color-text-muted) !important; margin-top: 6px !important; }
.ws-demo-iframe { width: 100%; height: 100%; border: none; background: #fff; border-radius: var(--radius-sm); }

.ws-compliance-list { display: flex; flex-direction: column; gap: 10px; }
.ws-compliance-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-compliance-item.pass { border-color: rgba(198,255,61,0.2); }
.ws-compliance-item.warn { border-color: rgba(255,184,77,0.2); background: rgba(255,184,77,0.04); }
.ws-comp-name { font-size: 13px; color: var(--color-text); }
.ws-comp-detail { font-size: 11px; color: var(--color-text-muted); }
.ws-comp-status { margin-left: auto; font-size: 10px; padding: 2px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-comp-status.pass { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-comp-status.warn { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-comp-status.fail { background: rgba(255,107,107,0.15); color: var(--color-accent-coral); }

.ws-compete-card { grid-column: 1 / -1; }
.ws-compete-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
.ws-compete-table th, .ws-compete-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 13px; }
.ws-compete-table th { color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.ws-compete-table td { color: var(--color-text); }
.ws-suggest-box { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: rgba(255,184,77,0.06); border: 1px solid rgba(255,184,77,0.2); border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-secondary); }

/* 反馈看板 */
.ws-feedback-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ws-fb-col-head { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); margin-bottom: 10px; font-family: var(--font-mono); }
.ws-dot { width: 8px; height: 8px; border-radius: 50%; }
.ws-dot.critical { background: var(--color-accent-coral); }
.ws-dot.high { background: var(--color-accent-amber); }
.ws-dot.medium { background: var(--color-accent-cyan); }
.ws-fb-card { padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 8px; }
.ws-fb-card.critical { border-left: 3px solid var(--color-accent-coral); }
.ws-fb-card.high { border-left: 3px solid var(--color-accent-amber); }
.ws-fb-card h4 { font-size: 13px; margin: 0 0 6px; font-weight: 500; }
.ws-fb-meta { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
.ws-fb-status { color: var(--color-accent-cyan); padding: 1px 6px; border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: 10px; }
.ws-fb-status.voting { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-fb-status.planned { background: rgba(0,229,255,0.12); color: var(--color-accent-cyan); }
.ws-fb-status.doing { background: rgba(183,148,244,0.15); color: var(--color-accent-violet); }
.ws-fb-status.done { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-fb-advance { margin-top: 8px; width: 100%; padding: 4px 8px; font-size: 10px; background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.2); border-radius: var(--radius-xs); color: var(--color-accent-cyan); cursor: pointer; transition: all var(--transition-base); font-family: var(--font-mono); }
.ws-fb-advance:hover { background: rgba(0,229,255,0.15); }
.ws-auto-tag { font-size: 10px; padding: 3px 8px; background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-radius: var(--radius-pill); font-family: var(--font-mono); }

/* A/B测试 */
.ws-ab-test { display: flex; gap: 12px; margin-bottom: 12px; }
.ws-ab-variant { flex: 1; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; }
.ws-ab-variant.winner { border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.04); }
.ws-ab-label { display: block; font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); margin-bottom: 6px; }
.ws-ab-rate { display: block; font-family: var(--font-display); font-weight: 800; font-size: 28px; }
.ws-ab-desc { display: block; font-size: 11px; color: var(--color-text-muted); margin-top: 4px; }
.ws-ab-conclusion { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(198,255,61,0.06); border: 1px solid rgba(198,255,61,0.2); border-radius: var(--radius-sm); font-size: 12px; }

/* 团队 */
.ws-team-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ws-team-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); font-size: 13px; }
.ws-team-avatar { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: var(--color-surface-light); border-radius: 50%; font-size: 12px; }
.ws-team-role-tag { margin-left: auto; font-size: 10px; padding: 2px 8px; background: rgba(255,255,255,0.05); border-radius: var(--radius-pill); color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-log-list { display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid var(--color-border); }
.ws-log-item { font-size: 12px; color: var(--color-text-secondary); }
.ws-log-item span { color: var(--color-accent-cyan); margin-right: 8px; }

/* 用户触达 */
.ws-reach-grid { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 20px; }
.ws-reach-desc { font-size: 12px; color: var(--color-text-muted); margin: 0 0 14px; }
.ws-segment-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ws-segment-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; }
.ws-segment-item.selected { border-color: var(--color-accent-cyan-soft); background: var(--color-accent-cyan-soft); }
.ws-segment-item input { accent-color: var(--color-accent-cyan); }
.ws-seg-name { font-size: 13px; color: var(--color-text); }
.ws-seg-desc { font-size: 11px; color: var(--color-text-muted); }
.ws-seg-count { margin-left: auto; font-size: 12px; color: var(--color-accent-cyan); }
.ws-reach-summary { text-align: center; padding: 10px; background: rgba(0,229,255,0.04); border-radius: var(--radius-sm); font-size: 13px; color: var(--color-text-secondary); }

.ws-push-types { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.ws-push-type { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); font-size: 12px; color: var(--color-text-secondary); cursor: pointer; }
.ws-push-type.selected { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-push-type input { display: none; }
.ws-broadcast-box textarea { width: 100%; padding: 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 13px; resize: vertical; outline: none; font-family: var(--font-body); }
.ws-broadcast-row { display: flex; gap: 8px; margin-top: 8px; }
.ws-broadcast-select { flex: 1; padding: 9px 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 13px; }
.ws-audit-note { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); font-size: 10px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 推送结果 + 历史 */
.ws-bc-result { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 12px; }
.ws-bc-result.ok { background: rgba(198,255,61,0.1); color: var(--color-accent-lime); border: 1px solid rgba(198,255,61,0.25); }
.ws-bc-result.fail { background: rgba(255,107,107,0.1); color: var(--color-accent-coral); border: 1px solid rgba(255,107,107,0.25); }
.ws-bc-history { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--color-border); }
.ws-bc-history-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-bc-history-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; margin-top: 8px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border-left: 2px solid var(--color-accent-cyan); }
.ws-bc-h-text { font-size: 12px; color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ws-bc-h-meta { font-size: 10px; color: var(--color-text-muted); }
.ws-fade-enter-active, .ws-fade-leave-active { transition: opacity 0.25s ease; }
.ws-fade-enter-from, .ws-fade-leave-to { opacity: 0; }

.ws-survey-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.ws-survey-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-survey-info h4 { font-size: 13px; margin: 0 0 4px; }
.ws-survey-info span { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-survey-rate { font-family: var(--font-display); font-weight: 700; font-size: 20px; color: var(--color-accent-lime); }

/* UGC管理 */
.ws-ugc-filters { display: flex; gap: 6px; }
.ws-ugc-filter { padding: 4px 10px; font-size: 11px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); cursor: pointer; }
.ws-ugc-filter.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); }
.ws-ugc-list { display: flex; flex-direction: column; gap: 10px; }
.ws-ugc-item { display: flex; gap: 12px; padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-ugc-avatar { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: var(--color-surface-light); border-radius: 50%; font-size: 16px; flex-shrink: 0; }
.ws-ugc-body { flex: 1; }
.ws-ugc-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ws-ugc-type { font-size: 10px; padding: 2px 7px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-ugc-type.测评 { background: rgba(0,229,255,0.1); color: var(--color-accent-cyan); }
.ws-ugc-type.打卡 { background: rgba(198,255,61,0.1); color: var(--color-accent-lime); }
.ws-ugc-type.社群问答 { background: rgba(183,148,244,0.1); color: var(--color-accent-violet); }
.ws-ugc-flag { font-size: 10px; padding: 2px 7px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-ugc-flag.featured { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-ugc-flag.pinned { background: rgba(255,107,107,0.15); color: var(--color-accent-coral); }
.ws-ugc-author { font-size: 11px; color: var(--color-text-muted); }
.ws-ugc-body h4 { font-size: 14px; margin: 0 0 6px; font-weight: 500; }
.ws-ugc-stats { display: flex; gap: 12px; font-size: 11px; color: var(--color-text-muted); align-items: center; }
.ws-ugc-stats span { display: inline-flex; align-items: center; gap: 3px; }
.ws-ugc-like { display: inline-flex; align-items: center; gap: 3px; background: none; border: none; color: var(--color-text-muted); font-size: 11px; cursor: pointer; padding: 2px 6px; border-radius: var(--radius-pill); transition: all var(--transition-base); }
.ws-ugc-like:hover { background: rgba(255,107,107,0.08); }
.ws-ugc-like.liked { color: var(--color-accent-coral); }
.ws-ugc-replies { margin-top: 8px; padding: 8px 10px; background: rgba(0,229,255,0.04); border-left: 2px solid var(--color-accent-cyan); border-radius: var(--radius-xs); display: flex; flex-direction: column; gap: 4px; }
.ws-ugc-reply { font-size: 11px; color: var(--color-text-secondary); display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
.ws-reply-user { color: var(--color-accent-cyan); font-weight: 600; }
.ws-reply-time { font-size: 10px; color: var(--color-text-muted); margin-left: auto; }
.ws-reply-input-row { display: flex; gap: 6px; margin-top: 8px; }
.ws-reply-input { flex: 1; padding: 6px 10px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 12px; outline: none; }
.ws-reply-input:focus { border-color: var(--color-accent-cyan); }
.ws-reply-send { padding: 4px 12px !important; font-size: 11px !important; }
.ws-reply-cancel { padding: 4px 10px !important; font-size: 11px !important; }
.ws-ugc-empty { padding: 32px; text-align: center; color: var(--color-text-muted); font-size: 12px; }
.ws-ugc-actions { display: flex; gap: 4px; flex-direction: column; }
.ws-ugc-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; font-size: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-base); }
.ws-ugc-btn:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-ugc-btn.active { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); background: rgba(0,229,255,0.08); }
.ws-qr-chip.copied { background: rgba(198,255,61,0.12) !important; color: var(--color-accent-lime) !important; border-color: rgba(198,255,61,0.3) !important; }

.ws-cocreate-side-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.ws-column-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.ws-column-item { padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-col-tag { font-size: 10px; padding: 2px 7px; background: rgba(198,255,61,0.1); color: var(--color-accent-lime); border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-column-item h4 { font-size: 13px; margin: 6px 0 4px; }
.ws-col-meta { font-size: 11px; color: var(--color-text-muted); }
.ws-welfare-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.ws-welfare-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-welfare-item h4 { font-size: 13px; margin: 0; }
.ws-welfare-data { font-size: 11px; color: var(--color-accent-amber); font-family: var(--font-mono); }

/* 沟通活动 */
.ws-comm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.ws-channel-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.ws-channel-card { flex: 1; min-width: 100px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; }
.ws-channel-card.cyan { border-color: rgba(0,229,255,0.2); }
.ws-channel-card.lime { border-color: rgba(198,255,61,0.2); }
.ws-channel-card.amber { border-color: rgba(255,184,77,0.2); }
.ws-channel-card.coral { border-color: rgba(255,107,107,0.2); }
.ws-ch-name { display: block; font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; }
.ws-ch-count { display: block; font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--color-accent-cyan); }
.ws-quick-replies { display: flex; flex-direction: column; gap: 6px; }
.ws-qr-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-qr-chip { padding: 6px 10px; font-size: 11px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-secondary); cursor: pointer; text-align: left; }
.ws-qr-chip:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }

.ws-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.ws-data-item { padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; }
.ws-data-num { display: block; font-family: var(--font-display); font-weight: 700; font-size: 24px; }
.ws-data-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-growth-note { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(198,255,61,0.06); border: 1px solid rgba(198,255,61,0.2); border-radius: var(--radius-sm); font-size: 12px; }

.ws-activity-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.ws-activity-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-act-info { flex: 1; }
.ws-act-type { font-size: 10px; padding: 2px 7px; border-radius: var(--radius-pill); font-family: var(--font-mono); margin-bottom: 4px; display: inline-block; }
.ws-act-type.live { background: rgba(255,107,107,0.15); color: var(--color-accent-coral); }
.ws-act-type.salon { background: rgba(183,148,244,0.15); color: var(--color-accent-violet); }
.ws-act-info h4 { font-size: 13px; margin: 4px 0; }
.ws-act-meta { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-act-btn { padding: 6px 14px; font-size: 11px; background: var(--color-accent-cyan-soft); border: 1px solid var(--color-accent-cyan-soft); border-radius: var(--radius-pill); color: var(--color-accent-cyan); cursor: pointer; }

@media (max-width: 1024px) {
  .ws-submit-grid, .ws-reach-grid, .ws-comm-grid, .ws-cocreate-side-grid { grid-template-columns: 1fr; }
  .ws-feedback-columns { grid-template-columns: 1fr; }
  .ws-admin-grid { grid-template-columns: 1fr; }
}
</style>

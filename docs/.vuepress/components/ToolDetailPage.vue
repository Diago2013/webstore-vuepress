<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WsIcon from './shared/WsIcon.vue'
import { tools, gradients, getTool } from '../data/tools.ts'
import { developers } from '../data/community.ts'
import {
  isFavorited, toggleFavorite,
  isFollowing, toggleFollow,
  voteToolUpdate, getToolVotes,
  voteCoRequest, getCoVotes,
  launchTool, getLaunchCount,
  addReview, getReviews
} from '../store/useStore.ts'

const route = useRoute()
const router = useRouter()

// 根据路由 ?id= 读取对应工具
const toolId = computed(() => (route.query.id as string) || 't1')
const tool = ref(getTool(toolId.value) || tools[0])

// 监听路由变化（SPA 跳转时切换工具）
watch(() => route.query.id, (newId) => {
  const t = getTool((newId as string) || 't1')
  if (t) {
    tool.value = t
    activeTab.value = 'info'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const developer = computed(() => developers.find(d => d.id === tool.value.developerId) || {
  id: tool.value.developerId,
  name: tool.value.developerName,
  avatar: tool.value.developerAvatar,
  bio: '专注工具开发的创作者',
  tools: 1,
  followers: 0,
  responseRate: 95
})

const coverGradient = computed(() => gradients[tool.value.cover])

// Tab切换
const activeTab = ref<'info' | 'interact' | 'security' | 'co-creation'>('info')

// 版本对比
const compareVersions = ref<string[]>([])
const toggleCompare = (v: string) => {
  const i = compareVersions.value.indexOf(v)
  if (i >= 0) compareVersions.value.splice(i, 1)
  else if (compareVersions.value.length < 2) compareVersions.value.push(v)
}
const compareResult = ref(false)
const showCompare = () => {
  if (compareVersions.value.length === 2) compareResult.value = true
}

// 求更新投票（持久化到 store）
const baseVotes = 842
const totalVotes = computed(() => baseVotes + getToolVotes(tool.value.id))
const voted = ref(false)
const voteUpdate = () => {
  if (voted.value) return
  voted.value = true
  voteToolUpdate(tool.value.id)
}

// 口碑词云
const wordCloud = computed(() => tool.value.wordCloud)

// 临时聊天室
const chatMessages = ref([
  { user: '设计师小K', avatar: '◈', text: '这个工具的AI风格迁移真的强', time: '14:23' },
  { user: '代码诗人', avatar: '✦', text: '刚升级到v3.2.1，性能确实提升了不少', time: '14:25' },
  { user: '数据矿工', avatar: '◢', text: '请问骨骼动画有教程吗？', time: '14:28' },
  { user: 'NovaStudio', avatar: '◆', text: '@数据矿工 官方文档有详细教程，社区也有横评帖', time: '14:30', isDev: true }
])
const chatInput = ref('')
const sendChat = () => {
  if (!chatInput.value.trim()) return
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  chatMessages.value.push({ user: '林深时见鹿', avatar: '✿', text: chatInput.value, time })
  chatInput.value = ''
}

// 私信抽屉
const dmOpen = ref(false)
const dmMessages = ref<any[]>([])
const dmInput = ref('')
const sendDm = () => {
  if (!dmInput.value.trim()) return
  dmMessages.value.push({ from: 'me', text: dmInput.value })
  const userText = dmInput.value
  dmInput.value = ''
  // 智能回复（基于关键词）
  setTimeout(() => {
    let reply = '收到您的消息，稍后详细回复'
    if (userText.includes('授权') || userText.includes('商用')) reply = '您好！个人免费商用，企业需购买授权，详见授权页'
    else if (userText.includes('价格') || userText.includes('费用')) reply = `${tool.value.name} ${tool.value.isFree ? '基础功能免费' : '订阅制'}，可在工具内查看具体套餐`
    else if (userText.includes('教程') || userText.includes('文档')) reply = '官方文档中心有详细教程，社区也有用户撰写的进阶指南'
    else if (userText.includes('API')) reply = '我们提供完整 REST API 与 Webhook，可在开发者文档查看'
    dmMessages.value.push({ from: 'dev', text: reply })
  }, 1200)
}

// DM 快捷标签
const dmTags = ['咨询授权', '价格套餐', 'API文档', '功能建议', 'BUG反馈']
const fillDm = (tag: string) => {
  dmInput.value = `您好，想咨询${tag}相关事宜：`
}

// 共创需求
const coRequests = ref([
  { id: 'cr1', title: '支持图层混合模式', votes: 842, status: 'planned', type: 'short' },
  { id: 'cr2', title: '导出WebP格式', votes: 567, status: 'voting', type: 'short' },
  { id: 'cr3', title: '协作编辑功能', votes: 1203, status: 'planning', type: 'long' },
  { id: 'cr4', title: 'AI生成3D像素体素', votes: 2340, status: 'planning', type: 'long' }
])

const newCoRequest = ref('')
const submitCoRequest = () => {
  if (!newCoRequest.value.trim()) return
  coRequests.value.unshift({
    id: 'cr_' + Date.now(),
    title: newCoRequest.value,
    votes: 1,
    status: 'voting',
    type: 'short'
  })
  newCoRequest.value = ''
}

// 共创投票（持久化）
const votedCoReqs = ref<string[]>([])
const voteCo = (req: any) => {
  if (votedCoReqs.value.includes(req.id)) return
  votedCoReqs.value.push(req.id)
  voteCoRequest(req.id)
}
const coVotes = (reqId: string) => getCoVotes(reqId)
const statusMap: Record<string, { text: string; color: string }> = {
  planned: { text: '已排期', color: '#C6FF3D' },
  voting: { text: '投票中', color: '#00E5FF' },
  planning: { text: '评估中', color: '#FFB84D' }
}

// 纠错
const errorReport = ref(false)
const errorType = ref('')
const errorDesc = ref('')
const errorSubmitted = ref(false)
const submitError = () => {
  if (!errorType.value || !errorDesc.value.trim()) {
    alert('请选择错误类型并填写描述')
    return
  }
  errorSubmitted.value = true
  setTimeout(() => {
    errorReport.value = false
    errorType.value = ''
    errorDesc.value = ''
    errorSubmitted.value = false
  }, 2000)
}

// 答疑直播
const liveSession = ref({
  title: `${tool.value.name} ${tool.value.version} 新功能答疑专场`,
  time: '本周六 20:00',
  registered: false,
  questions: 28
})

const registerLive = () => { liveSession.value.registered = true }
const liveQuestion = ref('')
const askLiveQuestion = () => {
  if (!liveQuestion.value.trim()) return
  liveSession.value.questions++
  liveQuestion.value = ''
  alert('问题已提交，主播将在直播中解答')
}

// 评价提交
const reviewRating = ref(5)
const reviewContent = ref('')
const submitReview = () => {
  if (!reviewContent.value.trim()) return
  addReview(tool.value.id, {
    rating: reviewRating.value,
    content: reviewContent.value,
    user: '林深时见鹿',
    avatar: '✿'
  })
  reviewContent.value = ''
  reviewRating.value = 5
  alert('评价已发布，获得 +15 积分')
}
const myReviewsForTool = computed(() => getReviews(tool.value.id))

// 收藏 / 关注 / 启动（持久化）
const favorited = computed(() => isFavorited(tool.value.id))
const onFav = () => toggleFavorite(tool.value.id)

const following = computed(() => isFollowing(tool.value.developerId))
const onFollow = () => toggleFollow(tool.value.developerId)

// 启动工具
const launchModalOpen = ref(false)
const launchCount = computed(() => getLaunchCount(tool.value.id))
const launch = () => {
  launchTool(tool.value.id)
  launchModalOpen.value = true
}

// 替代工具点击
const goAlt = (altName: string) => {
  router.push({ path: '/category/', query: { q: altName } })
}

const maxWeight = computed(() => Math.max(...wordCloud.value.map(w => w.weight)))
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 工具头部 -->
      <div class="ws-tool-hero ws-anim-fade-up">
        <div class="ws-tool-cover" :style="{ background: coverGradient }">
          <span class="ws-cover-icon">{{ tool.icon }}</span>
          <div class="ws-cover-flags">
            <span v-if="tool.isHot" class="ws-flag flag-hot"><WsIcon name="flame" :size="11" /> 热门</span>
            <span v-if="tool.isFree" class="ws-flag flag-free">免费</span>
          </div>
        </div>
        <div class="ws-tool-main">
          <div class="ws-tool-title-row">
            <h1 class="ws-tool-name">{{ tool.name }}</h1>
            <span class="ws-tool-version font-mono">{{ tool.version }}</span>
            <span class="ws-online-badge"><span class="ws-online-pulse"></span>{{ tool.onlineUsers }} 在线</span>
          </div>
          <p class="ws-tool-slogan">{{ tool.slogan }}</p>
          <p class="ws-tool-desc">{{ tool.description }}</p>

          <div class="ws-tool-tags">
            <span v-for="tag in tool.tags" :key="tag" class="ws-tag-chip">{{ tag }}</span>
          </div>

          <div class="ws-tool-actions">
            <button class="ws-btn ws-btn-primary" @click="launch"><WsIcon name="arrow-right" :size="14" /> 立即使用 <span class="ws-launch-count" v-if="launchCount">· 已用 {{ launchCount }} 次</span></button>
            <button class="ws-btn ws-btn-ghost" :class="{ 'ws-fav-active': favorited }" @click="onFav">
              <WsIcon name="heart" :size="14" :color="favorited ? '#FF6B6B' : 'currentColor'" /> {{ favorited ? '已收藏' : '收藏' }}
            </button>
            <button class="ws-btn ws-btn-ghost" @click="dmOpen = true"><WsIcon name="message" :size="14" /> 私信开发者</button>
            <button class="ws-btn ws-btn-ghost" @click="errorReport = !errorReport"><WsIcon name="alert" :size="14" /> 纠错</button>
          </div>

          <div class="ws-tool-meta-row">
            <div class="ws-meta-item">
              <WsIcon name="star" :size="14" color="var(--color-accent-amber)" />
              <span class="ws-meta-val">{{ tool.rating }}</span>
              <span class="ws-meta-label">({{ tool.ratingCount }}评)</span>
            </div>
            <div class="ws-meta-item">
              <WsIcon name="trending-up" :size="14" color="var(--color-accent-lime)" />
              <span class="ws-meta-val font-mono">{{ tool.heat24h.toLocaleString() }}</span>
              <span class="ws-meta-label">24h热度</span>
            </div>
            <div class="ws-meta-item">
              <WsIcon name="users" :size="14" color="var(--color-accent-cyan)" />
              <span class="ws-meta-val font-mono">{{ tool.heat30d.toLocaleString() }}</span>
              <span class="ws-meta-label">30d热度</span>
            </div>
            <div class="ws-meta-item">
              <WsIcon name="clock" :size="14" color="var(--color-text-muted)" />
              <span class="ws-meta-label">更新于 {{ tool.updateTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 纠错面板 -->
      <Transition name="ws-slide-down">
        <div v-if="errorReport" class="ws-error-panel">
          <h3><WsIcon name="alert" :size="16" color="var(--color-accent-coral)" /> 一键纠错 · 修改建议直达开发者后台</h3>
          <div class="ws-error-row">
            <select v-model="errorType" class="ws-error-select">
              <option value="">选择错误类型</option>
              <option>信息过期</option>
              <option>链接失效</option>
              <option>描述不准确</option>
              <option>分类错误</option>
              <option>其他</option>
            </select>
            <input v-model="errorDesc" class="ws-error-input" placeholder="详细描述错误内容…" />
            <button class="ws-btn ws-btn-primary" @click="submitError">
              {{ errorSubmitted ? '已提交 ✓' : '提交纠错' }}
            </button>
          </div>
          <div v-if="errorSubmitted" class="ws-error-success">感谢您的反馈，开发者已收到</div>
        </div>
      </Transition>

      <!-- Tab 导航 -->
      <div class="ws-tab-nav">
        <button class="ws-tab-btn" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">核心信息</button>
        <button class="ws-tab-btn" :class="{ active: activeTab === 'interact' }" @click="activeTab = 'interact'">原生互动</button>
        <button class="ws-tab-btn" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">数据安全</button>
        <button class="ws-tab-btn" :class="{ active: activeTab === 'co-creation' }" @click="activeTab = 'co-creation'">V3.0 共创</button>
      </div>

      <!-- ===== 核心信息区 ===== -->
      <div v-show="activeTab === 'info'" class="ws-tab-content">
        <div class="ws-info-grid">
          <!-- 版本时间轴 -->
          <div class="ws-info-card ws-version-card">
            <div class="ws-card-head">
              <h3><WsIcon name="refresh" :size="16" color="var(--color-accent-cyan)" /> 版本时间轴</h3>
              <span class="ws-compare-hint">选择2个版本对比</span>
            </div>
            <div class="ws-timeline">
              <div
                v-for="(v, i) in tool.versionHistory"
                :key="v.version"
                class="ws-timeline-item"
                :class="{ selected: compareVersions.includes(v.version) }"
              >
                <div class="ws-timeline-dot" :class="{ latest: i === 0 }" @click="toggleCompare(v.version)"></div>
                <div class="ws-timeline-content" @click="toggleCompare(v.version)">
                  <div class="ws-version-head">
                    <span class="ws-version-num font-mono">{{ v.version }}</span>
                    <span v-if="i === 0" class="ws-latest-tag">最新</span>
                    <span class="ws-version-date">{{ v.date }}</span>
                  </div>
                  <ul class="ws-version-changes">
                    <li v-for="change in v.changes" :key="change">{{ change }}</li>
                  </ul>
                </div>
              </div>
            </div>
            <button v-if="compareVersions.length === 2" class="ws-compare-btn" @click="showCompare">
              <WsIcon name="grid" :size="14" /> 对比 {{ compareVersions.join(' vs ') }}
            </button>
            <Transition name="ws-slide-down">
              <div v-if="compareResult" class="ws-compare-result">
                <div class="ws-compare-result-head">
                  <span>版本差异对比</span>
                  <button class="ws-compare-close" @click="compareResult = false">×</button>
                </div>
                <div class="ws-compare-diff">
                  <div v-for="v in compareVersions" :key="v" class="ws-diff-col">
                    <span class="ws-diff-version">{{ v }}</span>
                    <ul>
                      <li v-for="ver in tool.versionHistory.find(x => x.version === v)?.changes" :key="ver">{{ ver }}</li>
                    </ul>
                  </div>
                </div>
                <div class="ws-compare-summary">两版本间共 {{ compareVersions.length }} 个版本，新增功能 {{ tool.versionHistory.find(x => x.version === compareVersions[1])?.changes.length || 0 }} 项</div>
              </div>
            </Transition>
          </div>

          <!-- 替代方案与依赖 -->
          <div class="ws-info-side">
            <div class="ws-info-card">
              <h3><WsIcon name="link" :size="16" color="var(--color-accent-lime)" /> 工具替代方案</h3>
              <div class="ws-alt-list">
                <div v-for="alt in tool.alternatives" :key="alt" class="ws-alt-item" @click="goAlt(alt)">
                  <span class="ws-alt-icon">⇄</span>{{ alt }}
                  <WsIcon name="arrow-right" :size="11" color="var(--color-text-muted)" />
                </div>
              </div>
            </div>
            <div class="ws-info-card">
              <h3><WsIcon name="settings" :size="16" color="var(--color-accent-amber)" /> 使用依赖环境</h3>
              <div class="ws-dep-list">
                <span v-for="dep in tool.dependencies" :key="dep" class="ws-dep-chip">{{ dep }}</span>
              </div>
            </div>
          </div>

          <!-- 开发者故事 -->
          <div class="ws-info-card ws-dev-story">
            <div class="ws-card-head">
              <h3><WsIcon name="code" :size="16" color="var(--color-accent-violet)" /> 开发者故事</h3>
              <button class="ws-follow-btn" :class="{ following }" @click="onFollow">
                <WsIcon :name="following ? 'check' : 'plus'" :size="12" /> {{ following ? '已关注' : '关注' }}
              </button>
            </div>
            <div class="ws-dev-info">
              <span class="ws-dev-avatar-lg">{{ developer.avatar }}</span>
              <div>
                <div class="ws-dev-name-row">
                  <h4>{{ developer.name }}</h4>
                  <WsIcon v-if="developer.verified" name="check-circle" :size="14" color="var(--color-accent-cyan)" />
                </div>
                <p class="ws-dev-bio">{{ developer.bio }}</p>
                <div class="ws-dev-stats">
                  <span><strong>{{ developer.followers.toLocaleString() }}</strong> 关注</span>
                  <span>互动分 <strong class="text-gradient">{{ developer.interactionScore }}</strong></span>
                  <span>响应率 <strong>{{ developer.responseRate }}%</strong></span>
                  <span>平均 <strong>{{ developer.avgResponseTime }}</strong></span>
                </div>
              </div>
            </div>
            <p class="ws-dev-story-text">"{{ developer.story }}"</p>
            <div class="ws-dev-team">
              <span class="ws-team-label">团队成员</span>
              <div v-for="m in developer.team" :key="m.name" class="ws-team-member">
                <span class="ws-team-avatar">{{ m.avatar }}</span>
                <span class="ws-team-name">{{ m.name }}</span>
                <span class="ws-team-role">{{ m.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 原生互动区 ===== -->
      <div v-show="activeTab === 'interact'" class="ws-tab-content">
        <div class="ws-interact-grid">
          <!-- 实时在线动态 -->
          <div class="ws-interact-card">
            <h3><WsIcon name="users" :size="16" color="var(--color-accent-cyan)" /> 实时在线用户动态</h3>
            <div class="ws-online-feed">
              <div class="ws-feed-item">
                <span class="ws-feed-avatar">◈</span>
                <span class="ws-feed-text"><strong>设计师小K</strong> 正在使用</span>
                <span class="ws-feed-time font-mono">刚刚</span>
              </div>
              <div class="ws-feed-item">
                <span class="ws-feed-avatar">✦</span>
                <span class="ws-feed-text"><strong>代码诗人</strong> 收藏了此工具</span>
                <span class="ws-feed-time font-mono">2分钟前</span>
              </div>
              <div class="ws-feed-item">
                <span class="ws-feed-avatar">◢</span>
                <span class="ws-feed-text"><strong>数据矿工</strong> 发布了测评</span>
                <span class="ws-feed-time font-mono">15分钟前</span>
              </div>
              <div class="ws-feed-item">
                <span class="ws-feed-avatar">◉</span>
                <span class="ws-feed-text"><strong>Kael</strong> 提交了功能建议</span>
                <span class="ws-feed-time font-mono">1小时前</span>
              </div>
            </div>
          </div>

          <!-- 求更新投票 -->
          <div class="ws-interact-card">
            <h3><WsIcon name="bell" :size="16" color="var(--color-accent-amber)" /> 求更新投票</h3>
            <p class="ws-vote-desc">希望工具增加某功能？投票达标后推送提醒给开发者</p>
            <div class="ws-vote-box">
              <div class="ws-vote-count">
                <span class="ws-vote-num font-mono">{{ totalVotes }}</span>
                <span class="ws-vote-label">已投票</span>
              </div>
              <div class="ws-vote-bar">
                <div class="ws-vote-progress" :style="{ width: Math.min(totalVotes / 1000 * 100, 100) + '%' }"></div>
              </div>
              <span class="ws-vote-target">当前 {{ totalVotes }} 票 · 目标 1000 票</span>
            </div>
            <button class="ws-btn ws-btn-primary" :disabled="voted" @click="voteUpdate">
              <WsIcon name="plus" :size="14" /> {{ voted ? '已投票 ✓' : '我来投一票' }}
            </button>
          </div>

          <!-- 口碑词云 -->
          <div class="ws-interact-card ws-word-cloud-card">
            <h3><WsIcon name="grid" :size="16" color="var(--color-accent-lime)" /> 口碑词云 · 短句标签评价</h3>
            <div class="ws-word-cloud">
              <span
                v-for="w in wordCloud"
                :key="w.word"
                class="ws-word"
                :style="{
                  fontSize: (12 + (w.weight / maxWeight) * 22) + 'px',
                  opacity: 0.5 + (w.weight / maxWeight) * 0.5,
                  color: w.weight > 80 ? 'var(--color-accent-cyan)' : w.weight > 60 ? 'var(--color-accent-lime)' : 'var(--color-text-secondary)'
                }"
              >{{ w.word }}</span>
            </div>
          </div>

          <!-- 24h临时聊天室 -->
          <div class="ws-interact-card ws-chat-card">
            <div class="ws-card-head">
              <h3><WsIcon name="chat" :size="16" color="var(--color-accent-violet)" /> 24小时临时访客聊天室</h3>
              <span class="ws-chat-timer font-mono"><WsIcon name="clock" :size="11" /> 18:42:15 后自动解散</span>
            </div>
            <div class="ws-chat-messages">
              <div v-for="(msg, i) in chatMessages" :key="i" class="ws-chat-msg" :class="{ dev: msg.isDev }">
                <span class="ws-chat-avatar">{{ msg.avatar }}</span>
                <div>
                  <div class="ws-chat-meta">
                    <strong>{{ msg.user }}</strong>
                    <span v-if="msg.isDev" class="ws-dev-tag">开发者</span>
                    <span class="ws-chat-time font-mono">{{ msg.time }}</span>
                  </div>
                  <p>{{ msg.text }}</p>
                </div>
              </div>
            </div>
            <div class="ws-chat-input-row">
              <input v-model="chatInput" class="ws-chat-input" placeholder="说点什么…" @keydown.enter="sendChat" />
              <button class="ws-chat-send" @click="sendChat"><WsIcon name="send" :size="14" /></button>
            </div>
          </div>

          <!-- 我的评价 -->
          <div class="ws-interact-card ws-review-card">
            <h3><WsIcon name="star" :size="16" color="var(--color-accent-amber)" /> 撰写评价 · 发布后获得 +15 积分</h3>
            <div class="ws-review-form">
              <div class="ws-review-rating">
                <span>评分：</span>
                <div class="ws-stars">
                  <button
                    v-for="n in 5"
                    :key="n"
                    class="ws-star-btn"
                    :class="{ active: n <= reviewRating }"
                    @click="reviewRating = n"
                  >★</button>
                </div>
                <span class="ws-rating-text">{{ ['','差评','一般','还行','不错','力荐'][reviewRating] }}</span>
              </div>
              <textarea
                v-model="reviewContent"
                class="ws-review-textarea"
                placeholder="分享你的使用体验，帮助其他用户做出选择…"
                rows="3"
              ></textarea>
              <div class="ws-review-actions">
                <span class="ws-review-count font-mono">{{ reviewContent.length }} / 500</span>
                <button class="ws-btn ws-btn-primary" @click="submitReview" :disabled="!reviewContent.trim()">
                  <WsIcon name="send" :size="13" /> 发布评价
                </button>
              </div>
            </div>

            <!-- 已发布的评价 -->
            <div v-if="myReviewsForTool.length" class="ws-review-list">
              <h4>我的评价 ({{ myReviewsForTool.length }})</h4>
              <div v-for="r in myReviewsForTool" :key="r.id" class="ws-review-item">
                <span class="ws-review-avatar">{{ r.avatar }}</span>
                <div class="ws-review-body">
                  <div class="ws-review-meta">
                    <strong>{{ r.user }}</strong>
                    <span class="ws-review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
                    <span class="ws-review-time font-mono">{{ new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false }).slice(5, 16) }}</span>
                  </div>
                  <p>{{ r.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 数据安全区 ===== -->
      <div v-show="activeTab === 'security'" class="ws-tab-content">
        <div class="ws-security-grid">
          <!-- 隐私体检 -->
          <div class="ws-security-card">
            <h3><WsIcon name="shield" :size="18" color="var(--color-accent-lime)" /> 网页隐私体检</h3>
            <div class="ws-privacy-score">
              <div class="ws-score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" stroke-width="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-accent-lime)" stroke-width="8"
                    stroke-linecap="round" stroke-dasharray="314" :stroke-dashoffset="314 - (tool.privacyScore / 5 * 314)"
                    transform="rotate(-90 60 60)" />
                </svg>
                <div class="ws-score-center">
                  <span class="ws-score-num">{{ tool.privacyScore }}.0</span>
                  <span class="ws-score-label">/ 5.0</span>
                </div>
              </div>
              <div class="ws-privacy-items">
                <div class="ws-privacy-item ok"><WsIcon name="check" :size="12" /> 无追踪脚本</div>
                <div class="ws-privacy-item ok"><WsIcon name="check" :size="12" /> 最小化Cookie</div>
                <div class="ws-privacy-item ok"><WsIcon name="check" :size="12" /> HTTPS强制</div>
                <div class="ws-privacy-item ok"><WsIcon name="check" :size="12" /> 无第三方数据共享</div>
                <div class="ws-privacy-item ok"><WsIcon name="check" :size="12" /> 数据可导出/删除</div>
              </div>
            </div>
          </div>

          <!-- 可用性监控 -->
          <div class="ws-security-card ws-availability-card">
            <h3><WsIcon name="trending-up" :size="18" color="var(--color-accent-cyan)" /> 近30天可用性监控</h3>
            <div class="ws-avail-stats">
              <div class="ws-avail-stat">
                <span class="ws-avail-num text-gradient">99.97%</span>
                <span class="ws-avail-label">平均可用率</span>
              </div>
              <div class="ws-avail-stat">
                <span class="ws-avail-num font-mono">856ms</span>
                <span class="ws-avail-label">平均加载</span>
              </div>
              <div class="ws-avail-stat">
                <span class="ws-avail-num font-mono">0</span>
                <span class="ws-avail-label">宕机次数</span>
              </div>
            </div>
            <!-- 可用性柱状图 -->
            <div class="ws-avail-chart">
              <div
                v-for="(a, i) in tool.availability"
                :key="i"
                class="ws-avail-bar"
                :style="{ height: ((a.uptime - 99) / 1.2 * 100) + '%' }"
                :title="`${a.date}: ${a.uptime.toFixed(2)}% / ${Math.round(a.loadTime)}ms`"
              ></div>
            </div>
            <div class="ws-avail-legend">
              <span><span class="ws-dot dot-ok"></span> 正常 (99%+)</span>
              <span><span class="ws-dot dot-warn"></span> 波动 (98-99%)</span>
              <span><span class="ws-dot dot-down"></span> 异常 (<98%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== V3.0 共创区 ===== -->
      <div v-show="activeTab === 'co-creation'" class="ws-tab-content">
        <div class="ws-cocreation-grid">
          <!-- 共创需求看板 -->
          <div class="ws-cocreate-board">
            <div class="ws-card-head">
              <h3><WsIcon name="bulb" :size="16" color="var(--color-accent-cyan)" /> 共创需求看板</h3>
              <span class="ws-board-hint">区分短期功能投票 / 长期开发企划</span>
            </div>
            <div class="ws-cocreate-input">
              <input v-model="newCoRequest" placeholder="提出你的功能建议，标注使用场景…" @keydown.enter="submitCoRequest" />
              <button @click="submitCoRequest"><WsIcon name="plus" :size="14" /> 提交</button>
            </div>
            <div class="ws-cocreate-list">
              <div v-for="req in coRequests" :key="req.title" class="ws-cocreate-item">
                <span class="ws-req-type" :class="req.type">{{ req.type === 'short' ? '短期' : '长期' }}</span>
                <div class="ws-req-info">
                  <h4>{{ req.title }}</h4>
                  <span class="ws-req-status" :class="req.status">
                    {{ statusMap[req.status]?.text || '投票中' }}
                  </span>
                </div>
                <button
                  class="ws-req-vote"
                  :class="{ voted: votedCoReqs.includes(req.id) }"
                  :disabled="votedCoReqs.includes(req.id)"
                  @click="voteCo(req)"
                >
                  <WsIcon name="trending-up" :size="12" />
                  <span class="font-mono">{{ req.votes + coVotes(req.id) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 答疑直播 -->
          <div class="ws-cocreate-side">
            <div class="ws-cocreate-card ws-live-card">
              <div class="ws-live-badge"><WsIcon name="video" :size="12" /> 答疑专场</div>
              <h3>{{ liveSession.title }}</h3>
              <p class="ws-live-time"><WsIcon name="clock" :size="13" /> {{ liveSession.time }}</p>
              <p class="ws-live-questions">已收集 <strong>{{ liveSession.questions }}</strong> 个问题</p>
              <div class="ws-live-actions">
                <button class="ws-btn ws-btn-primary" :disabled="liveSession.registered" @click="registerLive">
                  {{ liveSession.registered ? '已预约 ✓' : '预约报名' }}
                </button>
                <button class="ws-btn ws-btn-ghost" @click="askLiveQuestion" :disabled="!liveQuestion.trim()">提前提问</button>
              </div>
              <input
                v-model="liveQuestion"
                class="ws-live-input"
                placeholder="输入想问的问题…"
                @keydown.enter="askLiveQuestion"
              />
              <p class="ws-live-note">未解决问题将留存至私信，开发者会逐一回复</p>
            </div>

            <!-- 体验打卡 -->
            <div class="ws-cocreate-card">
              <h3><WsIcon name="check-circle" :size="16" color="var(--color-accent-lime)" /> 工具体验打卡</h3>
              <p class="ws-card-desc">分享你的使用体验，优质内容展示在工具详情页</p>
              <button class="ws-btn ws-btn-ghost ws-full-btn" @click="activeTab = 'interact'; reviewContent = '打卡：今天使用了 ' + tool.name + '，体验很棒！'">
                <WsIcon name="edit" :size="14" /> 发布打卡
              </button>
            </div>

            <!-- 测评投稿 -->
            <div class="ws-cocreate-card">
              <h3><WsIcon name="file" :size="16" color="var(--color-accent-amber)" /> 测评投稿</h3>
              <p class="ws-card-desc">深度测评按互动数据发放积分，可兑换会员</p>
              <button class="ws-btn ws-btn-ghost ws-full-btn" @click="activeTab = 'interact'">
                <WsIcon name="edit" :size="14" /> 撰写测评
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具启动模态框 -->
    <Teleport to="body">
      <Transition name="ws-modal">
        <div v-if="launchModalOpen" class="ws-launch-modal" @click.self="launchModalOpen = false">
          <div class="ws-launch-box">
            <div class="ws-launch-head">
              <span class="ws-launch-icon" :style="{ background: coverGradient }">{{ tool.icon }}</span>
              <div>
                <h3>{{ tool.name }} {{ tool.version }}</h3>
                <p class="font-mono">由 {{ tool.developerName }} 提供 · 已安全启动</p>
              </div>
              <button class="ws-launch-close" @click="launchModalOpen = false">×</button>
            </div>
            <div class="ws-launch-frame">
              <div class="ws-launch-placeholder">
                <WsIcon name="rocket" :size="48" color="var(--color-accent-cyan)" />
                <h4>{{ tool.name }} 已启动</h4>
                <p>当前为模拟运行环境，实际项目中将加载工具真实页面</p>
                <p class="font-mono" style="color: var(--color-text-muted); font-size: 12px;">运行时数据隔离 · 自动同步配置 · 支持回滚</p>
              </div>
            </div>
            <div class="ws-launch-actions">
              <button class="ws-btn ws-btn-ghost" @click="launchModalOpen = false">关闭</button>
              <button class="ws-btn ws-btn-primary" @click="dmOpen = true; launchModalOpen = false">
                <WsIcon name="message" :size="14" /> 反馈建议
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 私信侧边抽屉 -->
    <Teleport to="body">
      <Transition name="ws-drawer">
        <div v-if="dmOpen" class="ws-dm-overlay" @click.self="dmOpen = false">
          <div class="ws-dm-drawer">
            <div class="ws-dm-header">
              <div class="ws-dm-dev">
                <span class="ws-dm-avatar">{{ developer.avatar }}</span>
                <div>
                  <h4>{{ developer.name }} <WsIcon name="check-circle" :size="13" color="var(--color-accent-cyan)" /></h4>
                  <span class="ws-dm-status"><span class="ws-online-pulse"></span>在线 · 平均{{ developer.avgResponseTime }}响应</span>
                </div>
              </div>
              <button class="ws-dm-close" @click="dmOpen = false"><WsIcon name="x" :size="18" /></button>
            </div>
            <div class="ws-dm-tags">
              <span
                v-for="tag in dmTags"
                :key="tag"
                class="ws-dm-tag"
                @click="fillDm(tag)"
              >{{ tag }}</span>
            </div>
            <div class="ws-dm-messages">
              <div v-for="(m, i) in dmMessages" :key="i" class="ws-dm-msg" :class="m.from">
                {{ m.text }}
              </div>
            </div>
            <div class="ws-dm-input-area">
              <button class="ws-dm-attach"><WsIcon name="image" :size="16" /></button>
              <input v-model="dmInput" placeholder="输入消息…支持截图附件" @keydown.enter="sendDm" />
              <button class="ws-dm-send" @click="sendDm"><WsIcon name="send" :size="14" /></button>
            </div>
            <div class="ws-dm-footer">
              <WsIcon name="shield" :size="11" color="var(--color-text-muted)" />
              <span>消息加密 · 支持已读状态 · 可一键清空归档</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ws-page { padding: 32px 0 80px; position: relative; z-index: 2; }

/* 工具头部 */
.ws-tool-hero {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  padding: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.ws-tool-cover {
  height: 200px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.ws-tool-cover::after { content:''; position:absolute; inset:0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 60%); }
.ws-cover-icon { font-size: 80px; color: white; filter: drop-shadow(0 4px 16px rgba(0,0,0,0.3)); z-index:1; }
.ws-cover-flags { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; z-index: 2; }
.ws-flag { display:inline-flex; align-items:center; gap:3px; font-size:10px; font-weight:600; padding:3px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.flag-hot { background: rgba(255,107,107,0.85); color: white; }
.flag-free { background: rgba(0,229,255,0.85); color: var(--color-base); }

.ws-tool-name { font-family: var(--font-display); font-weight: 800; font-size: 36px; margin: 0; letter-spacing: -0.02em; }
.ws-tool-version { font-size: 13px; padding: 3px 8px; background: rgba(255,255,255,0.05); border-radius: 5px; color: var(--color-text-muted); }
.ws-online-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--color-accent-lime); font-family: var(--font-mono); margin-left: auto; }
.ws-online-pulse { width: 6px; height: 6px; background: var(--color-accent-lime); border-radius: 50%; animation: ws-blink 2s ease-in-out infinite; }
.ws-tool-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.ws-tool-slogan { font-size: 16px; color: var(--color-accent-cyan); margin: 0 0 10px; font-weight: 500; }
.ws-tool-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin: 0 0 16px; }
.ws-tool-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
.ws-tag-chip { font-size: 11px; padding: 4px 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); }
.ws-tool-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.ws-tool-meta-row { display: flex; gap: 20px; flex-wrap: wrap; padding-top: 16px; border-top: 1px solid var(--color-border); }
.ws-meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; }
.ws-meta-val { color: var(--color-text); font-weight: 600; }
.ws-meta-label { color: var(--color-text-muted); font-size: 12px; }

/* 纠错 */
.ws-error-panel { padding: 18px; background: rgba(255,107,107,0.05); border: 1px solid rgba(255,107,107,0.2); border-radius: var(--radius-md); margin-bottom: 20px; }
.ws-error-panel h3 { display: flex; align-items: center; gap: 8px; font-size: 14px; margin: 0 0 12px; color: var(--color-text); }
.ws-error-row { display: flex; gap: 8px; flex-wrap: wrap; }
.ws-error-select, .ws-error-input { padding: 9px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 13px; }
.ws-error-input { flex: 1; min-width: 200px; }
.ws-error-select { min-width: 140px; }

/* Tab */
.ws-tab-nav { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid var(--color-border); padding-bottom: 0; overflow-x: auto; }
.ws-tab-btn { padding: 12px 20px; font-size: 14px; background: none; border: none; color: var(--color-text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--transition-fast); white-space: nowrap; }
.ws-tab-btn:hover { color: var(--color-text); }
.ws-tab-btn.active { color: var(--color-accent-cyan); border-bottom-color: var(--color-accent-cyan); }

.ws-tab-content { animation: ws-fade-in 0.4s var(--ease-out); }

/* 信息区 */
.ws-info-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
.ws-info-card { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 20px; }
.ws-info-card h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 0 0 16px; }
.ws-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ws-card-head h3 { margin: 0; }
.ws-compare-hint { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 时间轴 */
.ws-timeline { position: relative; padding-left: 24px; }
.ws-timeline::before { content: ''; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: var(--color-border); }
.ws-timeline-item { position: relative; padding-bottom: 20px; cursor: pointer; }
.ws-timeline-dot { position: absolute; left: -22px; top: 4px; width: 16px; height: 16px; border-radius: 50%; background: var(--color-surface); border: 2px solid var(--color-border-strong); transition: all var(--transition-fast); }
.ws-timeline-dot.latest { background: var(--color-accent-cyan); border-color: var(--color-accent-cyan); box-shadow: 0 0 12px var(--color-accent-cyan); }
.ws-timeline-item.selected .ws-timeline-dot { background: var(--color-accent-lime); border-color: var(--color-accent-lime); }
.ws-version-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ws-version-num { font-size: 14px; color: var(--color-accent-cyan); font-weight: 700; }
.ws-latest-tag { font-size: 9px; padding: 2px 6px; background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-radius: 4px; font-family: var(--font-mono); }
.ws-version-date { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); margin-left: auto; }
.ws-version-changes { margin: 0; padding-left: 16px; font-size: 13px; color: var(--color-text-secondary); line-height: 1.7; }
.ws-compare-btn { margin-top: 12px; padding: 8px 14px; background: var(--color-accent-cyan-soft); border: 1px solid var(--color-accent-cyan-soft); border-radius: var(--radius-pill); color: var(--color-accent-cyan); font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }

/* 替代/依赖 */
.ws-alt-list { display: flex; flex-direction: column; gap: 8px; }
.ws-alt-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; }
.ws-alt-item:hover { border-color: var(--color-accent-cyan-soft); }
.ws-alt-icon { color: var(--color-accent-lime); }
.ws-dep-list { display: flex; flex-wrap: wrap; gap: 8px; }
.ws-dep-chip { font-size: 12px; padding: 6px 12px; background: rgba(255,184,77,0.08); border: 1px solid rgba(255,184,77,0.2); border-radius: var(--radius-pill); color: var(--color-accent-amber); }

/* 开发者故事 */
.ws-dev-story { grid-column: 1 / -1; }
.ws-follow-btn { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: var(--color-accent-cyan-soft); border: 1px solid var(--color-accent-cyan-soft); border-radius: var(--radius-pill); color: var(--color-accent-cyan); font-size: 12px; cursor: pointer; }
.ws-dev-info { display: flex; gap: 16px; margin-bottom: 16px; }
.ws-dev-avatar-lg { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: var(--color-surface-light); border-radius: 14px; font-size: 28px; color: var(--color-accent-cyan); flex-shrink: 0; }
.ws-dev-name-row { display: flex; align-items: center; gap: 6px; }
.ws-dev-name-row h4 { font-family: var(--font-display); font-weight: 600; font-size: 18px; margin: 0; }
.ws-dev-bio { font-size: 13px; color: var(--color-text-secondary); margin: 4px 0 8px; }
.ws-dev-stats { display: flex; gap: 16px; font-size: 12px; color: var(--color-text-muted); flex-wrap: wrap; }
.ws-dev-stats strong { color: var(--color-text); font-family: var(--font-mono); }
.ws-dev-story-text { font-family: var(--font-display); font-size: 17px; line-height: 1.7; color: var(--color-text); margin: 0 0 16px; padding: 16px 20px; background: rgba(0,229,255,0.04); border-left: 3px solid var(--color-accent-cyan); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-style: italic; }
.ws-dev-team { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding-top: 16px; border-top: 1px solid var(--color-border); }
.ws-team-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-team-member { display: flex; align-items: center; gap: 6px; }
.ws-team-avatar { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: var(--color-surface-light); border-radius: 50%; font-size: 12px; }
.ws-team-name { font-size: 13px; color: var(--color-text); }
.ws-team-role { font-size: 11px; color: var(--color-text-muted); }

/* 互动区 */
.ws-interact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.ws-interact-card { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-interact-card h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 16px; margin: 0 0 14px; }
.ws-online-feed { display: flex; flex-direction: column; gap: 10px; }
.ws-feed-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); }
.ws-feed-avatar { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--color-surface-light); border-radius: 50%; font-size: 13px; }
.ws-feed-text { flex: 1; font-size: 13px; color: var(--color-text-secondary); }
.ws-feed-text strong { color: var(--color-text); }
.ws-feed-time { font-size: 11px; color: var(--color-text-muted); }

.ws-vote-desc { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 16px; }
.ws-vote-box { margin-bottom: 14px; }
.ws-vote-count { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.ws-vote-num { font-family: var(--font-display); font-weight: 800; font-size: 32px; color: var(--color-accent-cyan); }
.ws-vote-label { font-size: 12px; color: var(--color-text-muted); }
.ws-vote-bar { height: 8px; background: var(--color-surface); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
.ws-vote-progress { height: 100%; background: var(--gradient-cyan-lime); border-radius: 4px; transition: width 0.6s var(--ease-out); }
.ws-vote-target { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 词云 */
.ws-word-cloud-card { grid-column: 1 / -1; }
.ws-word-cloud { display: flex; flex-wrap: wrap; gap: 14px 18px; align-items: center; justify-content: center; padding: 24px; min-height: 180px; }
.ws-word { font-family: var(--font-display); font-weight: 600; transition: all var(--transition-fast); cursor: default; }
.ws-word:hover { transform: scale(1.15); }

/* 聊天室 */
.ws-chat-card { grid-column: 1 / -1; }
.ws-chat-timer { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-accent-amber); }
.ws-chat-messages { display: flex; flex-direction: column; gap: 12px; max-height: 280px; overflow-y: auto; margin-bottom: 12px; padding: 4px; }
.ws-chat-msg { display: flex; gap: 10px; }
.ws-chat-avatar { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: var(--color-surface-light); border-radius: 50%; font-size: 14px; flex-shrink: 0; }
.ws-chat-msg.dev .ws-chat-avatar { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); }
.ws-chat-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 2px; }
.ws-chat-meta strong { color: var(--color-text); font-size: 13px; }
.ws-dev-tag { font-size: 9px; padding: 1px 5px; background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-radius: 3px; font-family: var(--font-mono); }
.ws-chat-time { color: var(--color-text-muted); font-size: 10px; }
.ws-chat-msg p { margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; }
.ws-chat-input-row { display: flex; gap: 8px; }
.ws-chat-input { flex: 1; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text); font-size: 13px; outline: none; }
.ws-chat-input:focus { border-color: var(--color-accent-cyan); }
.ws-chat-send { width: 36px; height: 36px; background: var(--gradient-cyan-lime); color: var(--color-base); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* 数据安全 */
.ws-security-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
.ws-security-card { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-security-card h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 0 0 20px; }
.ws-privacy-score { display: flex; gap: 24px; align-items: center; }
.ws-score-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.ws-score-ring svg { width: 100%; height: 100%; }
.ws-score-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ws-score-num { font-family: var(--font-display); font-weight: 800; font-size: 28px; color: var(--color-accent-lime); }
.ws-score-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-privacy-items { display: flex; flex-direction: column; gap: 8px; }
.ws-privacy-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-secondary); }
.ws-privacy-item.ok { color: var(--color-accent-lime); }

.ws-avail-stats { display: flex; gap: 24px; margin-bottom: 20px; }
.ws-avail-stat { display: flex; flex-direction: column; }
.ws-avail-num { font-family: var(--font-display); font-weight: 700; font-size: 24px; }
.ws-avail-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); margin-top: 2px; }
.ws-avail-chart { display: flex; align-items: flex-end; gap: 3px; height: 80px; padding: 8px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); margin-bottom: 12px; }
.ws-avail-bar { flex: 1; background: var(--color-accent-lime); border-radius: 2px 2px 0 0; min-height: 4px; opacity: 0.7; transition: opacity 0.2s; }
.ws-avail-bar:hover { opacity: 1; }
.ws-avail-legend { display: flex; gap: 16px; font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
.dot-ok { background: var(--color-accent-lime); }
.dot-warn { background: var(--color-accent-amber); }
.dot-down { background: var(--color-accent-coral); }

/* 共创 */
.ws-cocreation-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
.ws-cocreate-board { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-board-hint { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-cocreate-input { display: flex; gap: 8px; margin-bottom: 16px; }
.ws-cocreate-input input { flex: 1; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 13px; outline: none; }
.ws-cocreate-input input:focus { border-color: var(--color-accent-cyan); }
.ws-cocreate-input button { display: inline-flex; align-items: center; gap: 5px; padding: 0 16px; background: var(--gradient-cyan-lime); color: var(--color-base); border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; }
.ws-cocreate-list { display: flex; flex-direction: column; gap: 10px; }
.ws-cocreate-item { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-req-type { font-size: 10px; padding: 3px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); font-weight: 600; }
.ws-req-type.short { background: rgba(0,229,255,0.1); color: var(--color-accent-cyan); }
.ws-req-type.long { background: rgba(183,148,244,0.1); color: var(--color-accent-violet); }
.ws-req-info { flex: 1; }
.ws-req-info h4 { font-size: 14px; margin: 0 0 4px; color: var(--color-text); font-weight: 500; }
.ws-req-status { font-size: 11px; font-family: var(--font-mono); }
.ws-req-status.planned { color: var(--color-accent-lime); }
.ws-req-status.voting { color: var(--color-accent-amber); }
.ws-req-status.planning { color: var(--color-accent-violet); }
.ws-req-vote { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-accent-lime); font-size: 12px; cursor: pointer; }

.ws-cocreate-side { display: flex; flex-direction: column; gap: 16px; }
.ws-cocreate-card { padding: 20px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-cocreate-card h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 15px; margin: 0 0 8px; }
.ws-card-desc { font-size: 12px; color: var(--color-text-muted); margin: 0 0 12px; }
.ws-full-btn { width: 100%; }
.ws-live-card { background: linear-gradient(135deg, rgba(183,148,244,0.08), rgba(0,229,255,0.04)); border-color: rgba(183,148,244,0.2); }
.ws-live-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 3px 8px; background: var(--color-accent-violet); color: white; border-radius: var(--radius-pill); font-family: var(--font-mono); margin-bottom: 10px; }
.ws-live-card h3 { font-size: 17px; }
.ws-live-time { font-size: 13px; color: var(--color-text-secondary); margin: 8px 0; display: flex; align-items: center; gap: 6px; }
.ws-live-questions { font-size: 12px; color: var(--color-text-muted); margin: 0 0 14px; }
.ws-live-questions strong { color: var(--color-accent-cyan); font-family: var(--font-mono); }
.ws-live-actions { display: flex; gap: 8px; margin-bottom: 10px; }
.ws-live-note { font-size: 11px; color: var(--color-text-muted); font-style: italic; margin: 0; }

/* 私信抽屉 */
.ws-dm-overlay { position: fixed; inset: 0; background: rgba(5,8,24,0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; justify-content: flex-end; }
.ws-dm-drawer { width: 420px; max-width: 100%; background: var(--color-surface); border-left: 1px solid var(--color-border); display: flex; flex-direction: column; box-shadow: -16px 0 48px rgba(0,0,0,0.4); }
.ws-dm-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--color-border); }
.ws-dm-dev { display: flex; align-items: center; gap: 12px; }
.ws-dm-avatar { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background: var(--color-surface-light); border-radius: 12px; font-size: 20px; color: var(--color-accent-cyan); }
.ws-dm-dev h4 { font-family: var(--font-display); font-weight: 600; font-size: 15px; margin: 0; display: flex; align-items: center; gap: 4px; }
.ws-dm-status { font-size: 11px; color: var(--color-accent-lime); display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); }
.ws-dm-close { width: 32px; height: 32px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: 50%; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ws-dm-tags { display: flex; gap: 6px; padding: 12px 20px; border-bottom: 1px solid var(--color-border); flex-wrap: wrap; }
.ws-dm-tag { font-size: 11px; padding: 4px 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); cursor: pointer; }
.ws-dm-tag:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-dm-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.ws-dm-msg { max-width: 75%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
.ws-dm-msg.me { background: var(--color-surface-light); color: var(--color-text); align-self: flex-end; border-bottom-right-radius: 4px; }
.ws-dm-msg.dev { background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.15); color: var(--color-text); align-self: flex-start; border-bottom-left-radius: 4px; }
.ws-dm-input-area { display: flex; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--color-border); align-items: center; }
.ws-dm-attach { width: 36px; height: 36px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: 50%; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ws-dm-input-area input { flex: 1; padding: 10px 14px; background: var(--color-base); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text); font-size: 13px; outline: none; }
.ws-dm-send { width: 36px; height: 36px; background: var(--gradient-cyan-lime); color: var(--color-base); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ws-dm-footer { padding: 10px 20px; border-top: 1px solid var(--color-border); display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 过渡 */
.ws-slide-down-enter-active, .ws-slide-down-leave-active { transition: all 0.3s var(--ease-out); }
.ws-slide-down-enter-from, .ws-slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
.ws-drawer-enter-active, .ws-drawer-leave-active { transition: opacity 0.3s; }
.ws-drawer-enter-active .ws-dm-drawer, .ws-drawer-leave-active .ws-dm-drawer { transition: transform 0.3s var(--ease-out); }
.ws-drawer-enter-from, .ws-drawer-leave-to { opacity: 0; }
.ws-drawer-enter-from .ws-dm-drawer, .ws-drawer-leave-to .ws-dm-drawer { transform: translateX(100%); }

@media (max-width: 1024px) {
  .ws-tool-hero { grid-template-columns: 1fr; }
  .ws-tool-cover { height: 160px; }
  .ws-info-grid, .ws-interact-grid, .ws-security-grid, .ws-cocreation-grid { grid-template-columns: 1fr; }
  .ws-privacy-score { flex-direction: column; }
}

/* ===== 收藏激活态 ===== */
.ws-fav-active {
  color: var(--color-accent-coral) !important;
  border-color: var(--color-accent-coral) !important;
  background: rgba(255, 107, 107, 0.1) !important;
}

.ws-launch-count {
  font-size: 11px;
  opacity: 0.7;
  font-family: var(--font-mono);
}

/* 关注按钮已关注态 */
.ws-follow-btn.following {
  background: var(--color-accent-lime);
  color: var(--color-base);
  border-color: var(--color-accent-lime);
}

/* 替代方案可点击 */
.ws-alt-item {
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ws-alt-item:hover {
  background: var(--color-accent-cyan-soft);
  padding-left: 8px;
}

/* 共创投票已投 */
.ws-req-vote.voted {
  background: var(--color-accent-lime);
  color: var(--color-base);
  cursor: not-allowed;
}
.ws-req-vote.voted::after {
  content: ' ✓';
}

/* 纠错成功提示 */
.ws-error-success {
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(198, 255, 61, 0.1);
  border: 1px solid rgba(198, 255, 61, 0.3);
  border-radius: var(--radius-xs);
  color: var(--color-accent-lime);
  font-size: 12px;
  text-align: center;
}

/* 版本对比结果 */
.ws-compare-result {
  margin-top: 14px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.ws-compare-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.ws-compare-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}
.ws-compare-close:hover { color: var(--color-text); }

.ws-compare-diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ws-diff-col {
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border-radius: var(--radius-sm);
}

.ws-diff-version {
  display: block;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-accent-cyan);
  margin-bottom: 8px;
}

.ws-diff-col ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.ws-compare-summary {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}

/* 直播输入框 */
.ws-live-input {
  width: 100%;
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text);
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
}
.ws-live-input:focus { border-color: var(--color-accent-cyan); }

/* ===== 工具启动模态框 ===== */
.ws-launch-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ws-launch-box {
  width: 100%;
  max-width: 900px;
  background: linear-gradient(180deg, var(--color-base-elevated), var(--color-base));
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
}

.ws-launch-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.ws-launch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.ws-launch-head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text);
}

.ws-launch-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.ws-launch-close {
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}
.ws-launch-close:hover { color: var(--color-text); }

.ws-launch-frame {
  height: 380px;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ws-launch-placeholder {
  text-align: center;
  padding: 30px;
}

.ws-launch-placeholder h4 {
  margin: 16px 0 8px;
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text);
}

.ws-launch-placeholder p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.ws-launch-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--color-border);
}

/* ===== 评价卡 ===== */
.ws-review-card { grid-column: 1 / -1; }

.ws-review-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ws-review-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.ws-stars {
  display: flex;
  gap: 4px;
}

.ws-star-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.ws-star-btn:hover,
.ws-star-btn.active {
  color: var(--color-accent-amber);
  transform: scale(1.15);
}

.ws-rating-text {
  font-size: 12px;
  color: var(--color-accent-amber);
  font-weight: 600;
}

.ws-review-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}
.ws-review-textarea:focus { border-color: var(--color-accent-cyan); }

.ws-review-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ws-review-count {
  font-size: 11px;
  color: var(--color-text-muted);
}

.ws-review-list {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.ws-review-list h4 {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.ws-review-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.ws-review-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-surface-light);
  font-size: 14px;
  flex-shrink: 0;
}

.ws-review-body { flex: 1; min-width: 0; }

.ws-review-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 12px;
}

.ws-review-stars {
  color: var(--color-accent-amber);
  font-size: 11px;
}

.ws-review-time {
  color: var(--color-text-muted);
  font-size: 10px;
  margin-left: auto;
}

.ws-review-body p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* ===== 模态框过渡 ===== */
.ws-modal-enter-active,
.ws-modal-leave-active {
  transition: opacity 0.3s var(--ease-out);
}
.ws-modal-enter-active .ws-launch-box,
.ws-modal-leave-active .ws-launch-box {
  transition: transform 0.3s var(--ease-spring);
}
.ws-modal-enter-from,
.ws-modal-leave-to {
  opacity: 0;
}
.ws-modal-enter-from .ws-launch-box,
.ws-modal-leave-to .ws-launch-box {
  transform: scale(0.92) translateY(20px);
}
</style>

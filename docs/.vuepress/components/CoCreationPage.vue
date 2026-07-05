<script setup lang="ts">
import { ref, computed } from 'vue'
import WsIcon from './shared/WsIcon.vue'
import { coCreationRequests, contests } from '../data/community.ts'
import {
  isJoinedGroup, joinGroup,
  voteCoRequest, getCoVotes,
  userPoints, addPost
} from '../store/useStore.ts'

// 共建小组（每个分配一个独立 ID 用于持久化加入状态）
const coBuildGroups = ref([
  { id: 'cb1', name: 'PixelForge 内测组', members: 142, dev: 'NovaStudio', avatar: '◆', tasks: ['测试图层混合', '反馈性能问题'], badge: '活跃' },
  { id: 'cb2', name: 'DataPulse 数据故事组', members: 89, dev: 'QuantumVue', avatar: '◢', tasks: ['设计看板模板', '案例分享'], badge: '招募中' },
  { id: 'cb3', name: 'MarkdownFlow 写作组', members: 56, dev: 'InkWell', avatar: '✦', tasks: ['协作编辑测试', '模板创作'], badge: '活跃' }
])

const joinCoBuild = (g: any) => {
  if (isJoinedGroup(g.id)) {
    alert(`您已加入「${g.name}」`)
    return
  }
  joinGroup(g.id)
  g.members += 1
  alert(`已加入「${g.name}」，获得共建标识 +5 积分`)
}

// 定制需求
const customRequests = ref([
  { id: 'cr_req1', title: '需要支持 ClickHouse 数据源', budget: '¥5,000-8,000', dev: 'QuantumVue', status: '对接中', coCreator: '林深时见鹿', accepted: false, feedback: '' },
  { id: 'cr_req2', title: '像素体素3D生成插件', budget: '¥10,000+', dev: '招募中', status: '招标中', coCreator: null, accepted: false, feedback: '' },
  { id: 'cr_req3', title: 'Markdown 脑图导出功能', budget: '¥3,000', dev: 'InkWell', status: '已上线', coCreator: '代码诗人', accepted: false, feedback: '' }
])

const newRequest = ref('')
const newBudget = ref('待报价')
const submitRequest = () => {
  if (!newRequest.value.trim()) return
  customRequests.value.unshift({
    id: 'cr_req_' + Date.now(),
    title: newRequest.value.trim(),
    budget: newBudget.value || '待报价',
    dev: '招募中',
    status: '招标中',
    coCreator: '林深时见鹿',
    accepted: false,
    feedback: ''
  })
  // 同步发布到社区（需求征集）
  addPost({
    section: '需求',
    title: newRequest.value.trim(),
    content: `预算：${newBudget.value || '待报价'}\n期待开发者对接`,
    tags: ['定制需求'],
    likes: 0,
    comments: 0
  })
  newRequest.value = ''
  newBudget.value = '待报价'
  alert('需求已发布，已同步至社区需求征集版块 +10 积分')
}

// 接单 / 提交反馈
const acceptOrder = (req: any) => {
  if (req.accepted) {
    alert('您已接单，可在下方填写反馈')
    return
  }
  req.accepted = true
  req.status = '对接中'
  req.dev = 'NovaStudio'
  alert(`已接单「${req.title}」，开发者将主动与您对接`)
}

const showFeedback = ref<string | null>(null)
const feedbackText = ref('')
const openFeedback = (req: any) => {
  showFeedback.value = req.id
  feedbackText.value = req.feedback || ''
}
const submitFeedback = (req: any) => {
  if (!feedbackText.value.trim()) return
  req.feedback = feedbackText.value.trim()
  req.status = '已完成'
  showFeedback.value = null
  feedbackText.value = ''
  alert('反馈已提交，需求已标记为完成')
}

// 共创需求投票（持久化）
const votedReqs = ref<string[]>([])
const voteCoReq = (r: any) => {
  if (votedReqs.value.includes(r.id)) {
    alert('您已投过票')
    return
  }
  votedReqs.value.push(r.id)
  voteCoRequest(r.id)
  r.votes = (r.votes || 0) + 1
}
const coVoteCount = (id: string) => getCoVotes(id)

// 年度大会
const annualConf = ref({
  title: 'WebStore 2025 年度共创大会',
  date: '2025-01-15',
  registered: false,
  agenda: [
    { time: '10:00', event: '开发者年度规划发布', speaker: '12位头部开发者' },
    { time: '14:00', event: '全场问答环节', speaker: '所有开发者与用户' },
    { time: '16:00', event: '全民功能投票', speaker: '社区全员' },
    { time: '18:00', event: '年度表彰典礼', speaker: '平台与开发者' }
  ],
  awards: ['年度共创工具', '最受欢迎开发者', '社群互助达人', '最佳测评作者', '年度BUG猎手']
})

const registerConf = () => {
  if (annualConf.value.registered) return
  annualConf.value.registered = true
  alert('已预约席位，会议前1天将发送提醒 +5 积分')
  // 加积分（通过加入大会"群组"实现）
  joinGroup('annual_conf_2025')
}

// 付费社群
const paidGroups = ref([
  { id: 'pg1', name: 'NovaStudio 创作者社群', price: '¥99/月', perks: ['一对一咨询', '优先试用', '专属资源', '创作者交流'], members: 234, joined: false },
  { id: 'pg2', name: 'QuantumVue 数据精英会', price: '¥199/月', perks: ['数据看板模板', '专家咨询', '案例库', '行业交流'], members: 156, joined: false }
])

const joinPaid = (g: any) => {
  if (g.joined) {
    alert('您已是该社群成员')
    return
  }
  if (!confirm(`确认加入「${g.name}」？将扣除相应积分体验1个月`)) return
  // 体验加入：扣 50 积分（演示），实际付费流程未接入
  g.joined = true
  g.members += 1
  joinGroup(g.id)
  alert(`已加入「${g.name}」，享受专属权益`)
}

const displayPoints = computed(() => userPoints.value)
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 头部 -->
      <div class="ws-cocreate-hero ws-anim-fade-up">
        <span class="ws-section-eyebrow">CO-CREATION · V3.0</span>
        <h1 class="ws-cocreate-title">双向联动 <span class="text-gradient">专属生态</span></h1>
        <p class="ws-cocreate-sub">共建开发小组 · 定制需求接单 · 年度共创大会 · 付费专属社群<br/>用户与开发者真正共创产品的连接枢纽</p>
        <div class="ws-hero-points">当前积分 <strong class="font-mono text-gradient">{{ displayPoints.toLocaleString() }}</strong></div>
      </div>

      <!-- 共建开发小组 -->
      <section class="ws-cocreate-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="users" :size="20" color="var(--color-accent-cyan)" /> 共建开发小组</h2>
          <p class="ws-section-desc">高活跃用户获得内测资格 · 参与开发讨论 · 专属共建标识</p>
        </div>
        <div class="ws-cobuild-grid">
          <div v-for="g in coBuildGroups" :key="g.id" class="ws-cobuild-card">
            <div class="ws-cobuild-head">
              <span class="ws-cobuild-avatar">{{ g.avatar }}</span>
              <div>
                <h3>{{ g.name }}</h3>
                <span class="ws-cobuild-dev font-mono">{{ g.dev }} · {{ g.members }} 成员</span>
              </div>
              <span class="ws-cobuild-badge" :class="g.badge === '活跃' ? 'active' : 'recruit'">{{ g.badge }}</span>
            </div>
            <div class="ws-cobuild-tasks">
              <span class="ws-task-label">当前任务</span>
              <div v-for="t in g.tasks" :key="t" class="ws-task-item">
                <WsIcon name="check-circle" :size="12" color="var(--color-accent-lime)" /> {{ t }}
              </div>
            </div>
            <div class="ws-cobuild-actions">
              <button
                class="ws-btn ws-btn-primary ws-full-btn"
                :class="{ joined: isJoinedGroup(g.id) }"
                @click="joinCoBuild(g)"
              >
                {{ isJoinedGroup(g.id) ? '已加入 · 进入小组' : '申请加入 · 获得共建标识' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 共创需求投票 -->
      <section class="ws-cocreate-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="trending-up" :size="20" color="var(--color-accent-lime)" /> 共创需求投票</h2>
          <p class="ws-section-desc">投票表达需求热度 · 投票即得 +1 积分 · 开发者按热度排期</p>
        </div>
        <div class="ws-covote-grid">
          <div v-for="r in coCreationRequests" :key="r.id" class="ws-covote-card">
            <div class="ws-covote-head">
              <span class="ws-covote-type" :class="r.type">{{ r.type === 'short' ? '短期' : '长期' }}</span>
              <span class="ws-covote-status" :class="r.status">{{ r.status }}</span>
            </div>
            <h3>{{ r.title }}</h3>
            <p class="ws-covote-scenario">使用场景：{{ r.scenario }}</p>
            <div class="ws-covote-foot">
              <div class="ws-covote-dev">
                <WsIcon name="user" :size="11" color="var(--color-text-muted)" />
                <span>{{ r.developer }}</span>
                <span class="font-mono ws-covote-deadline">· {{ r.deadline }}</span>
              </div>
              <button
                class="ws-vote-btn"
                :class="{ voted: votedReqs.includes(r.id) }"
                @click="voteCoReq(r)"
              >
                <WsIcon name="trending-up" :size="13" />
                <span>{{ r.votes + coVoteCount(r.id) }}</span>
                <span class="ws-vote-label">{{ votedReqs.includes(r.id) ? '已投' : '投票' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 定制需求接单 -->
      <section class="ws-cocreate-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="bulb" :size="20" color="var(--color-accent-lime)" /> 定制需求接单板块</h2>
          <p class="ws-section-desc">用户发布定制需求 · 开发者线上对接 · 功能上线标注共创发起人</p>
        </div>
        <div class="ws-custom-input-wrap">
          <div class="ws-custom-input">
            <WsIcon name="bulb" :size="16" color="var(--color-accent-lime)" />
            <input v-model="newRequest" placeholder="发布你的工具定制需求，开发者将主动对接…" @keydown.enter="submitRequest" />
            <input v-model="newBudget" class="ws-budget-input" placeholder="预算" />
            <button class="ws-btn ws-btn-primary" @click="submitRequest">发布需求</button>
          </div>
        </div>
        <div class="ws-custom-list">
          <div v-for="req in customRequests" :key="req.id" class="ws-custom-item">
            <div class="ws-custom-info">
              <h3>{{ req.title }}</h3>
              <div class="ws-custom-meta">
                <span class="ws-budget"><WsIcon name="gift" :size="12" color="var(--color-accent-amber)" /> {{ req.budget }}</span>
                <span class="ws-status" :class="req.status">{{ req.status }}</span>
                <span v-if="req.dev !== '招募中'" class="ws-dev font-mono">对接：{{ req.dev }}</span>
              </div>
              <div v-if="req.feedback" class="ws-feedback-display">
                <WsIcon name="message" :size="11" color="var(--color-accent-cyan)" />
                <span>反馈：{{ req.feedback }}</span>
              </div>
            </div>
            <div v-if="req.coCreator" class="ws-cocreator-tag">
              <WsIcon name="star" :size="11" color="var(--color-accent-lime)" />
              <span>共创发起人：{{ req.coCreator }}</span>
            </div>
            <div v-else class="ws-empty-creator"></div>
            <div class="ws-custom-actions">
              <button v-if="!req.accepted && req.status !== '已上线'" class="ws-btn ws-btn-primary" @click="acceptOrder(req)">
                接单对接
              </button>
              <button v-if="req.accepted && req.status !== '已完成'" class="ws-btn ws-btn-ghost" @click="openFeedback(req)">
                提交反馈
              </button>
              <span v-if="req.status === '已完成'" class="ws-done-tag">
                <WsIcon name="check-circle" :size="13" color="var(--color-accent-lime)" /> 已完成
              </span>
            </div>
          </div>
        </div>

        <!-- 反馈弹窗 -->
        <Transition name="ws-fade">
          <div v-if="showFeedback" class="ws-modal-mask" @click.self="showFeedback = null">
            <div class="ws-modal-box">
              <h3>提交对接反馈</h3>
              <textarea v-model="feedbackText" class="ws-modal-textarea" placeholder="描述对接结果、交付情况、开发者响应速度等…" rows="5"></textarea>
              <div class="ws-modal-actions">
                <button class="ws-btn ws-btn-ghost" @click="showFeedback = null">取消</button>
                <button class="ws-btn ws-btn-primary" @click="submitFeedback(customRequests.find(r => r.id === showFeedback))">提交反馈</button>
              </div>
            </div>
          </div>
        </Transition>
      </section>

      <!-- 年度共创大会 -->
      <section class="ws-cocreate-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="trophy" :size="20" color="var(--color-accent-amber)" /> 年度线上共创大会</h2>
          <p class="ws-section-desc">开发者发布年度规划 · 全场问答 · 全民功能投票 · 评选表彰活跃用户</p>
        </div>
        <div class="ws-conf-card">
          <div class="ws-conf-head">
            <div>
              <h3 class="ws-conf-title">{{ annualConf.title }}</h3>
              <p class="ws-conf-date"><WsIcon name="clock" :size="13" /> {{ annualConf.date }} · 全天直播</p>
            </div>
            <button class="ws-btn ws-btn-primary" :disabled="annualConf.registered" @click="registerConf">
              {{ annualConf.registered ? '已预约' : '预约席位' }}
            </button>
          </div>
          <div class="ws-conf-body">
            <div class="ws-conf-agenda">
              <h4>大会议程</h4>
              <div v-for="a in annualConf.agenda" :key="a.time" class="ws-agenda-item">
                <span class="ws-agenda-time font-mono">{{ a.time }}</span>
                <div>
                  <div class="ws-agenda-event">{{ a.event }}</div>
                  <div class="ws-agenda-speaker">{{ a.speaker }}</div>
                </div>
              </div>
            </div>
            <div class="ws-conf-awards">
              <h4>年度表彰奖项</h4>
              <div class="ws-awards-grid">
                <div v-for="award in annualConf.awards" :key="award" class="ws-award-item">
                  <WsIcon name="trophy" :size="18" color="var(--color-accent-amber)" />
                  <span>{{ award }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 付费专属社群 -->
      <section class="ws-cocreate-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="gift" :size="20" color="var(--color-accent-violet)" /> 开发者付费专属社群</h2>
          <p class="ws-section-desc">付费用户享受一对一咨询 · 优先试用 · 专属资源同步权益</p>
        </div>
        <div class="ws-paid-grid">
          <div v-for="g in paidGroups" :key="g.id" class="ws-paid-card" :class="{ joined: g.joined }">
            <div class="ws-paid-head">
              <h3>{{ g.name }}</h3>
              <span class="ws-paid-price font-mono">{{ g.price }}</span>
            </div>
            <div class="ws-paid-perks">
              <div v-for="p in g.perks" :key="p" class="ws-perk-item">
                <WsIcon name="check-circle" :size="13" color="var(--color-accent-lime)" />
                <span>{{ p }}</span>
              </div>
            </div>
            <div class="ws-paid-foot">
              <span class="ws-paid-members font-mono">{{ g.members }} 已加入</span>
              <button
                class="ws-btn"
                :class="g.joined ? 'ws-btn-ghost' : 'ws-btn-primary'"
                @click="joinPaid(g)"
              >
                {{ g.joined ? '已加入' : '加入社群' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ws-page { padding: 48px 0 80px; position: relative; z-index: 2; }
.ws-cocreate-hero { text-align: center; margin-bottom: 56px; }
.ws-cocreate-title { font-family: var(--font-display); font-weight: 700; font-size: clamp(36px, 5vw, 56px); margin: 12px 0; letter-spacing: -0.02em; }
.ws-cocreate-sub { font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin: 0; }
.ws-hero-points { margin-top: 16px; font-size: 13px; color: var(--color-text-muted); }
.ws-hero-points strong { font-size: 20px; margin-left: 6px; }
.ws-cocreate-section { margin-bottom: 64px; }
.ws-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
.ws-section-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 24px; margin: 0; }
.ws-section-desc { font-size: 13px; color: var(--color-text-muted); margin: 0; max-width: 420px; text-align: right; }

/* 共建小组 */
.ws-cobuild-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.ws-cobuild-card { padding: 22px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-cobuild-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.ws-cobuild-avatar { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: var(--color-surface-light); border-radius: 12px; font-size: 22px; color: var(--color-accent-cyan); }
.ws-cobuild-head h3 { font-family: var(--font-display); font-weight: 600; font-size: 16px; margin: 0; }
.ws-cobuild-dev { font-size: 11px; color: var(--color-text-muted); }
.ws-cobuild-badge { margin-left: auto; font-size: 10px; padding: 3px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-cobuild-badge.active { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-cobuild-badge.recruit { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-cobuild-tasks { margin-bottom: 16px; }
.ws-task-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-task-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-secondary); padding: 6px 0; }
.ws-cobuild-actions .ws-btn.joined { background: rgba(198,255,61,0.12); color: var(--color-accent-lime); border-color: rgba(198,255,61,0.3); }
.ws-full-btn { width: 100%; }

/* 共创投票 */
.ws-covote-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.ws-covote-card { padding: 20px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); transition: all var(--transition-base); }
.ws-covote-card:hover { border-color: var(--color-border-strong); transform: translateY(-2px); }
.ws-covote-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.ws-covote-type { font-size: 10px; padding: 3px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-covote-type.short { background: rgba(0,229,255,0.12); color: var(--color-accent-cyan); }
.ws-covote-type.long { background: rgba(183,148,244,0.12); color: var(--color-accent-violet); }
.ws-covote-status { font-size: 10px; padding: 3px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-covote-status.planning { background: rgba(255,255,255,0.06); color: var(--color-text-muted); }
.ws-covote-status.voting { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-covote-status.planned { background: rgba(0,229,255,0.12); color: var(--color-accent-cyan); }
.ws-covote-card h3 { font-family: var(--font-display); font-weight: 600; font-size: 16px; margin: 0 0 8px; }
.ws-covote-scenario { font-size: 12px; color: var(--color-text-secondary); margin: 0 0 14px; line-height: 1.5; }
.ws-covote-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ws-covote-dev { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-muted); }
.ws-covote-deadline { margin-left: 4px; }
.ws-vote-btn { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(198,255,61,0.08); border: 1px solid rgba(198,255,61,0.2); border-radius: var(--radius-pill); color: var(--color-accent-lime); font-size: 12px; cursor: pointer; transition: all var(--transition-base); font-family: var(--font-mono); }
.ws-vote-btn:hover { background: rgba(198,255,61,0.15); transform: translateY(-1px); }
.ws-vote-btn.voted { background: rgba(198,255,61,0.18); border-color: rgba(198,255,61,0.4); }
.ws-vote-label { margin-left: 2px; }

/* 定制需求 */
.ws-custom-input-wrap { margin-bottom: 20px; }
.ws-custom-input { display: flex; align-items: center; gap: 10px; padding: 8px; background: linear-gradient(135deg, rgba(198,255,61,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-pill); }
.ws-custom-input input { flex: 1; padding: 10px 14px; background: transparent; border: none; outline: none; color: var(--color-text); font-size: 14px; font-family: var(--font-body); }
.ws-custom-input input::placeholder { color: var(--color-text-muted); }
.ws-budget-input { max-width: 140px !important; font-family: var(--font-mono) !important; font-size: 13px !important; }
.ws-custom-list { display: flex; flex-direction: column; gap: 12px; }
.ws-custom-item { display: flex; align-items: center; gap: 16px; padding: 18px 22px; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); flex-wrap: wrap; }
.ws-custom-info { flex: 1; min-width: 240px; }
.ws-custom-info h3 { font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 0 0 8px; }
.ws-custom-meta { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; font-size: 12px; }
.ws-budget { display: inline-flex; align-items: center; gap: 4px; color: var(--color-accent-amber); font-family: var(--font-mono); }
.ws-status { padding: 2px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: 11px; }
.ws-status.对接中 { background: rgba(0,229,255,0.15); color: var(--color-accent-cyan); }
.ws-status.招标中 { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-status.已上线 { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-status.已完成 { background: rgba(198,255,61,0.18); color: var(--color-accent-lime); }
.ws-dev { color: var(--color-text-muted); }
.ws-feedback-display { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 6px 10px; background: rgba(0,229,255,0.05); border-radius: var(--radius-sm); font-size: 11px; color: var(--color-text-secondary); }
.ws-cocreator-tag { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(198,255,61,0.08); border: 1px solid rgba(198,255,61,0.2); border-radius: var(--radius-pill); color: var(--color-accent-lime); font-size: 12px; }
.ws-empty-creator { width: 0; }
.ws-custom-actions { display: flex; gap: 8px; align-items: center; }
.ws-done-tag { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(198,255,61,0.1); border-radius: var(--radius-pill); color: var(--color-accent-lime); font-size: 12px; }

/* 弹窗 */
.ws-modal-mask { position: fixed; inset: 0; background: rgba(10,14,39,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.ws-modal-box { width: 100%; max-width: 480px; padding: 28px; background: var(--color-surface); border: 1px solid var(--color-border-strong); border-radius: var(--radius-lg); }
.ws-modal-box h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; margin: 0 0 16px; }
.ws-modal-textarea { width: 100%; padding: 12px; background: var(--color-surface-light); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 13px; resize: vertical; outline: none; font-family: var(--font-body); }
.ws-modal-textarea:focus { border-color: var(--color-accent-cyan); }
.ws-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.ws-fade-enter-active, .ws-fade-leave-active { transition: opacity 0.2s ease; }
.ws-fade-enter-from, .ws-fade-leave-to { opacity: 0; }

/* 年度大会 */
.ws-conf-card { padding: 28px; background: linear-gradient(135deg, rgba(255,184,77,0.06), rgba(0,229,255,0.04)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-lg); }
.ws-conf-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.ws-conf-title { font-family: var(--font-display); font-weight: 700; font-size: 26px; margin: 0; }
.ws-conf-date { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--color-accent-amber); margin: 6px 0 0; }
.ws-conf-body { display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; }
.ws-conf-agenda h4, .ws-conf-awards h4 { font-family: var(--font-display); font-weight: 600; font-size: 15px; margin: 0 0 14px; color: var(--color-text); }
.ws-agenda-item { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.ws-agenda-time { font-size: 13px; color: var(--color-accent-cyan); min-width: 50px; }
.ws-agenda-event { font-size: 14px; color: var(--color-text); }
.ws-agenda-speaker { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
.ws-awards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ws-award-item { display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text); }

/* 付费社群 */
.ws-paid-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.ws-paid-card { padding: 24px; background: linear-gradient(180deg, rgba(183,148,244,0.06), rgba(255,255,255,0.01)); border: 1px solid rgba(183,148,244,0.2); border-radius: var(--radius-md); }
.ws-paid-card.joined { border-color: rgba(198,255,61,0.3); }
.ws-paid-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ws-paid-head h3 { font-family: var(--font-display); font-weight: 600; font-size: 18px; margin: 0; }
.ws-paid-price { font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--color-accent-violet); }
.ws-paid-perks { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.ws-perk-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
.ws-paid-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--color-border); }
.ws-paid-members { font-size: 12px; color: var(--color-text-muted); }

@media (max-width: 1024px) {
  .ws-cobuild-grid { grid-template-columns: 1fr; }
  .ws-covote-grid { grid-template-columns: 1fr; }
  .ws-paid-grid { grid-template-columns: 1fr; }
  .ws-conf-body { grid-template-columns: 1fr; }
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WsIcon from './shared/WsIcon.vue'
import { incentiveRules, currentUser } from '../data/community.ts'
import {
  exchangeItem, exchangedItems as storeExchanged,
  userPoints, memberDays
} from '../store/useStore.ts'

// 用户激励规则
const userRules = ref(incentiveRules.user)

// 开发者激励
const devRules = ref(incentiveRules.developer)

// 开发者激励分层
const devTiers = ref([
  {
    tier: 'S 级',
    name: '生态旗舰',
    score: '95+',
    color: 'gold',
    perks: ['平台分成下调至 5%', '7×24 专属运营客服', '首页轮播永久位', '年度大会主舞台', '新功能内测优先']
  },
  {
    tier: 'A 级',
    name: '高互动标杆',
    score: '85-94',
    color: 'cyan',
    perks: ['平台分成下调至 10%', '专属运营对接人', '专题页流量扶持', '共创活动资源位']
  },
  {
    tier: 'B 级',
    name: '活跃开发者',
    score: '70-84',
    color: 'lime',
    perks: ['标准分成 15%', '社群推广资源', '直播答疑曝光', '月度运营报告']
  },
  {
    tier: 'C 级',
    name: '入驻开发者',
    score: '<70',
    color: 'muted',
    perks: ['标准分成 20%', '基础流量分发', '社区发帖权限', '成长任务奖励']
  }
])

// 月度评选
const monthlyAwards = ref([
  { month: '2025年6月', title: '社群互助达人', winner: '林深时见鹿', avatar: '✿', reward: 'NovaStudio 高级会员 6 个月 + 限定徽章', votes: 1284 },
  { month: '2025年6月', title: '最佳测评作者', winner: '数据矿工', avatar: '◢', reward: '¥2,000 奖金 + 专属认证', votes: 892 },
  { month: '2025年5月', title: '社群互助达人', winner: '代码诗人', avatar: '✦', reward: 'QuantumVue 工具年卡 + 限定徽章', votes: 1056 }
])

// 积分兑换
const pointShop = ref([
  { item: '平台会员 1 个月', cost: 500, stock: '充足', icon: 'star' },
  { item: '去广告权益 3 个月', cost: 800, stock: '充足', icon: 'eye' },
  { item: '限定徽章 · 共创先锋', cost: 1500, stock: '稀有限量', icon: 'trophy' },
  { item: '工具高级权限包', cost: 1200, stock: '充足', icon: 'lock' },
  { item: '开发者付费社群 1 月', cost: 2000, stock: '紧张', icon: 'gift' },
  { item: '内测优先资格', cost: 3000, stock: '本月限定', icon: 'rocket' }
])

// 安全隐私功能
const securityFeatures = ref([
  {
    title: '聊天记录归档',
    icon: 'clock',
    color: 'cyan',
    desc: '聊天记录定时归档，支持一键清空',
    details: ['30 天后自动归档至云端', '用户可一键清空全部历史', '归档内容加密存储', '开发者后台无权查看原始记录']
  },
  {
    title: '违规消息拦截',
    icon: 'shield',
    color: 'lime',
    desc: '系统自动拦截广告、辱骂等违规消息',
    details: ['AI 实时识别广告 / 辱骂 / 钓鱼', '违规消息默认折叠并提示', '累计违规自动限制沟通权限', '用户可一键举报反馈']
  },
  {
    title: '匿名化数据',
    icon: 'lock',
    color: 'violet',
    desc: '开发者仅可查看匿名化用户数据',
    details: ['用户身份信息全量脱敏', '批量推送内容需平台审核', '禁止导出用户私人联系方式', '数据分析聚合展示，不可逆推个体']
  },
  {
    title: '原创版权存证',
    icon: 'file',
    color: 'amber',
    desc: '用户原创测评、教程自动版权存证',
    details: ['发布即上链版权存证', '开发者转载必须标注原作者', '侵权内容一键投诉下架', '原创者享内容分成收益']
  },
  {
    title: '黑名单与屏蔽',
    icon: 'x',
    color: 'coral',
    desc: '用户可拉黑开发者屏蔽全部推送',
    details: ['拉黑后不再接收任何消息', '屏蔽后不再推荐该开发者工具', '黑名单可随时管理', '平台不告知开发者被拉黑']
  },
  {
    title: '操作审计追踪',
    icon: 'eye',
    color: 'cyan',
    desc: '全链路敏感操作审计与风险识别',
    details: ['登录、支付、权限变更留痕', '异常注册 / 刷量自动识别', '开发者 API 调用全量审计', '用户可查看个人操作日志']
  }
])

// 当前用户积分与权益 - 使用 store 实时数据
const myWallet = computed(() => ({
  points: userPoints.value,
  memberDays: memberDays.value,
  badges: currentUser.badges.length,
  level: currentUser.level
}))

// 兑换状态：使用 store 持久化（跨页面同步）
const exchangedItems = computed(() => storeExchanged.value)
const exchangeMsg = ref<{ item: string; msg: string; ok: boolean } | null>(null)
const exchange = (p: { item: string; cost: number }) => {
  const result = exchangeItem({ name: p.item, cost: p.cost })
  exchangeMsg.value = { item: p.item, msg: result.msg, ok: result.ok }
  setTimeout(() => { exchangeMsg.value = null }, 2800)
}

// 阅读已展开的安全详情
const expandedSecurity = ref<string | null>(null)
const toggleSecurity = (title: string) => {
  expandedSecurity.value = expandedSecurity.value === title ? null : title
}

// 平台价值统计
const platformStats = ref([
  { label: '累计发放积分', value: '2.8M+', icon: 'star', color: 'amber' },
  { label: '认证原创内容', value: '48,620', icon: 'file', color: 'cyan' },
  { label: '违规拦截次数', value: '12,847', icon: 'shield', color: 'lime' },
  { label: '月度表彰用户', value: '320', icon: 'trophy', color: 'violet' }
])
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 头部 -->
      <div class="ws-incentive-hero ws-anim-fade-up">
        <span class="ws-section-eyebrow">INCENTIVE & SECURITY · V3.0</span>
        <h1 class="ws-incentive-title">双向激励与 <span class="text-gradient">信任安全</span></h1>
        <p class="ws-incentive-sub">用户激励 · 开发者激励 · 互动配套安全隐私<br/>构建「优质工具入驻 — 用户活跃反馈 — 工具持续优化」的正向循环</p>
        <div class="ws-platform-stats">
          <div v-for="s in platformStats" :key="s.label" class="ws-stat-pill">
            <WsIcon :name="s.icon" :size="14" :color="`var(--color-accent-${s.color})`" />
            <div>
              <div class="ws-stat-value font-mono">{{ s.value }}</div>
              <div class="ws-stat-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的钱包 / 当前权益概览 -->
      <section class="ws-incentive-section">
        <div class="ws-wallet-card">
          <div class="ws-wallet-head">
            <div class="ws-wallet-user">
              <span class="ws-wallet-avatar">{{ currentUser.avatar }}</span>
              <div>
                <h3>{{ currentUser.name }}</h3>
                <span class="ws-wallet-level font-mono">Lv.{{ myWallet.level }} · 共创先锋</span>
              </div>
            </div>
            <div class="ws-wallet-stats">
              <div class="ws-wallet-stat">
                <div class="ws-stat-num text-gradient font-mono">{{ myWallet.points }}</div>
                <div class="ws-stat-text">可用积分</div>
              </div>
              <div class="ws-wallet-stat">
                <div class="ws-stat-num font-mono">{{ myWallet.memberDays }}<span class="unit">天</span></div>
                <div class="ws-stat-text">会员剩余</div>
              </div>
              <div class="ws-wallet-stat">
                <div class="ws-stat-num font-mono">{{ myWallet.badges }}</div>
                <div class="ws-stat-text">徽章</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户激励 -->
      <section class="ws-incentive-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="star" :size="20" color="var(--color-accent-cyan)" /> 用户激励体系</h2>
          <p class="ws-section-desc">提交 BUG · 纠错 · 功能建议 · 优质测评 · 体验打卡 · 社群互助</p>
        </div>
        <div class="ws-incentive-layout">
          <!-- 激励规则表 -->
          <div class="ws-rules-card">
            <h3 class="ws-card-title">行为积分规则</h3>
            <div class="ws-rules-table">
              <div class="ws-rules-head">
                <span>行为</span>
                <span>基础积分</span>
                <span>额外奖励</span>
              </div>
              <div v-for="r in userRules" :key="r.action" class="ws-rules-row">
                <span class="ws-rule-action">{{ r.action }}</span>
                <span class="ws-rule-points font-mono">+{{ r.points }}</span>
                <span class="ws-rule-extra">{{ r.extra }}</span>
              </div>
            </div>
            <div class="ws-rules-foot">
              <WsIcon name="bulb" :size="13" color="var(--color-accent-amber)" />
              <span>积分可兑换平台会员、去广告权益、限定徽章、工具高级权限</span>
            </div>
          </div>

          <!-- 积分兑换商城 -->
          <div class="ws-shop-card">
            <h3 class="ws-card-title">积分兑换商城</h3>
            <div class="ws-shop-grid">
              <div v-for="p in pointShop" :key="p.item" class="ws-shop-item" :class="{ exchanged: exchangedItems.includes(p.item) }">
                <div class="ws-shop-icon">
                  <WsIcon :name="p.icon" :size="18" color="var(--color-accent-cyan)" />
                </div>
                <div class="ws-shop-info">
                  <h4>{{ p.item }}</h4>
                  <span class="ws-shop-stock" :class="p.stock">{{ p.stock }}</span>
                </div>
                <div class="ws-shop-foot">
                  <span class="ws-shop-cost font-mono">{{ p.cost }} pts</span>
                  <button
                    class="ws-btn ws-btn-primary ws-shop-btn"
                    :disabled="exchangedItems.includes(p.item) || myWallet.points < p.cost"
                    @click="exchange(p)"
                  >
                    {{ exchangedItems.includes(p.item) ? '已兑换' : '兑换' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 兑换结果 Toast -->
        <Transition name="ws-fade">
          <div v-if="exchangeMsg" class="ws-exchange-toast" :class="exchangeMsg.ok ? 'ok' : 'fail'">
            <WsIcon :name="exchangeMsg.ok ? 'check-circle' : 'alert'" :size="14" />
            <span>{{ exchangeMsg.msg }}</span>
          </div>
        </Transition>
        <div class="ws-monthly-card">
          <div class="ws-monthly-head">
            <h3 class="ws-card-title"><WsIcon name="trophy" :size="18" color="var(--color-accent-amber)" /> 月度评选 · 社群互助达人</h3>
            <span class="ws-monthly-tag font-mono">每月 1 日公示</span>
          </div>
          <div class="ws-monthly-list">
            <div v-for="(a, i) in monthlyAwards" :key="i" class="ws-monthly-item">
              <span class="ws-monthly-rank font-mono">#{{ i + 1 }}</span>
              <span class="ws-monthly-avatar">{{ a.avatar }}</span>
              <div class="ws-monthly-info">
                <div class="ws-monthly-name">{{ a.winner }}</div>
                <div class="ws-monthly-meta">{{ a.month }} · {{ a.title }}</div>
              </div>
              <div class="ws-monthly-reward">
                <WsIcon name="gift" :size="13" color="var(--color-accent-violet)" />
                <span>{{ a.reward }}</span>
              </div>
              <span class="ws-monthly-votes font-mono">{{ a.votes }} 票</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 开发者激励 -->
      <section class="ws-incentive-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="rocket" :size="20" color="var(--color-accent-lime)" /> 开发者激励体系</h2>
          <p class="ws-section-desc">推荐权重 · 流量扶持 · 分成下调 · 专属客服</p>
        </div>

        <!-- 互动活跃度 → 激励阶梯 -->
        <div class="ws-tier-grid">
          <div v-for="t in devTiers" :key="t.tier" class="ws-tier-card" :class="t.color">
            <div class="ws-tier-head">
              <span class="ws-tier-badge font-mono">{{ t.tier }}</span>
              <span class="ws-tier-score font-mono">{{ t.score }}</span>
            </div>
            <h3 class="ws-tier-name">{{ t.name }}</h3>
            <div class="ws-tier-perks">
              <div v-for="p in t.perks" :key="p" class="ws-tier-perk">
                <WsIcon name="check-circle" :size="12" />
                <span>{{ p }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 行为-权益对应表 -->
        <div class="ws-dev-rules">
          <h3 class="ws-card-title">行为 → 权益映射</h3>
          <div class="ws-dev-rules-list">
            <div v-for="r in devRules" :key="r.action" class="ws-dev-rule">
              <div class="ws-dev-action">
                <WsIcon name="zap" :size="14" color="var(--color-accent-lime)" />
                <span>{{ r.action }}</span>
              </div>
              <WsIcon name="arrow-right" :size="14" color="var(--color-text-muted)" />
              <div class="ws-dev-benefit">{{ r.benefit }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 互动配套安全隐私 -->
      <section class="ws-incentive-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="shield" :size="20" color="var(--color-accent-cyan)" /> 互动配套安全隐私</h2>
          <p class="ws-section-desc">聊天归档 · 违规拦截 · 匿名化数据 · 版权存证</p>
        </div>
        <div class="ws-security-grid">
          <div v-for="f in securityFeatures" :key="f.title" class="ws-security-card" :class="f.color">
            <div class="ws-security-head" @click="toggleSecurity(f.title)">
              <div class="ws-security-icon">
                <WsIcon :name="f.icon" :size="20" />
              </div>
              <div class="ws-security-info">
                <h3>{{ f.title }}</h3>
                <p>{{ f.desc }}</p>
              </div>
              <WsIcon name="arrow-right" :size="14" color="var(--color-text-muted)" :class="{ expanded: expandedSecurity === f.title }" />
            </div>
            <Transition name="ws-slide">
              <div v-if="expandedSecurity === f.title" class="ws-security-details">
                <div v-for="d in f.details" :key="d" class="ws-detail-item">
                  <WsIcon name="check" :size="12" />
                  <span>{{ d }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- 平台价值收尾 -->
      <section class="ws-incentive-coda">
        <div class="ws-coda-card">
          <span class="ws-section-eyebrow">ECOSYSTEM VALUE</span>
          <h2 class="ws-coda-title">生态循环 <span class="text-gradient">正向驱动</span></h2>
          <div class="ws-coda-loop">
            <div class="ws-loop-step">
              <WsIcon name="rocket" :size="22" color="var(--color-accent-cyan)" />
              <h4>优质工具入驻</h4>
              <p>开发者受激励政策吸引，主动上架与运营高质量网页工具</p>
            </div>
            <WsIcon name="arrow-right" :size="20" color="var(--color-text-muted)" class="ws-loop-arrow" />
            <div class="ws-loop-step">
              <WsIcon name="star" :size="22" color="var(--color-accent-lime)" />
              <h4>用户活跃反馈</h4>
              <p>积分、徽章、社群权益驱动用户主动反馈 BUG、测评、需求</p>
            </div>
            <WsIcon name="arrow-right" :size="20" color="var(--color-text-muted)" class="ws-loop-arrow" />
            <div class="ws-loop-step">
              <WsIcon name="trending-up" :size="22" color="var(--color-accent-amber)" />
              <h4>工具持续优化</h4>
              <p>开发者获取真实反馈数据，迭代产品，提升口碑与分成等级</p>
            </div>
          </div>
          <p class="ws-coda-tag">信任体系 · 社区互动 · 开发者生态赋能 · 差异化社区壁垒</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ws-page { padding: 48px 0 80px; position: relative; z-index: 2; }
.ws-incentive-hero { text-align: center; margin-bottom: 56px; }
.ws-incentive-title { font-family: var(--font-display); font-weight: 700; font-size: clamp(36px, 5vw, 56px); margin: 12px 0; letter-spacing: -0.02em; }
.ws-incentive-sub { font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin: 0 0 32px; }

/* 平台统计 */
.ws-platform-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; max-width: 920px; margin: 0 auto; }
.ws-stat-pill { display: flex; align-items: center; gap: 10px; padding: 14px 18px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-stat-value { font-size: 18px; font-weight: 700; color: var(--color-text); }
.ws-stat-label { font-size: 11px; color: var(--color-text-muted); }

.ws-incentive-section { margin-bottom: 64px; }
.ws-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
.ws-section-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 24px; margin: 0; }
.ws-section-desc { font-size: 13px; color: var(--color-text-muted); margin: 0; max-width: 420px; text-align: right; }
.ws-card-title { font-family: var(--font-display); font-weight: 600; font-size: 16px; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }

/* 我的钱包 */
.ws-wallet-card { padding: 24px 28px; background: linear-gradient(135deg, rgba(0,229,255,0.06), rgba(198,255,61,0.04)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-lg); }
.ws-wallet-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
.ws-wallet-user { display: flex; align-items: center; gap: 14px; }
.ws-wallet-avatar { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: var(--color-surface-light); border-radius: 16px; font-size: 28px; color: var(--color-accent-cyan); }
.ws-wallet-user h3 { font-family: var(--font-display); font-weight: 700; font-size: 20px; margin: 0; }
.ws-wallet-level { font-size: 12px; color: var(--color-accent-lime); }
.ws-wallet-stats { display: flex; gap: 32px; }
.ws-wallet-stat { text-align: center; }
.ws-wallet-stat .ws-stat-num { font-family: var(--font-display); font-weight: 700; font-size: 28px; line-height: 1.1; }
.ws-wallet-stat .ws-stat-num .unit { font-size: 14px; color: var(--color-text-muted); margin-left: 2px; }
.ws-wallet-stat .ws-stat-text { font-size: 11px; color: var(--color-text-muted); margin-top: 4px; }

/* 用户激励布局 */
.ws-incentive-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.ws-rules-card, .ws-shop-card { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }

/* 规则表 */
.ws-rules-table { display: flex; flex-direction: column; gap: 2px; }
.ws-rules-head, .ws-rules-row { display: grid; grid-template-columns: 1.4fr 0.8fr 1.4fr; gap: 10px; padding: 10px 12px; align-items: center; font-size: 13px; }
.ws-rules-head { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.ws-rules-row { background: rgba(255,255,255,0.02); border-radius: var(--radius-xs); }
.ws-rule-action { color: var(--color-text); }
.ws-rule-points { color: var(--color-accent-cyan); font-weight: 600; }
.ws-rule-extra { color: var(--color-accent-lime); font-size: 12px; }
.ws-rules-foot { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px; background: rgba(255,184,77,0.06); border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-secondary); }

/* 积分商城 */
.ws-shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ws-shop-item { padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); transition: all var(--transition-base); }
.ws-shop-item:hover { border-color: var(--color-border-strong); transform: translateY(-1px); }
.ws-shop-item.exchanged { opacity: 0.5; }
.ws-shop-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: var(--color-surface-light); border-radius: 10px; margin-bottom: 10px; }
.ws-shop-info h4 { font-family: var(--font-display); font-weight: 600; font-size: 13px; margin: 0 0 4px; }
.ws-shop-stock { font-size: 10px; font-family: var(--font-mono); padding: 2px 6px; border-radius: var(--radius-pill); }
.ws-shop-stock.充足 { background: rgba(198,255,61,0.12); color: var(--color-accent-lime); }
.ws-shop-stock.紧张 { background: rgba(255,184,77,0.12); color: var(--color-accent-amber); }
.ws-shop-stock.稀有限量, .ws-shop-stock.本月限定 { background: rgba(183,148,244,0.12); color: var(--color-accent-violet); }
.ws-shop-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
.ws-shop-cost { font-size: 13px; font-weight: 600; color: var(--color-accent-cyan); }
.ws-shop-btn { padding: 6px 14px; font-size: 12px; }
.ws-shop-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 兑换结果 Toast */
.ws-exchange-toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: var(--radius-pill); font-size: 13px; z-index: 999; backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
.ws-exchange-toast.ok { background: rgba(198,255,61,0.15); border: 1px solid rgba(198,255,61,0.4); color: var(--color-accent-lime); }
.ws-exchange-toast.fail { background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.4); color: var(--color-accent-coral); }
.ws-fade-enter-active, .ws-fade-leave-active { transition: all 0.25s ease; }
.ws-fade-enter-from, .ws-fade-leave-to { opacity: 0; transform: translate(-50%, -10px); }

/* 月度评选 */
.ws-monthly-card { padding: 24px; background: linear-gradient(135deg, rgba(255,184,77,0.04), rgba(0,229,255,0.03)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md); }
.ws-monthly-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.ws-monthly-tag { font-size: 11px; color: var(--color-text-muted); padding: 4px 10px; background: rgba(255,255,255,0.04); border-radius: var(--radius-pill); }
.ws-monthly-list { display: flex; flex-direction: column; gap: 10px; }
.ws-monthly-item { display: flex; align-items: center; gap: 14px; padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-monthly-rank { font-size: 13px; color: var(--color-accent-amber); font-weight: 600; min-width: 30px; }
.ws-monthly-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--color-surface-light); border-radius: 10px; font-size: 18px; color: var(--color-accent-cyan); }
.ws-monthly-info { flex: 1; }
.ws-monthly-name { font-family: var(--font-display); font-weight: 600; font-size: 15px; }
.ws-monthly-meta { font-size: 11px; color: var(--color-text-muted); }
.ws-monthly-reward { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-accent-violet); max-width: 320px; }
.ws-monthly-votes { font-size: 12px; color: var(--color-accent-amber); min-width: 60px; text-align: right; }

/* 开发者激励阶梯 */
.ws-tier-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.ws-tier-card { padding: 22px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); position: relative; overflow: hidden; }
.ws-tier-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.ws-tier-card.gold::before { background: linear-gradient(90deg, #FFB84D, #C6FF3D); }
.ws-tier-card.cyan::before { background: linear-gradient(90deg, #00E5FF, #B794F4); }
.ws-tier-card.lime::before { background: linear-gradient(90deg, #C6FF3D, #00E5FF); }
.ws-tier-card.muted::before { background: rgba(255,255,255,0.1); }
.ws-tier-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ws-tier-badge { font-size: 11px; padding: 3px 10px; border-radius: var(--radius-pill); font-weight: 600; }
.ws-tier-card.gold .ws-tier-badge { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-tier-card.cyan .ws-tier-badge { background: rgba(0,229,255,0.15); color: var(--color-accent-cyan); }
.ws-tier-card.lime .ws-tier-badge { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-tier-card.muted .ws-tier-badge { background: rgba(255,255,255,0.06); color: var(--color-text-muted); }
.ws-tier-score { font-size: 12px; color: var(--color-text-muted); }
.ws-tier-name { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin: 0 0 14px; }
.ws-tier-perks { display: flex; flex-direction: column; gap: 8px; }
.ws-tier-perk { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); }
.ws-tier-perk svg { color: var(--color-accent-lime); flex-shrink: 0; }

/* 开发者行为权益 */
.ws-dev-rules { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-dev-rules-list { display: flex; flex-direction: column; gap: 10px; }
.ws-dev-rule { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ws-dev-action { display: flex; align-items: center; gap: 8px; flex: 1; font-size: 14px; color: var(--color-text); }
.ws-dev-benefit { flex: 1; font-size: 13px; color: var(--color-accent-lime); font-family: var(--font-mono); }

/* 安全隐私 */
.ws-security-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.ws-security-card { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; transition: all var(--transition-base); }
.ws-security-card:hover { border-color: var(--color-border-strong); }
.ws-security-head { display: flex; align-items: flex-start; gap: 14px; padding: 18px; cursor: pointer; }
.ws-security-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
.ws-security-card.cyan .ws-security-icon { background: rgba(0,229,255,0.1); color: var(--color-accent-cyan); }
.ws-security-card.lime .ws-security-icon { background: rgba(198,255,61,0.1); color: var(--color-accent-lime); }
.ws-security-card.violet .ws-security-icon { background: rgba(183,148,244,0.1); color: var(--color-accent-violet); }
.ws-security-card.amber .ws-security-icon { background: rgba(255,184,77,0.1); color: var(--color-accent-amber); }
.ws-security-card.coral .ws-security-icon { background: rgba(255,107,107,0.1); color: var(--color-accent-coral); }
.ws-security-info { flex: 1; }
.ws-security-info h3 { font-family: var(--font-display); font-weight: 600; font-size: 15px; margin: 0 0 4px; }
.ws-security-info p { font-size: 12px; color: var(--color-text-muted); margin: 0; line-height: 1.5; }
.ws-security-head svg.ws-icon { transition: transform var(--transition-base); margin-top: 4px; }
.ws-security-head svg.ws-icon.expanded { transform: rotate(90deg); }
.ws-security-details { padding: 0 18px 18px 72px; display: flex; flex-direction: column; gap: 8px; }
.ws-detail-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-secondary); }
.ws-detail-item svg { color: var(--color-accent-lime); flex-shrink: 0; }

.ws-slide-enter-active, .ws-slide-leave-active { transition: all var(--transition-base); overflow: hidden; }
.ws-slide-enter-from, .ws-slide-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.ws-slide-enter-to, .ws-slide-leave-from { opacity: 1; max-height: 300px; }

/* 平台价值收尾 */
.ws-incentive-coda { margin-top: 32px; }
.ws-coda-card { padding: 48px 40px; text-align: center; background: linear-gradient(135deg, rgba(0,229,255,0.06), rgba(198,255,61,0.04), rgba(183,148,244,0.04)); border: 1px solid var(--color-border-strong); border-radius: var(--radius-xl); position: relative; overflow: hidden; }
.ws-coda-card::before { content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 200px; background: radial-gradient(ellipse at center, rgba(0,229,255,0.15), transparent 70%); pointer-events: none; }
.ws-coda-title { font-family: var(--font-display); font-weight: 700; font-size: clamp(28px, 4vw, 40px); margin: 12px 0 32px; letter-spacing: -0.02em; position: relative; }
.ws-coda-loop { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; position: relative; }
.ws-loop-step { flex: 1; min-width: 220px; max-width: 280px; padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-loop-step h4 { font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 12px 0 8px; }
.ws-loop-step p { font-size: 13px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.ws-loop-arrow { flex-shrink: 0; }
.ws-coda-tag { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted); margin: 0; letter-spacing: 0.05em; position: relative; }

/* 响应式 */
@media (max-width: 1024px) {
  .ws-platform-stats { grid-template-columns: repeat(2, 1fr); }
  .ws-incentive-layout { grid-template-columns: 1fr; }
  .ws-tier-grid { grid-template-columns: repeat(2, 1fr); }
  .ws-security-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .ws-wallet-head { flex-direction: column; align-items: stretch; }
  .ws-wallet-stats { justify-content: space-around; gap: 16px; }
  .ws-shop-grid { grid-template-columns: 1fr; }
  .ws-tier-grid { grid-template-columns: 1fr; }
  .ws-security-grid { grid-template-columns: 1fr; }
  .ws-coda-loop { flex-direction: column; }
  .ws-loop-arrow { transform: rotate(90deg); }
  .ws-section-head { flex-direction: column; align-items: flex-start; }
  .ws-section-desc { text-align: left; }
  .ws-rules-head, .ws-rules-row { grid-template-columns: 1fr 0.6fr 1fr; font-size: 12px; }
  .ws-monthly-item { flex-wrap: wrap; }
  .ws-monthly-reward { max-width: 100%; width: 100%; }
}
</style>

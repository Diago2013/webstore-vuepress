<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WsIcon from './shared/WsIcon.vue'
import { communityTopics, contests } from '../data/community.ts'
import {
  addPost, myPosts, addQuestion, myQuestions,
  voteQuestion, getQaVotes,
  toggleUgcLike, isUgcLiked,
  userPoints
} from '../store/useStore.ts'

const route = useRoute()
const router = useRouter()

const activeSection = ref<'all' | 'review' | 'tip' | 'request' | 'interview' | 'mine'>('all')

const sections = [
  { key: 'all', name: '全部', icon: 'grid' },
  { key: 'review', name: '测评', icon: 'star' },
  { key: 'tip', name: '技巧', icon: 'bulb' },
  { key: 'request', name: '需求征集', icon: 'message' },
  { key: 'interview', name: '开发者访谈', icon: 'video' },
  { key: 'mine', name: '我的发帖', icon: 'user' }
]

// 排序
const sortType = ref<'latest' | 'hot' | 'most-comment'>('latest')

// 合并社区话题 + 我的发帖
const allTopics = computed(() => {
  const mine = myPosts.value.map(p => ({
    id: p.id,
    section: p.section || '测评',
    author: '林深时见鹿',
    avatar: '✿',
    title: p.title,
    excerpt: p.content,
    likes: p.likes || 0,
    comments: p.comments || 0,
    time: '刚刚',
    hot: false,
    tags: p.tags || [],
    votes: p.votes,
    isMine: true
  }))
  return [...mine, ...communityTopics]
})

const filteredTopics = computed(() => {
  let list = allTopics.value
  if (activeSection.value === 'mine') {
    list = list.filter(t => t.isMine)
  } else if (activeSection.value !== 'all') {
    list = list.filter(t => {
      if (activeSection.value === 'review') return t.section === '测评'
      if (activeSection.value === 'tip') return t.section === '技巧'
      if (activeSection.value === 'request') return t.section === '需求'
      if (activeSection.value === 'interview') return t.section === '访谈'
      return true
    })
  }
  // 排序
  if (sortType.value === 'hot') list = [...list].sort((a, b) => b.likes - a.likes)
  else if (sortType.value === 'most-comment') list = [...list].sort((a, b) => b.comments - a.comments)
  return list
})

// 发帖弹窗
const showPostModal = ref(false)
const postForm = ref({
  section: '测评' as '测评' | '技巧' | '需求',
  title: '',
  content: '',
  tags: '',
  mentionDev: ''
})
const postSubmitted = ref(false)
const openPostModal = () => {
  showPostModal.value = true
  postSubmitted.value = false
}
const submitPost = () => {
  if (!postForm.value.title.trim() || !postForm.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }
  const tags = postForm.value.tags.split(/[,，\s]+/).filter(Boolean)
  addPost({
    section: postForm.value.section,
    title: postForm.value.title.trim(),
    content: postForm.value.content.trim(),
    tags,
    mentionDev: postForm.value.mentionDev,
    likes: 0,
    comments: 0
  })
  postSubmitted.value = true
  setTimeout(() => {
    showPostModal.value = false
    postForm.value = { section: '测评', title: '', content: '', tags: '', mentionDev: '' }
    activeSection.value = 'mine'
  }, 1500)
}

// 话题点赞（持久化）
const topicLiked = (id: string) => isUgcLiked('topic_' + id)
const toggleTopicLike = (id: string) => {
  toggleUgcLike('topic_' + id)
}

// 评论展开
const expandedTopic = ref<string | null>(null)
const topicComments = ref<Record<string, any[]>>({})
const commentInput = ref('')
const toggleComments = (id: string) => {
  expandedTopic.value = expandedTopic.value === id ? null : id
  if (!topicComments.value[id]) {
    // 初始化 mock 评论
    topicComments.value[id] = [
      { user: '代码诗人', avatar: '✦', text: '感谢分享，学到了！', time: '2小时前' },
      { user: '设计师小K', avatar: '◈', text: '想请教一下，这个对新手友好吗？', time: '1小时前' }
    ]
  }
}
const submitComment = (topicId: string) => {
  if (!commentInput.value.trim()) return
  if (!topicComments.value[topicId]) topicComments.value[topicId] = []
  topicComments.value[topicId].push({
    user: '林深时见鹿',
    avatar: '✿',
    text: commentInput.value.trim(),
    time: '刚刚',
    isMine: true
  })
  commentInput.value = ''
}

// 访谈
const interviews = ref([
  { id: 'iv1', title: '对话NovaStudio：独立工作室如何做出爆款工具', guest: '凌川 / 砚白', guestAvatar: '◆', excerpt: '我们采访了PixelForge背后的3人团队，聊聊独立开发者的生存之道...', questions: 142, views: 12500, date: '2天前', status: 'ongoing' },
  { id: 'iv2', title: 'QuantumVue创始人的数据可视化十年', guest: '云澈', guestAvatar: '◢', excerpt: '从阿里到创业，从DataPulse到AutoMLKit，一位数据老兵的复盘...', questions: 89, views: 8900, date: '上周', status: 'ended' }
])

const interviewQuestions = ref([
  { id: 'iq1', q: '独立工作室如何平衡产品迭代与商业化？', asker: '代码诗人', votes: 142 },
  { id: 'iq2', q: 'PixelForge的AI风格迁移是如何训练的？', asker: '数据矿工', votes: 89 },
  { id: 'iq3', q: '对刚起步的独立开发者有什么建议？', asker: '设计师小K', votes: 76 }
])

// 投票
const votedQuestions = ref<string[]>([])
const voteQ = (q: any) => {
  if (votedQuestions.value.includes(q.id)) return
  votedQuestions.value.push(q.id)
  voteQuestion(q.id)
  q.votes = (q.votes || 0) + 1
}
const qVotes = (id: string) => getQaVotes(id)

// 访谈提问
const newQuestion = ref('')
const askInterviewQuestion = (iv: any) => {
  if (!newQuestion.value.trim()) return
  const newQ = {
    id: 'iq_' + Date.now(),
    q: newQuestion.value.trim(),
    asker: '林深时见鹿',
    votes: 1
  }
  interviewQuestions.value.unshift(newQ)
  addQuestion({ content: newQuestion.value.trim(), target: iv.title, type: 'interview' })
  newQuestion.value = ''
  iv.questions++
  alert('问题已提交，+5 积分')
}

// 赛事
const contestSubmissions = ref([
  { id: 's1', author: '林深时见鹿', avatar: '✿', title: '未来城市·赛博像素', tool: 'PixelForge', votes: 342, voted: false },
  { id: 's2', author: '代码诗人', avatar: '✦', title: '云端数据之城', tool: 'DataPulse', votes: 287, voted: false },
  { id: 's3', author: '设计师小K', avatar: '◈', title: '霓虹深巷', tool: 'PixelForge', votes: 215, voted: false }
])
const voteSubmission = (s: any) => {
  if (s.voted) return
  s.voted = true
  s.votes++
}

// 参加赛事
const joinContest = (c: any) => {
  if (c.status === 'upcoming') {
    alert(`赛事「${c.title}」尚未开始，已为您预约提醒`)
  } else {
    alert(`已报名「${c.title}」，期待您的作品！`)
    c.participants = (c.participants || 0) + 1
  }
}

// 从 URL 查询参数（从 ProfilePage 跳转过来）
onMounted(() => {
  const group = route.query.group as string
  if (group) {
    // 滚动到社区内容
    setTimeout(() => {
      const el = document.querySelector('.ws-community-main')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }
})

const displayPoints = computed(() => userPoints.value)
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 头部 -->
      <div class="ws-community-hero ws-anim-fade-up">
        <span class="ws-section-eyebrow">COMMUNITY · V3.0</span>
        <h1 class="ws-community-title">公共话题 <span class="text-gradient">广场</span></h1>
        <p class="ws-community-sub">测评 · 技巧 · 需求征集 · 开发者访谈 —— 发帖可@对应开发者</p>
        <div class="ws-hero-points">当前积分 <strong class="font-mono text-gradient">{{ displayPoints.toLocaleString() }}</strong></div>
      </div>

      <div class="ws-community-grid">
        <!-- 左侧主内容 -->
        <div class="ws-community-main">
          <!-- 分区切换 -->
          <div class="ws-section-tabs">
            <button v-for="s in sections" :key="s.key" class="ws-sec-tab" :class="{ active: activeSection === s.key }" @click="activeSection = s.key as any">
              <WsIcon :name="s.icon" :size="13" /> {{ s.name }}
              <span v-if="s.key === 'mine' && myPosts.length" class="ws-tab-count">{{ myPosts.length }}</span>
            </button>
          </div>

          <!-- 发帖入口 -->
          <div class="ws-post-bar">
            <span class="ws-post-avatar">✿</span>
            <input class="ws-post-input" placeholder="分享你的测评、技巧，或@开发者提问…" readonly @click="openPostModal" />
            <button class="ws-btn ws-btn-primary" @click="openPostModal"><WsIcon name="plus" :size="13" /> 发帖</button>
          </div>

          <!-- 排序栏 -->
          <div class="ws-sort-bar">
            <span class="ws-sort-label">排序：</span>
            <button class="ws-sort-btn" :class="{ active: sortType === 'latest' }" @click="sortType = 'latest'">最新</button>
            <button class="ws-sort-btn" :class="{ active: sortType === 'hot' }" @click="sortType = 'hot'">最热</button>
            <button class="ws-sort-btn" :class="{ active: sortType === 'most-comment' }" @click="sortType = 'most-comment'">讨论最多</button>
            <span class="ws-sort-count">共 {{ filteredTopics.length }} 条</span>
          </div>

          <!-- 话题列表 -->
          <div class="ws-topic-list">
            <article v-for="t in filteredTopics" :key="t.id" class="ws-topic-card" :class="{ hot: t.hot, mine: t.isMine }">
              <div class="ws-topic-head">
                <span class="ws-topic-section" :class="t.section">{{ t.section }}</span>
                <span v-if="t.isMine" class="ws-mine-tag">我的</span>
                <span v-if="t.hot" class="ws-hot-tag"><WsIcon name="flame" :size="10" /> 热议</span>
                <span class="ws-topic-time font-mono">{{ t.time }}</span>
              </div>
              <h3 class="ws-topic-title">{{ t.title }}</h3>
              <p class="ws-topic-excerpt">{{ t.excerpt }}</p>
              <div class="ws-topic-tags">
                <span v-for="tag in t.tags" :key="tag" class="ws-topic-tag">#{{ tag }}</span>
              </div>
              <div class="ws-topic-foot">
                <div class="ws-topic-author">
                  <span class="ws-author-avatar">{{ t.avatar }}</span>
                  <span>{{ t.author }}</span>
                </div>
                <div class="ws-topic-stats">
                  <span v-if="t.votes" class="ws-stat"><WsIcon name="trending-up" :size="12" color="var(--color-accent-lime)" /> {{ t.votes }}</span>
                  <button class="ws-stat ws-like-btn" :class="{ liked: topicLiked(t.id) }" @click.stop="toggleTopicLike(t.id)">
                    <WsIcon name="heart" :size="12" :color="topicLiked(t.id) ? 'var(--color-accent-coral)' : 'var(--color-text-muted)'" />
                    {{ t.likes + (topicLiked(t.id) ? 1 : 0) }}
                  </button>
                  <button class="ws-stat ws-comment-btn" @click.stop="toggleComments(t.id)">
                    <WsIcon name="message" :size="12" color="var(--color-accent-cyan)" /> {{ t.comments + (topicComments[t.id]?.length || 0) }}
                  </button>
                </div>
              </div>

              <!-- 评论区 -->
              <Transition name="ws-slide-down">
                <div v-if="expandedTopic === t.id" class="ws-comment-section">
                  <div class="ws-comment-list">
                    <div v-for="(c, i) in topicComments[t.id] || []" :key="i" class="ws-comment-item" :class="{ mine: c.isMine }">
                      <span class="ws-comment-avatar">{{ c.avatar }}</span>
                      <div class="ws-comment-body">
                        <div class="ws-comment-head">
                          <span class="ws-comment-user">{{ c.user }}</span>
                          <span v-if="c.isMine" class="ws-comment-mine-tag">我</span>
                          <span class="ws-comment-time font-mono">{{ c.time }}</span>
                        </div>
                        <p class="ws-comment-text">{{ c.text }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="ws-comment-input-row">
                    <input v-model="commentInput" class="ws-comment-input" placeholder="发表你的评论…" @keydown.enter="submitComment(t.id)" />
                    <button class="ws-comment-send" @click="submitComment(t.id)"><WsIcon name="send" :size="13" /></button>
                  </div>
                </div>
              </Transition>
            </article>

            <!-- 空状态 -->
            <div v-if="!filteredTopics.length" class="ws-empty-state">
              <WsIcon name="message" :size="40" color="var(--color-text-muted)" />
              <p v-if="activeSection === 'mine'">您还没有发过帖，点击上方"发帖"分享您的经验</p>
              <p v-else>暂无匹配的话题</p>
            </div>
          </div>
        </div>

        <!-- 右侧栏 -->
        <aside class="ws-community-aside">
          <!-- 开发者访谈专栏 -->
          <div class="ws-aside-card ws-interview-card">
            <h3><WsIcon name="video" :size="16" color="var(--color-accent-violet)" /> 开发者访谈专栏</h3>
            <div v-for="iv in interviews" :key="iv.id" class="ws-interview-item">
              <div class="ws-interview-guest">
                <span class="ws-guest-avatar">{{ iv.guestAvatar }}</span>
                <div>
                  <span class="ws-guest-name">{{ iv.guest }}</span>
                  <span class="ws-interview-status" :class="iv.status">{{ iv.status === 'ongoing' ? '提问中' : '已结束' }}</span>
                </div>
              </div>
              <h4>{{ iv.title }}</h4>
              <p>{{ iv.excerpt }}</p>
              <div class="ws-interview-meta">
                <span><WsIcon name="message" :size="11" /> {{ iv.questions }} 提问</span>
                <span><WsIcon name="eye" :size="11" /> {{ iv.views.toLocaleString() }} 观看</span>
              </div>
              <div v-if="iv.status === 'ongoing'" class="ws-ask-box">
                <input v-model="newQuestion" placeholder="提前提交提问…" @keydown.enter="askInterviewQuestion(iv)" />
                <button @click="askInterviewQuestion(iv)">提问</button>
              </div>
              <p class="ws-interview-note">访谈内容长期开放评论</p>
            </div>
          </div>

          <!-- 热门提问 -->
          <div class="ws-aside-card">
            <h3><WsIcon name="trending-up" :size="16" color="var(--color-accent-cyan)" /> 本周热门提问</h3>
            <div class="ws-question-list">
              <div v-for="(q, i) in interviewQuestions" :key="q.id || i" class="ws-question-item">
                <span class="ws-q-rank font-mono">{{ i + 1 }}</span>
                <div>
                  <p class="ws-q-text">{{ q.q }}</p>
                  <span class="ws-q-asker">— {{ q.asker }}</span>
                </div>
                <button class="ws-q-vote" :class="{ voted: votedQuestions.includes(q.id) }" @click="voteQ(q)">
                  <WsIcon name="trending-up" :size="11" :color="votedQuestions.includes(q.id) ? 'var(--color-base)' : 'var(--color-accent-lime)'" />
                  <span class="font-mono">{{ q.votes }}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- 创意作品赛事 -->
      <section class="ws-contest-section">
        <div class="ws-section-head">
          <h2 class="ws-section-title"><WsIcon name="trophy" :size="20" color="var(--color-accent-amber)" /> 工具创意作品赛事</h2>
          <p class="ws-section-desc">开发者担任评委 · 优秀作品永久展示在工具详情页</p>
        </div>
        <div class="ws-contest-grid">
          <div v-for="c in contests" :key="c.id" class="ws-contest-card" :class="c.status">
            <div class="ws-contest-head">
              <span class="ws-contest-status" :class="c.status">{{ c.status === 'ongoing' ? '进行中' : '即将开始' }}</span>
              <span class="ws-contest-deadline font-mono">{{ c.deadline }}</span>
            </div>
            <h3 class="ws-contest-title">{{ c.title }}</h3>
            <p class="ws-contest-desc">{{ c.desc }}</p>
            <div class="ws-contest-prize">
              <WsIcon name="gift" :size="14" color="var(--color-accent-amber)" />
              <span>{{ c.prize }}</span>
            </div>
            <div class="ws-contest-foot">
              <div class="ws-contest-judges">
                <span>评委：</span>
                <span v-for="j in c.judges" :key="j" class="ws-judge-chip">{{ j }}</span>
              </div>
              <div class="ws-contest-stat">
                <WsIcon name="users" :size="12" color="var(--color-accent-cyan)" />
                <span class="font-mono">{{ c.participants }} 参赛</span>
              </div>
            </div>
            <button class="ws-contest-join" @click="joinContest(c)">
              {{ c.status === 'ongoing' ? '立即报名参赛' : '预约提醒' }}
            </button>
          </div>
        </div>

        <!-- 优秀作品展示 -->
        <div class="ws-submissions">
          <h3 class="ws-sub-title">往期优秀作品 · 永久展示在工具详情页</h3>
          <div class="ws-submission-grid">
            <div v-for="s in contestSubmissions" :key="s.id" class="ws-submission-card">
              <div class="ws-sub-cover" :style="{ background: 'linear-gradient(135deg, #6C8EEF, #B794F4)' }">
                <span class="ws-sub-icon">{{ s.tool === 'PixelForge' ? '◈' : '▣' }}</span>
                <span class="ws-sub-votes font-mono">{{ s.votes }} 票</span>
              </div>
              <div class="ws-sub-body">
                <h4>{{ s.title }}</h4>
                <div class="ws-sub-author">
                  <span class="ws-author-avatar sm">{{ s.avatar }}</span>
                  <span>{{ s.author }}</span>
                  <span class="ws-sub-tool font-mono">{{ s.tool }}</span>
                </div>
                <button class="ws-sub-vote-btn" :class="{ voted: s.voted }" @click="voteSubmission(s)">
                  <WsIcon name="heart" :size="11" :color="s.voted ? 'var(--color-accent-coral)' : 'currentColor'" />
                  {{ s.voted ? '已投票' : '投票' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 发帖弹窗 -->
      <Transition name="ws-fade">
        <div v-if="showPostModal" class="ws-modal-mask" @click.self="showPostModal = false">
          <div class="ws-modal-box ws-modal-box-lg">
            <template v-if="!postSubmitted">
              <h3>发布新帖</h3>
              <div class="ws-form-row">
                <label>分区</label>
                <div class="ws-radio-group">
                  <label v-for="s in ['测评', '技巧', '需求']" :key="s" class="ws-radio">
                    <input type="radio" v-model="postForm.section" :value="s" /><span>{{ s }}</span>
                  </label>
                </div>
              </div>
              <div class="ws-form-row">
                <label>标题</label>
                <input v-model="postForm.title" class="ws-modal-input" placeholder="一句话概括内容…" />
              </div>
              <div class="ws-form-row">
                <label>正文</label>
                <textarea v-model="postForm.content" class="ws-modal-textarea" placeholder="详细描述您想分享的内容…" rows="5"></textarea>
              </div>
              <div class="ws-form-row">
                <label>标签（用空格或逗号分隔）</label>
                <input v-model="postForm.tags" class="ws-modal-input" placeholder="如：PixelForge 教程 AI作图" />
              </div>
              <div class="ws-form-row">
                <label>@开发者（可选）</label>
                <input v-model="postForm.mentionDev" class="ws-modal-input" placeholder="@对应开发者会收到通知" />
              </div>
              <div class="ws-modal-actions">
                <button class="ws-btn ws-btn-ghost" @click="showPostModal = false">取消</button>
                <button class="ws-btn ws-btn-primary" @click="submitPost"><WsIcon name="send" :size="13" /> 发布（+10 积分）</button>
              </div>
            </template>
            <div v-else class="ws-post-success">
              <WsIcon name="check-circle" :size="48" color="var(--color-accent-lime)" />
              <h3>发布成功！</h3>
              <p>获得 +10 积分奖励</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.ws-page { padding: 48px 0 80px; position: relative; z-index: 2; }
.ws-community-hero { text-align: center; margin-bottom: 40px; }
.ws-community-title { font-family: var(--font-display); font-weight: 700; font-size: clamp(36px, 5vw, 56px); margin: 12px 0; }
.ws-community-sub { font-size: 15px; color: var(--color-text-secondary); margin: 0; }
.ws-hero-points { margin-top: 12px; font-size: 13px; color: var(--color-text-secondary); }
.ws-hero-points strong { font-size: 16px; margin-left: 4px; }

.ws-community-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; margin-bottom: 64px; }

/* 分区 */
.ws-section-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.ws-sec-tab { display: inline-flex; align-items: center; gap: 5px; padding: 8px 14px; font-size: 13px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast); }
.ws-sec-tab:hover { color: var(--color-text); }
.ws-sec-tab.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-tab-count { font-size: 10px; padding: 1px 6px; background: var(--color-accent-cyan); color: var(--color-base); border-radius: var(--radius-pill); font-family: var(--font-mono); font-weight: 700; }

/* 发帖 */
.ws-post-bar { display: flex; align-items: center; gap: 10px; padding: 8px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-pill); margin-bottom: 16px; }
.ws-post-avatar { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: linear-gradient(135deg, #6C8EEF, #B794F4); border-radius: 50%; font-size: 16px; }
.ws-post-input { flex: 1; padding: 10px 14px; background: transparent; border: none; outline: none; color: var(--color-text); font-size: 13px; cursor: pointer; }
.ws-post-input::placeholder { color: var(--color-text-muted); }

/* 排序 */
.ws-sort-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; font-size: 12px; }
.ws-sort-label { color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-sort-btn { padding: 4px 10px; font-size: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-secondary); cursor: pointer; }
.ws-sort-btn.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-sort-count { margin-left: auto; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 话题卡片 */
.ws-topic-list { display: flex; flex-direction: column; gap: 12px; }
.ws-topic-card { padding: 20px; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); transition: all var(--transition-fast); }
.ws-topic-card:hover { border-color: var(--color-border-strong); transform: translateY(-2px); }
.ws-topic-card.hot { border-left: 3px solid var(--color-accent-coral); }
.ws-topic-card.mine { border-left: 3px solid var(--color-accent-lime); }
.ws-topic-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.ws-topic-section { font-size: 10px; padding: 3px 8px; border-radius: var(--radius-pill); font-family: var(--font-mono); font-weight: 600; }
.ws-topic-section.测评 { background: rgba(0,229,255,0.12); color: var(--color-accent-cyan); }
.ws-topic-section.技巧 { background: rgba(198,255,61,0.12); color: var(--color-accent-lime); }
.ws-topic-section.需求 { background: rgba(255,184,77,0.12); color: var(--color-accent-amber); }
.ws-topic-section.访谈 { background: rgba(183,148,244,0.12); color: var(--color-accent-violet); }
.ws-mine-tag { font-size: 10px; padding: 2px 7px; background: var(--color-accent-lime); color: var(--color-base); border-radius: var(--radius-pill); font-family: var(--font-mono); font-weight: 700; }
.ws-hot-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; padding: 2px 7px; background: rgba(255,107,107,0.15); color: var(--color-accent-coral); border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-topic-time { font-size: 11px; color: var(--color-text-muted); margin-left: auto; }
.ws-topic-title { font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 0 0 8px; color: var(--color-text); }
.ws-topic-excerpt { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 12px; line-height: 1.6; }
.ws-topic-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.ws-topic-tag { font-size: 11px; color: var(--color-accent-cyan); }
.ws-topic-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--color-border); }
.ws-topic-author { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-secondary); }
.ws-author-avatar { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--color-surface-light); border-radius: 50%; font-size: 12px; }
.ws-author-avatar.sm { width: 20px; height: 20px; font-size: 10px; }
.ws-topic-stats { display: flex; gap: 14px; align-items: center; }
.ws-stat { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-muted); }
.ws-like-btn, .ws-comment-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: var(--radius-sm); transition: all var(--transition-fast); font-family: inherit; }
.ws-like-btn:hover, .ws-comment-btn:hover { background: rgba(255,255,255,0.04); }
.ws-like-btn.liked { color: var(--color-accent-coral); }

/* 评论区 */
.ws-comment-section { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--color-border); }
.ws-comment-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; max-height: 280px; overflow-y: auto; }
.ws-comment-item { display: flex; gap: 10px; padding: 8px 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); }
.ws-comment-item.mine { background: rgba(0,229,255,0.04); border: 1px solid rgba(0,229,255,0.15); }
.ws-comment-avatar { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--color-surface-light); border-radius: 50%; font-size: 13px; flex-shrink: 0; }
.ws-comment-body { flex: 1; }
.ws-comment-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.ws-comment-user { font-size: 12px; font-weight: 600; color: var(--color-text); }
.ws-comment-mine-tag { font-size: 9px; padding: 1px 5px; background: var(--color-accent-cyan); color: var(--color-base); border-radius: var(--radius-pill); font-weight: 700; }
.ws-comment-time { font-size: 10px; color: var(--color-text-muted); margin-left: auto; }
.ws-comment-text { font-size: 13px; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
.ws-comment-input-row { display: flex; gap: 6px; }
.ws-comment-input { flex: 1; padding: 8px 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 12px; outline: none; font-family: inherit; }
.ws-comment-input:focus { border-color: var(--color-accent-cyan); }
.ws-comment-send { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--color-accent-cyan-soft); border: 1px solid var(--color-accent-cyan-soft); border-radius: var(--radius-sm); color: var(--color-accent-cyan); cursor: pointer; }
.ws-comment-send:hover { background: var(--color-accent-cyan); color: var(--color-base); }

/* 空状态 */
.ws-empty-state { text-align: center; padding: 48px 20px; background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md); }
.ws-empty-state p { margin: 12px 0 0; font-size: 13px; color: var(--color-text-muted); }

/* 右侧栏 */
.ws-community-aside { display: flex; flex-direction: column; gap: 20px; }
.ws-aside-card { padding: 20px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.ws-aside-card h3 { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: 15px; margin: 0 0 16px; }

.ws-interview-item { padding: 14px 0; border-bottom: 1px solid var(--color-border); }
.ws-interview-item:last-child { border-bottom: none; }
.ws-interview-guest { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ws-guest-avatar { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--color-surface-light); border-radius: 8px; font-size: 16px; color: var(--color-accent-violet); }
.ws-guest-name { display: block; font-size: 13px; color: var(--color-text); }
.ws-interview-status { font-size: 10px; padding: 2px 6px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-interview-status.ongoing { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-interview-status.ended { background: rgba(139,146,176,0.15); color: var(--color-text-muted); }
.ws-interview-item h4 { font-size: 14px; margin: 8px 0; color: var(--color-text); font-weight: 600; }
.ws-interview-item p { font-size: 12px; color: var(--color-text-secondary); margin: 0 0 8px; line-height: 1.5; }
.ws-interview-meta { display: flex; gap: 12px; font-size: 11px; color: var(--color-text-muted); }
.ws-interview-meta span { display: inline-flex; align-items: center; gap: 4px; }
.ws-ask-box { display: flex; gap: 6px; margin: 10px 0 6px; }
.ws-ask-box input { flex: 1; padding: 7px 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); font-size: 12px; outline: none; font-family: inherit; }
.ws-ask-box input:focus { border-color: var(--color-accent-violet); }
.ws-ask-box button { padding: 7px 12px; background: var(--color-accent-violet); color: white; border: none; border-radius: var(--radius-sm); font-size: 11px; cursor: pointer; }
.ws-ask-box button:hover { opacity: 0.9; }
.ws-interview-note { font-size: 10px; color: var(--color-text-muted); font-style: italic; }

.ws-question-list { display: flex; flex-direction: column; gap: 10px; }
.ws-question-item { display: flex; gap: 10px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); }
.ws-q-rank { font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--color-accent-cyan); min-width: 20px; }
.ws-question-item > div { flex: 1; }
.ws-q-text { font-size: 13px; color: var(--color-text); margin: 0 0 4px; line-height: 1.4; }
.ws-q-asker { font-size: 11px; color: var(--color-text-muted); }
.ws-q-vote { display: flex; flex-direction: column; align-items: center; padding: 4px 8px; background: rgba(198,255,61,0.08); border: 1px solid rgba(198,255,61,0.2); border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast); }
.ws-q-vote:hover { background: rgba(198,255,61,0.15); }
.ws-q-vote.voted { background: var(--color-accent-lime); border-color: var(--color-accent-lime); }

/* 赛事 */
.ws-contest-section { margin-top: 40px; }
.ws-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
.ws-section-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 24px; margin: 0; }
.ws-section-desc { font-size: 13px; color: var(--color-text-muted); margin: 0; text-align: right; }

.ws-contest-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 32px; }
.ws-contest-card { padding: 24px; background: linear-gradient(180deg, rgba(255,184,77,0.06), rgba(255,255,255,0.01)); border: 1px solid rgba(255,184,77,0.2); border-radius: var(--radius-md); }
.ws-contest-card.upcoming { opacity: 0.85; border-color: var(--color-border); background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); }
.ws-contest-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ws-contest-status { font-size: 11px; padding: 3px 10px; border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-contest-status.ongoing { background: rgba(198,255,61,0.15); color: var(--color-accent-lime); }
.ws-contest-status.upcoming { background: rgba(255,184,77,0.15); color: var(--color-accent-amber); }
.ws-contest-deadline { font-size: 12px; color: var(--color-text-muted); }
.ws-contest-title { font-family: var(--font-display); font-weight: 700; font-size: 20px; margin: 0 0 8px; }
.ws-contest-desc { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 14px; }
.ws-contest-prize { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: rgba(255,184,77,0.08); border: 1px solid rgba(255,184,77,0.2); border-radius: var(--radius-sm); font-size: 13px; color: var(--color-accent-amber); margin-bottom: 14px; }
.ws-contest-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.ws-contest-judges { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--color-text-muted); flex-wrap: wrap; }
.ws-judge-chip { padding: 2px 8px; background: rgba(0,229,255,0.1); color: var(--color-accent-cyan); border-radius: var(--radius-pill); font-family: var(--font-mono); }
.ws-contest-stat { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }
.ws-contest-join {
  width: 100%;
  padding: 10px;
  background: var(--gradient-cyan-lime);
  color: var(--color-base);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}
.ws-contest-join:hover { box-shadow: var(--shadow-glow-cyan); }

/* 投稿展示 */
.ws-submissions { margin-top: 24px; }
.ws-sub-title { font-family: var(--font-display); font-weight: 600; font-size: 17px; margin: 0 0 16px; }
.ws-submission-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.ws-submission-card { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; transition: all var(--transition-base); }
.ws-submission-card:hover { border-color: var(--color-accent-amber-soft); transform: translateY(-4px); }
.ws-sub-cover { height: 140px; display: flex; align-items: center; justify-content: center; position: relative; }
.ws-sub-icon { font-size: 48px; color: white; }
.ws-sub-votes { position: absolute; top: 10px; right: 10px; padding: 3px 8px; background: rgba(0,0,0,0.4); color: var(--color-accent-lime); border-radius: var(--radius-pill); font-size: 11px; }
.ws-sub-body { padding: 14px; }
.ws-sub-body h4 { font-family: var(--font-display); font-weight: 600; font-size: 15px; margin: 0 0 8px; }
.ws-sub-author { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); margin-bottom: 10px; }
.ws-sub-tool { margin-left: auto; padding: 2px 6px; background: rgba(255,255,255,0.05); border-radius: 4px; }
.ws-sub-vote-btn {
  width: 100%;
  padding: 6px;
  background: rgba(255,107,107,0.08);
  border: 1px solid rgba(255,107,107,0.2);
  border-radius: var(--radius-sm);
  color: var(--color-accent-coral);
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all var(--transition-fast);
  font-family: inherit;
}
.ws-sub-vote-btn:hover { background: rgba(255,107,107,0.15); }
.ws-sub-vote-btn.voted { background: rgba(255,107,107,0.2); border-color: var(--color-accent-coral); }

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
.ws-modal-box-lg { max-width: 560px; }
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
  min-height: 100px;
  line-height: 1.5;
}
.ws-modal-textarea:focus { border-color: var(--color-accent-cyan); }
.ws-form-row { margin-bottom: 14px; }
.ws-form-row label { display: block; font-size: 12px; color: var(--color-text-muted); margin-bottom: 6px; font-family: var(--font-mono); }
.ws-radio-group { display: flex; gap: 14px; }
.ws-radio { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.ws-radio input { accent-color: var(--color-accent-cyan); }
.ws-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

.ws-post-success { text-align: center; padding: 20px; }
.ws-post-success h3 { margin: 16px 0 8px; }
.ws-post-success p { color: var(--color-text-secondary); margin: 0; }

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

/* 过渡 */
.ws-slide-down-enter-active, .ws-slide-down-leave-active { transition: all 0.3s var(--ease-out); }
.ws-slide-down-enter-from, .ws-slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.ws-fade-enter-active, .ws-fade-leave-active { transition: opacity 0.25s; }
.ws-fade-enter-from, .ws-fade-leave-to { opacity: 0; }
.ws-fade-enter-active .ws-modal-box, .ws-fade-leave-active .ws-modal-box { transition: transform 0.25s var(--ease-out); }
.ws-fade-enter-from .ws-modal-box, .ws-fade-leave-to .ws-modal-box { transform: scale(0.92); }

@media (max-width: 1024px) {
  .ws-community-grid { grid-template-columns: 1fr; }
  .ws-contest-grid, .ws-submission-grid { grid-template-columns: 1fr; }
}
</style>

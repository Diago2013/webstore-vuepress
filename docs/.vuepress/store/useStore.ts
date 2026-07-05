// WebStore 全局状态 - localStorage 持久化
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'webstore_state_v1'

interface PersistState {
  favorites: string[]          // 收藏工具ID
  pinnedTools: string[]        // 置顶工具ID
  followingDevs: string[]      // 关注开发者ID
  userPoints: number           // 用户积分
  memberDays: number           // 会员剩余天数
  readMessages: string[]       // 已读消息ID
  toolVotes: Record<string, number>  // 工具更新投票 { toolId: count }
  coVotes: Record<string, number>    // 共创需求投票 { requestId: count }
  qaVotes: Record<string, number>    // 社区问答投票 { questionId: count }
  ugcLikes: string[]           // 点赞的UGC内容ID
  myPosts: any[]               // 我发布的帖子
  myQuestions: any[]           // 我提的问题
  myReviews: Record<string, any[]>  // 我写的评价 { toolId: [...] }
  myNotes: any[]               // 我的笔记
  toolboxes: any[]             // 工具箱分组
  exchangedItems: string[]     // 已兑换的物品
  followedTopics: string[]     // 关注的话题
  searchHistory: string[]      // 搜索历史
  theme: 'dark' | 'light'      // 主题
  broadcastLogs: any[]         // 开发者推送记录
  joinedGroups: string[]       // 已加入的共创群组
  toolLaunchCount: Record<string, number>  // 工具使用次数
}

const defaultState: PersistState = {
  favorites: ['t3', 't4'],
  pinnedTools: ['t1', 't3', 't4'],
  followingDevs: ['d1'],
  userPoints: 2480,
  memberDays: 86,
  readMessages: [],
  toolVotes: {},
  coVotes: {},
  qaVotes: {},
  ugcLikes: [],
  myPosts: [],
  myQuestions: [],
  myReviews: {},
  myNotes: [],
  toolboxes: [],
  exchangedItems: [],
  followedTopics: [],
  searchHistory: [],
  theme: 'dark',
  broadcastLogs: [],
  joinedGroups: [],
  toolLaunchCount: {}
}

// 从 localStorage 加载
function loadState(): PersistState {
  if (typeof window === 'undefined') return { ...defaultState }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw)
    return { ...defaultState, ...parsed }
  } catch {
    return { ...defaultState }
  }
}

const state = ref<PersistState>(loadState())

// 持久化
if (typeof window !== 'undefined') {
  watch(state, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.warn('[WebStore] 持久化失败', e)
    }
  }, { deep: true })
}

// ===== 收藏 =====
export const isFavorited = (id: string) => state.value.favorites.includes(id)
export const toggleFavorite = (id: string) => {
  const idx = state.value.favorites.indexOf(id)
  if (idx >= 0) state.value.favorites.splice(idx, 1)
  else {
    state.value.favorites.push(id)
    state.value.userPoints += 2
  }
  return idx < 0
}

// ===== 置顶 =====
export const isPinned = (id: string) => state.value.pinnedTools.includes(id)
export const togglePin = (id: string) => {
  const idx = state.value.pinnedTools.indexOf(id)
  if (idx >= 0) state.value.pinnedTools.splice(idx, 1)
  else state.value.pinnedTools.push(id)
  return idx < 0
}

// ===== 关注开发者 =====
export const isFollowing = (devId: string) => state.value.followingDevs.includes(devId)
export const toggleFollow = (devId: string) => {
  const idx = state.value.followingDevs.indexOf(devId)
  if (idx >= 0) state.value.followingDevs.splice(idx, 1)
  else {
    state.value.followingDevs.push(devId)
    state.value.userPoints += 5
  }
  return idx < 0
}

// ===== 消息已读 =====
export const isRead = (msgId: string) => state.value.readMessages.includes(msgId)
export const markRead = (msgId: string) => {
  if (!state.value.readMessages.includes(msgId)) {
    state.value.readMessages.push(msgId)
  }
}
export const markAllRead = (ids: string[]) => {
  ids.forEach(id => {
    if (!state.value.readMessages.includes(id)) state.value.readMessages.push(id)
  })
}

// ===== 投票 =====
export const voteToolUpdate = (toolId: string): number => {
  state.value.toolVotes[toolId] = (state.value.toolVotes[toolId] || 0) + 1
  state.value.userPoints += 1
  return state.value.toolVotes[toolId]
}
export const getToolVotes = (toolId: string) => state.value.toolVotes[toolId] || 0

export const voteCoRequest = (reqId: string): number => {
  state.value.coVotes[reqId] = (state.value.coVotes[reqId] || 0) + 1
  state.value.userPoints += 1
  return state.value.coVotes[reqId]
}
export const getCoVotes = (reqId: string) => state.value.coVotes[reqId] || 0

export const voteQuestion = (qId: string): number => {
  state.value.qaVotes[qId] = (state.value.qaVotes[qId] || 0) + 1
  return state.value.qaVotes[qId]
}
export const getQaVotes = (qId: string) => state.value.qaVotes[qId] || 0

// ===== UGC 点赞 =====
export const isUgcLiked = (id: string) => state.value.ugcLikes.includes(id)
export const toggleUgcLike = (id: string) => {
  const idx = state.value.ugcLikes.indexOf(id)
  if (idx >= 0) state.value.ugcLikes.splice(idx, 1)
  else state.value.ugcLikes.push(id)
  return idx < 0
}

// ===== 我的帖子 / 问题 / 评价 / 笔记 =====
export const addPost = (post: any) => {
  state.value.myPosts.unshift({ ...post, id: 'p_' + Date.now(), createdAt: new Date().toISOString() })
  state.value.userPoints += 10
}
export const addQuestion = (q: any) => {
  state.value.myQuestions.unshift({ ...q, id: 'q_' + Date.now(), createdAt: new Date().toISOString() })
  state.value.userPoints += 5
}
export const addReview = (toolId: string, review: any) => {
  if (!state.value.myReviews[toolId]) state.value.myReviews[toolId] = []
  state.value.myReviews[toolId].unshift({ ...review, id: 'r_' + Date.now(), createdAt: new Date().toISOString() })
  state.value.userPoints += 15
}
export const getReviews = (toolId: string) => state.value.myReviews[toolId] || []
export const addNote = (note: any) => {
  state.value.myNotes.unshift({ ...note, id: 'n_' + Date.now(), createdAt: new Date().toISOString() })
  state.value.userPoints += 3
}

// ===== 工具箱分组 CRUD =====
export const addToolbox = (name: string) => {
  state.value.toolboxes.push({
    id: 'tb_' + Date.now(),
    name,
    tools: [],
    reminder: false,
    createdAt: new Date().toISOString()
  })
}
export const removeToolbox = (id: string) => {
  const idx = state.value.toolboxes.findIndex(tb => tb.id === id)
  if (idx >= 0) state.value.toolboxes.splice(idx, 1)
}

// ===== 积分兑换 =====
export const exchangeItem = (item: { name: string; cost: number }): { ok: boolean; msg: string } => {
  if (state.value.exchangedItems.includes(item.name)) {
    return { ok: false, msg: '您已兑换过此物品' }
  }
  if (state.value.userPoints < item.cost) {
    return { ok: false, msg: '积分不足' }
  }
  state.value.userPoints -= item.cost
  state.value.exchangedItems.push(item.name)
  return { ok: true, msg: '兑换成功！物品已发放至账户' }
}

// ===== 加入群组 =====
export const isJoinedGroup = (id: string) => state.value.joinedGroups.includes(id)
export const joinGroup = (id: string) => {
  if (!state.value.joinedGroups.includes(id)) {
    state.value.joinedGroups.push(id)
    state.value.userPoints += 5
    return true
  }
  return false
}

// ===== 工具使用次数 =====
export const launchTool = (toolId: string) => {
  state.value.toolLaunchCount[toolId] = (state.value.toolLaunchCount[toolId] || 0) + 1
  state.value.userPoints += 1
}
export const getLaunchCount = (toolId: string) => state.value.toolLaunchCount[toolId] || 0

// ===== 搜索历史 =====
export const addSearchHistory = (q: string) => {
  const idx = state.value.searchHistory.indexOf(q)
  if (idx >= 0) state.value.searchHistory.splice(idx, 1)
  state.value.searchHistory.unshift(q)
  if (state.value.searchHistory.length > 10) state.value.searchHistory.pop()
}

// ===== 主题 =====
export const toggleTheme = () => {
  state.value.theme = state.value.theme === 'dark' ? 'light' : 'dark'
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', state.value.theme)
  }
}

// ===== 开发者广播日志 =====
export const addBroadcastLog = (log: any) => {
  state.value.broadcastLogs.unshift({ ...log, id: 'b_' + Date.now(), createdAt: new Date().toISOString() })
}

// ===== 计算属性 =====
export const favorites = computed(() => state.value.favorites)
export const pinnedTools = computed(() => state.value.pinnedTools)
export const followingDevs = computed(() => state.value.followingDevs)
export const userPoints = computed(() => state.value.userPoints)
export const memberDays = computed(() => state.value.memberDays)
export const myPosts = computed(() => state.value.myPosts)
export const myQuestions = computed(() => state.value.myQuestions)
export const myNotes = computed(() => state.value.myNotes)
export const toolboxes = computed(() => state.value.toolboxes)
export const exchangedItems = computed(() => state.value.exchangedItems)
export const searchHistory = computed(() => state.value.searchHistory)
export const broadcastLogs = computed(() => state.value.broadcastLogs)
export const joinedGroups = computed(() => state.value.joinedGroups)
export const unreadCount = (allMsgIds: string[]) =>
  allMsgIds.filter(id => !state.value.readMessages.includes(id)).length

export const stateRef = state  // 暴露原始state供高级用法

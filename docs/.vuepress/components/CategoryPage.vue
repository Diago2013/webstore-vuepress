<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WsIcon from './shared/WsIcon.vue'
import WsToolCard from './shared/WsToolCard.vue'
import { tools, categories } from '../data/tools.ts'
import {
  toggleFavorite, isFavorited, addSearchHistory, searchHistory
} from '../store/useStore.ts'

const route = useRoute()
const router = useRouter()

// 榜单切换
const rankingType = ref<'hot24' | 'new30' | 'praise'>('hot24')
const rangeType = ref<'day' | 'week' | 'month'>('day')

const rankingTabs = [
  { key: 'hot24', name: '24小时热榜', icon: 'flame', desc: '实时热度排名' },
  { key: 'new30', name: '30天新锐榜', icon: 'zap', desc: '新上线优质工具' },
  { key: 'praise', name: '高口碑榜', icon: 'star', desc: '用户评分最高' }
]

// 一级分类、二级分类
const activeCategory = ref('all')
const activeSubCat = ref<string>('all')
const showAllSubCats = ref(false)
const subCategories = ['图像编辑', '代码转换', '可视化', '语音生成', '写作编辑', '机器学习', '表单', '录屏']

// 搜索关键词（来自 URL ?q= 或本地输入）
const searchQuery = ref('')

// 排序
const sortType = ref<'default' | 'rating' | 'heat' | 'new' | 'free'>('default')

// 视图模式 & 批量
const viewMode = ref<'grid' | 'list'>('grid')
const batchMode = ref(false)
const selectedIds = ref<string[]>([])

// 最近筛选（持久化到 localStorage）
const recentFiltersKey = 'webstore_recent_filters'
const recentFilters = ref<string[]>([])
const loadRecentFilters = () => {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(recentFiltersKey)
    recentFilters.value = raw ? JSON.parse(raw) : ['免费', 'AI工具', '热门']
  } catch { recentFilters.value = ['免费', 'AI工具', '热门'] }
}
loadRecentFilters()
const saveRecentFilters = () => {
  try { localStorage.setItem(recentFiltersKey, JSON.stringify(recentFilters.value)) } catch {}
}
const addRecentFilter = (f: string) => {
  const idx = recentFilters.value.indexOf(f)
  if (idx >= 0) recentFilters.value.splice(idx, 1)
  recentFilters.value.unshift(f)
  if (recentFilters.value.length > 8) recentFilters.value.pop()
  saveRecentFilters()
}
const clearRecentFilters = () => {
  recentFilters.value = []
  saveRecentFilters()
}

// 当前激活的快捷筛选
const activeQuickFilters = ref<string[]>([])
const toggleQuickFilter = (f: string) => {
  const idx = activeQuickFilters.value.indexOf(f)
  if (idx >= 0) activeQuickFilters.value.splice(idx, 1)
  else activeQuickFilters.value.push(f)
  currentPage.value = 1
}

// 从 URL 读取参数（WsNavbar 搜索 / HomePage 分类胶囊跳转过来）
const syncFromUrl = () => {
  const q = route.query.q as string
  const cat = route.query.cat as string
  const sort = route.query.sort as string
  if (q) {
    searchQuery.value = q
    addSearchHistory(q)
    addRecentFilter(q)
  }
  if (cat && categories.find(c => c.id === cat)) {
    activeCategory.value = cat
    addRecentFilter(categories.find(c => c.id === cat)!.name)
  }
  if (sort === 'hot') rankingType.value = 'hot24'
  else if (sort === 'new') rankingType.value = 'new30'
  else if (sort === 'rating') rankingType.value = 'praise'
}

onMounted(syncFromUrl)
watch(() => route.query, syncFromUrl)

// 排序后的工具
const sortedTools = computed(() => {
  let list = [...tools]
  if (rankingType.value === 'hot24') {
    const factor = rangeType.value === 'day' ? 1 : rangeType.value === 'week' ? 7 : 30
    list.sort((a, b) => (b.heat24h * factor) - (a.heat24h * factor))
  } else if (rankingType.value === 'new30') {
    list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  } else {
    list.sort((a, b) => b.rating - a.rating)
  }
  return list
})

// 应用所有筛选条件
const filteredTools = computed(() => {
  let list = sortedTools.value

  // 一级分类
  if (activeCategory.value !== 'all') {
    const catMap: Record<string, string> = { design: '设计创作', dev: '开发工具', data: '数据工具', ai: 'AI工具', efficiency: '效率工具' }
    const catName = catMap[activeCategory.value]
    if (catName) list = list.filter(t => t.category === catName)
  }

  // 二级分类
  if (activeSubCat.value !== 'all') {
    list = list.filter(t => t.subCategory === activeSubCat.value)
  }

  // 搜索关键词
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.slogan.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q) ||
      t.subCategory.toLowerCase().includes(q) ||
      t.developerName.toLowerCase().includes(q)
    )
  }

  // 快捷筛选
  if (activeQuickFilters.value.length) {
    activeQuickFilters.value.forEach(f => {
      if (f === '免费') list = list.filter(t => t.isFree)
      else if (f === '热门') list = list.filter(t => t.isHot)
      else if (f === '新品') list = list.filter(t => t.isNew)
      else if (f === 'AI工具') list = list.filter(t => t.category === 'AI工具' || t.tags.some(tag => tag.includes('AI')))
      else if (f === '隐私五星') list = list.filter(t => t.privacyScore === 5)
      else {
        // 作为标签匹配
        list = list.filter(t => t.tags.some(tag => tag.toLowerCase().includes(f.toLowerCase())) ||
          t.category.includes(f) || t.subCategory.includes(f))
      }
    })
  }

  // 二次排序
  if (sortType.value === 'rating') list.sort((a, b) => b.rating - a.rating)
  else if (sortType.value === 'heat') list.sort((a, b) => b.heat24h - a.heat24h)
  else if (sortType.value === 'new') list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  else if (sortType.value === 'free') {
    list.sort((a, b) => (b.isFree ? 1 : 0) - (a.isFree ? 1 : 0))
  }

  return list
})

// 分页
const currentPage = ref(1)
const pageSize = ref(6)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredTools.value.length / pageSize.value)))
const pagedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTools.value.slice(start, start + pageSize.value)
})
const goToPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  if (typeof window !== 'undefined') window.scrollTo({ top: 400, behavior: 'smooth' })
}

// 当筛选条件变化时回到第一页
watch([activeCategory, activeSubCat, searchQuery, sortType, rankingType, rangeType, activeQuickFilters], () => {
  currentPage.value = 1
})

// Top 3（始终是过滤后的前 3）
const top3 = computed(() => filteredTools.value.slice(0, 3))
const rankList = computed(() => filteredTools.value.slice(3))

// 批量操作
const toggleSelect = (id: string) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const selectAll = () => {
  selectedIds.value = filteredTools.value.map(t => t.id)
}
const invertSelection = () => {
  const allIds = filteredTools.value.map(t => t.id)
  selectedIds.value = allIds.filter(id => !selectedIds.value.includes(id))
}

// 批量动作
const batchMsg = ref('')
const showBatchMsg = (text: string) => {
  batchMsg.value = text
  setTimeout(() => batchMsg.value = '', 2500)
}

const batchFavorite = () => {
  if (!selectedIds.value.length) return
  let added = 0, removed = 0
  selectedIds.value.forEach(id => {
    const wasFav = isFavorited(id)
    toggleFavorite(id)
    if (!wasFav) added++
    else removed++
  })
  showBatchMsg(`已收藏 ${added} 个工具${removed ? `，取消收藏 ${removed} 个` : ''}`)
  selectedIds.value = []
}

const batchOpen = () => {
  if (!selectedIds.value.length) return
  showBatchMsg(`正在批量打开 ${selectedIds.value.length} 个工具（新标签页）`)
  selectedIds.value.forEach((id, i) => {
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.open(`/tool/?id=${id}`, '_blank')
      }
    }, i * 300)
  })
  selectedIds.value = []
}

const exportCsv = () => {
  if (!selectedIds.value.length) return
  const selected = tools.filter(t => selectedIds.value.includes(t.id))
  const headers = ['ID', '名称', '版本', '分类', '二级分类', '标签', '评分', '24h热度', '在线人数', '免费', '开发者', '更新时间']
  const rows = selected.map(t => [
    t.id, t.name, t.version, t.category, t.subCategory,
    t.tags.join('/'), t.rating, t.heat24h, t.onlineUsers,
    t.isFree ? '是' : '否', t.developerName, t.updateTime
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  // BOM 解决 Excel 中文乱码
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `webstore_tools_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showBatchMsg(`已导出 ${selected.length} 个工具到 CSV`)
  selectedIds.value = []
}

const batchComparePdf = () => {
  if (selectedIds.value.length < 2) {
    showBatchMsg('请至少选择 2 个工具进行对比')
    return
  }
  if (selectedIds.value.length > 4) {
    showBatchMsg('对比最多支持 4 个工具')
    return
  }
  showBatchMsg(`已生成 ${selectedIds.value.length} 个工具的对比报告（演示）`)
}

// 跳转到工具详情
const goTool = (id?: string) => {
  if (id) router.push({ path: '/tool/', query: { id } })
  else router.push('/tool/')
}

// 切换分类
const selectCategory = (catId: string) => {
  activeCategory.value = catId
  activeSubCat.value = 'all'
  if (catId !== 'all') {
    const cat = categories.find(c => c.id === catId)
    if (cat) addRecentFilter(cat.name)
  }
}

const selectSubCat = (sub: string) => {
  activeSubCat.value = activeSubCat.value === sub ? 'all' : sub
  if (activeSubCat.value !== 'all') addRecentFilter(sub)
}

// 点击最近筛选
const clickRecentFilter = (f: string) => {
  // 检测类型并应用
  if (['免费', '热门', '新品', 'AI工具', '隐私五星'].includes(f)) {
    toggleQuickFilter(f)
  } else if (categories.find(c => c.name === f)) {
    const cat = categories.find(c => c.name === f)!
    selectCategory(cat.id)
  } else if (subCategories.includes(f)) {
    selectSubCat(f)
  } else {
    // 当作搜索词
    searchQuery.value = f
  }
}

// 本地搜索提交
const submitLocalSearch = () => {
  if (searchQuery.value.trim()) {
    addSearchHistory(searchQuery.value.trim())
    addRecentFilter(searchQuery.value.trim())
  }
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

// 排序选项
const sortOptions = [
  { key: 'default', name: '默认榜单' },
  { key: 'rating', name: '评分优先' },
  { key: 'heat', name: '热度优先' },
  { key: 'new', name: '最新发布' },
  { key: 'free', name: '免费优先' }
]

// 每页大小选项
const pageSizes = [6, 12, 24]

// 分页按钮列表
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cur > 3) pages.push('...')
    const start = Math.max(2, cur - 1)
    const end = Math.min(total - 1, cur + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cur < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// 过滤结果统计
const resultStats = computed(() => ({
  total: filteredTools.value.length,
  start: filteredTools.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
  end: Math.min(currentPage.value * pageSize.value, filteredTools.value.length)
}))
</script>

<template>
  <div class="ws-page">
    <div class="ws-container">
      <!-- 页头 -->
      <div class="ws-page-head ws-anim-fade-up">
        <span class="ws-section-eyebrow">RANKINGS</span>
        <h1 class="ws-page-title">分类详情 <span class="text-gradient">实时榜单</span></h1>
        <p class="ws-page-sub">三大实时榜单 · 批量操作 · 二级分类筛选 —— 发现全网优质网页工具</p>
      </div>

      <!-- 三大榜单切换 -->
      <div class="ws-rank-tabs ws-anim-fade-up ws-delay-1">
        <button
          v-for="tab in rankingTabs"
          :key="tab.key"
          class="ws-rank-tab"
          :class="{ active: rankingType === tab.key }"
          @click="rankingType = tab.key as any"
        >
          <WsIcon :name="tab.icon" :size="18" />
          <div>
            <div class="ws-rank-name">{{ tab.name }}</div>
            <div class="ws-rank-desc">{{ tab.desc }}</div>
          </div>
        </button>
      </div>

      <!-- 时间范围 + 搜索 + 最近筛选 -->
      <div class="ws-range-bar ws-anim-fade-up ws-delay-2">
        <div class="ws-range-left">
          <span class="ws-range-label">时间范围</span>
          <button
            v-for="r in [{k:'day',n:'日'},{k:'week',n:'周'},{k:'month',n:'月'}]"
            :key="r.k"
            class="ws-range-btn"
            :class="{ active: rangeType === r.k }"
            @click="rangeType = r.k as any"
          >{{ r.n }}</button>
        </div>
        <div class="ws-range-center">
          <div class="ws-mini-search">
            <WsIcon name="search" :size="14" color="var(--color-text-muted)" />
            <input v-model="searchQuery" class="ws-mini-input" placeholder="在结果中搜索…" @keydown.enter="submitLocalSearch" />
            <button v-if="searchQuery" class="ws-mini-clear" @click="clearSearch">×</button>
          </div>
        </div>
        <div class="ws-range-right">
          <span class="ws-recent-label">最近筛选</span>
          <button
            v-for="f in recentFilters"
            :key="f"
            class="ws-recent-chip"
            :class="{ active: activeQuickFilters.includes(f) || searchQuery === f }"
            @click="clickRecentFilter(f)"
          >{{ f }}</button>
          <button class="ws-clear-btn" @click="clearRecentFilters"><WsIcon name="trash" :size="12" /> 清除</button>
        </div>
      </div>

      <!-- Top 3 颁奖台 -->
      <div v-if="top3.length" class="ws-podium ws-anim-fade-up ws-delay-3">
        <div
          v-for="(tool, i) in top3"
          :key="tool.id"
          class="ws-podium-item"
          :class="[`rank-${i + 1}`]"
          @click="goTool(tool.id)"
        >
          <div class="ws-podium-rank">{{ i + 1 }}</div>
          <div class="ws-podium-medal">{{ ['🥇', '🥈', '🥉'][i] }}</div>
          <div class="ws-podium-icon">{{ tool.icon }}</div>
          <h3 class="ws-podium-name">{{ tool.name }}</h3>
          <p class="ws-podium-slogan">{{ tool.slogan }}</p>
          <div class="ws-podium-meta">
            <span><WsIcon name="trending-up" :size="12" color="var(--color-accent-lime)" /> {{ tool.heat24h.toLocaleString() }}</span>
            <span><WsIcon name="star" :size="12" color="var(--color-accent-amber)" /> {{ tool.rating }}</span>
          </div>
        </div>
      </div>

      <!-- 分类筛选 + 排序 + 批量操作栏 -->
      <div class="ws-filter-bar">
        <div class="ws-cat-filter">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="ws-cat-btn"
            :class="{ active: activeCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <span>{{ cat.icon }}</span>{{ cat.name }}
          </button>
        </div>
        <div class="ws-batch-controls">
          <select v-model="sortType" class="ws-sort-select">
            <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">{{ opt.name }}</option>
          </select>
          <button class="ws-view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><WsIcon name="grid" :size="14" /></button>
          <button class="ws-view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><WsIcon name="list" :size="14" /></button>
          <button class="ws-batch-btn" :class="{ active: batchMode }" @click="batchMode = !batchMode; selectedIds = []">
            <WsIcon name="check-circle" :size="14" /> {{ batchMode ? '退出批量' : '批量操作' }}
          </button>
        </div>
      </div>

      <!-- 二级分类折叠 -->
      <div class="ws-subcat-bar">
        <span class="ws-subcat-label">二级分类</span>
        <button
          class="ws-subcat-chip"
          :class="{ active: activeSubCat === 'all' }"
          @click="activeSubCat = 'all'"
        >全部</button>
        <button
          v-for="sub in showAllSubCats ? subCategories : subCategories.slice(0, 4)"
          :key="sub"
          class="ws-subcat-chip"
          :class="{ active: activeSubCat === sub }"
          @click="selectSubCat(sub)"
        >{{ sub }}</button>
        <button class="ws-subcat-more" @click="showAllSubCats = !showAllSubCats">
          {{ showAllSubCats ? '收起' : `+${subCategories.length - 4} 展开` }}
        </button>
      </div>

      <!-- 快捷筛选 chips -->
      <div class="ws-quick-filters">
        <button
          v-for="f in ['免费', '热门', '新品', 'AI工具', '隐私五星']"
          :key="f"
          class="ws-quick-chip"
          :class="{ active: activeQuickFilters.includes(f) }"
          @click="toggleQuickFilter(f)"
        >{{ f }}</button>
        <span class="ws-filter-count" v-if="activeQuickFilters.length">已应用 {{ activeQuickFilters.length }} 个快捷筛选</span>
      </div>

      <!-- 批量模式下的操作栏 -->
      <Transition name="ws-slide-down">
        <div v-if="batchMode" class="ws-batch-toolbar">
          <button class="ws-batch-tool-btn" @click="selectAll"><WsIcon name="check-circle" :size="13" /> 全选</button>
          <button class="ws-batch-tool-btn" @click="invertSelection"><WsIcon name="refresh" :size="13" /> 反选</button>
          <button class="ws-batch-tool-btn" @click="selectedIds = []"><WsIcon name="x" :size="13" /> 清空</button>
          <span class="ws-batch-tool-info">已选 <strong>{{ selectedIds.length }}</strong> / {{ filteredTools.length }} 个</span>
        </div>
      </Transition>

      <!-- 批量浮动栏 -->
      <Transition name="ws-slide-up">
        <div v-if="batchMode && selectedIds.length" class="ws-batch-float">
          <span class="ws-batch-count">已选 <strong>{{ selectedIds.length }}</strong> 个</span>
          <button class="ws-batch-action" @click="batchFavorite"><WsIcon name="heart" :size="14" /> 批量收藏</button>
          <button class="ws-batch-action" @click="batchComparePdf"><WsIcon name="file" :size="14" /> 对比PDF</button>
          <button class="ws-batch-action" @click="batchOpen"><WsIcon name="grid" :size="14" /> 批量打开</button>
          <button class="ws-batch-action" @click="exportCsv"><WsIcon name="download" :size="14" /> 导出CSV</button>
          <button class="ws-batch-clear" @click="selectedIds = []">取消</button>
        </div>
      </Transition>

      <!-- 批量反馈消息 -->
      <Transition name="ws-slide-down">
        <div v-if="batchMsg" class="ws-batch-toast"><WsIcon name="check-circle" :size="14" color="var(--color-accent-lime)" /> {{ batchMsg }}</div>
      </Transition>

      <!-- 工具列表 -->
      <div v-if="pagedTools.length" class="ws-rank-list" :class="{ 'ws-grid-view': viewMode === 'grid' }">
        <template v-if="viewMode === 'grid'">
          <WsToolCard
            v-for="tool in pagedTools"
            :key="tool.id"
            :tool="tool"
            :selectable="batchMode"
            :selected="selectedIds.includes(tool.id)"
            @click="(id: string) => batchMode ? toggleSelect(id) : goTool(id)"
            @select="toggleSelect"
          />
        </template>
        <template v-else>
          <div
            v-for="(tool, i) in pagedTools"
            :key="tool.id"
            class="ws-rank-row"
            :class="{ selected: batchMode && selectedIds.includes(tool.id) }"
            @click="batchMode ? toggleSelect(tool.id) : goTool(tool.id)"
          >
            <div class="ws-rank-num font-mono">{{ (currentPage - 1) * pageSize + i + 1 }}</div>
            <label v-if="batchMode" class="ws-rank-check" @click.stop="toggleSelect(tool.id)">
              <input type="checkbox" :checked="selectedIds.includes(tool.id)" />
              <span></span>
            </label>
            <div class="ws-rank-icon">{{ tool.icon }}</div>
            <div class="ws-rank-info">
              <h3>{{ tool.name }} <span class="ws-rank-ver font-mono">{{ tool.version }}</span></h3>
              <p>{{ tool.slogan }}</p>
              <div class="ws-rank-tags">
                <span v-for="tag in tool.tags.slice(0,3)" :key="tag" class="ws-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="ws-rank-stats">
              <div class="ws-stat-item">
                <WsIcon name="trending-up" :size="13" color="var(--color-accent-lime)" />
                <span class="font-mono">{{ tool.heat24h.toLocaleString() }}</span>
              </div>
              <div class="ws-stat-item">
                <WsIcon name="star" :size="13" color="var(--color-accent-amber)" />
                <span>{{ tool.rating }}</span>
              </div>
              <div class="ws-stat-item">
                <WsIcon name="users" :size="13" color="var(--color-accent-cyan)" />
                <span class="font-mono">{{ tool.onlineUsers }}</span>
              </div>
            </div>
            <button class="ws-rank-action" @click.stop="goTool(tool.id)"><WsIcon name="arrow-right" :size="16" /></button>
          </div>
        </template>
      </div>

      <!-- 空状态 -->
      <div v-else class="ws-empty-state">
        <div class="ws-empty-icon">◉</div>
        <h3>没有找到匹配的工具</h3>
        <p>试试更换筛选条件或清空搜索词</p>
        <button class="ws-btn ws-btn-primary" @click="searchQuery = ''; activeQuickFilters = []; activeCategory = 'all'; activeSubCat = 'all'">
          <WsIcon name="refresh" :size="13" /> 重置筛选
        </button>
      </div>

      <!-- 分页 -->
      <div v-if="filteredTools.length > pageSize" class="ws-pagination">
        <div class="ws-page-info">
          显示 <strong>{{ resultStats.start }}</strong>-<strong>{{ resultStats.end }}</strong> / 共 <strong>{{ resultStats.total }}</strong> 个工具
          <span class="ws-page-size">
            每页
            <select v-model="pageSize" class="ws-size-select" @change="currentPage = 1">
              <option v-for="n in pageSizes" :key="n" :value="n">{{ n }}</option>
            </select>
          </span>
        </div>
        <div class="ws-page-buttons">
          <button class="ws-page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <WsIcon name="arrow-left" :size="12" />
          </button>
          <template v-for="(p, idx) in pageNumbers" :key="idx">
            <span v-if="p === '...'" class="ws-page-ellipsis">…</span>
            <button v-else class="ws-page-btn" :class="{ active: p === currentPage }" @click="goToPage(p as number)">{{ p }}</button>
          </template>
          <button class="ws-page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            <WsIcon name="arrow-right" :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ws-page { padding: 48px 0 80px; position: relative; z-index: 2; }

.ws-page-head { margin-bottom: 36px; }
.ws-page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(36px, 5vw, 56px);
  margin: 12px 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.ws-page-sub { font-size: 15px; color: var(--color-text-secondary); margin: 0; max-width: 600px; }

/* 榜单Tab */
.ws-rank-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.ws-rank-tab {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
  color: var(--color-text-secondary);
}

.ws-rank-tab:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}

.ws-rank-tab.active {
  background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(198,255,61,0.05));
  border-color: var(--color-accent-cyan);
  color: var(--color-text);
  box-shadow: var(--shadow-glow-cyan);
}

.ws-rank-name { font-family: var(--font-display); font-weight: 600; font-size: 16px; }
.ws-rank-desc { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; font-family: var(--font-mono); }

/* 时间范围 */
.ws-range-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.ws-range-left, .ws-range-right, .ws-range-center { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ws-range-label, .ws-recent-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }

.ws-range-btn {
  padding: 5px 14px;
  font-size: 13px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ws-range-btn.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }

/* mini 搜索 */
.ws-mini-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  min-width: 240px;
}
.ws-mini-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 13px;
  font-family: inherit;
}
.ws-mini-input::placeholder { color: var(--color-text-muted); }
.ws-mini-clear {
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; border: none;
  background: rgba(255,255,255,0.08); color: var(--color-text-muted);
  cursor: pointer; font-size: 14px; line-height: 1;
}

.ws-recent-chip {
  font-size: 11px; padding: 4px 10px;
  background: rgba(198,255,61,0.08);
  border: 1px solid rgba(198,255,61,0.2);
  border-radius: var(--radius-pill);
  color: var(--color-accent-lime);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ws-recent-chip:hover { background: rgba(198,255,61,0.18); transform: translateY(-1px); }
.ws-recent-chip.active { background: var(--color-accent-lime); color: var(--color-base); border-color: var(--color-accent-lime); }

.ws-clear-btn {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--color-text-muted);
  background: none; border: none; cursor: pointer;
  padding: 4px 8px;
}
.ws-clear-btn:hover { color: var(--color-accent-coral); }

/* 颁奖台 */
.ws-podium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 36px;
}

.ws-podium-item {
  position: relative;
  padding: 28px 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
}

.ws-podium-item:hover { transform: translateY(-6px); box-shadow: var(--shadow-card-hover); }

.ws-podium-item.rank-1 { border-color: rgba(255, 184, 77, 0.4); }
.ws-podium-item.rank-1::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(255,184,77,0.15), transparent 70%); }
.ws-podium-item.rank-2 { border-color: rgba(139, 146, 176, 0.3); }
.ws-podium-item.rank-3 { border-color: rgba(255, 107, 107, 0.25); }

.ws-podium-rank {
  position: absolute; top: 14px; left: 18px;
  font-family: var(--font-display); font-weight: 900; font-size: 48px;
  color: rgba(255,255,255,0.06); line-height: 1;
}

.ws-podium-medal { font-size: 32px; margin-bottom: 8px; }
.ws-podium-icon { font-size: 40px; color: var(--color-accent-cyan); margin-bottom: 12px; }
.ws-podium-name { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin: 0 0 6px; }
.ws-podium-slogan { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 14px; }
.ws-podium-meta { display: flex; justify-content: center; gap: 16px; font-size: 12px; }
.ws-podium-meta span { display: inline-flex; align-items: center; gap: 4px; }

/* 筛选栏 */
.ws-filter-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; gap: 16px; flex-wrap: wrap;
}

.ws-cat-filter { display: flex; gap: 8px; flex-wrap: wrap; }
.ws-cat-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; font-size: 13px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition-fast);
}
.ws-cat-btn:hover { color: var(--color-text); }
.ws-cat-btn.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }

.ws-batch-controls { display: flex; gap: 8px; align-items: center; }

.ws-sort-select {
  padding: 7px 12px; font-size: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer; outline: none;
  font-family: inherit;
}
.ws-sort-select:hover { border-color: var(--color-border-strong); }
.ws-sort-select option { background: var(--color-base); color: var(--color-text); }

.ws-view-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted); cursor: pointer;
}
.ws-view-btn.active { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); background: var(--color-accent-cyan-soft); }

.ws-batch-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; font-size: 13px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary); cursor: pointer;
}
.ws-batch-btn.active { background: var(--color-accent-lime-soft); color: var(--color-accent-lime); border-color: rgba(198,255,61,0.3); }

/* 二级分类 */
.ws-subcat-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 16px; padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}
.ws-subcat-label { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.ws-subcat-chip {
  font-size: 12px; padding: 4px 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition-fast);
}
.ws-subcat-chip:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); }
.ws-subcat-chip.active { background: var(--color-accent-cyan-soft); color: var(--color-accent-cyan); border-color: var(--color-accent-cyan); }
.ws-subcat-more { font-size: 12px; color: var(--color-accent-cyan); background: none; border: none; cursor: pointer; }

/* 快捷筛选 */
.ws-quick-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 20px;
}
.ws-quick-chip {
  font-size: 11px; padding: 5px 12px;
  background: rgba(0,229,255,0.06);
  border: 1px solid rgba(0,229,255,0.2);
  border-radius: var(--radius-pill);
  color: var(--color-accent-cyan);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-mono);
}
.ws-quick-chip:hover { background: rgba(0,229,255,0.15); }
.ws-quick-chip.active { background: var(--color-accent-cyan); color: var(--color-base); border-color: var(--color-accent-cyan); }
.ws-filter-count { font-size: 11px; color: var(--color-text-muted); margin-left: 8px; }

/* 批量工具栏 */
.ws-batch-toolbar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: rgba(198,255,61,0.06);
  border: 1px dashed rgba(198,255,61,0.3);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}
.ws-batch-tool-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px; font-size: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary); cursor: pointer;
}
.ws-batch-tool-btn:hover { color: var(--color-accent-lime); border-color: rgba(198,255,61,0.3); }
.ws-batch-tool-info { font-size: 12px; color: var(--color-text-muted); margin-left: auto; }
.ws-batch-tool-info strong { color: var(--color-accent-lime); font-family: var(--font-mono); }

/* 批量浮动栏 */
.ws-batch-float {
  position: sticky; bottom: 20px;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  background: rgba(19, 24, 56, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-accent-cyan-soft);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card-hover), var(--shadow-glow-cyan);
  margin: 20px auto;
  max-width: fit-content;
  z-index: 10;
}

.ws-batch-count { font-size: 13px; color: var(--color-text-secondary); }
.ws-batch-count strong { color: var(--color-accent-cyan); font-family: var(--font-mono); }

.ws-batch-action {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; font-size: 12px;
  background: rgba(0,229,255,0.1);
  border: 1px solid rgba(0,229,255,0.2);
  border-radius: var(--radius-pill);
  color: var(--color-accent-cyan); cursor: pointer;
}
.ws-batch-action:hover { background: var(--color-accent-cyan-soft); }

.ws-batch-clear { font-size: 12px; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 7px; }

/* 批量反馈 toast */
.ws-batch-toast {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  background: rgba(19, 24, 56, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-accent-lime-soft);
  border-radius: var(--radius-pill);
  color: var(--color-text);
  font-size: 13px;
  z-index: 100;
  box-shadow: var(--shadow-card-hover);
}

/* 网格视图 */
.ws-rank-list.ws-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

/* 排名列表 */
.ws-rank-list { display: flex; flex-direction: column; gap: 10px; }

.ws-rank-row {
  display: grid;
  grid-template-columns: 48px 50px 1fr auto 40px;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ws-rank-row:hover {
  border-color: var(--color-accent-cyan-soft);
  transform: translateX(4px);
  background: linear-gradient(180deg, rgba(0,229,255,0.04), rgba(255,255,255,0.01));
}
.ws-rank-row.selected {
  border-color: var(--color-accent-lime);
  background: linear-gradient(180deg, rgba(198,255,61,0.06), rgba(255,255,255,0.01));
}

.ws-rank-num {
  font-family: var(--font-display); font-weight: 700; font-size: 24px;
  color: var(--color-text-muted); text-align: center;
}

.ws-rank-check input { display: none; }
.ws-rank-check span {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  border: 2px solid var(--color-border-strong);
  border-radius: 6px; transition: all var(--transition-fast);
}
.ws-rank-check input:checked + span {
  background: var(--color-accent-cyan); border-color: var(--color-accent-cyan);
}
.ws-rank-check input:checked + span::after { content: '✓'; color: var(--color-base); font-weight: 700; font-size: 14px; }

.ws-rank-icon {
  display: flex; align-items: center; justify-content: center;
  width: 50px; height: 50px;
  background: var(--color-surface-light);
  border-radius: var(--radius-sm);
  font-size: 24px; color: var(--color-accent-cyan);
}

.ws-rank-info h3 {
  font-family: var(--font-display); font-weight: 600; font-size: 17px;
  margin: 0 0 4px; color: var(--color-text);
  display: flex; align-items: center; gap: 8px;
}
.ws-rank-ver { font-size: 10px; padding: 2px 6px; background: rgba(255,255,255,0.05); border-radius: 4px; color: var(--color-text-muted); }
.ws-rank-info p { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 6px; }
.ws-rank-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.ws-tag { font-size: 10px; padding: 2px 7px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-xs); color: var(--color-text-muted); }

.ws-rank-stats { display: flex; gap: 16px; }
.ws-stat-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }

.ws-rank-action {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: 50%; color: var(--color-text-muted); cursor: pointer;
  transition: all var(--transition-fast);
}
.ws-rank-action:hover { color: var(--color-accent-cyan); border-color: var(--color-accent-cyan-soft); background: var(--color-accent-cyan-soft); }

/* 空状态 */
.ws-empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}
.ws-empty-icon { font-size: 48px; color: var(--color-text-muted); margin-bottom: 12px; }
.ws-empty-state h3 { font-family: var(--font-display); font-weight: 600; font-size: 18px; margin: 0 0 8px; }
.ws-empty-state p { color: var(--color-text-secondary); margin: 0 0 16px; font-size: 13px; }

/* 分页 */
.ws-pagination {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 32px; padding-top: 24px;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap; gap: 12px;
}
.ws-page-info { font-size: 12px; color: var(--color-text-secondary); font-family: var(--font-mono); }
.ws-page-info strong { color: var(--color-accent-cyan); }
.ws-page-size { margin-left: 12px; }
.ws-size-select {
  padding: 3px 8px; font-size: 11px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  color: var(--color-text);
  cursor: pointer; outline: none;
  font-family: inherit;
}
.ws-size-select option { background: var(--color-base); }

.ws-page-buttons { display: flex; align-items: center; gap: 6px; }
.ws-page-btn {
  min-width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 8px; font-size: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer; font-family: var(--font-mono);
  transition: all var(--transition-fast);
}
.ws-page-btn:hover:not(:disabled) {
  border-color: var(--color-accent-cyan-soft);
  color: var(--color-accent-cyan);
}
.ws-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ws-page-btn.active {
  background: var(--color-accent-cyan);
  color: var(--color-base);
  border-color: var(--color-accent-cyan);
  font-weight: 700;
}
.ws-page-ellipsis { padding: 0 4px; color: var(--color-text-muted); font-family: var(--font-mono); }

/* 过渡 */
.ws-slide-up-enter-active, .ws-slide-up-leave-active { transition: all 0.3s var(--ease-out); }
.ws-slide-up-enter-from, .ws-slide-up-leave-to { opacity: 0; transform: translateY(20px); }

.ws-slide-down-enter-active, .ws-slide-down-leave-active { transition: all 0.3s var(--ease-out); }
.ws-slide-down-enter-from, .ws-slide-down-leave-to { opacity: 0; transform: translateY(-12px); }

@media (max-width: 1024px) {
  .ws-rank-tabs { grid-template-columns: 1fr; }
  .ws-podium { grid-template-columns: 1fr; }
  .ws-rank-row { grid-template-columns: 36px 40px 1fr; }
  .ws-rank-stats, .ws-rank-action { display: none; }
  .ws-range-bar { flex-direction: column; align-items: stretch; }
  .ws-mini-search { min-width: auto; }
}
</style>

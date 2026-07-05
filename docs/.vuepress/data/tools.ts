// WebStore V3.0 Mock 数据 - 工具数据
export interface Tool {
  id: string
  name: string
  slogan: string
  description: string
  icon: string
  cover: string
  category: string
  subCategory: string
  tags: string[]
  developerId: string
  developerName: string
  developerAvatar: string
  version: string
  releaseDate: string
  updateTime: string
  rating: number
  ratingCount: number
  heat24h: number
  heat30d: number
  isFree: boolean
  isHot: boolean
  isNew: boolean
  privacyScore: number
  onlineUsers: number
  alternatives: string[]
  dependencies: string[]
  wordCloud: { word: string; weight: number }[]
  versionHistory: { version: string; date: string; changes: string[] }[]
  availability: { date: string; uptime: number; loadTime: number }[]
}

const today = new Date()
const dayOffset = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const tools: Tool[] = [
  {
    id: 't1',
    name: 'PixelForge',
    slogan: 'AI驱动的像素艺术创作工坊',
    description: '面向独立游戏开发者与数字艺术家的像素画创作工具，内置AI辅助生成、骨骼动画、调色板管理与多分辨率导出。',
    icon: '◈',
    cover: 'gradient-1',
    category: '设计创作',
    subCategory: '图像编辑',
    tags: ['AI作图', '像素画', '游戏开发', '免费'],
    developerId: 'd1',
    developerName: 'NovaStudio',
    developerAvatar: '◆',
    version: 'v3.2.1',
    releaseDate: '2024-03-15',
    updateTime: dayOffset(2),
    rating: 4.8,
    ratingCount: 1284,
    heat24h: 8920,
    heat30d: 187600,
    isFree: true,
    isHot: true,
    isNew: false,
    privacyScore: 5,
    onlineUsers: 342,
    alternatives: ['Aseprite', 'Piskel', 'Lospec'],
    dependencies: ['现代浏览器', 'WebGL 2.0'],
    wordCloud: [
      { word: '易上手', weight: 92 },
      { word: 'AI强大', weight: 88 },
      { word: '免费良心', weight: 85 },
      { word: '导出方便', weight: 78 },
      { word: '动画流畅', weight: 72 },
      { word: '调色板丰富', weight: 68 },
      { word: '社区活跃', weight: 61 },
      { word: '更新勤快', weight: 55 }
    ],
    versionHistory: [
      { version: 'v3.2.1', date: dayOffset(2), changes: ['新增AI风格迁移模型', '优化大尺寸画布性能', '修复图层合并BUG'] },
      { version: 'v3.2.0', date: dayOffset(18), changes: ['骨骼动画系统上线', '支持GIF逐帧编辑', '新增6种调色板预设'] },
      { version: 'v3.1.0', date: dayOffset(45), changes: ['AI辅助生成开放公测', '多分辨率一键导出', '快捷键全面自定义'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.5 + Math.random() * 0.5,
      loadTime: 800 + Math.random() * 400
    }))
  },
  {
    id: 't2',
    name: 'CodeMorph',
    slogan: '代码一键转换多语言',
    description: '支持200+编程语言互转的智能代码转换工具，基于AST分析与LLM理解，保留代码语义与风格。',
    icon: '⌘',
    cover: 'gradient-2',
    category: '开发工具',
    subCategory: '代码转换',
    tags: ['AI编程', '代码转换', '开发者', '新上线'],
    developerId: 'd2',
    developerName: 'CipherLabs',
    developerAvatar: '◉',
    version: 'v1.0.5',
    releaseDate: dayOffset(20),
    updateTime: dayOffset(1),
    rating: 4.6,
    ratingCount: 423,
    heat24h: 5640,
    heat30d: 89200,
    isFree: false,
    isHot: false,
    isNew: true,
    privacyScore: 4,
    onlineUsers: 128,
    alternatives: ['Transcrypt', 'Jiphy'],
    dependencies: ['现代浏览器'],
    wordCloud: [
      { word: '转换准确', weight: 86 },
      { word: '语言丰富', weight: 80 },
      { word: '速度很快', weight: 75 },
      { word: '付费略贵', weight: 62 },
      { word: '界面清爽', weight: 58 }
    ],
    versionHistory: [
      { version: 'v1.0.5', date: dayOffset(1), changes: ['新增Rust转Zig', '优化Python转Go准确率'] },
      { version: 'v1.0.0', date: dayOffset(20), changes: ['正式版发布', '支持200+语言互转'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99 + Math.random() * 1,
      loadTime: 600 + Math.random() * 300
    }))
  },
  {
    id: 't3',
    name: 'DataPulse',
    slogan: '实时数据可视化看板',
    description: '拖拽式数据可视化工具，连接数据库/API/Excel，30秒搭建专业数据看板，支持实时刷新与告警。',
    icon: '▣',
    cover: 'gradient-3',
    category: '数据工具',
    subCategory: '可视化',
    tags: ['数据可视化', '看板', 'BI', '热门'],
    developerId: 'd3',
    developerName: 'QuantumVue',
    developerAvatar: '◢',
    version: 'v2.8.0',
    releaseDate: '2023-11-08',
    updateTime: dayOffset(5),
    rating: 4.9,
    ratingCount: 2156,
    heat24h: 12400,
    heat30d: 312000,
    isFree: false,
    isHot: true,
    isNew: false,
    privacyScore: 4,
    onlineUsers: 568,
    alternatives: ['Metabase', 'Redash', 'Grafana'],
    dependencies: ['现代浏览器', 'ES2020'],
    wordCloud: [
      { word: '拖拽好用', weight: 95 },
      { word: '颜值在线', weight: 90 },
      { word: '数据源多', weight: 84 },
      { word: '实时刷新', weight: 79 },
      { word: '告警及时', weight: 71 },
      { word: '模板丰富', weight: 65 },
      { word: '价格合理', weight: 58 }
    ],
    versionHistory: [
      { version: 'v2.8.0', date: dayOffset(5), changes: ['新增GIS地图组件', '告警支持企微钉钉', '性能提升40%'] },
      { version: 'v2.7.0', date: dayOffset(40), changes: ['AI智能图表推荐', '协作编辑上线'] },
      { version: 'v2.6.0', date: dayOffset(75), changes: ['支持ClickHouse', '新增桑基图'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.8 + Math.random() * 0.2,
      loadTime: 500 + Math.random() * 300
    }))
  },
  {
    id: 't4',
    name: 'VoiceCraft',
    slogan: 'AI语音克隆与合成',
    description: '3秒语音克隆，支持40+语种合成，情感表达细腻，适用于有声书、播客、视频配音场景。',
    icon: '◐',
    cover: 'gradient-4',
    category: 'AI工具',
    subCategory: '语音生成',
    tags: ['AI语音', '语音克隆', '配音', '热门'],
    developerId: 'd4',
    developerName: 'EchoAI',
    developerAvatar: '◈',
    version: 'v4.1.0',
    releaseDate: '2024-01-20',
    updateTime: dayOffset(3),
    rating: 4.7,
    ratingCount: 3420,
    heat24h: 15800,
    heat30d: 425000,
    isFree: false,
    isHot: true,
    isNew: false,
    privacyScore: 3,
    onlineUsers: 890,
    alternatives: ['ElevenLabs', 'Resemble'],
    dependencies: ['现代浏览器', '麦克风(可选)'],
    wordCloud: [
      { word: '克隆逼真', weight: 93 },
      { word: '情感丰富', weight: 87 },
      { word: '语种多', weight: 82 },
      { word: '商用授权清晰', weight: 76 },
      { word: 'API稳定', weight: 70 },
      { word: '价格偏贵', weight: 64 }
    ],
    versionHistory: [
      { version: 'v4.1.0', date: dayOffset(3), changes: ['新增情感控制标签', '方言识别准确率提升'] },
      { version: 'v4.0.0', date: dayOffset(35), changes: ['40+语种支持', '实时流式合成'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.3 + Math.random() * 0.7,
      loadTime: 900 + Math.random() * 500
    }))
  },
  {
    id: 't5',
    name: 'MarkdownFlow',
    slogan: '所见即所得Markdown编辑器',
    description: '块级拖拽、实时预览、脑图大纲、协作评论，为长文写作而生的Markdown编辑器。',
    icon: '◈',
    cover: 'gradient-5',
    category: '效率工具',
    subCategory: '写作编辑',
    tags: ['Markdown', '写作', '免费', '新上线'],
    developerId: 'd5',
    developerName: 'InkWell',
    developerAvatar: '✦',
    version: 'v0.9.2',
    releaseDate: dayOffset(15),
    updateTime: dayOffset(1),
    rating: 4.5,
    ratingCount: 287,
    heat24h: 3200,
    heat30d: 56800,
    isFree: true,
    isHot: false,
    isNew: true,
    privacyScore: 5,
    onlineUsers: 76,
    alternatives: ['Typora', 'Obsidian'],
    dependencies: ['现代浏览器'],
    wordCloud: [
      { word: '颜值高', weight: 88 },
      { word: '块拖拽好用', weight: 82 },
      { word: '协作流畅', weight: 75 },
      { word: '免费', weight: 80 },
      { word: '功能尚少', weight: 60 }
    ],
    versionHistory: [
      { version: 'v0.9.2', date: dayOffset(1), changes: ['新增脑图大纲', '修复协作冲突'] },
      { version: 'v0.9.0', date: dayOffset(15), changes: ['公测上线', '块级编辑器'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.9 + Math.random() * 0.1,
      loadTime: 400 + Math.random() * 200
    }))
  },
  {
    id: 't6',
    name: 'AutoMLKit',
    slogan: '零代码训练机器学习模型',
    description: '上传数据自动选型训练，支持分类回归聚类时序，一键部署API，模型可解释性报告。',
    icon: '⬡',
    cover: 'gradient-6',
    category: 'AI工具',
    subCategory: '机器学习',
    tags: ['AutoML', '零代码', 'AI', '热门'],
    developerId: 'd3',
    developerName: 'QuantumVue',
    developerAvatar: '◢',
    version: 'v2.3.0',
    releaseDate: '2023-09-12',
    updateTime: dayOffset(7),
    rating: 4.6,
    ratingCount: 892,
    heat24h: 7600,
    heat30d: 198000,
    isFree: false,
    isHot: true,
    isNew: false,
    privacyScore: 4,
    onlineUsers: 215,
    alternatives: ['H2O', 'AutoGluon'],
    dependencies: ['现代浏览器', 'WebGL'],
    wordCloud: [
      { word: '零代码友好', weight: 91 },
      { word: '模型丰富', weight: 84 },
      { word: '部署方便', weight: 78 },
      { word: '可解释性', weight: 73 },
      { word: '价格偏贵', weight: 66 }
    ],
    versionHistory: [
      { version: 'v2.3.0', date: dayOffset(7), changes: ['新增时序预测模型', 'SHAP可解释性报告'] },
      { version: 'v2.2.0', date: dayOffset(50), changes: ['GPU加速训练', '模型版本管理'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.6 + Math.random() * 0.4,
      loadTime: 700 + Math.random() * 400
    }))
  },
  {
    id: 't7',
    name: 'FormZen',
    slogan: '智能表单构建器',
    description: '拖拽生成多步骤表单，支持40+字段、条件逻辑、支付、文件上传，数据一键导出。',
    icon: '▤',
    cover: 'gradient-7',
    category: '效率工具',
    subCategory: '表单',
    tags: ['表单', '免费', '效率'],
    developerId: 'd2',
    developerName: 'CipherLabs',
    developerAvatar: '◉',
    version: 'v1.8.5',
    releaseDate: '2023-12-01',
    updateTime: dayOffset(10),
    rating: 4.4,
    ratingCount: 645,
    heat24h: 4100,
    heat30d: 102000,
    isFree: true,
    isHot: false,
    isNew: false,
    privacyScore: 5,
    onlineUsers: 154,
    alternatives: ['Typeform', '金数据'],
    dependencies: ['现代浏览器'],
    wordCloud: [
      { word: '上手快', weight: 85 },
      { word: '字段丰富', weight: 78 },
      { word: '免费够用', weight: 82 },
      { word: '模板少', weight: 55 }
    ],
    versionHistory: [
      { version: 'v1.8.5', date: dayOffset(10), changes: ['新增支付字段', '条件逻辑优化'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.95 + Math.random() * 0.05,
      loadTime: 350 + Math.random() * 150
    }))
  },
  {
    id: 't8',
    name: 'ScreenBeam',
    slogan: '浏览器录屏与协作标注',
    description: '一键录制浏览器操作，支持标注评论时间轴，团队协作复盘，GIF/视频导出。',
    icon: '◉',
    cover: 'gradient-8',
    category: '效率工具',
    subCategory: '录屏',
    tags: ['录屏', '协作', '新上线'],
    developerId: 'd5',
    developerName: 'InkWell',
    developerAvatar: '✦',
    version: 'v1.2.0',
    releaseDate: dayOffset(8),
    updateTime: dayOffset(2),
    rating: 4.3,
    ratingCount: 156,
    heat24h: 2800,
    heat30d: 42100,
    isFree: false,
    isHot: false,
    isNew: true,
    privacyScore: 4,
    onlineUsers: 62,
    alternatives: ['Loom', 'Recordit'],
    dependencies: ['现代浏览器', '屏幕录制权限'],
    wordCloud: [
      { word: '录屏清晰', weight: 80 },
      { word: '标注好用', weight: 76 },
      { word: '协作方便', weight: 71 },
      { word: '导出格式多', weight: 65 }
    ],
    versionHistory: [
      { version: 'v1.2.0', date: dayOffset(2), changes: ['新增GIF导出', '修复音频同步'] }
    ],
    availability: Array.from({ length: 30 }, (_, i) => ({
      date: dayOffset(29 - i),
      uptime: 99.7 + Math.random() * 0.3,
      loadTime: 600 + Math.random() * 300
    }))
  }
]

export const categories = [
  { id: 'all', name: '全部分类', icon: '⊞', count: tools.length },
  { id: 'design', name: '设计创作', icon: '◈', count: tools.filter(t => t.category === '设计创作').length },
  { id: 'dev', name: '开发工具', icon: '⌘', count: tools.filter(t => t.category === '开发工具').length },
  { id: 'data', name: '数据工具', icon: '▣', count: tools.filter(t => t.category === '数据工具').length },
  { id: 'ai', name: 'AI工具', icon: '✦', count: tools.filter(t => t.category === 'AI工具').length },
  { id: 'efficiency', name: '效率工具', icon: '▤', count: tools.filter(t => t.category === '效率工具').length }
]

export const gradients: Record<string, string> = {
  'gradient-1': 'linear-gradient(135deg, #00E5FF 0%, #6C8EEF 50%, #B794F4 100%)',
  'gradient-2': 'linear-gradient(135deg, #C6FF3D 0%, #00E5FF 100%)',
  'gradient-3': 'linear-gradient(135deg, #FF6B6B 0%, #FFB84D 50%, #C6FF3D 100%)',
  'gradient-4': 'linear-gradient(135deg, #B794F4 0%, #FF6B6B 100%)',
  'gradient-5': 'linear-gradient(135deg, #00E5FF 0%, #C6FF3D 100%)',
  'gradient-6': 'linear-gradient(135deg, #6C8EEF 0%, #B794F4 100%)',
  'gradient-7': 'linear-gradient(135deg, #FFB84D 0%, #FF6B6B 100%)',
  'gradient-8': 'linear-gradient(135deg, #C6FF3D 0%, #6C8EEF 100%)'
}

export function getTool(id: string): Tool | undefined {
  return tools.find(t => t.id === id)
}

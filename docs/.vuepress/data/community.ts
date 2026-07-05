// WebStore V3.0 Mock 数据 - 开发者、用户、社区、激励数据

export interface Developer {
  id: string
  name: string
  avatar: string
  bio: string
  story: string
  tools: string[]
  followers: number
  interactionScore: number
  verified: boolean
  responseRate: number
  avgResponseTime: string
  team: { name: string; role: string; avatar: string }[]
}

export const developers: Developer[] = [
  {
    id: 'd1',
    name: 'NovaStudio',
    avatar: '◆',
    bio: '专注创作工具的独立工作室',
    story: '我们是一支由3名前游戏大厂美术组成的独立工作室，2022年成立。PixelForge源于我们自己做游戏时找不到趁手像素工具的痛点，现已服务全球18万创作者。',
    tools: ['t1'],
    followers: 28400,
    interactionScore: 92,
    verified: true,
    responseRate: 98,
    avgResponseTime: '2小时',
    team: [
      { name: '凌川', role: '主程序/主创', avatar: '◆' },
      { name: '青木', role: '美术/设计', avatar: '◈' },
      { name: '砚白', role: '运营/社区', avatar: '◇' }
    ]
  },
  {
    id: 'd2',
    name: 'CipherLabs',
    avatar: '◉',
    bio: '让编程更简单的工具集',
    story: '来自清华的极客团队，痴迷于用AI降低编程门槛。CodeMorph是我们打磨2年的作品，希望让代码跨越语言边界。',
    tools: ['t2', 't7'],
    followers: 12600,
    interactionScore: 85,
    verified: true,
    responseRate: 95,
    avgResponseTime: '5小时',
    team: [
      { name: 'Kael', role: 'CEO', avatar: '◉' },
      { name: 'Lin', role: 'CTO', avatar: '◎' }
    ]
  },
  {
    id: 'd3',
    name: 'QuantumVue',
    avatar: '◢',
    bio: '让数据会说话',
    story: '前阿里数据可视化团队创业项目，DataPulse与AutoMLKit是我们的双产品线，已服务600+企业客户。',
    tools: ['t3', 't6'],
    followers: 45200,
    interactionScore: 88,
    verified: true,
    responseRate: 92,
    avgResponseTime: '8小时',
    team: [
      { name: '云澈', role: '创始人', avatar: '◢' },
      { name: '星河', role: '技术负责人', avatar: '◣' },
      { name: '时砚', role: '产品负责人', avatar: '◤' }
    ]
  },
  {
    id: 'd4',
    name: 'EchoAI',
    avatar: '◈',
    bio: '语音AI技术探索者',
    story: '专注于语音克隆与合成，自有训练框架，国内首批商用语音克隆服务商。',
    tools: ['t4'],
    followers: 31800,
    interactionScore: 76,
    verified: true,
    responseRate: 85,
    avgResponseTime: '12小时',
    team: [{ name: '沐风', role: 'CEO', avatar: '◈' }]
  },
  {
    id: 'd5',
    name: 'InkWell',
    avatar: '✦',
    bio: '为写作者造工具',
    story: '两人独立工作室，相信好的写作工具应该消失在文字背后。MarkdownFlow与ScreenBeam是我们的首批作品。',
    tools: ['t5', 't8'],
    followers: 8900,
    interactionScore: 90,
    verified: false,
    responseRate: 99,
    avgResponseTime: '1小时',
    team: [
      { name: '砚池', role: '全栈', avatar: '✦' },
      { name: '墨白', role: '设计', avatar: '✧' }
    ]
  }
]

// 当前用户
export const currentUser = {
  id: 'u1',
  name: '林深时见鹿',
  avatar: '✿',
  level: 7,
  exp: 7820,
  expToNext: 10000,
  badges: [
    { id: 'b1', name: '共创先锋', icon: '★', rarity: 'gold', desc: '参与3次共创' },
    { id: 'b2', name: 'BUG猎手', icon: '◈', rarity: 'silver', desc: '提交10个有效BUG' },
    { id: 'b3', name: '测评达人', icon: '◆', rarity: 'gold', desc: '5篇优质测评' },
    { id: 'b4', name: '社群互助', icon: '◇', rarity: 'bronze', desc: '回答20个问题' },
    { id: 'b5', name: '内测老兵', icon: '◉', rarity: 'gold', desc: '参与8次内测' },
    { id: 'b6', name: '纠错专家', icon: '◐', rarity: 'silver', desc: '纠错15次' }
  ],
  points: 4580,
  memberDays: 287,
  joinDate: '2023-04-12',
  isCoCreator: true,
  toolboxes: [
    {
      id: 'tb1',
      name: '日常效率',
      tools: ['t5', 't7', 't8'],
      reminder: true,
      shareCode: 'WS-TB1-X8K2'
    },
    {
      id: 'tb2',
      name: '设计创作',
      tools: ['t1'],
      reminder: false,
      shareCode: 'WS-TB2-P9M3'
    },
    {
      id: 'tb3',
      name: '数据分析',
      tools: ['t3', 't6'],
      reminder: true,
      shareCode: 'WS-TB3-L4N7'
    }
  ],
  following: ['d1', 'd3', 'd5'],
  usageStats: {
    totalUsed: 8,
    totalTime: '428h',
    favoriteCategory: '设计创作',
    weeklyActivity: [12, 8, 15, 22, 18, 25, 20]
  }
}

// 消息
export const messages = [
  { id: 'm1', type: 'developer', from: 'NovaStudio', avatar: '◆', title: 'PixelForge v3.2.1 已发布', desc: '新增AI风格迁移模型，优化大尺寸画布性能', time: '2小时前', read: false, priority: 'high' },
  { id: 'm2', type: 'update', from: '系统', avatar: '⚙', title: 'DataPulse 可用性异常已恢复', desc: '今日10:23-10:31出现短暂宕机，现已恢复', time: '5小时前', read: false, priority: 'medium' },
  { id: 'm3', type: 'interaction', from: 'EchoAI', avatar: '◈', title: '您提交的功能建议已被采纳', desc: '"方言识别增强"已列入下版本规划，感谢您的贡献', time: '昨天', read: true, priority: 'high' },
  { id: 'm4', type: 'system', from: 'WebStore', avatar: '⊞', title: '您已升级至 Lv.7', desc: '解锁内测优先审核权益，距离Lv.8还需2180经验', time: '2天前', read: true, priority: 'low' },
  { id: 'm5', type: 'developer', from: 'InkWell', avatar: '✦', title: '回复了您的私信', desc: '"关于MarkdownFlow的导出格式问题..."', time: '3天前', read: true, priority: 'medium' },
  { id: 'm6', type: 'interaction', from: '共创小组', avatar: '★', title: '本周内测名额已开放', desc: 'AutoMLKit v2.4.0 内测，您有优先参与权', time: '4天前', read: true, priority: 'high' }
]

// 社区话题
export const communityTopics = [
  { id: 'p1', section: '测评', author: '林深时见鹿', avatar: '✿', title: 'DataPulse vs Metabase 深度横评：中小团队该怎么选？', excerpt: '用了3个月两款产品，从数据源、可视化、协作、价格四个维度详细对比...', likes: 1284, comments: 156, time: '3小时前', hot: true, tags: ['数据可视化', '横评'] },
  { id: 'p2', section: '技巧', author: '代码诗人', avatar: '✦', title: 'PixelForge 骨骼动画的5个隐藏技巧', excerpt: '官方文档没写的5个高阶用法，让你的像素角色动起来更丝滑...', likes: 892, comments: 73, time: '8小时前', hot: true, tags: ['PixelForge', '教程'] },
  { id: 'p3', section: '需求', author: '设计师小K', avatar: '◈', title: '希望VoiceCraft支持粤语合成', excerpt: '做粤语内容创作，目前主流AI语音粤語支持都不好，希望EchoAI能考虑...', likes: 456, comments: 89, time: '昨天', hot: false, tags: ['VoiceCraft', '需求'], votes: 342 },
  { id: 'p4', section: '访谈', author: 'WebStore官方', avatar: '★', title: '对话NovaStudio：独立工作室如何做出爆款工具', excerpt: '我们采访了PixelForge背后的3人团队，聊聊独立开发者的生存之道...', likes: 2156, comments: 423, time: '2天前', hot: true, tags: ['访谈', '独立开发'] },
  { id: 'p5', section: '测评', author: '数据矿工', avatar: '◢', title: 'AutoMLKit零代码训练实战：30分钟搭建销售预测模型', excerpt: '从数据上传到API部署全流程记录，适合没有ML基础的同学...', likes: 768, comments: 102, time: '3天前', hot: false, tags: ['AutoML', '实战'] }
]

// 共创需求
export const coCreationRequests = [
  { id: 'cr1', title: 'PixelForge 支持图层混合模式', type: 'short', votes: 842, status: 'planned', developer: 'NovaStudio', deadline: '2024-Q3', scenario: '游戏UI制作需要正片叠底' },
  { id: 'cr2', title: 'CodeMorph 增加代码注释翻译', type: 'short', votes: 567, status: 'voting', developer: 'CipherLabs', deadline: '待定', scenario: '看国外开源项目注释翻译' },
  { id: 'cr3', title: 'DataPulse 实时大屏投屏功能', type: 'short', votes: 1203, status: 'planned', developer: 'QuantumVue', deadline: '2024-Q3', scenario: '团队周会展示数据' },
  { id: 'cr4', title: 'VoiceCraft 多人对话合成', type: 'long', votes: 2340, status: 'planning', developer: 'EchoAI', deadline: '2025-Q1', scenario: '有声书多角色配音' },
  { id: 'cr5', title: '全平台深色模式同步', type: 'long', votes: 1890, status: 'planning', developer: '多开发者', deadline: '2025-Q2', scenario: '夜间使用护眼' }
]

// 赛事
export const contests = [
  { id: 'c1', title: '像素艺术创作大赛 #3', status: 'ongoing', participants: 1284, prize: '¥10,000 + 高级会员', deadline: '15天后', judges: ['NovaStudio', 'InkWell'], desc: '以"未来城市"为主题，使用PixelForge创作像素作品' },
  { id: 'c2', title: '数据可视化故事讲述', status: 'upcoming', participants: 0, prize: '¥5,000 + 工具年卡', deadline: '7天后开始', judges: ['QuantumVue'], desc: '用DataPulse讲述一个真实数据故事' }
]

// 激励规则
export const incentiveRules = {
  user: [
    { action: '提交有效BUG', points: 50, extra: '采纳+200' },
    { action: '提交纠错信息', points: 20, extra: '采纳+100' },
    { action: '提交功能建议', points: 30, extra: '采纳+500+限定徽章' },
    { action: '优质测评投稿', points: 80, extra: '精选+300' },
    { action: '体验打卡', points: 10, extra: '连续7天+100' },
    { action: '社群回答问题', points: 15, extra: '被采纳+50' }
  ],
  developer: [
    { action: '保持高互动活跃度', benefit: '推荐权重提升' },
    { action: '常态化举办共创活动', benefit: '专题页+轮播流量扶持' },
    { action: '常态化举办直播答疑', benefit: '首页曝光优先级' },
    { action: '高口碑+高互动', benefit: '分成下调+专属运营客服' }
  ]
}

// 网页图片资源 - 通过 AI 生成
// 图片 API: https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image

export function img(prompt: string, size: string = 'landscape_4_3'): string {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

// 场景专题配图
export const sceneImages = {
  s1: img('modern developer workspace with multiple screens showing code diagrams and design tools, dark theme neon accents, futuristic tech aesthetic, clean UI interfaces'),
  s2: img('data analyst dashboard with colorful charts and graphs, modern dark UI, data visualization screens, professional analytics, glowing data nodes'),
  s3: img('content creator workspace with AI tools, video editing timeline, microphone, graphic design tablet, creative studio atmosphere with neon lighting')
}

// 社区作品展示封面
export const submissionCovers = {
  s1: img('cyberpunk pixel art cityscape with neon lights, futuristic buildings, retro gaming aesthetic, 8-bit style mixed with modern, purple and cyan color scheme'),
  s2: img('cloud data city visualization, floating data nodes and charts, modern 3D data landscape, blue and gold color scheme, abstract digital architecture'),
  s3: img('neon alley at night, cyberpunk street scene, glowing signs in Chinese, wet pavement reflections, purple and pink lighting, atmospheric urban photography')
}

// Hero 大图
export const heroImages = {
  webstore: img('modern web platform ecosystem visualization, connecting tools apps and developers, futuristic hub design, dark theme with cyan and lime accents, network nodes, clean professional UI design, 3D abstract'),
  community: img('diverse community of developers and users collaborating online, digital forum, modern chat interface, glowing connections, warm and inclusive atmosphere, tech community'),
  cocreate: img('collaborative development team working together, agile workspace, kanban board, code review, pair programming, modern office with plants, creative energy'),
  incentive: img('digital shield and reward system, security badges, glowing achievement trophies, trust and safety concept, modern dark UI, cyber security aesthetic, golden accents')
}

// 开发者访谈
export const interviewImages = {
  iv1: img('independent game studio workspace, pixel art on screens, creative coding environment, modern cozy office, plants, warm lighting, indie dev atmosphere'),
  iv2: img('data scientist at work, multiple dashboards showing analytics, modern office, blue ambient lighting, professional tech environment, large curved monitors')
}
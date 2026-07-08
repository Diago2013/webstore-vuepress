import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
  base: '/webstore-vuepress/',
  lang: 'zh-CN',
  title: 'WebStore',
  description: '网页版 App Store - 聚合全网工具、资源、服务类网页',

  bundler: viteBundler({
    viteOptions: {
      css: {
        preprocessorOptions: {}
      }
    }
  }),

  theme: defaultTheme({
    logo: '/logo.svg',
    navbar: [
      { text: '首页', link: '/' },
      { text: '分类', link: '/category/' },
      { text: '工具详情', link: '/tool/' },
      { text: '个人中心', link: '/profile/' },
      { text: '开发者中心', link: '/developer/' },
      { text: '共创专区', link: '/co-creation/' },
      { text: '社区', link: '/community/' },
      { text: '激励安全', link: '/incentive/' }
    ],
    sidebar: false,
    repo: false,
    contributors: false,
    lastUpdated: false,
    editLink: false,
    toggleColorMode: false,
    themePlugins: {
      search: false,
      git: false
    }
  }),

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap'
    }],
    ['meta', { name: 'theme-color', content: '#0A0E27' }]
  ]
})

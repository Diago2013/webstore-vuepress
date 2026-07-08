import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'

const SITE_URL = 'https://diago2013.github.io/webstore-vuepress/'
const SITE_NAME = 'WebStore'
const SITE_DESC = '网页版 App Store - 聚合全网工具、资源、服务类网页，AI 驱动的工具发现与协作平台'

export default defineUserConfig({
  base: '/webstore-vuepress/',
  lang: 'zh-CN',
  title: SITE_NAME,
  description: SITE_DESC,

  bundler: viteBundler({
    viteOptions: {
      css: {
        preprocessorOptions: {}
      }
    }
  }),

  plugins: [
    // 本地搜索
    searchPlugin({
      maxSuggestions: 10,
      locales: {
        '/': {
          placeholder: '搜索工具、开发者、话题...'
        }
      },
      hotKeys: [{ key: 'k', ctrl: true }],
      isSearchable: () => true
    })
  ],

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
      git: false
    }
  }),

  head: [
    // 字体预加载
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap'
    }],

    // SEO 基础
    ['meta', { name: 'theme-color', content: '#0A0E27' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'keywords', content: 'WebStore,工具商店,AI工具,开发工具,数据可视化,像素艺术,语音合成,机器学习,共创,开发者社区' }],
    ['meta', { name: 'author', content: 'WebStore Team' }],

    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: SITE_URL }],
    ['meta', { property: 'og:title', content: SITE_NAME }],
    ['meta', { property: 'og:description', content: SITE_DESC }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}og-image.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: SITE_NAME }],
    ['meta', { name: 'twitter:description', content: SITE_DESC }],
    ['meta', { name: 'twitter:image', content: `${SITE_URL}og-image.png` }],

    // 结构化数据 JSON-LD
    ['script', {
      type: 'application/ld+json'
    }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESC,
      inLanguage: 'zh-CN',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    })],

    // Canonical
    ['link', { rel: 'canonical', href: SITE_URL }]
  ]
})

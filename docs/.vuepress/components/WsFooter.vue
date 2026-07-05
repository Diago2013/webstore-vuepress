<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const footerNav = [
  {
    title: '探索',
    links: [
      { text: '首页推荐', link: '/' },
      { text: '全部分类', link: '/category/' },
      { text: '热门榜单', link: '/category/?sort=hot' },
      { text: '新锐工具', link: '/category/?filter=new' }
    ]
  },
  {
    title: '创作者',
    links: [
      { text: '开发者中心', link: '/developer/' },
      { text: '提交网页', link: '/developer/' },
      { text: '共创专区', link: '/co-creation/' },
      { text: '开发者访谈', link: '/community/' }
    ]
  },
  {
    title: '社区',
    links: [
      { text: '话题广场', link: '/community/' },
      { text: '创意赛事', link: '/community/' },
      { text: '激励体系', link: '/incentive/' },
      { text: '安全隐私', link: '/incentive/' }
    ]
  },
  {
    title: '账户',
    links: [
      { text: '个人中心', link: '/profile/' },
      { text: '我的工具箱', link: '/profile/' },
      { text: '消息中心', link: '/profile/' },
      { text: '等级权益', link: '/profile/' }
    ]
  }
]

const go = (link: string) => {
  router.push(link)
}
</script>

<template>
  <footer class="ws-footer">
    <div class="ws-footer-inner">
      <div class="ws-footer-top">
        <!-- 品牌 -->
        <div class="ws-footer-brand">
          <div class="ws-footer-logo">
            <span class="ws-logo-mark">
              <span class="ws-logo-dot dot-cyan"></span>
              <span class="ws-logo-dot dot-lime"></span>
            </span>
            <span class="ws-footer-name">WebStore</span>
          </div>
          <p class="ws-footer-tagline">
            网页版 App Store<br/>
            <span class="text-gradient">让优质工具被看见</span>
          </p>
          <div class="ws-footer-stats">
            <div class="ws-stat">
              <span class="ws-stat-num">12,847</span>
              <span class="ws-stat-label">收录工具</span>
            </div>
            <div class="ws-stat">
              <span class="ws-stat-num">2,341</span>
              <span class="ws-stat-label">认证开发者</span>
            </div>
            <div class="ws-stat">
              <span class="ws-stat-num">580K+</span>
              <span class="ws-stat-label">活跃用户</span>
            </div>
          </div>
        </div>

        <!-- 导航列 -->
        <div class="ws-footer-nav">
          <div v-for="col in footerNav" :key="col.title" class="ws-footer-col">
            <h4 class="ws-footer-title">{{ col.title }}</h4>
            <a v-for="l in col.links" :key="l.text" class="ws-footer-link" @click="go(l.link)">{{ l.text }}</a>
          </div>
        </div>
      </div>

      <div class="ws-footer-bottom">
        <p class="ws-copyright">
          © 2024 WebStore · 网页版 App Store · V3.0 双向共创生态
        </p>
        <div class="ws-footer-tags">
          <span class="ws-tag-pill">智能发现</span>
          <span class="ws-tag-pill">深度互动</span>
          <span class="ws-tag-pill">生态互联</span>
          <span class="ws-tag-pill">全链路信任</span>
        </div>
      </div>
    </div>

    <!-- 装饰光晕 -->
    <div class="ws-footer-glow glow-left"></div>
    <div class="ws-footer-glow glow-right"></div>
  </footer>
</template>

<style scoped>
.ws-footer {
  position: relative;
  margin-top: 120px;
  border-top: 1px solid var(--color-border);
  background: linear-gradient(180deg, transparent 0%, rgba(5, 8, 24, 0.6) 100%);
  overflow: hidden;
}

.ws-footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 80px var(--space-page) 40px;
  position: relative;
  z-index: 2;
}

.ws-footer-top {
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 60px;
  margin-bottom: 60px;
}

/* 品牌 */
.ws-footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.ws-logo-mark {
  position: relative;
  width: 28px;
  height: 28px;
}

.ws-logo-dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 6px;
}

.dot-cyan { background: var(--color-accent-cyan); top: 0; left: 0; }
.dot-lime { background: var(--color-accent-lime); bottom: 0; right: 0; mix-blend-mode: screen; }

.ws-footer-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  color: var(--color-text);
}

.ws-footer-tagline {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text);
  margin: 0 0 28px;
  letter-spacing: -0.01em;
}

.ws-footer-stats {
  display: flex;
  gap: 32px;
}

.ws-stat {
  display: flex;
  flex-direction: column;
}

.ws-stat-num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  color: var(--color-accent-cyan);
  line-height: 1;
}

.ws-stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
  font-family: var(--font-mono);
}

/* 导航列 */
.ws-footer-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.ws-footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ws-footer-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-accent-cyan);
  margin: 0 0 8px;
}

.ws-footer-link {
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.ws-footer-link:hover {
  color: var(--color-accent-cyan);
}

/* 底部 */
.ws-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
  gap: 24px;
  flex-wrap: wrap;
}

.ws-copyright {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  font-family: var(--font-mono);
}

.ws-footer-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ws-tag-pill {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

/* 光晕装饰 */
.ws-footer-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
}

.glow-left {
  background: var(--color-accent-cyan);
  bottom: -250px;
  left: -100px;
}

.glow-right {
  background: var(--color-accent-lime);
  bottom: -250px;
  right: -100px;
}

@media (max-width: 1024px) {
  .ws-footer-top {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .ws-footer-nav {
    grid-template-columns: repeat(2, 1fr);
  }
  .ws-footer-stats {
    flex-wrap: wrap;
    gap: 20px;
  }
  .ws-footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

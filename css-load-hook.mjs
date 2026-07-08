// 拦截 Node ESM loader 加载
// 1. .css 文件返回空模块，避免 ERR_UNKNOWN_FILE_EXTENSION
// 2. @internal/* 别名重写到 docs/.vuepress/.temp/internal/
import { pathToFileURL } from 'node:url'
import { resolve as pathResolve } from 'node:path'

const internalDir = pathResolve('docs/.vuepress/.temp/internal')

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@internal/')) {
    const sub = specifier.slice('@internal/'.length)
    let target = pathResolve(internalDir, sub)
    // 自动补 .js 扩展名
    try {
      const fs = await import('node:fs')
      if (!fs.existsSync(target) && fs.existsSync(target + '.js')) {
        target = target + '.js'
      }
    } catch {}
    return nextResolve(pathToFileURL(target).href, context)
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      source: 'export default {}',
      shortCircuit: true
    }
  }
  const result = await nextLoad(url, context)
  // 为 vuepress client 预编译产物注入全局变量定义
  // vite 的 define 替换不会作用于 node_modules 预编译 .js
  if (url.includes('/@vuepress/client/dist/') && url.endsWith('.js') && result.source) {
    const src = typeof result.source === 'string' ? result.source : result.source.toString()
    const prefix = 'var __VUEPRESS_DEV__ = false; var __VUEPRESS_SSR__ = true;'
    return {
      ...result,
      source: prefix + src
    }
  }
  return result
}

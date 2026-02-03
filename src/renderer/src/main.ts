import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index'
import 'dayjs/locale/zh-cn'
import 'element-plus/dist/index.css'
import '/Users/admin/funi/funi-paas-cs-web-cli/output/dist/components.css'
import './assets/main.css'
import 'katex/dist/katex.min.css'
import componentsInstall from '/Users/admin/funi/funi-paas-cs-web-cli/output/dist/index.es.js'

const pinia = createPinia()
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router).use(pinia).use(ElementPlus, { locale: zhCn }).use(componentsInstall).mount('#app')

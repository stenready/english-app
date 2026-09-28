import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './plugins/i18n'
import router from './router'
import { restoreSession } from './api'
import './assets/tailwind.css'
import './assets/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
// Restore the session before the first navigation, so route guards see it
restoreSession().then(() => {
  app.use(router)
  router.isReady().then(() => app.mount('#app'))
})

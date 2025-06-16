import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js' // .js 확장자 명시 (필수는 아니지만 명확성을 위해)

const app = createApp(App)

app.use(router)

app.mount('#app')
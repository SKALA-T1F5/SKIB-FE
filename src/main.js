import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// Material Design Icons (MDI) CSS 임포트 추가
import '@mdi/font/css/materialdesignicons.css' // 이 라인을 추가했습니다.

import i18n from './i18n' // i18n 추가

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n) // i18n 등록

const vuetify = createVuetify({
  components,
  directives,
  // 아이콘 셋을 MDI로 명시적으로 설정합니다.
  icons: {
    defaultSet: 'mdi', // 기본 아이콘 셋을 mdi로 설정
  },
})
app.use(vuetify)

app.mount('#app')

import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';

import 'vuetify/styles' // Vuetify 기본 스타일
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app');
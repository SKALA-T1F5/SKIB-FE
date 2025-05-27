import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

createApp(App)
  .use(router)
  .use(vuetify) // Vuetify를 여기서 사용합니다.
  .mount('#app');

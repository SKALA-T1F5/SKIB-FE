import { createApp } from 'vue';
// import './style.css';
import './style.scss';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';

createApp(App)
  .use(router)
  .use(vuetify) // Vuetify를 여기서 사용합니다.
  .use(PerfectScrollbar)
  .component('PerfectScrollbar', PerfectScrollbar) // ✅ 여기서 등록해야 함
  .mount('#app');

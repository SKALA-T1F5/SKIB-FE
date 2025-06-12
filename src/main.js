import { createApp } from 'vue';
// import './style.css';
import './style.scss';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';

const app = createApp(App);

app.use(router)
  .use(vuetify)
  .component('PerfectScrollbar', PerfectScrollbar)
  .mount('#app');

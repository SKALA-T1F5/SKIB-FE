import { createApp } from 'vue';
// import './style.css';
import './style.scss';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';
import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);

app.use(router)
  .use(vuetify)
  .use(VueApexCharts)
  .component('PerfectScrollbar', PerfectScrollbar)
  .mount('#app');

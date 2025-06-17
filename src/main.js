import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import './style.scss'; //trainer
// import './assets/main.css'; //trainee


import vuetify from './plugins/vuetify'; //trainer
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'; //trainer
import 'vue3-perfect-scrollbar/style.css'; //trainer
import VueApexCharts from 'vue3-apexcharts'; //trainer
import '@mdi/font/css/materialdesignicons.css'; //trainer



const app = createApp(App)

app.use(router)
    .use(vuetify) //trainer
    .use(VueApexCharts) //trainer
    .component('PerfectScrollbar', PerfectScrollbar) //trainer
    .mount('#app');
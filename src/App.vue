<template>
  <v-app>
    <AppHeader />
    <SideNavigation />
    <v-main>
      <!-- 여기에 라우터 뷰 또는 페이지 컴포넌트가 표시됩니다 -->
      <router-view />
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import AppHeader from '@/components/Layout/AppHeader.vue';
import SideNavigation from '@/components/Layout/SideNavigation.vue';
import Footer from '@/components/Layout/Footer.vue';

// 특별히 글로벌 컴포넌트를 불러올 필요 없으면 비워도 됩니다
</script>

<style scoped>
/* 필요하다면 전역 스타일 작성 */
</style>










<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style> -->

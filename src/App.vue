<template>
  <div id="app">
    <Header name="Nickname" role="Trainee" />
    <div class="layout-body">
      <SideBar />
      <main class="main-content">
        <router-view />
        본문 예시입니다.
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/layouts/Header.vue'
import SideBar from './components/layouts/SideBar.vue'
import Footer from './components/layouts/Footer.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.layout-body {
  display: flex;
  flex: 1;
  min-height: calc(100% - 80px - 60px);
}

.main-content {
  flex: 1;
  padding: 1rem;
  background-color: #ffffff;
}
</style>

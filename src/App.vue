<template>
  <div id="app">
    <Header name="Nickname" role="Trainee" />
    <main class="main-content"><router-view /> 본문 예시입니다.</main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/layouts/Header.vue'
import Footer from './components/layouts/Footer.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 1rem;
  background-color: #ffffff;
}
</style>

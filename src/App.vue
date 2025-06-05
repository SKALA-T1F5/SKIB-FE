<script setup lang="ts">
import Header from './components/layouts/Header.vue'
</script>

<template>
  <div id="app">
    <Header name="Nickname" role="Trainee" />
    <router-view /> 본문 예시입니다.
  </div>
</template>

<style scoped></style>

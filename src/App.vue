<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
// 별도 코드 필요 없음
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-application {
  height: 100%;
  overflow: hidden;
}

.v-application__wrap {
  height: 100%;
  overflow: hidden;
}
</style>

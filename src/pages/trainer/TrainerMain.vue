<!-- src/pages/trainer/TrainerMain.vue -->
<template>
  <v-app>
    <MainLayout>
      <router-view />
    </MainLayout>
  </v-app>
</template>

<script setup>
import MainLayout from '@/components/Layout/MainLayout.vue'
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

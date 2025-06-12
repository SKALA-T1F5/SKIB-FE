<template>
  <v-main>
    <AppHeader />
    <div class="content-wrapper">
      <SideNavigation :collapsed="collapsed" />
      <div class="main-content mt-0">
        <router-view />
      </div>
    </div>
  </v-main>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import SideNavigation from './SideNavigation.vue'

const collapsed = ref(false)
</script>

<style scoped>
.content-wrapper {
  display: flex;
  height: calc(100vh - 60px);
  margin-top: 30px;
}

.main-content {
  flex: 1;
  margin-left: 230px;
  padding: 24px;
  overflow-y: auto;
  height: 100%;
  transition: margin-left 0.2s;
}

.sidebar.collapsed + .main-content {
  margin-left: 56px;
}
</style>
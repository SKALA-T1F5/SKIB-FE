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
  margin-top: 60px;
}

.main-content {
  flex: 1;
  margin-left: 230px;
  padding: 0px 24px 24px 24px;
  overflow-y: auto;
  height: 100%;
  transition: margin-left 0.2s;
  scrollbar-width: thin;
  scrollbar-color: #bdbdbd #f4f6fa transparent; 
}
.main-content::-webkit-scrollbar {
  width: 8px; /* Scrollbar width */
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0); /* 기본 상태에서는 투명 */
  transition: background-color 0.3s;
}

.main-content:hover::-webkit-scrollbar-thumb,
.main-content:active::-webkit-scrollbar-thumb,
.main-content:focus::-webkit-scrollbar-thumb {
  background-color: rgb(255, 255, 255); /* hover/active 시 보임 */
}


.sidebar.collapsed + .main-content {
  margin-left: 56px;
}
</style>
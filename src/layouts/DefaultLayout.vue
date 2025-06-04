<template>
  <div class="layout">
    <Header />
    <div class="layout-body">
      <SideBar>
        <slot name="sidebar" />
      </SideBar>
      <main class="main-content">
        <slot />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import SideBar from '@/components/SideBar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.layout-body {
  display: flex;
  flex: 1;
  height: calc(100vh - 80px - 40px);
  background-color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
}
</style>

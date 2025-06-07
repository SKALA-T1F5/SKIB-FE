<template>
  <div id="app">
    <Header />
    <div class="layout-body">
      <SideBar class="sidebar" />
      <div class="content-area">
        <main class="main-content">
          <router-view />
          결과 확인 화면입니다.
        </main>
        <Footer class="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import SideBar from '@/components/layouts/SideBar.vue'
import Footer from '@/components/layouts/Footer.vue'
</script>

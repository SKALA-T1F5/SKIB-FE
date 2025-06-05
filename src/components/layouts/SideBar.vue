<template>
  <div class="sidebar">
    <div class="sidebar-icon">
      <svg-icon type="mdi" :path="mdiMenuOpen" />
    </div>
    <div class="sidebar-content">
      <!-- 추후 여기에 메뉴 컴포넌트가 들어갑니다 -->
    </div>
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiMenuOpen } from '@mdi/js'
</script>

<style scoped>
.sidebar {
  width: 10%;
  background-color: #1e2251;
  color: white;
  padding: 20px;
  border-top-right-radius: 50px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 100px;
  min-height: calc(100vh - 80px);
}

.sidebar-icon {
  position: absolute;
  top: 30px;
  right: 20px;
  width: 30px;
  height: 30px;
  color: white;
}

.sidebar-content {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto;
  flex: 1;
  width: 100%;
}
</style>

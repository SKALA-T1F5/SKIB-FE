<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 추후 여기에 메뉴 컴포넌트가 들어갑니다 -->
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.sidebar {
  width: 150px;
  height: calc(100% - 60px);
  background-color: #1e2251;
  color: white;
  padding: 20px;
  border-top-right-radius: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 100px;
  min-height: calc(100vh - 60px);
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

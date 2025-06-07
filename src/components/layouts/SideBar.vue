<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.sidebar {
  width: 150px; /* 기본 너비 (TraineeSideBar에서 오버라이드 가능) */
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
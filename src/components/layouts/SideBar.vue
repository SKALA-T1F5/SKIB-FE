<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
/* TraineeMain.vue의 .layout-body > :deep(.trainee-main-sidebar) 와 유사한 스타일 */
.sidebar {
  width: 250px; /* TraineeMain.vue에서 적용된 너비 */
  background-color: #1e2251; /* TraineeMain.vue에서 적용된 배경색 */
  color: white; /* TraineeMain.vue에서 적용된 텍스트 색상 */
  flex-shrink: 0;
  padding: 20px; /* TraineeMain.vue에서 적용된 패딩 */
  box-sizing: border-box;
  overflow-y: auto; /* 내부 스크롤을 위해 */
  border-top-right-radius: 40px; /* TraineeMain.vue에서 적용된 border-radius */
  position: relative;
  min-width: 100px;
  height: 100%; /* flex 컨테이너인 .layout-body에 맞춰 높이 100% */
  display: flex; /* 내부 컨텐츠를 위한 flex */
  flex-direction: column; /* 내부 컨텐츠를 위한 flex */
}

/* 슬롯 컨텐츠를 감싸는 내부 div */
.sidebar-content {
  flex: 1; /* 남은 공간을 모두 차지 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto; /* 슬롯 내부 컨텐츠가 길어질 경우 스크롤 */
  width: 100%;
  /* margin-top: 0; */ /* 제거, slot content에서 관리 */
}
</style>
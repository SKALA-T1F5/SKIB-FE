<template>
  <div class="main-layout">
    <Header :name="userName" :role="userRole" />

    <div class="layout-body">
      <aside :class="['sidebar-container', { collapsed: isSidebarCollapsed }]">
        <div class="sidebar-header">
          <div class="sidebar-header-content">
            <slot name="sidebar-header-content" :is-collapsed="isSidebarCollapsed"></slot>
          </div>
          <button class="collapse-btn" @click="toggleSidebar">
            <span class="material-icons">{{
              isSidebarCollapsed ? 'chevron_right' : 'chevron_left'
            }}</span>
          </button>
        </div>
        <hr v-if="!isSidebarCollapsed && hasSidebarHeaderContent" class="divider-in-header" />

        <div class="sidebar-content-slot">
          <slot name="sidebar" :is-collapsed="isSidebarCollapsed"></slot>
        </div>
      </aside>

      <div class="content-area">
        <main class="main-content">
          <slot name="content"></slot>
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, useSlots } from 'vue'
import Header from './Header.vue' // 실제 Header.vue 경로에 맞게 수정해주세요.
import Footer from './Footer.vue' // 실제 Footer.vue 경로에 맞게 수정해주세요.

const userName = ref('Guest')
const userRole = ref('Trainee')
const isSidebarCollapsed = ref(false) // 사이드바 접힘/펼침 상태

const slots = useSlots()
// 'sidebar-header-content' 슬롯에 콘텐츠가 제공되었는지 확인하여 구분선 렌더링 여부를 결정합니다.
// TraineeMain.vue에서 검색창을 이 슬롯에 넣을 것이므로, 이 값은 true가 됩니다.
const hasSidebarHeaderContent = computed(() => !!slots['sidebar-header-content'])

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

onMounted(() => {
  const storedName = localStorage.getItem('name')
  const storedRole = localStorage.getItem('role')
  if (storedName) {
    userName.value = storedName
  }
  if (storedRole) {
    userRole.value = storedRole
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-container {
  width: 180px; /* 펼쳤을 때 너비 */
  min-width: 180px; /* 최소 너비 고정 */
  background-color: #eef2f6;
  color: #222;
  padding-top: 24px;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px; /* 이전처럼 다시 추가 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  /* transition: width 0.2s ease-in-out, min-width 0.2s ease-in-out; */ /* 너비는 고정되므로 transition 불필요 */
  position: relative;
  z-index: 900;
  height: calc(100vh - 60px);
}

.sidebar-container.collapsed {
  width: 55px; /* 접었을 때 너비 */
  min-width: 55px; /* 접었을 때 최소 너비 */
  align-items: center;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 슬롯 내용과 버튼을 양 끝으로 분리 */
  padding: 0 14px 0px 10px; /* 왼쪽 여백 추가 */
}

.sidebar-container.collapsed .sidebar-header {
  justify-content: center; /* 접었을 때 버튼만 중앙으로 */
  padding: 0 0 20px 0; /* 접었을 때 패딩 조정 */
}

.sidebar-header-content {
  flex-grow: 1; /* 남은 공간을 차지하도록 */
  margin-right: 10px; /* 토글 버튼과의 간격 */
  display: flex; /* 내부 요소 정렬을 위해 flexbox 사용 */
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: flex-start; /* 검색창을 왼쪽으로 정렬 */
}

.divider-in-header {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 14px 10px;
}

.collapse-btn {
  background: #fff;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #888;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  transition: background 0.2s;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #f0f0f0;
}

.sidebar-content-slot {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 20px 14px; /* 좌우 여백 추가 및 하단 패딩 */
  transition: opacity 0.2s ease-in-out;
}

.sidebar-container.collapsed .sidebar-content-slot {
  opacity: 0;
  pointer-events: none;
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background-color: #fff;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
}
</style>

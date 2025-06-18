<template>
  <div class="main-layout">
    <Header :name="userName" :role="userRole" />

    <div class="layout-body">
      <aside v-if="showSidebar" :class="['sidebar-container', { collapsed: isSidebarCollapsed }]">
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

      <div :class="['content-area', { 'full-width': !showSidebar }]">
        <main class="main-content">
          <slot name="content"></slot>
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, useSlots, defineProps } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'

const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true,
  },
})

const userName = ref('Guest')
const userRole = ref('Trainee')
const isSidebarCollapsed = ref(false)

const slots = useSlots()
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
  overflow-x: hidden;
  /* 여백이 많아진 원인 중 하나일 수 있으므로 gap 속성이 있다면 제거하거나 조정 */
  /* gap: 0; */
}

.sidebar-container {
  width: 180px;
  min-width: 180px;
  background-color: #eef2f6;
  color: #222;
  padding-top: 24px;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 900;
  flex: 0 0 auto;
  min-height: 0;

  transition:
    width 0.3s ease-in-out,
    padding 0.3s ease-in-out,
    border-radius 0.3s ease-in-out;
}

.sidebar-container.collapsed {
  width: 55px;
  min-width: 55px;
  align-items: center;
  padding-left: 0;
  padding-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 14px 0px 10px;
  position: relative;
  padding-right: 35px;
}

.sidebar-container.collapsed .sidebar-header {
  padding: 0 0 20px 0;
  justify-content: center;
}

.sidebar-header-content {
  flex-grow: 1;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition:
    opacity 0.3s ease-in-out,
    width 0.3s ease-in-out,
    visibility 0s linear 0.3s;
}

.sidebar-container.collapsed .sidebar-header-content {
  opacity: 0;
  width: 0;
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
  transition:
    opacity 0.3s ease-in-out,
    width 0.3s ease-in-out,
    visibility 0s linear 0s;
}

.divider-in-header {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 14px 10px;
  transition:
    opacity 0.3s ease-in-out,
    margin 0.3s ease-in-out,
    visibility 0s linear 0.3s;
}

.sidebar-container.collapsed .divider-in-header {
  opacity: 0;
  margin: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease-in-out,
    margin 0.3s ease-in-out,
    visibility 0s linear 0s;
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
  transition:
    background 0.2s,
    transform 0.3s ease-in-out;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
}

.sidebar-container.collapsed .collapse-btn {
  right: 50%;
  transform: translateY(-50%) translateX(50%);
}

.collapse-btn:hover {
  background: #f0f0f0;
}

.sidebar-content-slot {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 20px 14px;
  transition:
    opacity 0.3s ease-in-out,
    visibility 0s linear 0.3s;
}

.sidebar-container.collapsed .sidebar-content-slot {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transition:
    opacity 0.3s ease-in-out,
    visibility 0s linear 0s;
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  align-items: center; /* main-content를 수평 중앙으로 정렬 */
  /* 사이드바와 content-area 사이의 불필요한 여백 제거 */
  /* margin-left, padding-left 관련 속성 확인 및 제거/조정 */
  margin-left: 0; /* 혹시 모를 마진 초기화 */
  padding-left: 0; /* 혹시 모를 패딩 초기화 */
}

/* 사이드바가 없을 때 content-area가 전체 너비를 차지하도록 */
.content-area.full-width {
  margin-left: 0; /* 사이드바 없음 -> 마진 0 */
  width: 100%; /* 전체 너비 차지 */
}

.main-content {
  flex: 1;
  padding: 24px; /* 메인 콘텐츠 내부 패딩은 유지 */
  overflow-y: auto;
  min-height: 0;
  width: 100%; /* 부모의 100%를 기본으로 하되 max-width에 의해 제한 */
  box-sizing: border-box;
  /* 콘텐츠 자체의 좌우 여백을 줄이려면 padding-left/right를 조정 */
  /* 현재 padding: 24px; 가 전체 방향에 적용되므로, 좌우 패딩을 줄이고 싶다면 아래처럼 변경 */
  /* padding: 24px 10px; // 상하 24px, 좌우 10px */
}
</style>

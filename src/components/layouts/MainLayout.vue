<template>
  <div class="main-layout">
    <Header :name="userName" :role="userRole" />

    <div class="layout-body">
      <aside :class="['sidebar-container', { collapsed: isSidebarCollapsed }]">
        <div class="sidebar-header">
          <button class="collapse-btn" @click="toggleSidebar">
            <span class="material-icons">{{
              isSidebarCollapsed ? 'chevron_right' : 'chevron_left'
            }}</span>
          </button>
        </div>
        <div class="sidebar-content-slot">
          <slot name="sidebar"></slot>
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
import { ref, onMounted } from 'vue'
import Header from './Header.vue' // Header.vue 경로 확인 필요 (실제 경로에 맞게 수정)
import Footer from './Footer.vue' // Footer.vue 경로 확인 필요 (실제 경로에 맞게 수정)

const userName = ref('Guest')
const userRole = ref('Trainee')
const isSidebarCollapsed = ref(false) // 사이드바 접힘/펼침 상태

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
/* Material Icons 웹폰트 임포트 (버튼 아이콘용) */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* 전체 레이아웃 구조 */
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

/* SideBar 컨테이너 스타일 */
.sidebar-container {
  width: 180px; /* 펼쳤을 때 너비 */
  min-width: 150px; /* 최소 너비 고정 */
  background-color: #eef2f6;
  color: #222;
  padding-top: 24px;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition:
    width 0.2s ease-in-out,
    min-width 0.2s ease-in-out;
  position: relative;
  z-index: 900;
  height: calc(100vh - 60px);
}

.sidebar-container.collapsed {
  width: 55px; /* 접었을 때 너비 */
  min-width: 55px; /* 접었을 때 최소 너비 */
  align-items: center;
}

/* SideBar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  /* 제목이 없어졌으므로 justify-content를 변경하여 버튼을 오른쪽에 배치 */
  justify-content: flex-end; /* 버튼을 오른쪽 끝으로 */
  padding: 0 16px 20px 10px;
}

.sidebar-container.collapsed .sidebar-header {
  justify-content: center; /* 접었을 때 버튼만 중앙으로 */
  padding: 0 0 20px 0; /* 접었을 때 패딩 조정 */
}

/* sidebar-title과 divider 스타일은 더 이상 필요 없으므로 제거 */

/* Collapse Button */
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
}

.collapse-btn:hover {
  background: #f0f0f0;
}

/* SideBar Content Slot (슬롯 내용 감싸는 div) */
.sidebar-content-slot {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  transition: opacity 0.2s ease-in-out;
}

.sidebar-container.collapsed .sidebar-content-slot {
  opacity: 0;
  pointer-events: none; /* 클릭 이벤트 방지 */
}

/* 메인 콘텐츠 영역의 스타일 */
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

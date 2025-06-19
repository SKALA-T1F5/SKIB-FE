<template>
  <div class="main-layout">
    <Header :name="userName" :role="userRole" />

    <div class="layout-body">
      <aside v-if="showSidebar" :class="['sidebar-container', { collapsed: isSidebarCollapsed }]">
        <div class="sidebar-header">
          <div class="sidebar-header-content">
            <h3 class="sidebar-title" v-if="!isSidebarCollapsed">
              {{ sidebarTitle }}
            </h3>
            <slot name="sidebar-header-content" :is-collapsed="isSidebarCollapsed"></slot>
          </div>
          <button class="collapse-btn" @click="toggleSidebar">
            <span class="material-icons">{{
              isSidebarCollapsed ? 'chevron_right' : 'chevron_left'
            }}</span>
          </button>
        </div>
        <hr v-if="!isSidebarCollapsed" class="divider-in-header" />

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
// MainLayout에서 더 이상 직접 TraineeTestSideBar나 TraineeTestResultSideBar를 렌더링하지 않으므로
// 아래 두 컴포넌트 임포트는 제거했습니다.
// import TraineeTestSideBar from '@/components/trainee/test/TraineeTestSideBar.vue'
// import TraineeTestResultSideBar from '@/components/trainee/result/TraineeTestResultSideBar.vue'

const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true,
  },
  sidebarType: {
    type: String,
    default: 'default', // 'test', 'testResult' 등으로 구분
  },
  // sidebarComponent를 직접 사용하지 않으므로, 이와 관련된 props는 더 이상 필요 없을 수 있습니다.
  // 필요한 경우에만 유지하세요.
  // testQuestions: {
  //   type: Array,
  //   default: () => [],
  // },
  // currentTestQuestionId: {
  //   type: [Number, String, null],
  //   default: null,
  // },
})

const userName = ref('Guest')
const userRole = ref('Trainee')
const isSidebarCollapsed = ref(false)

const slots = useSlots() // 슬롯을 사용하는 경우에 필요합니다.

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

// TraineeTestSideBar에서 발생한 selectQuestion 이벤트를 받아서 부모 컴포넌트로 다시 emit
// sidebarComponent를 직접 사용하지 않으므로, 이와 관련된 emit 및 함수도 필요 없을 수 있습니다.
// const emit = defineEmits(['selectQuestionFromSidebar'])
// const handleSelectTestQuestion = (questionId) => {
//   emit('selectQuestionFromSidebar', questionId)
// }

// sidebarTitle computed 속성은 계속 사용하므로 유지합니다.
// MainLayout에 sidebarType을 prop으로 전달하여 제목을 제어할 수 있습니다.
const sidebarTitle = computed(() => {
  switch (props.sidebarType) {
    case 'test':
      return '문제 현황'
    case 'testResult':
      return '시험 결과' // 시험 결과 화면일 때 보여줄 제목
    default:
      return // 기본 제목
  }
})

// sidebarComponent computed 속성은 더 이상 사용되지 않으므로 제거했습니다.
// 이 로직으로 인해 TraineeMain.vue의 사이드바 내용이 렌더링되지 않았을 가능성이 높습니다.
// const sidebarComponent = computed(() => { /* ... 기존 로직 ... */ });
</script>

<style scoped>
/* 기존 스타일은 유지됩니다. */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow-x: hidden;
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
  align-items: center; /* 세로 중앙 정렬 */
  justify-content: flex-start;
  padding: 0 14px 0px 10px;
  position: relative;
  padding-right: 35px; /* 토글 버튼 공간 확보 */
}

.sidebar-container.collapsed .sidebar-header {
  padding: 0 0 20px 0;
  justify-content: center;
}

.sidebar-header-content {
  flex-grow: 1;
  margin-right: 10px;
  display: flex; /* 내부 요소들을 flex로 관리하여 정렬 */
  align-items: center; /* '문제 현황' 텍스트를 세로 중앙으로 정렬 */
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

/* '문제 현황' 문구에 적용될 스타일 */
.sidebar-title {
  font-size: 16px;
  font-weight: bold;
  color: #333; /* 사이드바 배경에 맞는 색상으로 조정 */
  margin-left: 10px; /* 불필요한 마진 제거 */
  white-space: nowrap; /* 텍스트가 한 줄로 표시되도록 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 넘치는 텍스트를 ...으로 표시 */
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
  top: 50%; /* sidebar-header의 세로 중앙에 위치 */
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
  align-items: center;
  margin-left: 0;
  padding-left: 0;
}

.content-area.full-width {
  margin-left: 0;
  width: 100%;
  align-items: stretch;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}
</style>

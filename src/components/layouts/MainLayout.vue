<template>
  <div class="main-layout">
    <Header :name="userName" :role="userRole" />

    <div class="layout-body">
      <aside class="sidebar-container">
        <slot name="sidebar"></slot>
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
import { ref, onMounted } from 'vue';
import Header from './Header.vue'; // Header 컴포넌트 임포트
import Footer from './Footer.vue'; // Footer 컴포넌트 임포트

// 중요: SideBar 컴포넌트는 슬롯을 통해 주입되므로
// MainLayout.vue 내부에서는 직접 임포트하거나 사용하지 않습니다.

const userName = ref('Guest'); // Header에 전달될 사용자 이름 기본값 설정
const userRole = ref('Trainee'); // Header에 전달될 사용자 역할 기본값 설정

onMounted(() => {
  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 이름과 역할을 가져옵니다.
  // 이 값들은 Header 컴포넌트의 props로 전달됩니다.
  const storedName = localStorage.getItem('name');
  const storedRole = localStorage.getItem('role');
  if (storedName) {
    userName.value = storedName;
  }
  if (storedRole) {
    userRole.value = storedRole;
  }
});
</script>

<style scoped>
/* 전체 레이아웃 구조를 정의하는 스타일 */
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 뷰포트 전체 높이를 차지하도록 설정 */
}

.layout-body {
  display: flex;
  flex: 1; /* Header와 Footer를 제외한 남은 공간을 모두 차지하도록 설정 */
  overflow: hidden; /* 내부 스크롤이 필요한 경우를 대비하여 오버플로우 숨김 */
}

/* SideBar 컨테이너의 스타일: 기존 SideBar.vue의 핵심 스타일을 여기에 적용 */
.sidebar-container {
  width: 150px; /* 기본 너비 (TraineeSideBar에서 오버라이드 가능) */
  height: 100%;
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

/* 메인 콘텐츠 영역의 스타일 */
.content-area {
  display: flex;
  flex-direction: column;
  flex: 1; /* SideBar를 제외한 남은 공간을 모두 차지하도록 설정 */
  overflow: hidden; /* 메인 콘텐츠 영역 스크롤 관리 */
}

.main-content {
  flex: 1; /* 콘텐츠가 길어질 경우 스크롤되도록 설정 */
  padding: 24px;
  overflow-y: auto;
  background-color: #ffffff;
}
</style>
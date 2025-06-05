<template>
  <div class="trainee-main">
    <!-- 헤더 -->
    <Header />

    <!-- 본문 레이아웃: 사이드바 + 메인 -->
    <div class="layout-body">
      <TraineeSideBar />

      <div class="content-area">
        <main class="main-content">
          <h2>본문 예시입니다.</h2>
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import Footer from '@/components/layouts/Footer.vue'
import TraineeSideBar from '@/components/layouts/sidebar/TraineeSideBar.vue'
</script>

<style scoped>
.trainee-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Header 제외 나머지 */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 사이드바는 TraineeSideBar.vue 내부에서 width 지정 */
.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* 메인 콘텐츠 영역 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #ffffff;
}

/* 푸터는 항상 아래 고정 */
</style>

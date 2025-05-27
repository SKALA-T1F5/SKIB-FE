<template>
  <v-app-bar app color="white" flat border>
    <v-container class="fill-height d-flex align-center">
      <!-- 로고 및 프로젝트 이름 -->
      <v-btn variant="text" class="d-flex align-center mr-4" @click="navigateToProject">
        <div class="logo-icon rounded-lg d-flex align-center justify-center mr-3">
          <v-icon color="white">mdi-file-text</v-icon>
        </div>
        <v-toolbar-title class="text-h6 font-weight-bold text-grey-darken-3">
          SKIB demo
        </v-toolbar-title>
      </v-btn>

      <v-spacer></v-spacer>

      <!-- 사용자 아이콘 및 언어 설정 -->
      <div class="d-flex align-center space-x-4">
        <v-btn icon variant="text" color="grey-darken-1" @click="navigateToLanguageSettings">
          <v-icon>mdi-earth</v-icon>
        </v-btn>
        <v-btn icon variant="text" color="grey-darken-1" @click="navigateToMyPage">
          <div class="user-icon rounded-circle d-flex align-center justify-center">
            <v-icon color="white">mdi-account</v-icon>
          </div>
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function navigateToProject() {
  router.push('/trainer/project');
}

function navigateToMyPage() {
  router.push('/trainer/mypage');
}

function navigateToLanguageSettings() {
  // 언어 설정 페이지로 이동하는 로직 추가
}
</script>

<style scoped>
.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(to right, #000000, #00000075);
  /* primary to orange-400 */
}

.user-icon {
  width: 32px;
  height: 32px;
  background-color: #0000009a;
  /* primary color */
}

.space-x-4>*:not(:last-child) {
  margin-right: 16px;
}

.space-x-8>*:not(:last-child) {
  margin-right: 32px;
}

/* Vuetify v-btn의 기본 패딩을 줄이기 위해 필요할 수 있습니다 */
.v-btn.v-btn--text {
  padding: 0 8px;
}
</style>
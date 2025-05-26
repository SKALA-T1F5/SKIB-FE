<template>
    <v-app-bar app color="white" flat border>
      <v-container class="fill-height d-flex align-center">
        <!-- 로고 및 프로젝트 이름 -->
        <div class="d-flex align-center mr-4">
          <div class="logo-icon rounded-lg d-flex align-center justify-center mr-3">
            <v-icon color="white">mdi-file-text</v-icon>
          </div>
          <v-toolbar-title class="text-h6 font-weight-bold text-grey-darken-3">
            SKIB demo
          </v-toolbar-title>
        </div>
  
        <v-spacer></v-spacer>
  
        <!-- 네비게이션 링크 (데스크톱) -->
        <div class="d-none d-md-flex align-center space-x-8">
          <v-btn text color="grey-darken-2" variant="text" class="font-weight-medium" to="/dashboard">
            대시보드
          </v-btn>
          <v-btn text color="grey-darken-2" variant="text" class="font-weight-medium" to="/document-management">
            문서 관리
          </v-btn>
          <v-btn text color="grey-darken-2" variant="text" class="font-weight-medium" to="/settings">
            설정
          </v-btn>
        </div>
  
        <v-spacer></v-spacer>
  
        <!-- 알림 및 사용자 아이콘 -->
        <div class="d-flex align-center space-x-4">
          <v-btn icon variant="text" color="grey-darken-1">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
          <div class="user-icon rounded-circle d-flex align-center justify-center">
            <v-icon color="white">mdi-account</v-icon>
          </div>
        </div>
      </v-container>
    </v-app-bar>
  </template>
  
  <script setup>
  // Composition API를 사용했지만 Options API로 변경해도 무방합니다.
  // 필요한 경우 Vue Router 링크를 사용하려면 'to' 속성을 v-btn에 추가하세요.
  </script>
  
  <style scoped>
  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(to right, #ff9800, #ffb74d); /* primary to orange-400 */
  }
  
  .user-icon {
    width: 32px;
    height: 32px;
    background-color: #ff9800; /* primary color */
  }
  
  .space-x-4 > *:not(:last-child) {
    margin-right: 16px;
  }
  
  .space-x-8 > *:not(:last-child) {
    margin-right: 32px;
  }
  
  /* Vuetify v-btn의 기본 패딩을 줄이기 위해 필요할 수 있습니다 */
  .v-btn.v-btn--text {
    padding: 0 8px;
  }
  </style>
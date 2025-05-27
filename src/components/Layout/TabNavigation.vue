<template>
    <v-tabs v-model="activeTab">
      <v-tab>프로젝트 메인</v-tab>
      <v-tab>문서 관리</v-tab>
      <v-tab>문제 관리</v-tab>
      <v-tab>훈련생 관리</v-tab>
      <v-tab>시험 관리</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item>
        <slot name="project-management"></slot>
      </v-window-item>
      <v-window-item>
        <slot name="document-management"></slot>
      </v-window-item>
      <v-window-item>
        <slot name="problem-management"></slot>
      </v-window-item>
      <v-window-item>
        <slot name="trainee-management"></slot>
      </v-window-item>
      <v-window-item>
        <slot name="exam-management"></slot>
      </v-window-item>
    </v-window>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const activeTab = ref(0);
  </script>
  
  <style scoped>
  </style>
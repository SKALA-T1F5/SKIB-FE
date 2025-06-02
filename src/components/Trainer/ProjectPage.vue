<template>
    <v-container fluid>
      <!-- 탭 전환 UI -->
      <TabNavigation v-model="activeTab" />
  
      <!-- 탭에 따라 슬롯 전환 -->
       <v-card color="secondary" elevation="0">
      <component :is="currentComponent" @next-step="handleNextStep" />
    </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  import TabNavigation from '../Layout/TabNavigation.vue'
  
  import ProjectDetail from './ProjectDetail.vue'
  import DocumentManagement from './DocumentManagement.vue'
  import ProblemManagement from './ProblemManagement.vue'
  import TraineeManagement from './TraineeManagement.vue'
  import ExamManagement from './ExamManagement.vue'
  import ExamGenerate from './ExamGenerate.vue'
  
  const activeTab = ref(0)
  
  const currentComponent = computed(() => {
    return [
      ProjectDetail,
      DocumentManagement,
      ProblemManagement,
      TraineeManagement,
      ExamManagement,
      ExamGenerate
    ][activeTab.value]
  })

  const handleNextStep = () => {
    activeTab.value = 5; // ExamGenerate.vue의 인덱스
  }
  </script>
  
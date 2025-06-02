<template>
  <v-container fluid>
    <!-- 탭 전환 UI -->
    <TabNavigation v-model="activeTab" :tabs="tabs" />
   
    <v-card color="secondary" elevation="0">
    <v-window v-model="activeTab">
      <v-window-item :value="0">
        <ProjectDetail />
      </v-window-item>
      <v-window-item :value="1">
        <DocumentManagement />
      </v-window-item>
      <v-window-item :value="2">
        <ProblemManagement />
      </v-window-item>
      <v-window-item :value="3">
        <TraineeManagement />
      </v-window-item>
      <v-window-item :value="4">
        <ExamManagement />
      </v-window-item>
    </v-window>
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

const activeTab = ref('0')
const tabs = ['Project', 'Documents', 'Questions', 'Tests', 'Trainees']


</script>
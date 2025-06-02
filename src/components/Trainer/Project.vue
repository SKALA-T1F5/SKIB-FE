<template>
  <v-container fluid class="py-6">
    <v-row>
      <v-col v-for="project in projects" :key="project.id" cols="12" sm="6" md="4">
        <v-card class="project-card">
          <v-card-title class="project-card-title">
            <div class="text-h6">{{ project.name }}</div>
          </v-card-title>
          <v-card-text class="project-card-text">
            <p><strong>설명:</strong> {{ project.description }}</p>
            <p><strong>시작일:</strong> {{ project.startDate }}</p>
            <p><strong>상태:</strong> {{ project.status }}</p>
          </v-card-text>
          <v-card-actions class="project-card-actions">
            <v-btn class="project-btn-primary" @click="goToProjectManagement(project.id)">관리</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const useBackend = ref(false); // 백엔드 연동 여부를 결정하는 플래그

const projects = ref([]);
const router = useRouter();

// 임시 프로젝트 데이터
const temporaryProjects = [
  { id: 1, name: 'Project A', description: '프로젝트 A 설명', startDate: '2023-01-01', status: '진행 중' },
  { id: 2, name: 'Project B', description: '프로젝트 B 설명', startDate: '2023-02-01', status: '완료' },
  { id: 3, name: 'Project C', description: '프로젝트 C 설명', startDate: '2023-03-01', status: '대기 중' }
];

onMounted(async () => {
  if (useBackend.value) {
    // 백엔드에서 프로젝트 데이터 가져오기
    try {
      const response = await axios.get('/api/projects');
      projects.value = response.data;
    } catch (error) {
      console.error('Failed to fetch projects from backend:', error);
      // 백엔드 연동 실패 시 임시 데이터 사용
      projects.value = temporaryProjects;
    }
  } else {
    // 임시 프로젝트 데이터 사용
    projects.value = temporaryProjects;
  }
});

function goToProjectManagement(projectId) {
  router.push(`/trainer/project/${projectId}`);
}
</script>

<style>
</style>
<template>
  <v-container fluid class="py-6">
    <v-row>
      <v-col v-for="project in projects" :key="project.id" cols="12" sm="6" md="4">
        <v-card elevation="0" class="bg-primary overflow-hidden bubble-shape bubble-primary-shape project-card">
          <v-card-text>
            <div class="d-flex align-start mb-6">
              <div class="ml-auto z-1">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn icon rounded="sm" variant="text" size="small" v-bind="props">
                      <v-icon color="white">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-sheet rounded="md" width="150" class="elevation-10">
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title class="ml-2">수정</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-delete</v-icon>
                        </template>
                        <v-list-item-title class="ml-2">삭제</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-sheet>
                </v-menu>
              </div>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon color="white" class="mr-2">mdi-folder</v-icon>
              <h2 class="text-h5 font-weight-medium text-white mb-0">
                {{ project.name }}
              </h2>
            </div>
            <div class="text-subtitle-1 text-medium-emphasis text-white mb-4">
              <p class="mb-1"><strong>설명:</strong> {{ project.description }}</p>
              <p class="mb-1"><strong>시작일:</strong> {{ project.startDate }}</p>
              <p class="mb-1"><strong>상태:</strong> {{ project.status }}</p>
            </div>
            <v-btn 
              class="project-btn-primary" 
              @click="goToProjectManagement(project.id)"
              variant="flat"
              color="primary"
              rounded="sm"
            >
              관리
            </v-btn>
          </v-card-text>
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
  localStorage.setItem('projectId', projectId);
  router.push(`/trainer/project/${projectId}`);
}
</script>

<style scoped>
.project-card {
  transition: transform 0.2s;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-5px);
}

.bubble-shape {
  position: relative;
  border-radius: 15px;
}

.bubble-primary-shape::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -1px;
  width: 200px;
  height: 120px;
  background: rgba(var(--v-theme-darkprimary), 0.3);
  border-radius: 50%;
  z-index: 0;
}

.bubble-primary-shape::after {
  content: '';
  position: absolute;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  top: -85px;
  right: -95px;
  background: rgba(var(--v-theme-darkprimary), 0.3);
  z-index: 0;
}

.project-btn-primary {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.text-white {
  color: white !important;
}

.text-medium-emphasis {
  opacity: 0.8;
}
</style>
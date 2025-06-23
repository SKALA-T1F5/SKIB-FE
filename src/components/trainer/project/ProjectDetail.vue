<template>
  <MainLayout :show-sidebar="true" sidebar-type="project">
    <template #sidebar="{ isCollapsed }">
      <TrainerSideBar :is-collapsed="isCollapsed" />
    </template>

    <template #content>
      <v-container fluid>
        <div class="project-detail-header">
          <h2>{{ projectName }}</h2>
        </div>
        <v-tabs v-model="activeTab" background-color="white" color="primary" grow>
          <v-tab v-for="(tab, idx) in tabLabels" :key="idx" :value="idx">
            {{ tab }}
          </v-tab>
        </v-tabs>
        <v-window v-model="activeTab" class="mt-4">
          <v-window-item :value="0">
            <div class="project-detail-content">
              <router-view v-if="activeTab === 0" />
            </div>
          </v-window-item>
          <v-window-item :value="1">
            <div class="project-detail-content">
              <router-view v-if="activeTab === 1" />
            </div>
          </v-window-item>
          <v-window-item :value="2">
            <div class="project-detail-content">
              <router-view v-if="activeTab === 2" />
            </div>
          </v-window-item>
        </v-window>
      </v-container>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TrainerSideBar from '@/components/trainer/TrainerSideBar.vue' // TrainerSideBar 임포트

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId
const projectName = ref(`프로젝트 ${projectId}`) // 실제 프로젝트명 로드 로직으로 대체 필요

const tabLabels = ['문서 관리', '테스트 관리', '훈련생 관리']
const tabRoutes = [
  `/trainer/project/${projectId}/document`,
  `/trainer/project/${projectId}/test`,
  `/trainer/project/${projectId}/learner`,
]

// 현재 라우트 경로에 따라 초기 탭 설정
const activeTab = ref(tabRoutes.findIndex((r) => route.path.startsWith(r)))
if (activeTab.value === -1) activeTab.value = 0 // 일치하는 탭이 없으면 기본 0번째 탭 (문서 관리)

watch(activeTab, (val) => {
  router.push(tabRoutes[val])
})

// 라우트 변경을 감지하여 탭 업데이트
watch(
  () => route.path,
  (newPath) => {
    const newTabIdx = tabRoutes.findIndex((r) => newPath.startsWith(r))
    if (newTabIdx !== -1 && newTabIdx !== activeTab.value) {
      activeTab.value = newTabIdx
    }
  },
)

onMounted(() => {
  // 실제 프로젝트명 불러오는 API 호출 등 (예: /api/projects/{projectId} 엔드포인트)
  // fetchProjectName(projectId);
})

// 예시: 프로젝트 이름을 불러오는 더미 함수
// async function fetchProjectName(id) {
//   try {
//     const response = await fetch(`/api/projects/${id}`); // 실제 API 엔드포인트
//     const data = await response.json();
//     projectName.value = data.name; // API 응답에서 프로젝트 이름을 가져옴
//   } catch (error) {
//     console.error('Failed to fetch project name:', error);
//     projectName.value = `프로젝트 ${id}`; // 에러 발생 시 폴백
//   }
// }
</script>

<style scoped>
.project-detail-header {
  margin-bottom: 20px;
}
.project-detail-content {
  margin-top: 24px;
}

/* Vuetify 탭 선택 색상 커스텀 */
:deep(.v-tab--selected) {
  color: #191d5a !important;
}
:deep(.v-tabs .v-tab--selected) {
  border-bottom: 2px solid #191d5a !important;
}
</style>

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
import { ref, onMounted, watch, computed } from 'vue' // computed 임포트 추가
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TrainerSideBar from '@/components/trainer/TrainerSideBar.vue' // TrainerSideBar 임포트

const route = useRoute()
const router = useRouter()

// projectId는 route.params에서 직접 가져오는 것이 아니라 computed로 정의하여 반응성 확보
const currentProjectId = computed(() => route.params.projectId)

const projectName = ref(`프로젝트 ${currentProjectId.value}`) // 실제 프로젝트명 로드 로직으로 대체 필요

const tabLabels = ['문서 관리', '테스트 관리', '훈련생 관리']

// tabRoutes를 computed 속성으로 변경하여 projectId 변경에 반응하도록 함
const tabRoutes = computed(() => [
  `/trainer/project/${currentProjectId.value}/document`,
  `/trainer/project/${currentProjectId.value}/test`,
  `/trainer/project/${currentProjectId.value}/learner`,
])

// 현재 라우트 경로에 따라 초기 탭 설정
// watchEffect를 사용하여 currentProjectId와 route.path 모두에 반응하도록 함
const activeTab = ref(0) // 초기값 0으로 설정, watchEffect에서 실제 경로 기반으로 업데이트

watch(activeTab, (val) => {
  // activeTab이 변경될 때만 라우팅 실행
  // tabRoutes.value를 사용해야 computed 속성에 접근
  if (router.currentRoute.value.path !== tabRoutes.value[val]) {
    router.push(tabRoutes.value[val])
  }
})

// 라우트 변경을 감지하여 탭 업데이트 및 projectName 업데이트
watch(
  () => route.path,
  (newPath) => {
    // projectId가 변경되면 projectName도 업데이트
    projectName.value = `프로젝트 ${currentProjectId.value}`

    // 현재 경로에 맞는 탭 인덱스 찾기
    const newTabIdx = tabRoutes.value.findIndex((r) => newPath.startsWith(r))
    if (newTabIdx !== -1 && newTabIdx !== activeTab.value) {
      activeTab.value = newTabIdx
    }
  },
  { immediate: true }, // 컴포넌트 마운트 시 즉시 실행
)

// currentProjectId가 변경될 때마다 projectName도 업데이트 (만약 API 호출 로직이 없다면)
watch(
  currentProjectId,
  (newProjectId) => {
    projectName.value = `프로젝트 ${newProjectId}`
    // 실제 프로젝트 이름을 불러오는 API 호출이 있다면 여기서 다시 호출해야 합니다.
    // fetchProjectName(newProjectId);
  },
  { immediate: true },
)

onMounted(() => {
  // 실제 프로젝트명 불러오는 API 호출 등 (예: /api/projects/{projectId} 엔드포인트)
  // fetchProjectName(currentProjectId.value); // 초기 로드 시 프로젝트 이름 설정
})

// 예시: 프로젝트 이름을 불러오는 더미 함수 (API 연동 시 주석 해제 후 사용)
// async function fetchProjectName(id) {
//   try {
//     // const response = await fetch(`/api/projects/${id}`); // 실제 API 엔드포인트
//     // const data = await response.json();
//     // projectName.value = data.name; // API 응답에서 프로젝트 이름을 가져옴

//     // 임시 데이터
//     const exampleProjects = [
//       { id: '901', name: 'AI 기반 문서 분석 프로젝트' },
//       { id: '902', name: '스마트 제조 공정 최적화' },
//       { id: '903', name: '고객 행동 패턴 예측 시스템' },
//     ];
//     const foundProject = exampleProjects.find(p => p.id === id);
//     projectName.value = foundProject ? foundProject.name : `프로젝트 ${id}`;

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

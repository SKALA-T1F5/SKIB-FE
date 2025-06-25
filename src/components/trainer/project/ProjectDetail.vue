<template>
  <MainLayout :show-sidebar="true" sidebar-type="project" :project="projectInfoForLayout">
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import TrainerSideBar from '@/components/trainer/TrainerSideBar.vue'

const route = useRoute()
const router = useRouter()

const currentProjectId = computed(() => route.params.projectId)

// MainLayout에 project prop으로 전달할 객체를 computed로 정의합니다.
// MainLayout이 `project.projectName`을 사이드바 제목으로 사용할 것이라고 가정합니다.
const projectName = ref('') // 실제 프로젝트 이름을 담을 ref

const projectInfoForLayout = computed(() => {
  return {
    id: currentProjectId.value,
    projectName: projectName.value || `프로젝트 ${currentProjectId.value}`, // projectName이 로드되지 않았을 경우를 대비
  }
})

const tabLabels = ['문서 관리', '테스트 관리', '훈련생 관리']

const tabRoutes = computed(() => [
  `/trainer/project/${currentProjectId.value}/document`,
  `/trainer/project/${currentProjectId.value}/test`,
  `/trainer/project/${currentProjectId.value}/trainee`,
])

const activeTab = ref(0)

watch(activeTab, (val) => {
  if (router.currentRoute.value.path !== tabRoutes.value[val]) {
    router.push(tabRoutes.value[val])
  }
})

watch(
  () => route.path,
  (newPath) => {
    // 라우트 변경 시 현재 프로젝트 이름 다시 로드 (필요하다면)
    // 일반적으로는 projectId가 변경될 때만 로드하면 됩니다.
    // 하지만 ensureProjectNameIsLoaded(); 같은 호출이 필요할 수 있습니다.

    const newTabIdx = tabRoutes.value.findIndex((r) => newPath.startsWith(r))
    if (newTabIdx !== -1 && newTabIdx !== activeTab.value) {
      activeTab.value = newTabIdx
    }
  },
  { immediate: true },
)

// currentProjectId가 변경될 때마다 프로젝트 이름을 업데이트합니다.
watch(
  currentProjectId,
  (newProjectId) => {
    if (newProjectId) {
      fetchProjectName(newProjectId) // 프로젝트 ID가 변경되면 이름 다시 불러오기
    } else {
      projectName.value = '' // ID가 없으면 이름 초기화
    }
  },
  { immediate: true }, // 컴포넌트 마운트 시에도 즉시 실행
)

onMounted(() => {
  // onMounted 시점에서는 이미 currentProjectId watch에 의해 fetchProjectName이 호출될 것입니다.
  // 추가적으로 필요한 초기 로직이 있다면 여기에 추가합니다.
})

// 프로젝트 이름을 불러오는 더미 함수 (실제 API 연동 필요)
async function fetchProjectName(id) {
  try {
    // 실제 API 호출 (예: axios.get(`/api/projects/${id}`))
    // const response = await fetch(`/api/projects/${id}`);
    // const data = await response.json();
    // projectName.value = data.name;

    // 임시 데이터
    const exampleProjects = [
      { id: '901', name: 'AI 기반 문서 분석 프로젝트' },
      { id: '902', name: '스마트 제조 공정 최적화' },
      { id: '903', name: '고객 행동 패턴 예측 시스템' },
      // route.params.projectId에 오는 값이 123일 수도 있으니 추가
      { id: '123', name: '데모 프로젝트: 신입 역량 평가' },
    ]
    const foundProject = exampleProjects.find((p) => p.id === id.toString()) // id를 문자열로 비교
    projectName.value = foundProject ? foundProject.name : `프로젝트 ${id}` // 찾지 못하면 기본값
  } catch (error) {
    console.error('Failed to fetch project name:', error)
    projectName.value = `프로젝트 ${id}` // 에러 발생 시 폴백
  }
}
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

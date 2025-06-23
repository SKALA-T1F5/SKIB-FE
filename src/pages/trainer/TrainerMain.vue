<template>
  <MainLayout>
    <template #sidebar-header-content="{ isCollapsed }">
      <SearchInput
        v-if="!isCollapsed"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        @reset-filters="handleResetFilters"
      />
    </template>

    <template #sidebar="{ isCollapsed }">
      <TrainerMainSideBar
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        @reset-filters="handleResetFilters"
        :is-collapsed="isCollapsed"
      />
    </template>

    <template #content>
      <div class="main-header">
        <h2 class="welcome-message">{{ userName }} 매니저님, 반갑습니다!</h2>
      </div>

      <hr class="content-divider" />

      <div class="project-cards-container">
        <TrainerProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @manage="handleProjectAction(project, 'manage')"
        />

        <div v-if="filteredProjects.length === 0" class="no-projects-message">
          <p>해당 조건에 일치하는 프로젝트가 없습니다.</p>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/config/axios' // axios 설정을 가져옵니다.

import MainLayout from '@/components/layouts/MainLayout.vue'
import SearchInput from '@/components/layouts/SearchInput.vue'
import TrainerMainSideBar from '@/components/trainer/main/TrainerMainSideBar.vue'
import TrainerProjectCard from '@/components/trainer/main/TrainerProjectCard.vue'

const router = useRouter()
const userName = ref(localStorage.getItem('name') || '사용자')
const projects = ref([])
const searchQuery = ref('')
// Project는 Status 속성을 가지고 있지 않으므로 statusFilters 제거
// const statusFilters = ref({
//   inProgress: false,
//   completed: false,
//   pending: false,
// })

// 라우팅 실험 및 빈 데이터 상황을 위한 임시 프로젝트 데이터
const exampleProjects = [
  {
    id: 901,
    name: '예시 프로젝트 A',
    description: '이것은 라우팅 실험을 위한 예시 프로젝트 A입니다.',
    startDate: '2024-01-15',
    // status: '진행 중', // Project는 Status 속성을 가지고 있지 않으므로 제거
  },
  {
    id: 902,
    name: '예시 프로젝트 B',
    description: '이것은 라우팅 실험을 위한 예시 프로젝트 B입니다.',
    startDate: '2024-03-01',
    // status: '완료', // Project는 Status 속성을 가지고 있지 않으므로 제거
  },
  {
    id: 903,
    name: '예시 프로젝트 C',
    description: '이것은 라우팅 실험을 위한 예시 프로젝트 C입니다.',
    startDate: '2024-05-20',
    // status: '대기 중', // Project는 Status 속성을 가지고 있지 않으므로 제거
  },
]

// 검색어를 기반으로 프로젝트를 필터링하는 computed 속성
const filteredProjects = computed(() => {
  let currentProjects = projects.value

  // 검색어 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    currentProjects = currentProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query),
    )
  }

  // Project는 Status 속성을 가지고 있지 않으므로 상태 필터링 로직 제거
  // const isInProgressChecked = statusFilters.value.inProgress
  // const isCompletedChecked = statusFilters.value.completed
  // const isPendingChecked = statusFilters.value.pending

  // if (isInProgressChecked || isCompletedChecked || isPendingChecked) {
  //   currentProjects = currentProjects.filter((project) => {
  //     let matchStatusFilter = false
  //     if (isInProgressChecked && project.status === '진행 중') {
  //       matchStatusFilter = true
  //     }
  //     if (isCompletedChecked && project.status === '완료') {
  //       matchStatusFilter = true
  //     }
  //     if (isPendingChecked && project.status === '대기 중') {
  //       matchStatusFilter = true
  //     }
  //     return matchStatusFilter
  //   })
  // }

  // 필터가 적용되지 않은 경우 모든 프로젝트 반환
  // Project는 Status 속성을 가지고 있지 않으므로 statusFilters.value 조건 제거
  if (!searchQuery.value) {
    return projects.value
  }

  return currentProjects
})

// 프로젝트 목록을 불러오는 함수
const fetchProjects = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.')
      router.push('/login')
      return
    }

    const response = await api.get('/project/getUserProjectList', {
      params: {
        userId: parseInt(userId),
      },
    })

    const fetchedProjectData = response.data?.resultData?.projects
    if (Array.isArray(fetchedProjectData) && fetchedProjectData.length > 0) {
      projects.value = fetchedProjectData.map((project) => ({
        id: project.projectId,
        name: project.projectName,
        description: project.projectDescription,
        startDate: project.createdAt?.slice(0, 10) || '', // 'YYYY-MM-DD' 형식
      }))
    } else {
      console.warn(
        'API에서 프로젝트 데이터를 불러오지 못했거나 데이터가 비어있습니다. 예시 프로젝트를 로드합니다.',
      )
      projects.value = exampleProjects
    }
    console.log('로드된 프로젝트:', projects.value)
  } catch (error) {
    console.error('프로젝트 데이터를 불러오는 데 실패했습니다:', error)
    alert(
      '프로젝트 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요. 예시 프로젝트를 로드합니다.',
    )
    projects.value = exampleProjects
  }
}

// 필터 초기화 함수
const handleResetFilters = () => {
  searchQuery.value = ''
  // Project는 Status 속성을 가지고 있지 않으므로 statusFilters 초기화 제거
  // statusFilters.value = {
  //   inProgress: false,
  //   completed: false,
  //   pending: false,
  // }
  fetchProjects() // 필터 초기화 후 프로젝트 재조회
}

// 프로젝트 카드 액션 처리 함수 (수정, 삭제, 관리)
const handleProjectAction = (project, actionType) => {
  console.log(`'${project.name}' ${actionType} 요청 (Project ID: ${project.id})`)
  if (actionType === 'manage') {
    localStorage.setItem('projectId', project.id)
    // TrainerDocumentManagement.vue 페이지로 이동하도록 경로를 수정합니다.
    router.push(`/trainer/project/${project.id}/document`)
  }
  // 트레이너는 프로젝트를 수정하거나 삭제할 수 없으므로 해당 로직 제거
  // else if (actionType === 'edit') {
  //   alert(`프로젝트 "${project.name}" 수정 기능을 구현해야 합니다.`)
  // } else if (actionType === 'delete') {
  //   if (confirm(`정말로 프로젝트 "${project.name}"을 삭제하시겠습니까?`)) {
  //     alert(`프로젝트 "${project.name}" 삭제 기능을 구현해야 합니다.`)
  //   }
  // }
}

// 컴포넌트 마운트 시 프로젝트 목록 조회
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
/* MainLayout.vue에 전반적인 레이아웃 스타일이 정의되었으므로,
    여기서는 콘텐츠 영역에 특화된 스타일만 유지합니다. */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  margin-top: 0px;
}

.welcome-message {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

/* 프로젝트 추가 버튼 제거로 인한 불필요 스타일 제거 */
/*
.add-test-button {
  background-color: #e0e0e0;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.add-test-button:hover {
  background-color: #d0d0d0;
}
*/

.content-divider {
  border: 0;
  border-top: 1px solid black;
  margin: -13px 0px 10px 0px;
}

.project-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  grid-auto-rows: minmax(auto, auto);
}

@media (max-width: 1200px) {
  .project-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 900px) {
  .project-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 600px) {
  .project-cards-container {
    grid-template-columns: 1fr;
  }
}

.no-projects-message {
  width: 100%;
  text-align: center;
  padding: 50px;
  color: #777;
  font-size: 16px;
}
</style>

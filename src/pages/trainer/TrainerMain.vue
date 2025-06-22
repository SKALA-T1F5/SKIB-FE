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
        :statusFilters="statusFilters"
        @update:searchQuery="searchQuery = $event"
        @update:statusFilters="statusFilters = $event"
        @reset-filters="handleResetFilters"
        :is-collapsed="isCollapsed"
      />
    </template>

    <template #content>
      <div class="main-header">
        <h2 class="welcome-message">{{ userName }} 매니저님, 반갑습니다!</h2>
        <button class="add-test-button" @click="showAddProjectModal">+ 프로젝트 추가</button>
      </div>

      <hr class="content-divider" />

      <div class="project-cards-container">
        <TrainerProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @edit="handleProjectAction(project, 'edit')"
          @delete="handleProjectAction(project, 'delete')"
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
// import AddProjectModal from '@/components/trainer/main/AddProjectModal.vue' // 모달을 구현할 경우 주석 해제

const router = useRouter()
const userName = ref(localStorage.getItem('name') || '사용자')
const userRole = ref(localStorage.getItem('role') || 'Trainer')
const projects = ref([])
const searchQuery = ref('')
const statusFilters = ref({
  inProgress: false,
  completed: false,
  pending: false,
})

// 라우팅 실험 및 빈 데이터 상황을 위한 임시 프로젝트 데이터
const exampleProjects = [
  { id: 901, name: '예시 프로젝트 A', description: '이것은 라우팅 실험을 위한 예시 프로젝트 A입니다.', startDate: '2024-01-15', status: '진행 중' },
  { id: 902, name: '예시 프로젝트 B', description: '이것은 라우팅 실험을 위한 예시 프로젝트 B입니다.', startDate: '2024-03-01', status: '완료' },
  { id: 903, name: '예시 프로젝트 C', description: '이것은 라우팅 실험을 위한 예시 프로젝트 C입니다.', startDate: '2024-05-20', status: '대기 중' },
];

// 검색어 및 상태 필터를 기반으로 프로젝트를 필터링하는 computed 속성
const filteredProjects = computed(() => {
  let currentProjects = projects.value;

  // 검색어 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    currentProjects = currentProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query),
    );
  }

  const isInProgressChecked = statusFilters.value.inProgress;
  const isCompletedChecked = statusFilters.value.completed;
  const isPendingChecked = statusFilters.value.pending;

  // 상태별 필터링
  if (isInProgressChecked || isCompletedChecked || isPendingChecked) {
    currentProjects = currentProjects.filter((project) => {
      let matchStatusFilter = false;
      if (isInProgressChecked && project.status === '진행 중') {
        matchStatusFilter = true;
      }
      if (isCompletedChecked && project.status === '완료') {
        matchStatusFilter = true;
      }
      if (isPendingChecked && project.status === '대기 중') {
        matchStatusFilter = true;
      }
      return matchStatusFilter;
    });
  }

  // 필터가 적용되지 않은 경우 모든 프로젝트 반환
  if (
    !searchQuery.value &&
    !isInProgressChecked &&
    !isCompletedChecked &&
    !isPendingChecked
  ) {
    return projects.value; // 필터가 없으면 모든 로드된 프로젝트 (API 또는 예시) 반환
  }

  return currentProjects;
});

// 프로젝트 추가 모달 상태 (구현할 경우 사용)
// const addProjectModalVisible = ref(false)
// const showAddProjectModal = () => {
//   addProjectModalVisible.value = true
// }
// const hideAddProjectModal = () => {
//   addProjectModalVisible.value = false
// }
// const addProject = async (newProjectData) => {
//   console.log('새 프로젝트 추가:', newProjectData)
//   // 프로젝트 추가 API 호출 구현
//   // await api.post('/api/projects', newProjectData)
//   // await fetchProjects()
//   // hideAddProjectModal()
// }

// 프로젝트 목록을 불러오는 함수
const fetchProjects = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    const response = await api.get('/api/project/getUserProjectList', {
      params: {
        userId: parseInt(userId),
      },
    });

    const fetchedProjectData = response.data?.resultData?.projects;
    if (Array.isArray(fetchedProjectData) && fetchedProjectData.length > 0) {
      projects.value = fetchedProjectData.map((project) => ({
        id: project.projectId,
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        status: project.status,
      }));
    } else {
      console.warn('API에서 프로젝트 데이터를 불러오지 못했거나 데이터가 비어있습니다. 예시 프로젝트를 로드합니다.');
      projects.value = exampleProjects; // API 데이터가 없으면 예시 프로젝트 로드
    }
    console.log('로드된 프로젝트:', projects.value);
  } catch (error) {
    console.error('프로젝트 데이터를 불러오는 데 실패했습니다:', error);
    alert('프로젝트 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요. 예시 프로젝트를 로드합니다.');
    projects.value = exampleProjects; // 오류 발생 시에도 예시 프로젝트 로드
  }
};

// 필터 초기화 함수
const handleResetFilters = () => {
  searchQuery.value = '';
  statusFilters.value = {
    inProgress: false,
    completed: false,
    pending: false,
  };
  fetchProjects(); // 필터 초기화 후 프로젝트 재조회
};

// 프로젝트 카드 액션 처리 함수 (수정, 삭제, 관리)
const handleProjectAction = (project, actionType) => {
  console.log(`'${project.name}' ${actionType} 요청 (Project ID: ${project.id})`);
  if (actionType === 'manage') {
    // 예시 프로젝트는 ID가 900번대이므로, 이를 분기하여 처리할 수 있습니다.
    if (project.id >= 900 && project.id <= 999) {
      alert(`예시 프로젝트 "${project.name}"에 대한 관리 페이지로 이동합니다. 실제 로직은 구현되어 있지 않습니다.`);
      // 실제 라우팅이나 특정 로직을 여기에 추가
      router.push(`/trainer/project/${project.id}`); // 예시 프로젝트도 라우팅 가능하도록
    } else {
      localStorage.setItem('projectId', project.id);
      router.push(`/trainer/project/${project.id}`);
    }
  } else if (actionType === 'edit') {
    alert(`프로젝트 "${project.name}" 수정 기능을 구현해야 합니다.`);
  } else if (actionType === 'delete') {
    if (confirm(`정말로 프로젝트 "${project.name}"을 삭제하시겠습니까?`)) {
      alert(`프로젝트 "${project.name}" 삭제 기능을 구현해야 합니다.`);
    }
  }
};

// 컴포넌트 마운트 시 프로젝트 목록 조회
onMounted(() => {
  fetchProjects();
});
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
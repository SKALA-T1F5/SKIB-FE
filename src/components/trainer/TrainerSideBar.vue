<template>
  <div :class="['trainer-sidebar-content', { 'is-collapsed': isCollapsed }]">
    <div class="project-list-wrapper" v-if="!isCollapsed">
      <div
        v-for="project in projects"
        :key="project.id"
        :class="['project-item-sidebar', { active: project.id === currentProjectId }]"
        @click="selectProject(project.id)"
      >
        <v-icon size="20" class="project-icon">mdi-folder-star-outline</v-icon>
        <span class="project-name">{{ project.name }}</span>
        <v-icon v-if="project.id === currentProjectId" size="20" class="current-project-indicator"
          >mdi-chevron-right</v-icon
        >
      </div>
    </div>
    <div v-else class="project-list-collapsed">
      <v-icon size="30" color="white">mdi-folder-multiple-outline</v-icon>
    </div>

    <div :class="['project-count-footer', { 'is-collapsed': isCollapsed }]">
      <span v-if="!isCollapsed" class="expanded-project-count"
        >총 프로젝트: {{ projects.length }}개</span
      >
      <span v-else class="collapsed-project-count">{{ projects.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, watch, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/config/axios' // axios 설정을 가져옵니다.

const props = defineProps({
  isCollapsed: Boolean, // MainLayout에서 전달되는 사이드바 접힘 상태
})

const router = useRouter()
const route = useRoute() // 현재 라우트 정보를 가져오기 위해 사용
const projects = ref([])
const currentProjectId = ref(null) // 현재 활성화된 프로젝트 ID

// 라우팅 실험 및 빈 데이터 상황을 위한 임시 프로젝트 데이터
const exampleProjects = [
  {
    id: 901,
    name: 'AI 기반 문서 분석 프로젝트 (예시)',
    description: '이것은 AI 문서 분석을 위한 예시 프로젝트입니다.',
    startDate: '2024-01-15',
  },
  {
    id: 902,
    name: '스마트 제조 공정 최적화 (예시)',
    description: '제조 공정 데이터 분석 및 최적화 프로젝트',
    startDate: '2024-03-01',
  },
  {
    id: 903,
    name: '고객 행동 패턴 예측 시스템 (예시)',
    description: '사용자 데이터 기반 행동 예측 시스템 구축',
    startDate: '2024-05-20',
  },
]

// 프로젝트 목록을 불러오는 함수
const fetchProjects = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      console.error('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요. 예시 데이터를 로드합니다.')
      projects.value = exampleProjects // 개발 편의를 위해 예시 데이터 로드
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
    projects.value = exampleProjects // API 호출 실패 시 예시 데이터 로드
  }
}

// 프로젝트 선택 및 라우팅
const selectProject = (projectId) => {
  if (currentProjectId.value === projectId) {
    return // 이미 선택된 프로젝트면 아무것도 하지 않음
  }
  currentProjectId.value = projectId
  // 로컬 스토리지에 projectId 저장 (TrainerTestManagement 등에서 사용)
  localStorage.setItem('projectId', projectId)
  router.push(`/trainer/project/${projectId}/test`)
}

// 현재 라우트의 projectId를 감지하여 currentProjectId 업데이트
watch(
  () => route.params.projectId,
  (newProjectId) => {
    if (newProjectId) {
      currentProjectId.value = parseInt(newProjectId) // 라우트 파라미터는 문자열이므로 숫자로 변환
      // 라우트 변경 시 로컬 스토리지에 projectId 저장 (최초 로드 또는 직접 URL 접근 시)
      localStorage.setItem('projectId', newProjectId)
    } else {
      currentProjectId.value = null // projectId가 없으면 null
      localStorage.removeItem('projectId') // projectId가 없으면 로컬 스토리지에서도 제거
    }
  },
  { immediate: true }, // 컴포넌트 마운트 시 즉시 실행
)

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.trainer-sidebar-content {
  width: 100%;
  height: 100%;
  padding: 0 10px 20px 0px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column; /* 자식 요소들을 세로로 정렬 */
  position: relative; /* 하단 고정을 위해 relative 설정 */
}

.trainer-sidebar-content.is-collapsed {
  padding: 0;
  align-items: center; /* 아이콘과 텍스트를 중앙으로 */
}

.project-list-wrapper {
  flex-grow: 1; /* 남은 공간을 차지하여 목록이 위로 밀착되도록 */
  overflow-y: auto; /* 프로젝트 목록이 길어질 경우 스크롤 */
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-right: 10px; /* 사이드바 우측 패딩을 목록에만 적용 */
  /* margin-top: 10px; // 이 부분을 제거하거나 0으로 설정하여 상단 여백을 줄입니다. */
}

/* MainLayout에서 헤더 타이틀이 관리되므로, TrainerSideBar 내부의 이 스타일은 더 이상 필요 없습니다. */
/* .sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 12px;
  color: #333;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
} */

.project-item-sidebar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.2s ease;
  color: #333;
  border-left: 3px solid transparent;
}

.project-item-sidebar:hover {
  background-color: #e0e0f2;
  color: #191d5a;
  border-left-color: #191d5a;
}

.project-item-sidebar.active {
  background-color: #191d5a;
  color: white;
  font-weight: 600;
  border-left-color: #191d5a;
}

.project-item-sidebar.active .project-icon,
.project-item-sidebar.active .current-project-indicator {
  color: white !important;
}

.project-icon {
  margin-right: 10px;
  color: #666;
  transition: color 0.2s ease;
}

.project-name {
  flex-grow: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-project-indicator {
  margin-left: auto;
  color: #191d5a;
}

.project-item-sidebar:hover .project-icon,
.project-item-sidebar:hover .current-project-indicator {
  color: #191d5a;
}

.project-list-collapsed {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 20px;
}

.project-count-footer {
  padding: 15px 12px;
  border-top: 1px solid #eee;
  background-color: #eef2f6;
  color: #555;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  flex-shrink: 0;
  transition: all 0.3s ease-in-out;
}

.project-count-footer.is-collapsed {
  text-align: center;
  padding: 10px 0;
}

.expanded-project-count {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapsed-project-count {
  font-weight: bold;
  font-size: 16px;
  /* 이전에는 white였으나, collapsed sidebar의 배경색을 따르도록 inherit으로 변경 */
  color: inherit; /* 변경: collapsed sidebar의 색상과 일치하도록 */
}
</style>

<template>
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">훈련생 관리</h2>
      <p class="section-subtitle">
        프로젝트에 배정된 훈련생 목록을 확인하고 테스트 결과를 관리합니다.
      </p>
    </div>

    <section class="trainee-management-section section-bg">
      <div class="section-header">
        <h4 class="section-title">프로젝트 훈련생 목록</h4>
        <v-col cols="12" md="4" class="search-col">
          <v-text-field
            v-model="searchQuery"
            label="훈련생 검색"
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
            hide-details
            variant="outlined"
            class="rounded-input"
          />
        </v-col>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredTrainees"
        :items-per-page="10"
        class="elevation-0 trainee-table"
        no-data-text="해당하는 훈련생이 없습니다."
        item-key="id"
        show-expand
        single-expand
        v-model:expanded="expanded"
      >
        <template v-slot:item.name="{ item }">
          <div class="trainee-info-cell">
            <v-icon small class="mr-2">mdi-account-circle</v-icon>
            <strong>{{ item.name }}</strong>
          </div>
        </template>
        <template v-slot:item.email="{ item }">
          {{ item.email }}
        </template>
        <template v-slot:item.affiliation="{ item }">
          {{ item.affiliation }}
        </template>
        <template v-slot:item.assignedDate="{ item }">
          {{ item.assignedDate }}
        </template>

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length + 1" class="expanded-test-results-cell">
            <TraineeTestResults :trainee-id="item.id" />
          </td>
        </template>

        <template v-slot:no-data>
          <div class="no-results-table">
            <v-icon size="64" color="grey lighten-1">mdi-account-remove</v-icon>
            <p class="no-results-text">해당하는 훈련생이 없습니다.</p>
          </div>
        </template>
      </v-data-table>

      <div class="list-footer">
        <span class="total-count">총 {{ filteredTrainees.length }}명 훈련생</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import TraineeTestResults from '@/components/trainer/trainee/TraineeTestResults.vue'
import axios from 'axios'

const route = useRoute()

const trainees = ref([])
const searchQuery = ref('')
const expanded = ref([])
const projectId = ref(null)

const headers = [
  { title: '이름', value: 'name', align: 'start', sortable: true },
  { title: '이메일', value: 'email', sortable: true },
  { title: '소속', value: 'affiliation', sortable: true },
  { title: '배정일', value: 'assignedDate', sortable: true },
  { title: '', value: 'data-table-expand', sortable: false },
]

const filteredTrainees = computed(() => {
  if (!searchQuery.value) {
    return trainees.value
  }
  const lowerCaseSearch = searchQuery.value.toLowerCase()
  return trainees.value.filter(
    (trainee) =>
      trainee.name.toLowerCase().includes(lowerCaseSearch) ||
      trainee.email.toLowerCase().includes(lowerCaseSearch) ||
      trainee.affiliation.toLowerCase().includes(lowerCaseSearch) ||
      trainee.id.toLowerCase().includes(lowerCaseSearch),
  )
})

const fetchTrainees = async () => {
  try {
    projectId.value = route.params.projectId || 4 // 실제 프로젝트 ID에 맞게 조정 필요

    if (!projectId.value) {
      console.warn('projectId가 없습니다. API 호출을 건너뜁니다.')
      return
    }

    const response = await axios.get('/project/getProjectUsers', {
      params: {
        projectId: projectId.value,
      },
    })

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      // type이 'TRAINEE'인 사용자만 필터링
      trainees.value = response.data.resultData.trainee.map((trainee) => ({
        id: trainee.userId,
        name: trainee.name,
        email: trainee.email,
        affiliation: trainee.department,
        assignedDate: trainee.createdAt.split('T')[0],
      }))
    } else {
      console.error('API 응답 오류:', response.data.resultMsg)
      trainees.value = []
    }
  } catch (error) {
    console.error('훈련생 목록을 불러오는 중 오류 발생:', error)
    trainees.value = []
  }
}

onMounted(() => {
  fetchTrainees()
})
</script>

<style scoped>
/* TrainerDocumentManagement.vue 스타일 기반 */
.common-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 12px;
}

.header-section {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  margin-bottom: 24px;
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  color: #333;
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  white-space: nowrap;
  line-height: 1;
  padding-bottom: 2px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  font-family: inherit;
}

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px;
  margin-bottom: 32px;
}

.trainee-management-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

/* 검색 필드 관련 스타일 수정 */
.search-col {
  padding-top: 0;
  padding-bottom: 0;
  max-width: 250px; /* 기존 search-field의 max-width 유지 */
}

.rounded-input :deep(.v-input__control) {
  border-radius: 8px !important;
}

.trainee-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.trainee-info-cell {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #333;
}

/* 확장된 행의 내부 여백 제거 */
.expanded-test-results-cell {
  padding: 0 !important;
  background-color: #f7f9fc; /* 확장된 부분 배경색 살짝 다르게 */
}

.no-results-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #aaa;
  font-size: 1.1rem;
  background-color: #ffffff;
  border-radius: 0 0 8px 8px;
}

.no-results-text {
  margin-top: 15px;
}

.list-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 0 0 0;
}

.total-count {
  color: #888;
  font-size: 0.95rem;
}

/* Vuetify 컴포넌트 오버라이드 */
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: #444 !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
  font-size: 0.95rem !important;
  color: #555 !important;
}

/* 확장 아이콘 색상 및 크기 조정 */
.v-data-table .v-data-table__expand-icon {
  color: #1976d2 !important; /* primary blue */
  font-size: 18px !important;
}
</style>

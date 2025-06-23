<template>
  <AILoading :show="isLoading" :message="loadingMessage" />
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">연수생 관리</h2>
      <p class="section-subtitle">
        프로젝트에 배정된 연수생 목록을 확인하고 테스트 결과를 관리합니다.
      </p>
    </div>

    <section class="trainee-management-section section-bg">
      <div class="section-header">
        <h4 class="section-title">프로젝트 연수생 목록</h4>
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          label="연수생 검색"
          single-line
          hide-details
          dense
          class="search-field"
        ></v-text-field>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredTrainees"
        :items-per-page="10"
        class="elevation-0 trainee-table"
        no-data-text="해당하는 연수생이 없습니다."
        :loading="isLoading"
        loading-text="연수생 목록을 불러오는 중입니다..."
        item-key="id"
        show-expand
        single-expand
        :expanded.sync="expanded"
      >
        <template v-slot:item.name="{ item }">
          <div class="trainee-info-cell">
            <v-icon small class="mr-2">mdi-account-circle</v-icon>
            <strong>{{ item.name }}</strong>
          </div>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'Active' ? 'green darken-1' : 'orange darken-1'"
            x-small
            label
            text-color="white"
          >
            {{ item.status === 'Active' ? '활동 중' : '비활성' }}
          </v-chip>
        </template>
        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length + 1" class="expanded-test-results-cell">
            <TraineeTestResults :trainee-id="item.id" />
          </td>
        </template>
        <template v-slot:no-data>
          <div class="no-results-table">
            <v-icon size="64" color="grey lighten-1">mdi-account-remove</v-icon>
            <p class="no-results-text">해당하는 연수생이 없습니다.</p>
          </div>
        </template>
      </v-data-table>

      <div class="list-footer">
        <span class="total-count">총 {{ filteredTrainees.length }}명 연수생</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AILoading from '@/components/layouts/AiLoading.vue'
import TraineeTestResults from '@/components/trainer/trainee/TraineeTestResults.vue' // 이 컴포넌트가 개별 테스트 목록을 담당

const route = useRoute()

const isLoading = ref(true)
const loadingMessage = ref('연수생 목록을 불러오는 중입니다...')
const trainees = ref([])
const searchQuery = ref('')
const expanded = ref([]) // 확장된 행을 추적하기 위한 배열

const headers = [
  { title: '이름', value: 'name', align: 'start', sortable: true },
  { title: '이메일', value: 'email', sortable: true },
  { title: '소속', value: 'affiliation', sortable: true },
  { title: '배정일', value: 'assignedDate', sortable: true },
  { title: '상태', value: 'status', sortable: true },
  { title: '', value: 'data-table-expand', sortable: false }, // 확장 아이콘을 위한 Vuetify 특수 헤더
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
  isLoading.value = true
  loadingMessage.value = '연수생 목록을 불러오는 중입니다...'
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    trainees.value = [
      {
        id: 'T-001',
        name: '김철수',
        email: 'kim.cs@example.com',
        affiliation: 'A팀',
        assignedDate: '2024-01-15',
        status: 'Active',
      },
      {
        id: 'T-002',
        name: '이영희',
        email: 'lee.yh@example.com',
        affiliation: 'B팀',
        assignedDate: '2024-02-01',
        status: 'Active',
      },
      {
        id: 'T-003',
        name: '박민수',
        email: 'park.ms@example.com',
        affiliation: 'A팀',
        assignedDate: '2024-03-10',
        status: 'Inactive',
      },
      {
        id: 'T-004',
        name: '최지영',
        email: 'choi.jy@example.com',
        affiliation: 'C팀',
        assignedDate: '2024-03-22',
        status: 'Active',
      },
      {
        id: 'T-005',
        name: '정대현',
        email: 'jung.dh@example.com',
        affiliation: 'B팀',
        assignedDate: '2024-04-05',
        status: 'Active',
      },
      {
        id: 'T-006',
        name: '홍길동',
        email: 'hong.gd@example.com',
        affiliation: 'C팀',
        assignedDate: '2024-04-10',
        status: 'Inactive',
      },
    ]
  } catch (error) {
    console.error('연수생 목록 가져오기 실패 (Mock):', error)
    trainees.value = []
  } finally {
    isLoading.value = false
    loadingMessage.value = '데이터 로딩 중입니다...'
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
  padding: 24px; /* 원래 24px 24px 24px 24px 였지만, 아래에서 덮어쓸 여지를 남김 */
  margin-bottom: 32px;
}

.trainee-management-section {
  padding: 24px; /* section-bg의 패딩을 명시적으로 적용 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.search-field {
  max-width: 250px;
}

.trainee-table {
  background-color: #ffffff; /* 테이블 배경색 */
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
  background-color: #ffffff; /* 테이블 내부 배경색 */
  border-radius: 0 0 8px 8px; /* 하단만 둥글게 */
}

.no-results-text {
  margin-top: 15px;
}

.list-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 0 0 0; /* 테이블 하단에 간격 추가 */
}

.total-count {
  color: #888;
  font-size: 0.95rem;
}

/* Vuetify 컴포넌트 오버라이드 */
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  font-size: 1rem !important; /* 테이블 헤더 폰트 크기 */
  font-weight: 600 !important;
  color: #444 !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
  font-size: 0.95rem !important; /* 테이블 셀 폰트 크기 */
  color: #555 !important;
}

/* 확장 아이콘 색상 및 크기 조정 */
.v-data-table .v-data-table__expand-icon {
  color: #1976d2 !important; /* primary blue */
  font-size: 18px !important;
}
</style>

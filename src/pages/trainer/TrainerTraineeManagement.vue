<template>
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
import TraineeTestResults from '@/components/trainer/trainee/TraineeTestResults.vue'

const route = useRoute()

const trainees = ref([])
const searchQuery = ref('')
const expanded = ref([]) // 확장된 행을 추적하기 위한 배열

// 1. 인적사항 목록: 이름, 이메일, 소속, 배정일만 나타나도록 headers 정의
const headers = [
  { title: '이름', value: 'name', align: 'start', sortable: true },
  { title: '이메일', value: 'email', sortable: true },
  { title: '소속', value: 'affiliation', sortable: true },
  { title: '배정일', value: 'assignedDate', sortable: true },
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
  // 실제 API 호출 대신 목업 데이터 사용
  trainees.value = [
    {
      id: 'T-001',
      name: '김철수',
      email: 'kim.cs@example.com',
      affiliation: 'A팀',
      assignedDate: '2024-01-15',
    },
    {
      id: 'T-002',
      name: '이영희',
      email: 'lee.yh@example.com',
      affiliation: 'B팀',
      assignedDate: '2024-02-01',
    },
    {
      id: 'T-003',
      name: '박민수',
      email: 'park.ms@example.com',
      affiliation: 'A팀',
      assignedDate: '2024-03-10',
    },
    {
      id: 'T-004',
      name: '최지영',
      email: 'choi.jy@example.com',
      affiliation: 'C팀',
      assignedDate: '2024-03-22',
    },
    {
      id: 'T-005',
      name: '정대현',
      email: 'jung.dh@example.com',
      affiliation: 'B팀',
      assignedDate: '2024-04-05',
    },
    {
      id: 'T-006',
      name: '홍길동',
      email: 'hong.gd@example.com',
      affiliation: 'C팀',
      assignedDate: '2024-04-10',
    },
  ]
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

.search-field {
  max-width: 250px;
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

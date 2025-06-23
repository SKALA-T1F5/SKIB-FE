<template>
  <v-card class="elevation-1 common-card">
    <v-card-title class="common-card-title">
      <v-icon left>mdi-account-group</v-icon>
      프로젝트 배정 훈련생 목록
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="훈련생 검색"
        single-line
        hide-details
        dense
        class="search-field"
      ></v-text-field>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="filteredTrainees"
        :items-per-page="10"
        class="elevation-0"
        no-data-text="배정된 훈련생이 없습니다."
        :loading="isLoading"
        loading-text="훈련생 목록을 불러오는 중입니다..."
      >
        <template v-slot:item.actions="{ item }">
          <v-btn small color="primary" @click="emitViewResults(item.id)" class="action-button">
            테스트 결과 보기
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['view-results'])

const isLoading = ref(true)
const trainees = ref([])
const search = ref('')

const headers = [
  { title: '훈련생 ID', value: 'id', align: 'start', sortable: true },
  { title: '이름', value: 'name', sortable: true },
  { title: '이메일', value: 'email', sortable: false },
  { title: '배정일', value: 'assignedDate', sortable: true },
  { title: '상태', value: 'status', sortable: true },
  { title: '작업', value: 'actions', sortable: false },
]

const filteredTrainees = computed(() => {
  if (!search.value) {
    return trainees.value
  }
  const lowerCaseSearch = search.value.toLowerCase()
  return trainees.value.filter(
    (trainee) =>
      trainee.name.toLowerCase().includes(lowerCaseSearch) ||
      trainee.email.toLowerCase().includes(lowerCaseSearch) ||
      trainee.id.toLowerCase().includes(lowerCaseSearch),
  )
})

const fetchTrainees = async () => {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    trainees.value = [
      {
        id: 'T-001',
        name: '김철수',
        email: 'kim.cs@example.com',
        assignedDate: '2024-01-15',
        status: 'Active',
      },
      {
        id: 'T-002',
        name: '이영희',
        email: 'lee.yh@example.com',
        assignedDate: '2024-02-01',
        status: 'Active',
      },
      {
        id: 'T-003',
        name: '박민수',
        email: 'park.ms@example.com',
        assignedDate: '2024-03-10',
        status: 'Inactive',
      },
      {
        id: 'T-004',
        name: '최지영',
        email: 'choi.jy@example.com',
        assignedDate: '2024-03-22',
        status: 'Active',
      },
      {
        id: 'T-005',
        name: '정대현',
        email: 'jung.dh@example.com',
        assignedDate: '2024-04-05',
        status: 'Active',
      },
    ]
  } catch (error) {
    console.error('Failed to fetch trainees:', error)
    trainees.value = []
  } finally {
    isLoading.value = false
  }
}

const emitViewResults = (traineeId) => {
  emit('view-results', traineeId)
}

onMounted(() => {
  fetchTrainees()
})
</script>

<style scoped>
.common-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.common-card-title {
  padding: 16px 24px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.common-card-title .v-icon {
  margin-right: 10px;
  color: #1976d2; /* Primary blue */
}

.search-field {
  max-width: 300px;
}

.action-button {
  margin: 5px 0;
}
</style>

<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">테스트 생성</h2>
        <p class="section-subtitle">
          Step 2 of 4 : 빠른 테스트를 구성할 문제와 조건을 선택하고 다음 단계로 이동하세요.
        </p>
      </div>
      <v-progress-linear
        :model-value="50"
        height="10"
        color="#191d5a"
        bg-color="#191d5a"
        rounded
      ></v-progress-linear>
    </v-col>
  </v-row>

  <v-row class="mt-4">
    <v-col cols="12">
      <div class="section-bg test-config-section">
        <h4 class="section-title">테스트 기본 설정</h4>
        <v-form ref="form" v-model="formValid">
          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model="testName"
                label="테스트명"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
                :rules="[(v) => !!v || '테스트명을 입력해주세요.']"
                required
                bg-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model.number="totalTestQuestions"
                label="생성할 테스트의 총 문제 수"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                min="1"
                :max="totalAvailableQuestions"
                class="mb-4"
                :rules="[
                  (v) => !!v || '총 문제 수를 입력해주세요.',
                  (v) => v >= 1 || '총 문제 수는 1개 이상이어야 합니다.',
                  (v) =>
                    v <= totalAvailableQuestions ||
                    `총 문제 수는 저장된 총 문제 수 (${totalAvailableQuestions}개)를 초과할 수 없습니다.`,
                  (v) => v !== '' || '총 문제 수를 입력해주세요.',
                ]"
                bg-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model.number="testDuration"
                label="응시 제한 시간 (분)"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                min="1"
                class="mb-4"
                :rules="[
                  (v) => !!v || '응시 시간을 입력해주세요.',
                  (v) => v >= 1 || '응시 시간은 1분 이상이어야 합니다.',
                ]"
                bg-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model.number="passingScore"
                label="합격 기준 점수"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                min="0"
                max="100"
                class="mb-4"
                :rules="[
                  (v) =>
                    (v !== null && v !== undefined && v !== '') || '합격 기준 점수를 입력해주세요.',
                  (v) => (v >= 0 && v <= 100) || '합격 기준 점수는 0점에서 100점 사이여야 합니다.',
                  (v) => v !== '' || '합격 기준 점수를 입력해주세요.',
                ]"
                bg-color="white"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-col>
  </v-row>

  <v-row class="mt-4">
    <v-col cols="12">
      <div class="section-bg document-list-section fill-height">
        <h4 class="section-title">문서 목록</h4>
        <div class="total-available-questions-info mb-4">
          <span class="font-weight-bold">저장된 총 문제: {{ totalAvailableQuestions }}개</span>
        </div>
        <div class="document-table-container">
          <v-data-table
            :headers="headers"
            :items="internalRevenues"
            item-value="name"
            class="elevation-0"
            hide-default-footer
            disable-pagination
          >
            <template v-slot:item.totalQuestionsPerDoc="{ item }">
              {{ item.questionCount || 0 }}
            </template>
          </v-data-table>
        </div>
      </div>
    </v-col>
  </v-row>

  <v-row class="bottom-fixed-actions">
    <v-col cols="12" class="d-flex justify-space-between align-center px-0">
      <v-btn
        variant="flat"
        color="grey"
        class="force-white"
        @click="emitPrevStep"
        :disabled="props.isLoading"
        >이전 단계</v-btn
      >
      <v-tooltip :text="disabledReason" location="top" :disabled="isFormValid">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            variant="flat"
            color="#191d5a"
            @click="emitNextStep"
            :disabled="props.isLoading || !isFormValid"
            >다음 단계</v-btn
          >
        </template>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, watch, onMounted } from 'vue'
import axios from '@/config/axios'
import { useRoute } from 'vue-router'

const props = defineProps({
  revenues: {
    type: Array,
    default: () => [],
  },
  isLoading: Boolean,
})

const emit = defineEmits(['update:revenues', 'prev-step', 'next-step'])

const route = useRoute()

const internalRevenues = ref([])

const testName = ref('')
const totalTestQuestions = ref(0)
const testDuration = ref(60)
const passingScore = ref(60)

const form = ref(null)
const formValid = ref(false)

const currentProjectId = computed(
  () => route.params.projectId || localStorage.getItem('projectId') || 'mock-project-123',
)

const fetchDocumentQuestionCounts = async () => {
  emit('update:isLoading', true) // 로딩 시작
  try {
    const response = await axios.get('/test/document-question-counts', {
      params: { projectId: currentProjectId.value },
    })

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      internalRevenues.value = response.data.resultData.map((doc) => ({
        id: doc.documentId,
        name: doc.documentName,
        questionCount: doc.questionCount, // API에서 받은 questionCount를 사용
        // 이 외에 필요한 필드가 있다면 여기에 추가 (예: keyword, selected, mcSet, sqSet 등)
        // 현재 API 응답에는 keyword 정보가 없으므로 빈 배열로 초기화하거나 백엔드에서 제공하도록 요청해야 합니다.
        keyword: [],
        selected: true, // 기본적으로 선택된 상태로 가정
        mcSet: 0, // 빠른 생성에서는 mcCount/sqCount 대신 questionCount로 총 문제를 다루므로 0으로 설정
        sqSet: 0,
      }))
      // TestQuickConfig에서는 이전에 revenues prop을 받아서 사용했지만, 이제는 API에서 직접 데이터를 가져오므로
      // 부모 컴포넌트의 revenues 상태를 여기서 업데이트 해줄 필요가 있습니다.
      // 하지만 현재 `emit('update:revenues', internalRevenues.value)`를 호출하면
      // TrainerTestManagement의 revenues가 TestQuickConfig의 internalRevenues와 동일한 구조로 업데이트됩니다.
      // 추후 이 revenues 데이터가 TestQuestionReviewQuick으로 넘어가서 사용될 때 문제가 없는지 확인이 필요합니다.
      // 만약 `mcSet`과 `sqSet`이 `TestQuestionReviewQuick`에서 필요하다면,
      // `internalRevenues`에 해당 필드를 추가하고 초기화하는 로직이 필요합니다.
      emit(
        'update:revenues',
        internalRevenues.value.map((doc) => ({
          id: doc.id,
          name: doc.name,
          keyword: doc.keyword, // 현재는 빈 배열
          selected: doc.selected,
          mcSet: doc.questionCount, // 빠른 생성에서는 전체 문제를 mcSet으로 임시 설정
          sqSet: 0,
        })),
      )
    } else {
      console.error('API 응답 오류:', response.data.resultMsg)
      internalRevenues.value = []
    }
  } catch (error) {
    console.error('문서별 문제 수 가져오기 실패:', error)
    alert('문서 목록을 불러오는 데 실패했습니다.')
    internalRevenues.value = []
  } finally {
    emit('update:isLoading', false) // 로딩 종료
  }
}

watch(
  () => props.revenues,
  (newVal) => {
    // 이 watch는 TestQuickConfig가 외부에서 revenues prop을 받을 때 초기화하는 용도였으나,
    // 이제 내부에서 API를 호출하므로 그 필요성이 줄어들었습니다.
    // 하지만 혹시 다른 경로를 통해 revenues가 전달될 경우를 대비해 유지할 수 있습니다.
    // 여기서는 API 호출로 데이터를 초기화하므로, 이 watch의 immediate: true는 제거합니다.
    // API 호출로 초기화된 데이터가 있다면 해당 데이터를 사용하고, 없다면 props.revenues를 참조합니다.
    if (newVal.length > 0 && internalRevenues.value.length === 0) {
      internalRevenues.value = newVal.map((item) => ({
        ...item,
        mcCount: item.mcCount || 0,
        sqCount: item.sqCount || 0,
      }))
    }
  },
  { deep: true },
)

const headers = [
  { title: '문서명', key: 'name', width: '40%' },
  { title: '키워드', key: 'keyword', sortable: false, width: '30%' },
  {
    title: '문서별 총 문제',
    key: 'totalQuestionsPerDoc',
    align: 'center',
    sortable: false,
    width: '30%',
  },
]

const totalAvailableQuestions = computed(() =>
  internalRevenues.value.reduce((sum, doc) => sum + (doc.questionCount || 0), 0),
)

// 버튼 활성화를 위한 조건 확인
const isFormValid = computed(() => {
  if (!testName.value.trim()) {
    return false
  }
  if (
    totalTestQuestions.value === null ||
    totalTestQuestions.value === undefined ||
    totalTestQuestions.value < 1 ||
    totalTestQuestions.value === ''
  ) {
    return false
  }
  if (testDuration.value === null || testDuration.value === undefined || testDuration.value < 1) {
    return false
  }
  if (
    passingScore.value === null ||
    passingScore.value === undefined ||
    passingScore.value === ''
  ) {
    return false
  }

  if (totalTestQuestions.value > totalAvailableQuestions.value) {
    return false
  }
  if (passingScore.value < 0 || passingScore.value > 100) {
    return false
  }

  return true
})

// 버튼 비활성화 이유를 제공하는 computed 속성
const disabledReason = computed(() => {
  if (props.isLoading) {
    return '로딩 중입니다.'
  }
  if (!testName.value.trim()) {
    return '테스트명을 입력해주세요.'
  }
  if (
    totalTestQuestions.value === null ||
    totalTestQuestions.value === undefined ||
    totalTestQuestions.value < 1 ||
    totalTestQuestions.value === ''
  ) {
    return '총 문제 수는 1개 이상이어야 합니다.'
  }
  if (totalTestQuestions.value > totalAvailableQuestions.value) {
    return `총 문제 수는 저장된 총 문제 수 (${totalAvailableQuestions.value}개)를 초과할 수 없습니다.`
  }
  if (testDuration.value === null || testDuration.value === undefined || testDuration.value < 1) {
    return '응시 시간은 1분 이상이어야 합니다.'
  }
  if (
    passingScore.value === null ||
    passingScore.value === undefined ||
    passingScore.value === ''
  ) {
    return '합격 기준 점수를 입력해주세요.'
  }
  if (passingScore.value < 0 || passingScore.value > 100) {
    return '합격 기준 점수는 0점에서 100점 사이여야 합니다.'
  }

  return '모든 정보를 입력해주세요.'
})

const emitPrevStep = () => {
  emit('prev-step')
}

const emitNextStep = async () => {
  const { valid } = await form.value.validate()

  if (!valid) {
    alert('테스트 기본 설정 입력값을 확인해주세요.')
    return
  }

  emit(
    'next-step',
    internalRevenues.value,
    testName.value,
    totalTestQuestions.value,
    testDuration.value,
    passingScore.value,
  )
}

onMounted(() => {
  console.log('TestQuickConfig mounted!')
  fetchDocumentQuestionCounts()
})

watch(currentProjectId, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    fetchDocumentQuestionCounts()
  }
})
</script>

<style scoped>
.force-white {
  color: white !important;
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
  margin-left: 0;
  white-space: nowrap;
  line-height: 1;
  padding-bottom: 2px;
}

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

.document-list-section .document-table-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
}

.v-data-table {
  background-color: transparent !important;
}

.v-data-table :deep(td),
.v-data-table :deep(th) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.centered-input :deep(input) {
  text-align: center;
}

.bottom-fixed-actions {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 16px 0;
  border-top: 1px solid #eee;
  z-index: 100;
  max-width: 1150px;
  left: 0;
  right: 0;
  margin: 0 auto;
}
.bottom-fixed-actions .v-col {
  padding-top: 0;
  padding-bottom: 0;
}

.test-config-section {
  padding-bottom: 24px;
}

.fill-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.total-available-questions-info {
  text-align: left;
  margin-bottom: 16px;
  color: #191d5a;
  font-size: 1rem;
  padding-left: 8px;
}
</style>

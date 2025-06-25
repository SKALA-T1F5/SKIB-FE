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
              {{ (item.mcCount || 0) + (item.sqCount || 0) }}
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
        :disabled="isLoading"
        >이전 단계</v-btn
      >
      <v-tooltip :text="disabledReason" location="top" :disabled="isFormValid">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="flat"
            color="#191d5a"
            @click="emitNextStep"
            :disabled="isLoading || !isFormValid"
            >다음 단계</v-btn
          >
        </template>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, watch } from 'vue'

const props = defineProps({
  revenues: {
    type: Array,
    default: () => [],
  },
  isLoading: Boolean,
})

const emit = defineEmits(['update:revenues', 'prev-step', 'next-step'])

const internalRevenues = ref([])

const testName = ref('')
const totalTestQuestions = ref(0)
const testDuration = ref(60)
const passingScore = ref(60)

const form = ref(null)
const formValid = ref(false)

watch(
  () => props.revenues,
  (newVal) => {
    internalRevenues.value = newVal.map((item) => ({
      ...item,
      mcCount: item.mcCount || 0,
      sqCount: item.sqCount || 0,
    }))
  },
  { immediate: true, deep: true },
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
  internalRevenues.value.reduce((sum, doc) => sum + (doc.mcCount || 0) + (doc.sqCount || 0), 0),
)

// 버튼 활성화를 위한 조건 확인
const isFormValid = computed(() => {
  // 1. 테스트명이 공란이 아닐 경우
  if (!testName.value.trim()) {
    return false
  }
  // 2. 생성할 테스트의 총 문제 수가 1 이상일 경우
  // number 타입 입력 필드에 빈 문자열이 들어올 경우 0으로 처리되므로, null/undefined/빈 문자열 검사 추가
  if (
    totalTestQuestions.value === null ||
    totalTestQuestions.value === undefined ||
    totalTestQuestions.value < 1
  ) {
    return false
  }
  // 3. 응시 제한 시간이 1 이상일 경우
  if (testDuration.value === null || testDuration.value === undefined || testDuration.value < 1) {
    return false
  }
  // 4. 합격 기준 점수가 공란이 아닐 경우 (null, undefined, 빈 문자열 모두 포함)
  if (
    passingScore.value === null ||
    passingScore.value === undefined ||
    passingScore.value === ''
  ) {
    return false
  }

  return true
})

// 버튼 비활성화 이유를 제공하는 computed 속성
const disabledReason = computed(() => {
  if (isLoading.value) {
    return '로딩 중입니다.'
  }
  if (!testName.value.trim()) {
    return '테스트명을 입력해주세요.'
  }
  if (
    totalTestQuestions.value === null ||
    totalTestQuestions.value === undefined ||
    totalTestQuestions.value < 1
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
  // isFormValid에서 확인하지 않지만, Vuetify rules에서 추가로 검사하는 조건도 포함 가능 (선택 사항)
  if (passingScore.value < 0 || passingScore.value > 100) {
    return '합격 기준 점수는 0점에서 100점 사이여야 합니다.'
  }

  return '모든 정보를 입력해주세요.' // 기본 폴백 메시지 (이 메시지가 보이면 isFormValid 로직 재검토 필요)
})

const emitPrevStep = () => {
  emit('prev-step')
}

const emitNextStep = async () => {
  // 폼 유효성 검사 (버튼이 활성화된 후에도 유효하지 않은 값이 들어올 경우 메시지 표시)
  const { valid } = await form.value.validate()

  if (!valid) {
    alert('테스트 기본 설정 입력값을 확인해주세요.')
    return
  }

  emit('update:revenues', internalRevenues.value)
  emit(
    'next-step',
    internalRevenues.value,
    testName.value,
    totalTestQuestions.value,
    testDuration.value,
    passingScore.value,
  )
}
</script>

<style scoped>
.force-white {
  color: white !important;
}

/* Common header styles */
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

/* 새로 추가된 섹션 배경 스타일 */
.section-bg {
  background: #eef2f6; /* 회색 배경 */
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

/* 문서 목록 섹션의 높이를 고정하고 스크롤바 추가 */
.document-list-section .document-table-container {
  max-height: 400px; /* 원하는 높이로 조절 */
  overflow-y: auto; /* 세로 스크롤바 */
  overflow-x: hidden; /* 가로 스크롤바 숨김 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white; /* 테이블 배경색 */
}

/* 데이터 테이블의 기본 배경색을 투명하게 설정하여 부모의 배경색을 따르도록 함 */
.v-data-table {
  background-color: transparent !important;
}

/* 테이블 셀 내 텍스트 줄바꿈 방지 */
.v-data-table :deep(td),
.v-data-table :deep(th) {
  white-space: nowrap;
  overflow: hidden; /* 내용이 넘칠 경우 숨김 */
  text-overflow: ellipsis; /* 넘치는 텍스트를 ...으로 표시 */
}

/* input 숫자 가운데 정렬 (현재 테이블에는 숫자 입력 필드가 없지만 스타일 유지를 위해 남겨둠) */
.centered-input :deep(input) {
  text-align: center;
}

/* 하단 고정 버튼을 위한 스타일 */
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

/* 테스트 설정 섹션 스타일 */
.test-config-section {
  padding-bottom: 24px; /* 적절한 하단 패딩 */
}

.fill-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 저장된 총 문제 수 표시를 위한 스타일 */
.total-available-questions-info {
  text-align: left; /* 왼쪽 정렬 */
  margin-bottom: 16px; /* 아래 여백 */
  color: #191d5a;
  font-size: 1rem;
  padding-left: 8px; /* 왼쪽 여백 */
}
</style>

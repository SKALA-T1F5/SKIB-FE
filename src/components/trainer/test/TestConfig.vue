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
      <div class="section-bg document-list-section fill-height">
        <h4 class="section-title">문서 목록</h4>
        <div class="total-available-questions-info mb-4 d-flex justify-space-between align-center">
          <span class="font-weight-bold">저장된 총 문제: {{ totalAvailableQuestions }}개</span>
          <v-form ref="form" v-model="formValid" class="d-flex align-center">
            <v-text-field
              v-model.number="totalTestQuestions"
              label="총 문제 수"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              min="1"
              :max="totalAvailableQuestions"
              class="ml-4"
              style="max-width: 180px"
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
          </v-form>
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
const totalTestQuestions = ref(0) // testName, testDuration, passingScore 제거
const form = ref(null)
const formValid = ref(false)

watch(
  () => props.revenues,
  (newVal) => {
    internalRevenues.value = newVal.map((item) => ({
      ...item,
      questionCount: item.questionCount || 0,
    }))
  },
  { deep: true, immediate: true },
)

const headers = [
  { title: '문서명', key: 'name', width: '40%' },
  { title: '키워드', key: 'keyword', sortable: false },
  { title: '총 질문 수', key: 'totalQuestionsPerDoc', sortable: false },
]

const totalAvailableQuestions = computed(() => {
  return internalRevenues.value.reduce((sum, doc) => sum + doc.questionCount, 0)
})

const isFormValid = computed(() => {
  return (
    formValid.value &&
    totalTestQuestions.value > 0 &&
    totalTestQuestions.value <= totalAvailableQuestions.value
  )
})

const disabledReason = computed(() => {
  if (!totalTestQuestions.value) {
    return '총 문제 수를 입력해주세요.'
  }
  if (totalTestQuestions.value <= 0) {
    return '총 문제 수는 1개 이상이어야 합니다.'
  }
  if (totalTestQuestions.value > totalAvailableQuestions.value) {
    return `총 문제 수는 저장된 총 문제 수 (${totalAvailableQuestions.value}개)를 초과할 수 없습니다.`
  }
  return ''
})

const emitPrevStep = () => {
  emit('prev-step')
}

const emitNextStep = async () => {
  const { valid } = await form.value.validate()
  if (valid && isFormValid.value) {
    emit('next-step', {
      totalTestQuestions: totalTestQuestions.value,
      revenues: internalRevenues.value, // 선택된 문서 정보도 함께 전달
    })
  }
}
</script>

<style scoped>
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

.total-available-questions-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f0f3f7;
  border-radius: 8px;
  font-size: 15px;
  color: #343a40;
}

.total-available-questions-info .v-input--density-compact {
  font-size: 14px;
}

.total-available-questions-info .v-input__details {
  padding-top: 4px;
}

.bottom-fixed-actions {
  position: sticky;
  bottom: 0;
  background-color: #ffffff; /* 또는 페이지 배경색 */
  padding: 16px 0;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  margin-left: -12px; /* v-col padding 상쇄 */
  margin-right: -12px; /* v-col padding 상쇄 */
  width: calc(100% + 24px); /* v-col padding 상쇄 */
}

.force-white {
  color: #ffffff !important;
}
</style>

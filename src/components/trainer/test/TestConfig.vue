<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">테스트 생성</h2>
        <p class="section-subtitle">
          Step 2 of 4 : 테스트를 구성할 문제와 조건을 선택하고 다음 단계로 이동하세요.
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
    <v-col cols="12" sm="6" class="d-flex flex-column">
      <div class="section-bg mb-4">
        <h4 class="section-title">테스트 목표</h4>
        <p class="text-body-1 text-medium-emphasis">{{ examGoal }}</p>
      </div>

      <div class="section-bg document-list-section flex-grow-1">
        <h4 class="section-title">문서 목록</h4>
        <div class="document-table-container">
          <v-data-table
            :headers="headers"
            :items="internalRevenues"
            item-value="id"
            class="elevation-0"
            hide-default-footer
            disable-pagination
          >
            <template v-slot:item.name="{ item }">
              <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                {{ item.name }}
              </h6>
            </template>
            <template v-slot:item.keyword="{ item }">
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="(keyword, kIndex) in item.keyword.slice(0, 1)"
                  :key="kIndex"
                  size="small"
                  color="blue-grey"
                  variant="tonal"
                  rounded="lg"
                  class="mr-1 mb-1"
                >
                  {{ keyword }}
                </v-chip>
              </div>
            </template>
            <template v-slot:item.sqSet="{ item }">
              <v-text-field
                v-model.number="item.sqSet"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 60px"
                min="0"
                @update:model-value="emitUpdateRevenues"
                class="hide-number-spinners text-center-input"
              ></v-text-field>
            </template>
            <template v-slot:item.mcSet="{ item }">
              <v-text-field
                v-model.number="item.mcSet"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 60px"
                min="0"
                @update:model-value="emitUpdateRevenues"
                class="hide-number-spinners text-center-input"
              ></v-text-field>
            </template>
          </v-data-table>
        </div>
      </div>
    </v-col>

    <v-col cols="12" sm="6">
      <div class="section-bg h-100">
        <h4 class="section-title">테스트 세팅</h4>
        <v-form class="mt-4">
          <v-text-field
            v-model="internalSelectedDocument.title"
            label="테스트이름"
            variant="outlined"
            rounded="lg"
            bg-color="white"
            @update:model-value="emitUpdateSelectedDocument"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="internalSelectedDocument.examTime"
            label="시험 시간 (분)"
            type="number"
            variant="outlined"
            rounded="lg"
            bg-color="white"
            min="1"
            @update:model-value="emitUpdateSelectedDocument"
            class="mb-4 hide-number-spinners"
          ></v-text-field>
          <v-select
            v-model="internalSelectedDocument.difficulty"
            :items="['EASY', 'NORMAL', 'HARD']"
            label="난이도"
            variant="outlined"
            rounded="lg"
            bg-color="white"
            @update:model-value="emitUpdateSelectedDocument"
            class="mb-4"
          ></v-select>
          <div class="d-flex align-center mb-4">
            <v-text-field
              v-model.number="internalSelectedDocument.passScore"
              label="PASS 기준 점수"
              type="number"
              variant="outlined"
              rounded="lg"
              bg-color="white"
              class="mr-2 hide-number-spinners"
              style="width: 150px"
              min="0"
              max="100"
              @update:model-value="emitUpdateSelectedDocument"
            ></v-text-field>
            <v-select
              v-model="internalSelectedDocument.retakeAllowed"
              :items="[
                { text: '재응시 허용', value: true },
                { text: '재응시 불허', value: false },
              ]"
              label="재응시 여부"
              variant="outlined"
              rounded="lg"
              bg-color="white"
              class="flex-grow-1"
              item-title="text"
              item-value="value"
              @update:model-value="emitUpdateSelectedDocument"
            ></v-select>
          </div>
          <div class="total-questions mt-4 mb-4" style="text-align: center">
            객관식:&nbsp;<span class="font-weight-bold" style="color: #191d5a">{{
              totalMcqCountComputed
            }}</span
            >&nbsp;&nbsp;|&nbsp;&nbsp;주관식:&nbsp;<span
              class="font-weight-bold"
              style="color: #191d5a"
              >{{ totalSaqCountComputed }}</span
            >&nbsp;&nbsp;|&nbsp;&nbsp;총 문제 수:&nbsp;<span
              class="font-weight-bold"
              style="color: #191d5a"
              >{{ totalMcqCountComputed + totalSaqCountComputed }}</span
            >
          </div>
        </v-form>
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
      <v-btn variant="flat" color="#191d5a" @click="emitNextStep" :disabled="isLoading"
        >다음 단계</v-btn
      >
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue'

const props = defineProps({
  examGoal: String,
  selectedDocument: Object,
  revenues: Array,
  isLoading: Boolean,
  // 이전에 추가했던 props 정의는 그대로 유지됩니다.
  totalMcqCount: {
    type: Number,
    default: 0,
  },
  totalSaqCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['prev-step', 'next-step', 'update:selected-document', 'update:revenues'])

const headers = [
  { title: '문서명', key: 'name', sortable: false, width: '35%' },
  { title: 'Keyword', key: 'keyword', sortable: false, align: 'center', width: '30%' },
  { title: '객관식', key: 'mcSet', sortable: false, align: 'center', width: '15%' },
  { title: '주관식', key: 'sqSet', sortable: false, align: 'center', width: '15%' },
]

const internalSelectedDocument = ref({ ...props.selectedDocument })
const internalRevenues = ref([...props.revenues])

watch(
  () => props.selectedDocument,
  (newVal) => {
    internalSelectedDocument.value = { ...newVal }
  },
  { deep: true },
)

watch(
  () => props.revenues,
  (newVal) => {
    internalRevenues.value = [...newVal]
  },
  { deep: true },
)

const totalMcqCountComputed = computed(() => {
  return internalRevenues.value.reduce((sum, doc) => sum + doc.mcSet, 0)
})

const totalSaqCountComputed = computed(() => {
  return internalRevenues.value.reduce((sum, doc) => sum + doc.sqSet, 0)
})

const emitPrevStep = () => {
  emit('prev-step')
}

const emitNextStep = () => {
  emit('next-step', {
    selectedDocument: internalSelectedDocument.value,
    revenues: internalRevenues.value,
  })
}

const emitUpdateSelectedDocument = () => {
  emit('update:selected-document', internalSelectedDocument.value)
}

const emitUpdateRevenues = () => {
  emit('update:revenues', internalRevenues.value)
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
  padding: 24px; /* 통일된 패딩 */
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

/* 문서 목록 섹션의 높이를 고정하고 스크롤바 추가 */
.document-list-section .document-table-container {
  max-height: 400px; /* 원하는 높이로 조절 (flex-grow-1과 함께 사용 시 동적으로 변경됨) */
  overflow-y: auto; /* 세로 스크롤바 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white; /* 테이블 배경색 흰색 유지 */
}

/* 데이터 테이블 내부 스타일 조정 (필요시) */
.document-table-container .v-data-table {
  background-color: transparent !important; /* 부모 컨테이너 배경을 따르도록 */
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

/* 텍스트 필드, 셀렉트 박스 등 내부 요소들의 배경을 흰색으로 강제 */
.v-text-field :deep(.v-field__field),
.v-select :deep(.v-field__field) {
  background-color: white !important;
}

/* 숫자 입력 필드의 스피너 버튼 숨기기 */
.hide-number-spinners :deep(input[type='number']::-webkit-outer-spin-button),
.hide-number-spinners :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.hide-number-spinners :deep(input[type='number']) {
  -webkit-appearance: none; /* Chrome, Safari 등 WebKit/Blink 기반 브라우저 */
  -moz-appearance: none; /* Firefox (하위 호환성을 위해 유지하거나 필요에 따라 제거) */
  appearance: none; /* 표준 */
}

/* 숫자 입력 필드 텍스트 가운데 정렬 */
.text-center-input :deep(input) {
  text-align: center;
}
</style>

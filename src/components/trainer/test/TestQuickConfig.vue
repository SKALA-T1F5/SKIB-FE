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
      <div class="section-bg document-list-section">
        <h4 class="section-title">문서 목록</h4>
        <div class="document-table-container">
          <v-data-table
            :headers="headers"
            :items="internalRevenues"
            item-value="name"
            class="elevation-0"
            hide-default-footer
            disable-pagination
          >
            <template v-slot:item.selected="{ item }">
              <v-checkbox
                v-model="item.selected"
                density="compact"
                hide-details
                color="#191d5a"
              ></v-checkbox>
            </template>
            <template v-slot:item.mcSet="{ item }">
              <v-row no-gutters align="center">
                <v-col cols="auto" class="d-flex align-center">
                  <v-text-field
                    v-model.number="item.mcSet"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    single-line
                    min="0"
                    max="100"
                    style="max-width: 80px"
                    class="centered-input"
                    :disabled="!item.selected"
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>
            <template v-slot:item.sqSet="{ item }">
              <v-row no-gutters align="center">
                <v-col cols="auto" class="d-flex align-center">
                  <v-text-field
                    v-model.number="item.sqSet"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    single-line
                    min="0"
                    max="100"
                    style="max-width: 80px"
                    class="centered-input"
                    :disabled="!item.selected"
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>
          </v-data-table>
        </div>
        <div class="summary-info mt-4">
          <span class="font-weight-bold">총 객관식 문제: {{ totalMcqCount }}개</span>
          <span class="ml-4 font-weight-bold">총 주관식 문제: {{ totalSaqCount }}개</span>
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
      <v-btn
        variant="flat"
        color="#191d5a"
        @click="emitNextStep"
        :disabled="isLoading || (totalMcqCount === 0 && totalSaqCount === 0)"
        >다음 단계</v-btn
      >
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

// prop으로 받은 revenues를 내부에서 사용할 반응형 상태로 복사
const internalRevenues = ref([])

// revenues prop이 변경될 때마다 internalRevenues를 업데이트
watch(
  () => props.revenues,
  (newVal) => {
    internalRevenues.value = newVal.map((item) => ({ ...item }))
  },
  { immediate: true, deep: true }, // 컴포넌트 마운트 시 즉시 실행, 객체 내부 변경 감지
)

const headers = [
  { title: '선택', key: 'selected', width: '80px', align: 'center', sortable: false },
  { title: '문서명', key: 'name' },
  { title: '키워드', key: 'keyword', sortable: false },
  { title: '객관식 (MCQ)', key: 'mcSet', align: 'center', sortable: false },
  { title: '주관식 (SAQ)', key: 'sqSet', align: 'center', sortable: false },
]

const totalMcqCount = computed(() =>
  internalRevenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.mcSet : 0), 0),
)
const totalSaqCount = computed(() =>
  internalRevenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.sqSet : 0), 0),
)

const emitPrevStep = () => {
  emit('prev-step')
}

const emitNextStep = () => {
  // 선택된 문서가 없거나 문제 수가 0인 경우를 체크
  if (totalMcqCount.value === 0 && totalSaqCount.value === 0) {
    alert('문서를 선택하고 생성할 문제 수를 설정해주세요.')
    return
  }
  emit('update:revenues', internalRevenues.value)
  emit('next-step', internalRevenues.value)
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white; /* 테이블 배경색 */
}

/* 데이터 테이블의 기본 배경색을 투명하게 설정하여 부모의 배경색을 따르도록 함 */
.v-data-table {
  background-color: transparent !important;
}

/* v-checkbox와 v-text-field의 불필요한 마진/패딩 제거 */
.v-data-table :deep(.v-selection-control) {
  margin: 0;
  padding: 0;
}

.v-data-table :deep(.v-input__control) {
  padding: 0;
}

.v-data-table :deep(.v-text-field .v-input__control) {
  min-height: unset; /* 최소 높이 제거 */
}

/* input 숫자 가운데 정렬 */
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

.summary-info {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  margin-top: 16px;
  padding-right: 8px; /* 오른쪽 여백 */
  color: #191d5a;
  font-size: 1rem;
}
</style>

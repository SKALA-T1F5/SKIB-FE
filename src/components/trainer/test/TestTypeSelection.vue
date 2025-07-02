<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">새 테스트 생성</h2>
        <p class="section-subtitle">테스트 생성 방식을 선택하고 다음 단계로 이동하세요.</p>
      </div>
      <v-progress-linear
        :model-value="0"
        height="10"
        color="#191d5a"
        bg-color="#191d5a"
        rounded
      ></v-progress-linear>
    </v-col>
  </v-row>

  <v-row class="mt-8 justify-center" dense>
    <v-col cols="12" sm="8" md="6" lg="4" xl="3" class="d-flex pa-2">
      <v-card
        class="test-type-card text-center d-flex flex-column align-center justify-center"
        :class="{ 'test-type-card-selected': selectedTestType === 'ai' }"
        outlined
        @click="selectType('ai')"
      >
        <div class="card-icon-wrapper mb-4">
          <v-icon size="64" color="#191d5a">mdi-brain</v-icon>
        </div>
        <h3 class="text-h6 font-weight-bold mb-2">AI 기반 테스트 생성</h3>
        <p class="text-body-2 text-medium-emphasis">
          AI 프롬프트를 입력하여 새로운 문제를 생성하고 테스트를 구성합니다.
        </p>
      </v-card>
    </v-col>

    <v-col cols="12" sm="8" md="6" lg="4" xl="3" class="d-flex pa-2">
      <v-card
        class="test-type-card text-center d-flex flex-column align-center justify-center"
        :class="{ 'test-type-card-selected': selectedTestType === 'quick' }"
        outlined
        @click="selectType('quick')"
      >
        <div class="card-icon-wrapper mb-4">
          <v-icon size="64" color="#191d5a">mdi-rocket-launch-outline</v-icon>
        </div>
        <h3 class="text-h6 font-weight-bold mb-2">빠른 테스트 생성</h3>
        <p class="text-body-2 text-medium-emphasis">
          기존 문서에서 문제 수를 지정하여 빠르게 테스트를 생성합니다.
        </p>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="bottom-fixed-actions">
    <v-col cols="12" class="d-flex justify-start align-center px-0">
      <v-btn
        variant="flat"
        color="grey"
        class="force-white"
        @click="emitPrevStep"
        :disabled="isLoading"
        >이전 단계</v-btn
      >
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

const props = defineProps({
  isLoading: Boolean,
})

const emit = defineEmits(['prev-step', 'next-step'])

const selectedTestType = ref(null) // 'ai' 또는 'quick'

const selectType = (type) => {
  selectedTestType.value = type
  emit('next-step', type) // 클릭 시 바로 다음 단계로 이동
}

const emitPrevStep = () => {
  emit('prev-step')
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

.test-type-card {
  width: 100%; /* v-col 안에서 100%를 차지하도록 */
  max-width: 450px; /* 카드의 최대 너비는 유지 */
  min-height: 280px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border: 2px solid #e0e0e0 !important;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  /* padding은 v-col의 pa-2에서 처리되므로 여기서는 제거하거나 필요에 따라 조정 */
  padding: 24px; /* 내부 패딩 명시 */
}

.test-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  border-color: #a1a1a1 !important;
}

.test-type-card-selected {
  border-color: #191d5a !important;
  background-color: #eef2f6 !important;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-icon-wrapper {
  margin-bottom: 16px;
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
  max-width: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
}
.bottom-fixed-actions .v-col {
  padding-top: 0;
  padding-bottom: 0;
}
</style>

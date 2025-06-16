<!-- components/AILoading.vue -->
<template>
  <div v-if="show" class="loading-overlay">
    <v-dialog
      :model-value="show"
      persistent
      width="300"
      class="loading-dialog"
      :scrim="false"
      :retain-focus="false"
    >
      <v-card class="d-flex flex-column align-center justify-center pa-5 transparent-card">
        <img 
          src="@/assets/images/ai-loading.gif" 
          alt="AI Loading" 
          class="ai-loading-gif"
        />
        <!-- <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular> -->
        <div class="mt-4 text-h6 text-center text-white">AI가 문제를 생성중입니다...</div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-dialog {
  z-index: 10000;
}

.transparent-card {
  background-color: transparent !important;
  box-shadow: none !important;
}

.ai-loading-gif {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

/* 다이얼로그 외부 배경 스타일 */
:deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.85) !important;
  backdrop-filter: blur(80px);
}

/* 다이얼로그 컨텐츠 영역 스타일 */
:deep(.v-dialog) {
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.v-overlay__content) {
  background-color: transparent !important;
}
</style>
  
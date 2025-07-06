<template>
  <v-overlay
    :model-value="show"
    class="align-center justify-center ai-loading-overlay"
    scrim="white"
    persistent
    contained
  >
    <div class="d-flex flex-column align-center">
      <img src="@/assets/ai-loading.gif" alt="AI Loading" class="ai-loading-gif mb-4" />
      <span class="text-h6 font-weight-bold" style="color: #191d5a">{{ message }}</span>
      <span class="text-caption text-grey-darken-2 mt-2">잠시만 기다려주세요...</span>
    </div>
  </v-overlay>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '데이터 로딩 중입니다...',
  },
})
</script>

<style scoped>
.ai-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 현재 배경색과 투명도 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999 !important;
}

.ai-loading-gif {
  width: 80px; /* GIF 크기 조절 */
  height: 80px;
  object-fit: contain; /* 이미지 비율 유지 */
}
</style>

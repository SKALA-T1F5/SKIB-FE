<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">테스트 생성</h2>
        <p class="section-subtitle">Step 4 of 4 : 테스트 생성이 완료되었습니다.</p>
      </div>
      <v-progress-linear
        :model-value="100"
        height="10"
        color="#191d5a"
        bg-color="#191d5a"
        rounded
      ></v-progress-linear>
    </v-col>
  </v-row>
  <v-row class="text-center mt-8">
    <v-col cols="12">
      <v-icon size="80" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
      <h3 class="text-h5 mb-2 font-weight-bold">테스트 생성이 완료되었습니다!</h3>
      <p class="text-subtitle-1 text-medium-emphasis mb-6">
        응시자에게 아래 링크를 공유하여 테스트를 시작할 수 있습니다.
      </p>

      <v-card
        outlined
        class="pa-6 mx-auto mb-6"
        max-width="600"
        elevation="0"
        style="border-width: 2px"
      >
        <p class="font-weight-bold text-h6 mb-4" style="color: #191d5a">테스트 초대 링크:</p>
        <div class="d-flex align-center justify-center">
          <v-text-field
            :model-value="testLink"
            readonly
            variant="outlined"
            density="comfortable"
            hide-details
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyLink"
            class="flex-grow-1"
          ></v-text-field>
        </div>
      </v-card>

      <v-btn color="grey-darken-2" class="mt-4" @click="emitReturnToList">
        테스트 목록으로 돌아가기
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  testId: [Number, String],
  testLink: String,
})

const emit = defineEmits(['return-to-list'])

const copyLink = () => {
  if (navigator.clipboard && props.testLink) {
    navigator.clipboard
      .writeText(props.testLink)
      .then(() => {
        alert('테스트 링크가 클립보드에 복사되었습니다!')
      })
      .catch((err) => {
        console.error('링크 복사 실패:', err)
        alert('링크 복사에 실패했습니다.')
      })
  }
}

const emitReturnToList = () => {
  emit('return-to-list')
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

/* 하단 고정 버튼을 위한 스타일 (TestPrompt와 동일하게) */
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

<template>
  <v-dialog :model-value="modelValue" @update:model-value="updateModelValue" max-width="600px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ selectedDocument?.originalName }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <p><strong>파일 유형:</strong> {{ selectedDocument?.fileType }}</p>
        <p><strong>업로드 날짜:</strong> {{ formatDate(selectedDocument?.uploadDate) }}</p>
        <p><strong>파일 크기:</strong> {{ formatSize(selectedDocument?.fileSize) }}</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean, // 다이얼로그 열림/닫힘 상태 (v-model)
  selectedDocument: Object, // 미리보기할 문서 객체
})

const emit = defineEmits(['update:modelValue'])

const updateModelValue = (value) => {
  emit('update:modelValue', value)
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR')
}

function formatSize(bytes) {
  if (bytes === 0) return '0 KB'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* 필요한 스타일 추가 */
/* v-card-title의 기본 패딩은 Vuetify에서 제공하므로 추가 스타일링은 최소화 */
</style>

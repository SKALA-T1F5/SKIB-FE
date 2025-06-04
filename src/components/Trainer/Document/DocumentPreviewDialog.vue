<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="600px"
  >
    <v-card>
      <v-card-title>
        {{ selectedDocument?.originalName }}
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <p><strong>파일 유형:</strong> {{ selectedDocument?.fileType }}</p>
        <p><strong>업로드일:</strong> {{ formatDate(selectedDocument?.uploadDate) }}</p>
        <p><strong>파일 크기:</strong> {{ formatSize(selectedDocument?.fileSize) }}</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean, // 다이얼로그 열림/닫힘 상태 (v-model)
  selectedDocument: Object, // 미리보기할 문서 객체
});

const emit = defineEmits(['update:modelValue']);

const updateModelValue = (value) => {
  emit('update:modelValue', value);
};

const closeDialog = () => {
  emit('update:modelValue', false);
};

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

function formatSize(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb > 1024
    ? (kb / 1024).toFixed(1) + ' MB'
    : kb.toFixed(0) + ' KB';
}
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>
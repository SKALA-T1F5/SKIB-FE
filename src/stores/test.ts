// src/stores/exam.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useExamStore = defineStore('exam', () => {
  const isExamActive = ref(false); // 시험 활성화 상태

  function setExamActive(status: boolean) {
    isExamActive.value = status;
  }

  return { isExamActive, setExamActive };
});
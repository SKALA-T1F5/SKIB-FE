// src/stores/exam.js (주석도 .js로 변경)
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useExamStore = defineStore('exam', () => {
  const isExamActive = ref(false); // 시험 활성화 상태

  function setExamActive(status) { // : boolean 제거
    isExamActive.value = status;
  }

  return { isExamActive, setExamActive };
});
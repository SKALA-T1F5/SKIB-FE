<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">테스트 생성</h2>
        <p class="section-subtitle">Step 3 of 4 : 생성된 문제를 확인하고 필요에 따라 교체합니다.</p>
      </div>
      <v-progress-linear
        :model-value="75"
        height="10"
        color="#191d5a"
        bg-color="#191d5a"
        rounded
      ></v-progress-linear>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <h3 class="text-h6 mb-4 font-weight-bold">생성된 문제 목록 (Test ID: {{ testId }})</h3>
      <v-alert
        v-if="questions.length === 0 && !isFetchingQuestions"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        아직 생성된 문제가 없습니다. 이전 단계에서 문제를 생성해주세요.
      </v-alert>
      <div v-if="isFetchingQuestions" class="d-flex justify-center align-center py-10">
        <v-progress-circular indeterminate color="#191d5a" size="50"></v-progress-circular>
        <span class="ml-4 text-h6" style="color: #191d5a">문제 로딩 중...</span>
      </div>
      <v-expansion-panels v-else variant="accordion" class="mb-4 question-expansion-panels">
        <v-expansion-panel
          v-for="(question, index) in questions"
          :key="question.questionId"
          class="question-panel"
        >
          <v-expansion-panel-title class="font-weight-bold" style="color: #191d5a">
            문제 {{ index + 1 }}:
            {{ question.questionType === 'multiple_choice' ? '객관식' : '주관식' }}
            <span class="text-medium-emphasis ml-2"
              >{{ question.content.substring(0, 50) }}...</span
            >
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat outlined class="question-detail-card">
              <v-card-text>
                <p class="mb-2 text-body-1">
                  <strong class="text-h6" style="color: #191d5a">문제:</strong>
                  {{ question.content }}
                </p>
                <div v-if="question.questionType === 'multiple_choice'" class="mb-2">
                  <strong class="text-h6" style="color: #191d5a">선택지:</strong>
                  <ul class="ml-4">
                    <li v-for="(option, i) in question.options" :key="i" class="text-body-2 mb-1">
                      {{ option }}
                    </li>
                  </ul>
                </div>
                <p class="mb-2 text-body-1">
                  <strong class="text-h6" style="color: #191d5a">정답:</strong>
                  {{ question.answer }}
                </p>
                <p class="mb-2 text-body-2 text-medium-emphasis">
                  <strong>출처 문서:</strong> {{ question.documentName }}
                </p>
                <p class="mb-4 text-body-2 text-medium-emphasis">
                  <strong>키워드:</strong>
                  <v-chip
                    v-for="(keyword, kIdx) in question.keywords"
                    :key="kIdx"
                    size="small"
                    color="blue-grey"
                    variant="tonal"
                    rounded="lg"
                    class="ml-1"
                  >
                    {{ keyword }}
                  </v-chip>
                </p>
                <div class="d-flex justify-end mt-4">
                  <v-btn
                    color="#191d5a"
                    variant="outlined"
                    size="small"
                    @click="
                      refreshQuestion(
                        question.questionId,
                        index,
                        question.documentId,
                        question.questionType,
                      )
                    "
                    :loading="refreshingQuestionId === question.questionId"
                    :disabled="isLoading"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    문제 새로고침
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
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
        :disabled="isLoading || questions.length === 0 || isFetchingQuestions"
        >다음 단계</v-btn
      >
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'
// import api from '@/config/axios'; // API 호출 제거

const props = defineProps({
  testId: [Number, String],
  isLoading: {
    // TrainerTestManagement.vue로부터 받은 로딩 상태
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['prev-step', 'next-step'])

const questions = ref([])
const refreshingQuestionId = ref(null) // 새로고침 중인 문제 ID
const isFetchingQuestions = ref(false) // 문제 목록 자체를 불러오는 중인지

// Mock 데이터 생성 함수 (다양한 문제 생성)
const createMockQuestion = (type, docId) => {
  const qId = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const docName =
    docId === 101
      ? 'Aiper Front 개발환경 가이드.pdf'
      : docId === 102
        ? 'alopex_UI_1.1.2_개발가이드.pdf'
        : docId === 104
          ? 'Vue.js 완벽 가이드.pdf'
          : '기타 문서.pdf'
  const keywords =
    docId === 101
      ? ['React', 'Webpack', '개발환경']
      : docId === 102
        ? ['UI Component', 'CSS', 'JS', 'Alopex']
        : docId === 104
          ? ['Vuex', 'Pinia', 'Composition API', 'Vue']
          : ['General']

  if (type === 'multiple_choice') {
    const choices = [
      `옵션 A (New ${Math.random().toFixed(2)})`,
      `옵션 B (New ${Math.random().toFixed(2)})`,
      `옵션 C (New ${Math.random().toFixed(2)})`,
      `옵션 D (New ${Math.random().toFixed(2)})`,
    ]
    const answer = choices[Math.floor(Math.random() * choices.length)]
    return {
      questionId: qId,
      documentId: docId,
      questionType: 'multiple_choice',
      content: `다음 중 "${docName}"에 대한 설명으로 올바른 것은? (객관식 문제 - ${Math.random().toFixed(4)})`,
      options: choices,
      answer: answer,
      documentName: docName,
      keywords: keywords,
    }
  } else {
    // short_answer
    return {
      questionId: qId,
      documentId: docId,
      questionType: 'short_answer',
      content: `"${docName}"에서 설명하는 핵심 개념을 서술하시오. (주관식 문제 - ${Math.random().toFixed(4)})`,
      options: [],
      answer: '핵심 개념에 대한 자세한 설명입니다.',
      documentName: docName,
      keywords: keywords,
    }
  }
}

const fetchQuestions = async () => {
  if (!props.testId) {
    questions.value = []
    return
  }
  isFetchingQuestions.value = true // 문제 불러오기 시작
  try {
    await new Promise((resolve) => setTimeout(resolve, 800)) // 0.8초 지연

    questions.value = [
      createMockQuestion('multiple_choice', 101),
      createMockQuestion('multiple_choice', 101),
      createMockQuestion('short_answer', 101),
      createMockQuestion('multiple_choice', 102),
      createMockQuestion('short_answer', 102),
      createMockQuestion('multiple_choice', 102),
      createMockQuestion('multiple_choice', 104),
      createMockQuestion('short_answer', 104),
    ]
  } catch (error) {
    console.error('문제 목록 불러오기 실패 (Mock):', error)
    questions.value = []
  } finally {
    isFetchingQuestions.value = false // 문제 불러오기 종료
  }
}

const refreshQuestion = async (questionId, index, documentId, questionType) => {
  if (refreshingQuestionId.value === questionId || props.isLoading) return // 이미 새로고침 중이거나 부모 로딩 중이면 중복 요청 방지

  refreshingQuestionId.value = questionId
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 1초 지연 시뮬레이션

    const newMockQuestion = createMockQuestion(questionType, documentId)
    questions.value[index] = newMockQuestion
    alert('문제가 성공적으로 교체되었습니다! (Mock)')
  } catch (error) {
    console.error('문제 교체 중 오류 발생 (Mock):', error)
    alert('문제 교체 중 오류가 발생했습니다. (Mock)')
  } finally {
    refreshingQuestionId.value = null
  }
}

const emitPrevStep = () => {
  emit('prev-step')
}

const emitNextStep = () => {
  emit('next-step')
}

onMounted(() => {
  if (props.testId) {
    fetchQuestions()
  }
})

watch(
  () => props.testId,
  (newId) => {
    if (newId) {
      fetchQuestions()
    } else {
      questions.value = []
    }
  },
  { immediate: true },
)
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

.question-expansion-panels .v-expansion-panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 은은한 그림자 */
}

.question-expansion-panels .v-expansion-panel-title {
  padding: 16px;
  background-color: #f5f5f5; /* 타이틀 배경색 */
}

.question-detail-card {
  border: none !important; /* 내부 카드는 테두리 제거 */
  box-shadow: none !important;
  background-color: transparent !important;
}

.question-content p,
.question-content ul {
  margin-bottom: 8px;
  padding-left: 8px; /* 내용 들여쓰기 */
}

.question-content ul {
  list-style-type: disc;
  margin-left: 20px;
}

.question-content li {
  margin-bottom: 4px;
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
  max-width: 1150px;
  left: 0;
  right: 0;
  margin: 0 auto;
}
.bottom-fixed-actions .v-col {
  padding-top: 0;
  padding-bottom: 0;
}
</style>

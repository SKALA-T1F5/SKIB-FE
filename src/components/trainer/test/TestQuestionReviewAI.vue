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

  <v-row class="mt-4" align="stretch">
    <v-col cols="12" sm="4" class="d-flex flex-column">
      <v-card elevation="0" class="section-bg flex-grow-1">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1" style="height:">
          <h4 class="section-title mb-6">문제 목록</h4>
          <div
            v-if="isFetchingQuestions"
            class="d-flex justify-center align-center py-10 flex-grow-1"
          >
            <v-progress-circular indeterminate color="#191d5a" size="50"></v-progress-circular>
            <span class="ml-4 text-h6" style="color: #191d5a">문제 로딩 중...</span>
          </div>
          <v-expansion-panels
            v-else
            variant="accordion"
            class="questions-expansion-panels flex-grow-1"
          >
            <v-expansion-panel
              v-for="(question, index) in questions"
              :key="question.id"
              class="question-panel"
            >
              <v-expansion-panel-title
                class="question-panel-title"
                :class="{ 'question-panel-title-active': activeQuestionIndex === index }"
                @click="selectQuestion(index)"
              >
                <div class="d-flex align-center justify-space-between w-100">
                  <span class="text-subtitle-1 font-weight-bold" style="color: #191d5a">
                    문제 {{ index + 1 }}.
                    <span class="text-body-2 text-medium-emphasis ml-2">{{
                      question.type === 'OBJECTIVE' ? '객관식' : '주관식'
                    }}</span>
                  </span>
                  <v-chip
                    :color="getDifficultyColor(question.difficultyLevel)"
                    size="small"
                    class="ml-2 font-weight-bold"
                  >
                    {{ getDifficultyText(question.difficultyLevel) }}
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="question-panel-content">
                <v-list dense class="py-0">
                  <v-list-item class="px-0">
                    <v-list-item-title class="font-weight-medium">질문:</v-list-item-title>
                    <v-list-item-subtitle>{{ question.question }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="question.options" class="px-0">
                    <v-list-item-title class="font-weight-medium">선택지:</v-list-item-title>
                    <v-list-item-subtitle>
                      <ol class="option-list">
                        <li v-for="(option, optIdx) in question.options" :key="optIdx">
                          {{ option }}
                        </li>
                      </ol>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <v-list-item-title class="font-weight-medium">정답:</v-list-item-title>
                    <v-list-item-subtitle>{{ question.answer }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <v-list-item-title class="font-weight-medium">풀이:</v-list-item-title>
                    <v-list-item-subtitle>{{ question.explanation }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="question.documentName" class="px-0">
                    <v-list-item-title class="font-weight-medium">출처 문서:</v-list-item-title>
                    <v-list-item-subtitle>{{ question.documentName }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="question.keywords && question.keywords.length" class="px-0">
                    <v-list-item-title class="font-weight-medium">키워드:</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        v-for="keyword in question.keywords"
                        :key="keyword"
                        size="x-small"
                        class="mr-1 my-1"
                        >{{ keyword }}</v-chip
                      >
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="question.tags && question.tags.length" class="px-0">
                    <v-list-item-title class="font-weight-medium">태그:</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        v-for="tag in question.tags"
                        :key="tag"
                        size="x-small"
                        class="mr-1 my-1"
                        >{{ tag }}</v-chip
                      >
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="8" class="d-flex flex-column">
      <v-card elevation="0" class="section-bg flex-grow-1">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
          <h4 class="section-title mb-6">문제 상세 및 수정</h4>

          <div v-if="activeQuestion" class="flex-grow-1 d-flex flex-column">
            <v-card outlined class="mb-4 pa-4 flex-grow-1">
              <v-chip-group column class="mb-4">
                <v-chip label color="blue-grey lighten-5">
                  유형: {{ activeQuestion.type === 'OBJECTIVE' ? '객관식' : '주관식' }}
                </v-chip>
                <v-chip label :color="getDifficultyColor(activeQuestion.difficultyLevel)">
                  난이도: {{ getDifficultyText(activeQuestion.difficultyLevel) }}
                </v-chip>
                <v-chip label color="blue-grey lighten-5" v-if="activeQuestion.documentName">
                  출처: {{ activeQuestion.documentName }}
                </v-chip>
              </v-chip-group>

              <v-textarea
                v-model="activeQuestion.question"
                label="문제"
                outlined
                rows="3"
                hide-details
                class="mb-4"
              ></v-textarea>

              <div v-if="activeQuestion.type === 'OBJECTIVE'">
                <h5 class="font-weight-medium text-subtitle-1 mb-2">선택지</h5>
                <v-text-field
                  v-for="(option, index) in activeQuestion.options"
                  :key="index"
                  v-model="activeQuestion.options[index]"
                  :label="`선택지 ${index + 1}`"
                  outlined
                  dense
                  hide-details
                  class="mb-2"
                ></v-text-field>
              </div>

              <v-text-field
                v-model="activeQuestion.answer"
                label="정답"
                outlined
                dense
                hide-details
                class="mb-4"
              ></v-text-field>

              <v-textarea
                v-model="activeQuestion.explanation"
                label="풀이"
                outlined
                rows="3"
                hide-details
                class="mb-4"
              ></v-textarea>

              <div v-if="activeQuestion.type === 'SUBJECTIVE' && activeQuestion.gradingCriteria">
                <h5 class="font-weight-medium text-subtitle-1 mb-2">채점 기준</h5>
                <table class="grading-table">
                  <thead>
                    <tr>
                      <th class="score-column">점수</th>
                      <th>기준</th>
                      <th>예시</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(criteria, cIdx) in activeQuestion.gradingCriteria" :key="cIdx">
                      <td class="score-column">{{ criteria.score }}</td>
                      <td>{{ criteria.criteria }}</td>
                      <td>{{ criteria.example }}</td>
                      <td>{{ criteria.note }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <v-combobox
                v-model="activeQuestion.keywords"
                label="키워드 (쉼표로 구분)"
                multiple
                chips
                outlined
                dense
                clearable
                class="mt-4"
              ></v-combobox>

              <v-combobox
                v-model="activeQuestion.tags"
                label="태그 (쉼표로 구분)"
                multiple
                chips
                outlined
                dense
                clearable
              ></v-combobox>

              <v-card-actions class="d-flex justify-end mt-4">
                <v-btn color="#191d5a" class="white--text" @click="saveQuestionChanges">
                  변경 사항 저장
                </v-btn>
                <v-btn color="red" class="white--text" @click="replaceQuestion">
                  문제 교체 (AI 재요청)
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
          <div v-else class="d-flex flex-column align-center justify-center flex-grow-1">
            <p class="text-h6 text-medium-emphasis">
              왼쪽에서 문제를 선택하여 상세 내용을 확인하세요.
            </p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="mt-4">
    <v-col cols="12">
      <v-card elevation="0" class="section-bg">
        <v-card-text class="pa-8">
          <h4 class="section-title mb-6">참조 문서 목록</h4>
          <v-expansion-panels variant="accordion" class="documents-expansion-panels">
            <v-expansion-panel
              v-for="document in documents"
              :key="document.documentId"
              class="document-panel"
            >
              <v-expansion-panel-title class="document-panel-title">
                <span class="text-subtitle-1 font-weight-bold" style="color: #191d5a">
                  {{ document.documentName }}
                </span>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="document-panel-content">
                <v-list dense class="py-0">
                  <v-list-item class="px-0">
                    <v-list-item-title class="font-weight-medium">문서 ID:</v-list-item-title>
                    <v-list-item-subtitle>{{ document.documentId }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <v-list-item-title class="font-weight-medium"
                      >포함된 문제 수:</v-list-item-title
                    >
                    <v-list-item-subtitle>{{ document.questionCount }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="document.keywords && document.keywords.length" class="px-0">
                    <v-list-item-title class="font-weight-medium">키워드:</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        v-for="keyword in document.keywords"
                        :key="keyword"
                        size="x-small"
                        class="mr-1 my-1"
                        >{{ keyword }}</v-chip
                      >
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, watch, defineProps } from 'vue'
import axios from 'axios'

const props = defineProps({
  questionsData: {
    type: Object,
    default: null,
  },
})

const questions = ref([])
const documents = ref([])
const activeQuestionIndex = ref(null)
const isFetchingQuestions = ref(true) // 로딩 상태를 questionsData prop으로 제어

watch(
  () => props.questionsData,
  (newVal) => {
    if (newVal && newVal.questions) {
      questions.value = newVal.questions
      isFetchingQuestions.value = false
      groupDocumentsFromQuestions(newVal.questions)
    } else {
      questions.value = []
      documents.value = []
      isFetchingQuestions.value = true // Still loading or no data
    }
  },
  { immediate: true, deep: true },
)

const activeQuestion = computed(() => {
  if (activeQuestionIndex.value !== null && questions.value[activeQuestionIndex.value]) {
    return questions.value[activeQuestionIndex.value]
  }
  return null
})

const selectQuestion = (index) => {
  activeQuestionIndex.value = index
}

const getDifficultyColor = (level) => {
  switch (level) {
    case 'EASY':
      return 'green lighten-3'
    case 'NORMAL':
      return 'orange lighten-3'
    case 'HARD':
      return 'red lighten-3'
    default:
      return 'grey lighten-3'
  }
}

const getDifficultyText = (level) => {
  switch (level) {
    case 'EASY':
      return '쉬움'
    case 'NORMAL':
      return '보통'
    case 'HARD':
      return '어려움'
    default:
      return '알 수 없음'
  }
}

const groupDocumentsFromQuestions = (questionList) => {
  const docMap = {}
  questionList.forEach((q) => {
    if (!docMap[q.documentId]) {
      docMap[q.documentId] = {
        documentId: q.documentId,
        documentName: q.documentName,
        keywords: [],
        questionCount: 0,
      }
    }
    docMap[q.documentId].questionCount++
    // Add unique keywords
    q.keywords.forEach((keyword) => {
      if (!docMap[q.documentId].keywords.includes(keyword)) {
        docMap[q.documentId].keywords.push(keyword)
      }
    })
  })
  documents.value = Object.values(docMap)
}

const saveQuestionChanges = async () => {
  if (!activeQuestion.value) return

  try {
    // 실제 API 연동 시에는 activeQuestion.value의 변경된 내용을 서버로 전송
    // 예: await axios.put(`/api/questions/${activeQuestion.value.id}`, activeQuestion.value);
    console.log('문제 변경 사항 저장:', activeQuestion.value)
    alert('문제 변경 사항이 저장되었습니다.')
  } catch (error) {
    console.error('문제 변경 사항 저장 실패:', error)
    alert('문제 변경 사항 저장에 실패했습니다.')
  }
}

const replaceQuestion = async () => {
  if (!activeQuestion.value) return

  // 이 부분은 AI에게 새로운 문제 생성을 요청하는 API 호출이 필요합니다.
  // userConfig.generationType이 "EXTRA"인 경우에만 새로고침 버튼이 나타나게 한다면,
  // 해당 문제의 키워드를 기반으로 새로운 문제를 요청하는 로직이 필요합니다.
  alert('문제 교체 기능은 아직 구현되지 않았습니다. AI 재요청 로직이 필요합니다.')
  console.log('문제 교체 요청 (AI 재요청):', activeQuestion.value)

  // 예시: API 호출
  // try {
  //   const response = await axios.post('/api/regenerate-question', {
  //     documentId: activeQuestion.value.documentId,
  //     keywords: activeQuestion.value.keywords,
  //     type: activeQuestion.value.type,
  //     difficultyLevel: activeQuestion.value.difficultyLevel
  //   });
  //   const newQuestion = response.data.resultData;
  //   // 기존 문제를 새 문제로 교체
  //   questions.value[activeQuestionIndex.value] = newQuestion;
  //   alert('문제가 성공적으로 교체되었습니다!');
  // } catch (error) {
  //   console.error('문제 교체 실패:', error);
  //   alert('문제 교체에 실패했습니다. 다시 시도해주세요.');
  // }
}
</script>

<style scoped>
/* Common header styles (TrainerDocumentManagement.vue에서 가져옴) */
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

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.questions-expansion-panels,
.documents-expansion-panels {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.question-panel,
.document-panel {
  background-color: #fcfdfe;
}

.question-panel-title,
.document-panel-title {
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
}

.question-panel-title-active {
  background-color: #e3f2fd; /* Active state background */
}

.question-panel-title .v-expansion-panel-title__overlay,
.document-panel-title .v-expansion-panel-title__overlay {
  background-color: transparent !important;
}

.question-panel-title:hover,
.document-panel-title:hover {
  background-color: #f5f5f5;
}

.question-panel:last-child .question-panel-title,
.document-panel:last-child .document-panel-title {
  border-bottom: none;
}

.question-panel-content,
.document-panel-content {
  padding: 16px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e9ecef; /* Separator for content */
}

.v-list-item-title {
  font-size: 14px;
  color: #343a40;
}

.v-list-item-subtitle {
  font-size: 14px;
  color: #6c757d;
  white-space: normal; /* Allow text to wrap */
}

.option-list {
  padding-left: 20px;
  margin-top: 5px;
}

.option-list li {
  margin-bottom: 4px;
}

.grading-table {
  width: 100%;
  min-width: 600px; /* 테이블 최소 너비 설정 (콘텐츠에 따라 조절) */
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #fcfdfe; /* Match li background */
  border: 1px solid #e9ecef; /* Match li border */
  border-radius: 8px; /* Match li border-radius */
  overflow: hidden; /* Ensures border-radius is applied to content */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); /* Match li shadow */
}

.grading-table :deep(th),
.grading-table :deep(td) {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 15px;
  color: #495057;
  white-space: nowrap; /* 셀 내용이 줄바꿈되지 않도록 */
}

/* "점수" 열 너비 조정 */
.grading-table :deep(th.score-column),
.grading-table :deep(td.score-column) {
  width: 80px; /* 점수 열의 너비를 더 넓게 */
  min-width: 80px; /* 최소 너비 유지 */
  max-width: 80px; /* 최대 너비 제한 */
  white-space: nowrap;
}

/* 다른 */
</style>

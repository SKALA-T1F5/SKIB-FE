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
            class="question-list-panels d-flex flex-column flex-grow-1"
            v-model="expandedPanels"
          >
            <v-expansion-panel
              v-for="doc in documents"
              :key="doc.id"
              elevation="0"
              :value="doc.id"
              rounded="lg"
              class="d-flex flex-column"
            >
              <v-expansion-panel-title class="text-body-1 font-weight-medium">
                {{ doc.name.length > 20 ? doc.name.substring(0, 17) + '...' : doc.name }} ({{
                  doc.questions.length
                }})
              </v-expansion-panel-title>
              <v-expansion-panel-text class="d-flex flex-column flex-grow-1">
                <div class="question-list-scrollable flex-grow-1">
                  <v-list lines="two" class="py-0">
                    <template v-for="(item, i) in doc.questions" :key="item.id">
                      <v-list-item
                        :active="selectedQuestionIndex === questions.indexOf(item)"
                        color="secondary"
                        rounded="sm"
                        density="compact"
                        @click="selectQuestion(questions.indexOf(item))"
                        class="question-list-item"
                      >
                        <h6 class="text-body-2 text-medium-emphasis">
                          Q{{ String(questions.indexOf(item) + 1).padStart(2, '0') }} ({{
                            item.type === 'MCQ' ? '객관식' : '주관식'
                          }})
                        </h6>
                        <p class="text-caption text-medium-emphasis">
                          {{ item.question.substring(0, 30) }}...
                        </p>
                      </v-list-item>
                      <v-divider v-if="i < doc.questions.length - 1" class="my-2"></v-divider>
                    </template>
                  </v-list>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="8" class="d-flex flex-column">
      <v-card elevation="0" class="section-bg flex-grow-1">
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
          <h4 class="section-title mb-6">문제 정보</h4>
          <div v-if="currentQuestion" class="d-flex flex-column flex-grow-1">
            <div class="d-flex align-center flex-wrap mb-4">
              <h4 class="text-h6 mr-3 font-weight-bold aligned-text-item" style="color: #191d5a">
                Q{{ String(selectedQuestionIndex + 1).padStart(2, '0') }}
              </h4>
              <span class="text-body-2 mr-2 aligned-text-item" style="color: grey">
                {{ currentQuestion.documentName }}
              </span>
              <v-chip
                v-for="(tag, kIdx) in currentQuestion.tags"
                :key="kIdx"
                size="small"
                color="primary"
                variant="flat"
                rounded="lg"
                class="ml-1 mr-1 my-1 enhanced-tag"
              >
                #{{ tag }}
              </v-chip>
              <span class="ml-2 difficulty-text aligned-text-item" :class="getDifficultyClass()">
                {{ getDifficultyText() }}
              </span>
              <v-spacer></v-spacer>

              <v-btn
                variant="flat"
                class="ml-2 refresh-button-icon"
                @click="refreshQuestion"
                :loading="isRefreshing"
                :disabled="questions.length === 0"
                icon
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>

            <div class="question-section flex-grow-1">
              <div class="question-content-wrapper">
                <p class="question-text">{{ currentQuestion.question }}</p>

                <div class="options-container" v-if="currentQuestion.type === 'MCQ'">
                  <div
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    class="option-item"
                    :class="{ 'is-correct': option === currentQuestion.answer }"
                  >
                    <span class="option-label">{{ getOptionLabel(index) }}</span>
                    <span class="option-content">{{ option }}</span>
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <div class="solution-section flex-grow-1">
              <h4 class="solution-title">정답 및 해설</h4>
              <div
                v-if="currentQuestion.explanation && currentQuestion.type === 'MCQ'"
                class="solution-text-scrollable"
              >
                {{ currentQuestion.explanation }}
              </div>
              <div
                v-else-if="
                  currentQuestion.type === 'Subjective' &&
                  currentQuestion.gradingCriteria &&
                  currentQuestion.gradingCriteria.length > 0
                "
                class="grading-criteria-scrollable"
              >
                <v-table density="compact" class="grading-table">
                  <thead>
                    <tr>
                      <th class="text-left score-column">점수</th>
                      <th class="text-left">기준</th>
                      <th class="text-left">예시</th>
                      <th class="text-left">참고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(criterion, index) in currentQuestion.gradingCriteria" :key="index">
                      <td class="score-column">{{ criterion.score }}점</td>
                      <td>{{ criterion.criteria }}</td>
                      <td>{{ criterion.example || '-' }}</td>
                      <td>{{ criterion.note || '-' }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
              <div v-else class="no-solution">
                <p>이 문제에 대한 풀이 또는 채점 기준이 없습니다.</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10">
            <p class="text-h6 text-medium-emphasis">
              좌측 목록에서 문제를 선택하여 상세 내용을 확인하세요.
            </p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="bottom-fixed-actions">
    <v-col cols="12" class="d-flex justify-space-between align-center px-0">
      <v-btn variant="flat" color="grey" class="force-white" @click="prevStep"> 이전 단계 </v-btn>
      <div class="d-flex align-center mr-2" style="gap: 8px">
        <v-btn
          variant="flat"
          color="grey"
          class="force-white"
          :disabled="selectedQuestionIndex === 0 || questions.length === 0"
          @click="moveToPreviousQuestion"
        >
          이전 문제
        </v-btn>
        <v-btn
          variant="flat"
          color="grey"
          class="force-white"
          :disabled="selectedQuestionIndex === questions.length - 1 || questions.length === 0"
          @click="moveToNextQuestion"
        >
          다음 문제
        </v-btn>
        <v-btn
          variant="flat"
          color="#191d5a"
          @click="nextStep"
          :disabled="questions.length === 0 || isFetchingQuestions"
        >
          검토 완료
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['next-step', 'prev-step', 'update:isLoading'])

const props = defineProps({
  testId: [Number, String],
  isLoading: {
    type: Boolean,
    default: false,
  },
  selectedDocument: {
    type: Object,
    default: null,
  },
  revenues: {
    type: Array,
    default: () => [],
  },
  examGoal: {
    type: String,
    default: '',
  },
  questionsData: {
    // TrainerTestManagement.vue에서 전달받는 questionsData prop
    type: Array,
    default: () => [],
  },
})

function nextStep() {
  const selectedQuestionIds = questions.value.map((q) => q.id) // 현재 화면에 노출된(선택된) 문제들의 ID
  const initialQuestionIds = new Set(props.questionsData.map((q) => q.id)) // 초기 questionsData의 모든 문제 ID

  // 초기 questionsData에는 있었지만, 현재 questions.value에는 없는 문제들의 ID
  const toDeleteQuestionIds = Array.from(initialQuestionIds).filter(
    (id) => !selectedQuestionIds.includes(id),
  )

  emit('next-step', { selectedQuestionIds, toDeleteQuestionIds })
}

function prevStep() {
  emit('prev-step')
}

const documents = ref([])
const questions = ref([])
const extraQuestions = ref([]) // EXTRA 문제들을 별도로 저장
const selectedQuestionIndex = ref(0)
const isFetchingQuestions = ref(false) // Prop으로 전달받은 isLoading을 따르도록 설정
const isRefreshing = ref(false) // EXTRA 문제 새로고침 로딩 상태

const currentQuestion = computed(() => {
  return questions.value[selectedQuestionIndex.value]
})

const expandedPanels = ref([])

// TraineeQuestionArea.vue의 getOptionLabel 함수와 동일
const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + ')'
}

// 난이도를 텍스트로 변환하는 함수
const getDifficultyText = () => {
  if (!currentQuestion.value || !currentQuestion.value.difficultyLevel) return 'NORMAL'

  return currentQuestion.value.difficultyLevel // 이미 문자열로 제공됨 (EASY, NORMAL, HARD)
}

// 난이도별 CSS 클래스 반환
const getDifficultyClass = () => {
  const difficultyText = getDifficultyText()
  return `difficulty-${difficultyText.toLowerCase()}`
}

// BASIC 문제를 EXTRA 문제로 교체하는 함수
const refreshQuestion = () => {
  if (!currentQuestion.value || extraQuestions.value.length === 0) {
    console.warn('교체할 수 있는 EXTRA 문제가 없습니다.')
    return
  }

  isRefreshing.value = true

  try {
    // 현재 문제와 같은 문서의 EXTRA 문제들을 필터링
    const sameDocumentExtraQuestions = extraQuestions.value.filter(
      (q) => q.documentId === currentQuestion.value.documentId && q.id !== currentQuestion.value.id,
    )

    let replacementQuestion = null

    if (sameDocumentExtraQuestions.length > 0) {
      // 같은 문서의 다른 EXTRA 문제가 있으면 거기서 선택
      const randomIndex = Math.floor(Math.random() * sameDocumentExtraQuestions.length)
      replacementQuestion = sameDocumentExtraQuestions[randomIndex]
    } else {
      // 같은 문서의 다른 EXTRA 문제가 없으면 전체 EXTRA 문제에서 현재 문제와 다른 것을 선택
      const allDifferentExtraQuestions = extraQuestions.value.filter(
        (q) => q.id !== currentQuestion.value.id,
      )
      if (allDifferentExtraQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allDifferentExtraQuestions.length)
        replacementQuestion = allDifferentExtraQuestions[randomIndex]
      }
    }

    if (!replacementQuestion) {
      console.warn('교체할 수 있는 다른 EXTRA 문제가 없습니다.')
      isRefreshing.value = false
      return
    }

    // 현재 문제를 선택된 EXTRA 문제로 교체
    const currentIndex = selectedQuestionIndex.value
    questions.value[currentIndex] = {
      ...replacementQuestion,
      isReplaced: true, // 교체된 문제임을 표시
    }

    // 문서 목록도 업데이트
    updateDocumentsList()

    console.log('문제 교체 완료:', replacementQuestion.question.substring(0, 50) + '...')
  } catch (error) {
    console.error('문제 교체 중 오류 발생:', error)
  } finally {
    // 짧은 딜레이 후 로딩 해제 (UX 개선)
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

// 문서 목록 업데이트 함수
const updateDocumentsList = () => {
  const docsMap = new Map()

  questions.value.forEach((q) => {
    const docId = q.documentId
    if (!docsMap.has(docId)) {
      docsMap.set(docId, {
        id: docId,
        name: q.documentName,
        questions: [],
      })
    }
    docsMap.get(docId).questions.push(q)
  })

  documents.value = Array.from(docsMap.values())
}

// 임시 데이터 (더 많은 데이터 추가됨)
const sampleQuestions = [
  {
    id: 'q1-doc1',
    documentId: 'doc1',
    documentName: 'Vue.js 기초와 심화 학습 가이드',
    question: 'Vue.js의 라이프사이클 훅 중 컴포넌트가 마운트된 직후 호출되는 훅은 무엇인가요?',
    type: 'MCQ',
    options: ['beforeCreate', 'created', 'beforeMount', 'mounted'],
    answer: 'mounted',
    explanation:
      '`mounted` 훅은 컴포넌트가 DOM에 마운트된 직후 호출되어 DOM 접근이 필요한 작업을 수행하기에 적합합니다.',
    gradingCriteria: null,
    keywords: ['Vue.js', '라이프사이클 훅'],
    tags: ['프론트엔드', 'Vue', '기초'],
    difficultyLevel: 'NORMAL',
    generationType: 'BASIC',
  },
  {
    id: 'q2-doc1',
    documentId: 'doc1',
    documentName: 'Vue.js 기초와 심화 학습 가이드',
    question: 'Vuex의 `state`에 직접 접근하여 값을 변경하는 방법과 권장되는 방법을 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      'Vuex의 `state`는 직접 변경할 수 있지만, 이는 권장되지 않습니다. `state`를 변경하는 유일한 권장 방법은 `mutations`를 사용하는 것입니다. `mutations`를 통해 변경하면 변경 이력을 추적하고 디버깅하기 용이해집니다.',
    explanation:
      'Vuex는 예측 가능한 상태 관리를 위해 `mutations`를 통한 상태 변경을 강제합니다. `actions`는 비동기 로직을 처리하고 `mutations`를 `commit`하여 상태를 변경합니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: 'state 직접 변경 비권장 이유와 mutations를 통한 변경의 중요성을 정확히 설명함',
        example:
          'state는 mutations를 통해서만 변경해야 디버깅 및 추적 용이. 직접 변경 시 상태 예측 어려움.',
        note: '',
      },
      {
        score: 3,
        criteria: 'mutations 사용을 언급했으나 직접 변경의 문제점 설명이 부족함',
        example: '',
        note: '',
      },
      {
        score: 1,
        criteria: 'Vuex 상태 관리 개념에 대한 이해가 부족함',
        example: '',
        note: '부분 점수',
      },
    ],
    keywords: ['Vuex', 'State', 'Mutations'],
    tags: ['프론트엔드', 'Vue', '심화'],
    difficultyLevel: 'HARD',
    generationType: 'BASIC',
  },
  {
    id: 'q3-doc1',
    documentId: 'doc1',
    documentName: 'Vue.js 기초와 심화 학습 가이드',
    question:
      'Vue 컴포넌트 간 데이터 전달 방법 중 부모에서 자식으로 데이터를 전달할 때 사용하는 것은 무엇인가요?',
    type: 'MCQ',
    options: ['Emit', 'Provide/Inject', 'Props', 'Vuex'],
    answer: 'Props',
    explanation: '부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달할 때는 `Props`를 사용합니다.',
    gradingCriteria: null,
    keywords: ['Vue.js', '데이터 전달', 'Props'],
    tags: ['프론트엔드', 'Vue', '기초'],
    difficultyLevel: 'EASY',
    generationType: 'BASIC',
  },
  {
    id: 'q1-doc2',
    documentId: 'doc2',
    documentName: 'JavaScript 핵심 개념과 활용',
    question: 'JavaScript에서 호이스팅(Hoisting)에 대해 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      '호이스팅은 JavaScript에서 인터프리터가 코드 실행 전에 변수 및 함수 선언을 해당 스코프의 맨 위로 "끌어올리는" 동작을 의미합니다. 변수는 `undefined`로 초기화되지만, 함수 선언은 전체가 호이스팅됩니다.',
    explanation:
      'JavaScript의 호이스팅은 선언이 스코프의 맨 위로 이동하는 것처럼 동작하는 특징입니다. `var` 변수와 함수 선언에 적용되며, `let`과 `const`는 TDZ(Temporal Dead Zone)의 영향을 받습니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: '호이스팅의 정의와 동작 방식을 정확히 설명하고, 변수와 함수 선언의 차이를 언급함',
        example:
          '변수와 함수 선언이 스코프 상단으로 이동하는 것. 변수는 undefined로, 함수는 전체가 호이스팅됨',
        note: '',
      },
      {
        score: 3,
        criteria: '호이스팅의 정의는 설명했지만, 변수와 함수 선언의 차이에 대한 언급이 부족함',
        example: '',
        note: '',
      },
      {
        score: 1,
        criteria: '호이스팅에 대한 피상적인 이해 또는 일부 오류가 있음',
        example: '',
        note: '부분 점수',
      },
    ],
    keywords: ['JavaScript', '호이스팅'],
    tags: ['프론트엔드', 'JavaScript', '핵심'],
    difficultyLevel: 'HARD',
    generationType: 'BASIC',
  },
  {
    id: 'q2-doc2',
    documentId: 'doc2',
    documentName: 'JavaScript 핵심 개념과 활용',
    question:
      '자바스크립트의 이벤트 버블링(Event Bubbling)과 캡처링(Event Capturing)에 대해 설명하시오.',
    type: 'Subjective',
    options: [],
    answer:
      '이벤트 버블링은 이벤트가 발생한 요소부터 부모 요소로 전파되는 현상이고, 이벤트 캡처링은 이벤트가 DOM의 최상위 요소부터 이벤트 발생 요소까지 하위로 전파되는 현상입니다. 대부분의 브라우저는 캡처링 단계에서 이벤트를 포착한 후 버블링 단계에서 처리합니다.',
    explanation:
      '`addEventListener`의 세 번째 인자를 `true`로 설정하면 캡처링 단계에서 이벤트를 처리할 수 있습니다. `event.stopPropagation()`을 사용하면 이벤트 전파를 중단시킬 수 있습니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: '버블링과 캡처링을 정확히 구분하고 설명하며, 발생 순서와 제어 방법을 언급함',
        example:
          '버블링: 자식->부모, 캡처링: 부모->자식. addEventListener 옵션, stopPropagation() 설명.',
        note: '',
      },
      {
        score: 3,
        criteria: '두 개념을 설명했으나 발생 순서나 제어 방법에 대한 설명이 부족함',
        example: '',
        note: '',
      },
      { score: 1, criteria: '이벤트 전파에 대한 이해가 부족함', example: '', note: '부분 점수' },
    ],
    keywords: ['JavaScript', '이벤트', '버블링', '캡처링'],
    tags: ['프론트엔드', 'JavaScript', 'DOM'],
    difficultyLevel: 'HARD',
    generationType: 'BASIC',
  },
  {
    id: 'q3-doc2',
    documentId: 'doc2',
    documentName: 'JavaScript 핵심 개념과 활용',
    question: 'ES6에서 도입된 `let`과 `const` 키워드가 `var`와 다른 점을 설명하세요.',
    type: 'MCQ',
    options: [
      '`var`는 함수 스코프, `let`과 `const`는 블록 스코프를 가집니다.',
      '`let`과 `const`는 호이스팅되지 않습니다.',
      '`var`는 재선언 및 재할당이 가능하고, `const`는 재선언 및 재할당이 불가능합니다.',
      '모든 설명이 옳습니다.',
    ],
    answer: '모든 설명이 옳습니다.',
    explanation:
      '`var`는 함수 스코프를 가지며, 재선언 및 재할당이 자유롭습니다. `let`과 `const`는 블록 스코프를 가지며, `let`은 재할당이 가능하지만 재선언은 불가능하고, `const`는 재선언 및 재할당 모두 불가능합니다. `let`과 `const`도 호이스팅되지만, TDZ(Temporal Dead Zone)에 의해 실제 사용 전에 접근하면 오류가 발생합니다.',
    gradingCriteria: null,
    keywords: ['JavaScript', 'ES6', 'let', 'const', 'var'],
    tags: ['프론트엔드', 'JavaScript', 'ES6'],
    difficultyLevel: 'NORMAL',
    generationType: 'BASIC',
  },
  {
    id: 'q1-doc3',
    documentId: 'doc3',
    documentName: '웹 표준과 접근성 이해하기',
    question: '웹 접근성(Web Accessibility)이 중요한 이유를 두 가지 이상 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      '웹 접근성은 장애인, 고령자 등 신체적 제약이 있는 사용자들도 웹 콘텐츠를 동등하게 이용할 수 있도록 보장하는 것을 의미합니다. 중요한 이유는 다음과 같습니다: 1) **사회적 형평성**: 모든 사람이 정보에 접근할 권리가 있으며, 웹 접근성은 이를 실현하는 데 필수적입니다. 2) **법적 의무**: 많은 국가에서 웹 접근성을 법적으로 의무화하고 있습니다. 3) **사용성 향상**: 웹 접근성을 고려한 설계는 모든 사용자에게 더 나은 사용성을 제공하며, 검색 엔진 최적화에도 도움이 됩니다.',
    explanation:
      '웹 접근성은 단순히 장애인을 위한 것이 아니라, 기술적 제약이나 환경적 제약이 있는 모든 사용자들을 포함하여 웹 사용의 보편성을 높이는 중요한 개념입니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: '웹 접근성의 정의와 함께 중요성을 2가지 이상 명확하고 구체적으로 설명함',
        example: '사회적 형평성, 법적 의무, 사용성 향상 등 구체적 설명',
        note: '',
      },
      {
        score: 3,
        criteria: '정의는 설명했으나 중요성 설명이 한 가지에 그치거나 불명확함',
        example: '',
        note: '',
      },
      { score: 1, criteria: '웹 접근성 개념에 대한 이해가 부족함', example: '', note: '부분 점수' },
    ],
    keywords: ['웹 접근성', '웹 표준'],
    tags: ['웹', '표준', '접근성'],
    difficultyLevel: 'HARD',
    generationType: 'BASIC',
  },
  {
    id: 'q2-doc3',
    documentId: 'doc3',
    documentName: '웹 표준과 접근성 이해하기',
    question: 'HTML 시맨틱 태그(Semantic Tags)를 사용하는 주된 목적은 무엇인가요?',
    type: 'MCQ',
    options: [
      '웹 페이지의 디자인을 더 아름답게 만들기 위함',
      '검색 엔진 최적화(SEO) 및 웹 접근성 향상',
      '자바스크립트 코드 작성 시 편의성 증대',
      '브라우저 호환성 문제 해결',
    ],
    answer: '검색 엔진 최적화(SEO) 및 웹 접근성 향상',
    explanation:
      '시맨틱 태그(예: `<header>`, `<nav>`, `<article>`, `<footer>`)는 콘텐츠의 의미를 명확하게 전달하여 검색 엔진이 웹 페이지 내용을 더 잘 이해하도록 돕고, 스크린 리더 같은 보조 기술이 페이지 구조를 파악하여 웹 접근성을 높이는 데 기여합니다.',
    gradingCriteria: null,
    keywords: ['HTML', '시맨틱 태그', '웹 표준'],
    tags: ['웹', 'HTML', 'SEO', '접근성'],
    difficultyLevel: 'NORMAL',
    generationType: 'BASIC',
  },
  {
    id: 'q1-doc4',
    documentId: 'doc4',
    documentName: '데이터베이스 시스템 기초',
    question:
      '관계형 데이터베이스에서 `JOIN` 연산이 필요한 이유와 `INNER JOIN`의 개념을 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      '`JOIN`은 여러 테이블에 분리 저장된 데이터를 논리적으로 연결하여 함께 조회하기 위해 사용됩니다. 데이터 중복을 피하고 무결성을 유지하기 위함입니다. `INNER JOIN`은 두 테이블에서 조인 조건에 맞는 행만 반환하는 가장 기본적인 조인 방식입니다.',
    explanation:
      '관계형 데이터베이스는 정규화를 통해 데이터 중복을 최소화하고 데이터 무결성을 유지합니다. 이 과정에서 데이터가 여러 테이블에 분산되므로, 필요한 정보를 얻기 위해 `JOIN` 연산이 필수적입니다. `INNER JOIN` 외에도 `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN` 등이 있습니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: 'JOIN의 필요성(정규화, 데이터 통합)과 INNER JOIN의 동작 방식을 정확히 설명함',
        example: '데이터 분리 저장의 단점 극복, 무결성 유지. INNER JOIN: 조건 맞는 행만 반환.',
        note: '',
      },
      {
        score: 3,
        criteria: 'JOIN의 필요성은 설명했으나 INNER JOIN 설명이 부족하거나 부정확함',
        example: '',
        note: '',
      },
      {
        score: 1,
        criteria: '데이터베이스 JOIN에 대한 이해가 부족함',
        example: '',
        note: '부분 점수',
      },
    ],
    keywords: ['데이터베이스', 'JOIN', '관계형 데이터베이스'],
    tags: ['백엔드', '데이터베이스', 'SQL'],
    difficultyLevel: 'HARD',
    generationType: 'BASIC',
  },
  {
    id: 'q2-doc4',
    documentId: 'doc4',
    documentName: '데이터베이스 시스템 기초',
    question:
      'SQL의 `WHERE` 절에서 사용되는 `LIKE` 연산자의 역할은 무엇이며, 어떤 와일드카드 문자가 사용되나요?',
    type: 'MCQ',
    options: [
      '`LIKE`는 정확히 일치하는 문자열을 찾고, `%`와 `_`가 사용됩니다.',
      '`LIKE`는 패턴 매칭을 위해 사용되며, `%`와 `_`가 사용됩니다.',
      '`LIKE`는 숫자 범위 비교에 사용되며, `*`와 `?`가 사용됩니다.',
      '`LIKE`는 문자열 길이 비교에 사용되며, `$`와 `#`가 사용됩니다.',
    ],
    answer: '`LIKE`는 패턴 매칭을 위해 사용되며, `%`와 `_`가 사용됩니다.',
    explanation:
      '`LIKE` 연산자는 `WHERE` 절에서 특정 패턴에 일치하는 문자열을 검색할 때 사용됩니다. `%`는 0개 이상의 문자를, `_`는 단일 문자를 나타내는 와일드카드 문자입니다.',
    gradingCriteria: null,
    keywords: ['SQL', 'WHERE', 'LIKE', '와일드카드'],
    tags: ['백엔드', '데이터베이스', 'SQL'],
    difficultyLevel: 'NORMAL',
    generationType: 'BASIC',
  },
  {
    id: 'eq1-doc1',
    documentId: 'doc1',
    documentName: 'Vue.js 기초와 심화 학습 가이드',
    question: 'Vuex의 Mutations와 Actions의 차이점은 무엇인가요?',
    type: 'MCQ',
    options: [
      'Mutations는 비동기 로직을 처리하고, Actions는 동기 로직을 처리합니다.',
      'Mutations는 직접 상태를 변경하고, Actions는 Mutations를 커밋하여 상태를 변경합니다.',
      'Mutations는 API 호출에 사용되고, Actions는 UI 이벤트를 처리합니다.',
      'Mutations와 Actions는 기능적으로 동일합니다.',
    ],
    answer: 'Mutations는 직접 상태를 변경하고, Actions는 Mutations를 커밋하여 상태를 변경합니다.',
    explanation:
      'Mutations는 Vuex 상태(state)를 직접 변경하는 유일한 방법이며 항상 동기적으로 실행됩니다. Actions는 비동기 작업을 포함할 수 있으며, 실제 상태 변경은 Mutations를 커밋(commit)하는 방식으로 이루어집니다.',
    gradingCriteria: null,
    keywords: ['Vuex', 'Mutations', 'Actions'],
    tags: ['프론트엔드', 'Vue', 'EXTRA'],
    difficultyLevel: 'NORMAL',
    generationType: 'EXTRA',
  },
  {
    id: 'eq2-doc1',
    documentId: 'doc1',
    documentName: 'Vue.js 기초와 심화 학습 가이드',
    question:
      'Vue 3의 Composition API가 기존 Options API에 비해 가지는 장점을 2가지 이상 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      'Composition API는 로직 재사용성 향상(컴포저블), 관련된 로직을 한 곳에 모아 코드를 더 읽기 쉽게 만듦(가독성), 대규모 컴포넌트의 코드 관리 용이성, 타입 추론 개선(TypeScript 사용 시) 등의 장점을 가집니다.',
    explanation:
      'Composition API는 Vue 2의 Mixins나 HOC(Higher-Order Components)가 가지는 단점(네이밍 충돌, 데이터 출처 불명확)을 해결하며, 반응형 로직을 더 유연하게 구성할 수 있게 합니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: 'Composition API의 장점 2가지 이상을 구체적이고 정확하게 설명함',
        example: '로직 재사용성, 가독성, 대규모 컴포넌트 관리 용이성, TypeScript 지원 개선 등.',
        note: '',
      },
      {
        score: 3,
        criteria: '장점을 한 가지 언급했거나 설명이 다소 추상적임',
        example: '',
        note: '',
      },
      {
        score: 1,
        criteria: 'Composition API에 대한 이해가 부족함',
        example: '',
        note: '부분 점수',
      },
    ],
    keywords: ['Vue 3', 'Composition API', 'Options API'],
    tags: ['프론트엔드', 'Vue', 'EXTRA'],
    difficultyLevel: 'HARD',
    generationType: 'EXTRA',
  },
  {
    id: 'eq1-doc2',
    documentId: 'doc2',
    documentName: 'JavaScript 핵심 개념과 활용',
    question: '자바스크립트의 클로저(Closure)에 대해 예시와 함께 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      '클로저는 내부 함수가 외부 함수의 스코프에 있는 변수에 접근할 수 있는 현상을 말합니다. 외부 함수가 실행을 마쳐도 내부 함수가 외부 함수의 변수를 참조하고 있다면 그 변수는 가비지 컬렉션의 대상이 되지 않고 메모리에 유지됩니다. 예를 들어, `function outer() { let count = 0; return function inner() { count++; return count; } }` 에서 `inner` 함수는 `outer` 함수의 `count` 변수에 대한 클로저를 형성합니다.',
    explanation:
      '클로저는 자바스크립트의 강력한 기능 중 하나로, 함수형 프로그래밍 패턴을 구현하거나 프라이빗 변수를 만들 때 유용하게 사용됩니다. 클로저는 함수와 그 함수가 선언될 당시의 렉시컬 환경의 조합입니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: '클로저의 정의와 동작 원리를 정확히 설명하고 적절한 코드 예시를 제공함',
        example:
          '내부 함수가 외부 함수 스코프 변수 접근 + 외부 함수 종료 후에도 변수 유지 + 코드 예시',
        note: '',
      },
      {
        score: 3,
        criteria: '클로저 정의는 설명했으나 예시가 부족하거나 동작 원리 설명이 불완전함',
        example: '',
        note: '',
      },
      { score: 1, criteria: '클로저에 대한 이해가 부족함', example: '', note: '부분 점수' },
    ],
    keywords: ['JavaScript', '클로저'],
    tags: ['프론트엔드', 'JavaScript', 'EXTRA'],
    difficultyLevel: 'HARD',
    generationType: 'EXTRA',
  },
  {
    id: 'eq2-doc2',
    documentId: 'doc2',
    documentName: 'JavaScript 핵심 개념과 활용',
    question: '자바스크립트에서 `null`과 `undefined`의 차이점을 설명하세요.',
    type: 'MCQ',
    options: [
      '`null`은 값이 없는 것을 나타내고, `undefined`는 변수가 선언되었지만 값이 할당되지 않은 상태를 나타냅니다.',
      '`null`은 객체 타입이고, `undefined`는 원시 타입입니다.',
      '`null`은 개발자가 의도적으로 값을 비울 때 사용하고, `undefined`는 시스템이 값을 할당하지 못했을 때 사용합니다.',
      '모든 설명이 옳습니다.',
    ],
    answer:
      '`null`은 값이 없는 것을 나타내고, `undefined`는 변수가 선언되었지만 값이 할당되지 않은 상태를 나타냅니다.',
    explanation:
      '`null`은 "값이 없음"을 명시적으로 나타내는 할당된 값입니다. `typeof null`은 `object`를 반환합니다. `undefined`는 변수가 선언되었지만 아직 값이 할당되지 않았거나, 존재하지 않는 속성에 접근할 때 나타나는 값입니다. `typeof undefined`는 `undefined`를 반환합니다.',
    gradingCriteria: null,
    keywords: ['JavaScript', 'null', 'undefined'],
    tags: ['프론트엔드', 'JavaScript', 'EXTRA'],
    difficultyLevel: 'NORMAL',
    generationType: 'EXTRA',
  },
  {
    id: 'eq1-doc3',
    documentId: 'doc3',
    documentName: '웹 표준과 접근성 이해하기',
    question: 'ARIA(Accessible Rich Internet Applications)의 역할과 중요성에 대해 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      'ARIA는 웹 콘텐츠 및 웹 애플리케이션의 접근성을 향상시키기 위한 기술 표준입니다. 주로 HTML만으로 의미를 전달하기 어려운 동적인 콘텐츠나 사용자 인터페이스 컴포넌트(예: 탭, 아코디언, 모달)에 추가적인 시맨틱 정보를 제공하여, 스크린 리더와 같은 보조 기술이 이를 이해하고 사용자에게 올바르게 전달할 수 있도록 돕습니다.',
    explanation:
      'ARIA 속성(roles, states, properties)은 요소의 역할(role), 상태(state), 속성(property)을 정의하여 보조 기술에 추가 정보를 제공합니다. 이를 통해 시각적 정보에 의존하지 않는 사용자도 복잡한 웹 애플리케이션을 효과적으로 사용할 수 있습니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: 'ARIA의 정의, 역할(시맨틱 정보 제공), 중요성(보조 기술 지원)을 정확히 설명함',
        example: 'HTML로 표현 어려운 동적 UI에 시맨틱 정보 제공. 스크린 리더 등 보조 기술에 중요.',
        note: '',
      },
      {
        score: 3,
        criteria: 'ARIA의 정의는 언급했으나 역할이나 중요성 설명이 부족함',
        example: '',
        note: '',
      },
      { score: 1, criteria: 'ARIA에 대한 이해가 부족함', example: '', note: '부분 점수' },
    ],
    keywords: ['ARIA', '웹 접근성', '웹 표준'],
    tags: ['웹', '표준', '접근성', 'EXTRA'],
    difficultyLevel: 'HARD',
    generationType: 'EXTRA',
  },
  {
    id: 'eq1-doc4',
    documentId: 'doc4',
    documentName: '데이터베이스 시스템 기초',
    question: '데이터베이스 정규화(Normalization)의 목적과 제1정규형(1NF)의 의미를 설명하세요.',
    type: 'Subjective',
    options: [],
    answer:
      '정규화는 데이터 중복을 최소화하고 데이터 무결성을 보장하며, 데이터 삽입, 삭제, 갱신 시 발생할 수 있는 이상(Anomaly) 현상을 방지하기 위한 과정입니다. 제1정규형(1NF)은 테이블의 모든 도메인이 원자 값(atomic value)으로만 구성되어야 한다는 것을 의미하며, 반복되는 그룹이 없어야 합니다.',
    explanation:
      '정규화는 데이터베이스 설계에서 매우 중요한 단계입니다. 1NF 외에도 2NF, 3NF, BCNF 등이 있으며, 각 정규형은 이전 정규형의 조건을 만족하면서 추가적인 제약을 가합니다.',
    gradingCriteria: [
      {
        score: 5,
        criteria: '정규화의 목적(중복 최소화, 무결성, 이상 현상 방지)과 1NF의 개념을 정확히 설명함',
        example: '데이터 중복 줄이고 이상 현상 막기. 1NF: 원자값, 반복 그룹 없음.',
        note: '',
      },
      {
        score: 3,
        criteria: '정규화의 목적이나 1NF 설명 중 하나가 부족하거나 부정확함',
        example: '',
        note: '',
      },
      {
        score: 1,
        criteria: '데이터베이스 정규화에 대한 이해가 부족함',
        example: '',
        note: '부분 점수',
      },
    ],
    keywords: ['데이터베이스', '정규화', '1NF'],
    tags: ['백엔드', '데이터베이스', 'EXTRA'],
    difficultyLevel: 'HARD',
    generationType: 'EXTRA',
  },
]

// questionsData prop이 변경될 때마다 내부 상태 업데이트
const processQuestionsData = (data) => {
  const docsMap = new Map()
  const allQuestions = []
  const allExtraQuestions = []
  let uniqueDocCounter = 0
  let uniqueQuestionCounter = 0

  const sourceData = data && data.length > 0 ? data : sampleQuestions // questionsData가 비어있으면 sampleQuestions 사용

  sourceData.forEach((q) => {
    const docId = q.documentId || q.documentName || `generated-doc-id-${uniqueDocCounter++}`

    const processedQuestion = {
      id: q.id || `question-id-${uniqueQuestionCounter++}`,
      documentId: docId,
      documentName: q.documentName || '알 수 없는 문서',
      question: q.question || '질문 내용 없음',
      type: q.type === 'OBJECTIVE' ? 'MCQ' : q.type === 'SUBJECTIVE' ? 'Subjective' : q.type,
      options: q.options || [],
      answer: q.answer || '정답 정보 없음',
      explanation: q.explanation || '해설 정보 없음',
      gradingCriteria: q.gradingCriteria || null,
      keywords: q.keywords || [],
      tags: q.tags || [],
      difficultyLevel:
        q.difficultyLevel || ['EASY', 'NORMAL', 'HARD'][Math.floor(Math.random() * 3)], // 임시 데이터 난이도 무작위
      generationType: q.generationType || 'BASIC',
      isReplaced: q.isReplaced || false,
    }

    if (processedQuestion.generationType === 'BASIC') {
      if (!docsMap.has(docId)) {
        docsMap.set(docId, {
          id: docId,
          name: processedQuestion.documentName,
          questions: [],
        })
      }
      docsMap.get(docId).questions.push(processedQuestion)
      allQuestions.push(processedQuestion)
    }

    if (processedQuestion.generationType === 'EXTRA') {
      allExtraQuestions.push(processedQuestion)
    }
  })

  documents.value = Array.from(docsMap.values())
  questions.value = allQuestions
  extraQuestions.value = allExtraQuestions

  if (selectedQuestionIndex.value >= questions.value.length) {
    selectedQuestionIndex.value = Math.max(0, questions.value.length - 1)
  }

  if (questions.value.length > 0 && documents.value.length > 0) {
    expandedPanels.value = [documents.value[0]?.id]
  } else {
    expandedPanels.value = []
  }
}

watch(
  () => props.questionsData,
  (newQuestionsData) => {
    isFetchingQuestions.value = props.isLoading
    if (newQuestionsData && newQuestionsData.length > 0) {
      processQuestionsData(newQuestionsData)
    } else {
      // newQuestionsData가 비어있거나 없을 때만 sampleQuestions 사용
      processQuestionsData(sampleQuestions)
    }
  },
  { immediate: true },
)

watch(
  () => props.isLoading,
  (newVal) => {
    isFetchingQuestions.value = newVal
  },
)

const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
}

const moveToNextQuestion = () => {
  if (selectedQuestionIndex.value < questions.value.length - 1) {
    selectedQuestionIndex.value++
  }
}

const moveToPreviousQuestion = () => {
  if (selectedQuestionIndex.value > 0) {
    selectedQuestionIndex.value--
  }
}

onMounted(() => {
  // 컴포넌트 마운트 시 questionsData prop을 감시하므로 별도의 fetch 호출 불필요
})
</script>

<style scoped>
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

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

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

/* Enhanced tag styling */
.enhanced-tag {
  font-weight: 500 !important;
  background-color: #e0e7ed !important; /* Soft grey-blue */
  color: #3f5e7f !important; /* Darker blue text */
  border: 1px solid #c8d3dd !important;
  box-shadow: none !important; /* Remove shadow */
  padding: 3px 10px !important; /* Adjust padding */
  font-size: 0.75rem !important; /* Smaller font */
  height: auto !important; /* Adjust height based on content */
}

/* Difficulty text styling */
.difficulty-text {
  font-weight: bold;
  font-size: 0.75rem; /* Smaller font size for consistency */
  padding: 4px 10px; /* Adjusted padding */
  border-radius: 16px; /* More rounded */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: none !important; /* Remove shadow */
  display: inline-flex; /* To better control padding and height */
  align-items: center;
  justify-content: center;
}

.difficulty-easy {
  background-color: #e6f4ea; /* Light green */
  color: #388e3c; /* Darker green */
  border: 1px solid #a8dab5;
}

.difficulty-normal {
  background-color: #fff8e1; /* Light orange */
  color: #f57f17; /* Darker orange */
  border: 1px solid #ffe082;
}

.difficulty-hard {
  background-color: #fbe9e7; /* Light red */
  color: #d32f2f; /* Darker red */
  border: 1px solid #ffab91;
}

/* Refresh Button (아이콘만) */
.refresh-button-icon {
  background-color: transparent !important; /* 배경 투명 */
  color: #191d5a !important; /* 아이콘 색상 */
  box-shadow: none !important; /* 그림자 제거 */
  min-width: 36px !important; /* 아이콘 버튼 최소 너비 */
  width: 36px !important; /* 아이콘 버튼 너비 */
  height: 36px !important; /* 아이콘 버튼 높이 */
  padding: 0 !important; /* 패딩 제거 */
  border-radius: 50% !important; /* 원형으로 */
  transition: background-color 0.2s ease-in-out;
}

.refresh-button-icon:hover {
  background-color: rgba(25, 29, 90, 0.1) !important; /* 호버 시 약간의 배경색 */
}

.refresh-button-icon:active {
  background-color: rgba(25, 29, 90, 0.2) !important; /* 클릭 시 더 진한 배경색 */
}

.refresh-button-icon.v-btn--disabled {
  opacity: 0.4 !important; /* 비활성화 시 투명도 */
  cursor: not-allowed !important;
}

/* Question Header alignment */
.aligned-text-item {
  /* This is to ensure text nodes align better with v-chip/v-btn */
  display: inline-flex;
  align-items: center;
  /* Add consistent vertical padding to align text visually */
  padding-top: 4px;
  padding-bottom: 4px;
}

/* Expansion panel styles */
.question-list-panels {
  display: flex;
  flex-grow: 1; /* Make the panels container grow */
  min-height: 0; /* Ensure it can shrink if needed */
}

.question-list-panels :deep(.v-expansion-panel) {
  display: flex;
  min-height: unset; /* Vuetify 기본 min-height 설정을 해제 */
  background-color: #f8f8f8;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

/* 열린 패널의 경우, 내용이 전체 공간을 채우도록 */
.question-list-panels :deep(.v-expansion-panel.v-expansion-panel--active) {
  flex-grow: 1; /* 열린 패널만 남은 공간을 채우도록 함 */
}

.question-list-panels :deep(.v-expansion-panel-title) {
  min-height: 48px;
  padding: 0 16px;
  flex-shrink: 0; /* Title should not shrink */
}

.question-list-panels :deep(.v-expansion-panel__content) {
  padding-left: 0;
  padding-right: 0;
  display: flex; /* Make content area a flex container */
  flex-grow: 1; /* Allow content to grow */
  min-height: 0; /* Allow content to shrink */
  overflow-y: hidden; /* v-list-item이 패널을 넘어가지 않도록 숨김 */
}

.question-list-scrollable {
  height: 100%; /* Fill the height of its flex parent */
  flex-grow: 1; /* Allow scrollable area to grow */
  min-height: 0; /* Allow scrollable area to shrink */
}

/* 리스트 아이템 스타일 */
.question-list-panels .v-list-item {
  border-radius: 4px;
  /* margin-bottom removed to prevent double margin with divider */
  transition: background-color 0.2s ease;
  padding-left: 12px;
}

.question-list-panels .v-list-item:hover {
  background-color: #f9f9f9;
}

.question-list-panels .v-list-item.v-list-item--active {
  background-color: #f5f5f5;
  border-left: 4px solid #1976d2;
  color: #191d5a;
}

.question-list-panels .v-list-item.v-list-item--active h6,
.question-list-panels .v-list-item.v-list-item--active p {
  color: #191d5a !important;
}

/* 문제 목록 간 구분선 스타일 */
.question-list-panels .v-divider {
  border-color: rgba(0, 0, 0, 0.08) !important; /* 연한 구분선 색상 */
}

/* 문제 정보 UI 스타일 (TraineeQuestionArea.vue 및 TraineeSolutionArea.vue 참조) */
.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 내용물이 길어져도 이 요소가 커지는 것을 방지하고 스크롤을 허용 */
  overflow-y: auto; /* **문제 영역 전체 스크롤** */
  padding-right: 10px; /* 스크롤바 공간 확보 */
  /* margin-bottom removed - now controlled by divider */
}

.question-section::-webkit-scrollbar {
  width: 6px;
}
.question-section::-webkit-scrollbar-track {
  background: transparent;
}
.question-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.question-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.question-content-wrapper {
  flex-grow: 1; /* 문제 텍스트와 보기를 감싸는 컨테이너가 공간을 채우도록 */
  display: flex;
  flex-direction: column;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  margin: 0 0 20px 0; /* 하단 마진 추가 */
  color: #495057;
  flex-shrink: 0; /* 문제 텍스트 자체는 축소되지 않도록 */
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1; /* 옵션 컨테이너가 남은 공간을 채우도록 */
  min-height: 0; /* 스크롤 가능하도록 */
  align-items: center; /* **선택지 중앙 정렬** */
  width: 100%; /* 부모 너비 전체 사용 */
}

.option-item {
  display: flex;
  align-items: flex-start;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 25px;
  font-size: 16px;
  color: #495057;
  cursor: default;
  transition: all 0.2s ease-in-out;
  position: relative;
  width: 100%; /* 옵션 아이템이 부모 너비를 채우도록 */
}

/* **정답인 경우 초록색 표시** */
.option-item.is-correct {
  background-color: #e6f4ea; /* Light green background */
  border-color: #4caf50; /* Green border */
  color: #2e7d32; /* Darker green text */
  font-weight: 500;
}

.option-item.is-correct .option-label {
  color: #2e7d32; /* Darker green for label */
}

.option-label {
  min-width: 30px;
  font-weight: bold;
  margin-right: 15px;
  color: #6c757d;
  flex-shrink: 0;
}

.option-content {
  flex-grow: 1;
  word-break: break-word;
}

.solution-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 내용물이 길어져도 이 요소가 커지는 것을 방지하고 스크롤을 허용 */
  overflow-y: auto; /* 내용이 넘칠 때 스크롤바 생성 */
  padding-right: 10px; /* 스크롤바 공간 확보 */
}

.solution-section::-webkit-scrollbar {
  width: 6px;
}
.solution-section::-webkit-scrollbar-track {
  background: transparent;
}
.solution-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.solution-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.solution-title {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.solution-text-scrollable {
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.7;
  color: #495057;
  min-height: 0; /* Flexbox 아이템이 내용물에 의해 커지는 것을 방지 */
}

/* Styling for the new grading table */
.grading-criteria-scrollable {
  overflow-x: auto; /* 가로 스크롤 추가 */
  min-height: 0;
  padding-bottom: 10px; /* 스크롤바가 내용물을 가리지 않도록 여유 공간 */
}

.grading-criteria-scrollable::-webkit-scrollbar {
  height: 8px; /* 가로 스크롤바 높이 */
}

.grading-criteria-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.grading-criteria-scrollable::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.grading-criteria-scrollable::-webkit-scrollbar-thumb:hover {
  background: #555;
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

/* 다른 열들은 콘텐츠에 따라 자동으로 너비가 조절되도록 */
.grading-table :deep(th:not(.score-column)),
.grading-table :deep(td:not(.score-column)) {
  width: auto;
  white-space: normal; /* 다른 열은 줄바꿈 허용 */
}

.grading-table :deep(th) {
  background-color: #f0f4f7;
  font-weight: 600;
  color: #34495e;
  text-transform: none; /* Prevent uppercase from Vuetify table header */
}

.grading-table :deep(tr:last-child td) {
  border-bottom: none;
}

.no-solution {
  color: #777;
  font-style: italic;
  padding: 15px 0;
  text-align: center;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

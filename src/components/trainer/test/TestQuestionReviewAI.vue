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
        <v-card-text class="pa-8 d-flex flex-column flex-grow-1">
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
            class="question-list-panels flex-grow-1"
            v-model="expandedPanels"
          >
            <v-expansion-panel
              v-for="doc in documents"
              :key="doc.id"
              elevation="0"
              :value="doc.id"
              rounded="lg"
            >
              <v-expansion-panel-title class="text-body-1 font-weight-medium">
                {{ doc.name.length > 20 ? doc.name.substring(0, 17) + '...' : doc.name }} ({{
                  doc.questions.length
                }})
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="question-list-scrollable">
                  <v-list lines="two" class="py-0">
                    <v-list-item
                      v-for="(item, i) in doc.questions"
                      :key="item.id"
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
        <v-card-text class="pa-8">
          <h4 class="section-title mb-6">문제 정보</h4>
          <div v-if="currentQuestion">
            <div class="d-flex align-center flex-wrap mb-4">
              <h4 class="text-h6 mt-1 mr-3 font-weight-bold" style="color: #191d5a">
                Q{{ String(selectedQuestionIndex + 1).padStart(2, '0') }}
              </h4>
              <span class="text-h8 mt-1 mr-2" style="color: grey">
                {{ currentQuestion.documentName }}
              </span>
              <v-chip
                v-for="(keyword, kIdx) in currentQuestion.tags"
                :key="kIdx"
                size="x-small"
                color="blue-grey-lighten-4"
                variant="tonal"
                rounded="lg"
                class="ml-1 mr-1 my-1"
              >
                {{ keyword }}
              </v-chip>
              <span class="text-h8 mt-1 ml-2" style="color: grey"> | {{ difficultyStars }} </span>
              <v-spacer></v-spacer>
            </div>

            <h4 class="text-h8 mt-1 font-weight-bold mb-2">문제</h4>
            <v-textarea
              v-model="currentQuestionAndOptions"
              readonly
              variant="plain"
              rows="6"
              auto-grow
              hide-details
              class="custom-textarea"
              rounded="lg"
              density="compact"
            ></v-textarea>

            <v-divider class="my-6"></v-divider>

            <div class="d-flex align-center mb-2">
              <h4 class="text-h8 mt-1 font-weight-bold">정답 및 채점기준</h4>
            </div>
            <v-textarea
              v-model="currentAnswerAndExplanation"
              readonly
              variant="plain"
              rows="6"
              auto-grow
              hide-details
              class="custom-textarea"
              rounded="lg"
              density="compact"
            ></v-textarea>
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
const emit = defineEmits(['next-step', 'prev-step'])

const props = defineProps({
  testId: [Number, String],
  isLoading: {
    type: Boolean,
    default: false,
  },
})

function nextStep() {
  emit('next-step')
}

function prevStep() {
  emit('prev-step')
}

const documents = ref([])
const questions = ref([]) // 현재 선택된 문서의 문제 목록 (실제 표시용)

const isFetchingQuestions = ref(false)
const selectedQuestionIndex = ref(0)

const currentQuestionAndOptions = ref('')
const currentAnswerAndExplanation = ref('')

const currentQuestion = computed(() => {
  return questions.value[selectedQuestionIndex.value] || null
})

const expandedPanels = ref([]) // 초기에는 모든 패널 닫힘

const difficultyStars = computed(() => {
  const level = currentQuestion.value?.difficultyLevel
  if (typeof level === 'number' && level >= 1 && level <= 5) {
    return '⭐'.repeat(level)
  }
  return ''
})

const formatAnswerAndExplanation = (question) => {
  if (!question) return ''

  let formattedText = `[정답] ${question.answer}\n[해설] ${question.explanation || ''}`

  if (question.type === 'SAQ' && question.gradingCriteria) {
    formattedText += '\n\n[채점기준]'
    question.gradingCriteria.forEach((criteria) => {
      formattedText += `\n- ${criteria.score}점: ${criteria.criteria}`
    })
  }

  return formattedText
}

const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
  if (questions.value.length > 0) {
    const question = questions.value[index]
    currentQuestionAndOptions.value =
      question.question +
      '\n' +
      (question.options || []).map((option, idx) => `${idx + 1}. ${option}`).join('\n')
    currentAnswerAndExplanation.value = formatAnswerAndExplanation(question)
  } else {
    currentQuestionAndOptions.value = ''
    currentAnswerAndExplanation.value = ''
  }
}

const fetchDocumentsAndQuestions = async () => {
  isFetchingQuestions.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800)) // 로딩 시뮬레이션

    const fetchedData = [
      {
        id: 1,
        name: 'Aiper Front 개발환경 가이드',
        questions: [
          {
            id: 1,
            type: 'MCQ',
            difficultyLevel: 3,
            question: '프론트엔드 빌드 도구 중 하나는 무엇인가요?',
            options: ['Webpack', 'MySQL', 'Nginx', 'Photoshop', 'Figma'],
            answer: 'Webpack',
            explanation:
              'Webpack은 프론트엔드 애플리케이션의 모듈을 번들링하고 최적화된 결과물을 생성하는 대표적인 빌드 도구입니다.',
            tags: ['기초이해'],
            documentId: 1,
            documentName: 'Aiper Front 개발환경 가이드',
          },
          {
            id: 2,
            type: 'MCQ',
            difficultyLevel: 3,
            question: '환경 변수를 설정할 때 일반적으로 사용하는 파일 확장자는 무엇인가요?',
            options: ['.json', '.xml', '.env', '.txt', '.md'],
            answer: '.env',
            explanation:
              '.env 파일은 환경 변수 설정을 위해 널리 사용되며, 실행 시 애플리케이션 설정 정보를 안전하게 관리할 수 있습니다.',
            tags: ['실무적용'],
            documentId: 1,
            documentName: 'Aiper Front 개발환경 가이드',
          },
          {
            id: 3,
            type: 'MCQ',
            difficultyLevel: 3,
            question: '패키지 관리를 위한 대표적인 도구는 무엇인가요?',
            options: ['npm', 'Git', 'Jira', 'Slack', 'Confluence'],
            answer: 'npm',
            explanation:
              'npm은 자바스크립트 패키지를 설치하고 관리하기 위한 대표적인 패키지 관리 도구입니다.',
            tags: ['기초이해'],
            documentId: 1,
            documentName: 'Aiper Front 개발환경 가이드',
          },
          {
            id: 4,
            type: 'SAQ',
            difficultyLevel: 3,
            question: '빌드 최적화를 위해 사용하는 기법 한 가지를 작성하세요.',
            options: null,
            answer: '코드 스플리팅',
            gradingCriteria: [
              {
                score: 0,
                criteria: '관련 없는 설명',
                example: '최적화와 관계 없는 답변입니다.',
                note: '관련 없는 설명',
              },
              {
                score: 1,
                criteria: '최적화에 대한 추상적 언급',
                example: '최적화가 필요합니다.',
                note: '구체적인 기법이 없음',
              },
              {
                score: 3,
                criteria: '빌드 최적화 기법을 간단히 설명',
                example: '코드 압축을 사용합니다.',
                note: '구체적이나 간략함',
              },
              {
                score: 5,
                criteria: '빌드 최적화 기법과 효과를 구체적으로 설명',
                example: '코드 스플리팅을 통해 초기 로딩 시간을 단축시킵니다.',
                note: '정확하고 구체적인 설명',
              },
            ],
            explanation:
              '코드 스플리팅은 애플리케이션을 여러 청크로 나누어 초기 로딩 속도를 개선하는 최적화 기법입니다.',
            tags: ['문제해결력'],
            documentId: 1,
            documentName: 'Aiper Front 개발환경 가이드',
          },
          {
            id: 5,
            type: 'SAQ',
            difficultyLevel: 3,
            question: '개발 환경 구축 시 자주 발생하는 문제와 해결 방법을 작성하세요.',
            options: null,
            answer: '의존성 충돌 발생 시 패키지 재설치',
            gradingCriteria: [
              {
                score: 0,
                criteria: '관련 없는 설명',
                example: '개발 환경은 중요합니다.',
                note: '관련 없는 설명',
              },
              {
                score: 1,
                criteria: '문제만 언급',
                example: '충돌이 자주 발생합니다.',
                note: '해결 방법 없음',
              },
              {
                score: 3,
                criteria: '문제와 해결 방법을 간단히 언급',
                example: '의존성 충돌 시 패키지를 재설치합니다.',
                note: '구체적이나 간략함',
              },
              {
                score: 5,
                criteria: '문제 발생 상황과 구체적인 해결 방법 설명',
                example:
                  '의존성 충돌이 발생하면 node_modules 폴더를 삭제하고 패키지를 재설치하여 해결합니다.',
                note: '정확하고 구체적인 설명',
              },
            ],
            explanation:
              '패키지 의존성 충돌 시 기존 패키지를 삭제 후 재설치하면 버전 불일치를 해결할 수 있습니다.',
            tags: ['문제해결력'],
            documentId: 1,
            documentName: 'Aiper Front 개발환경 가이드',
          },
        ],
      },
      {
        id: 2,
        name: 'alopex_UI_1.1.2_개발가이드',
        questions: [
          {
            id: 6,
            type: 'MCQ',
            difficultyLevel: 3,
            question: '디자인 시스템의 주요 목적은 무엇인가요?',
            options: ['일관성 유지', '빠른 배포', '코드 리뷰', '성능 튜닝', '데이터 분석'],
            answer: '일관성 유지',
            explanation:
              '디자인 시스템은 UI 요소의 일관성과 재사용성을 유지하기 위한 표준화된 시스템입니다.',
            tags: ['디자인이해'],
            documentId: 2,
            documentName: 'alopex_UI_1.1.2_개발가이드',
          },
          {
            id: 7,
            type: 'MCQ',
            difficultyLevel: 3,
            question: 'UI 최적화 시 중요한 요소는 무엇인가요?',
            options: [
              '로딩 속도',
              '백엔드 언어',
              '테스트 커버리지',
              '코드 리뷰 빈도',
              '데이터베이스 종류',
            ],
            answer: '로딩 속도',
            explanation:
              'UI 최적화는 사용자 경험 향상을 위해 빠른 로딩 속도를 유지하는 것이 중요합니다.',
            tags: ['실무적용'],
            documentId: 2,
            documentName: 'alopex_UI_1.1.2_개발가이드',
          },
          {
            id: 8,
            type: 'MCQ',
            difficultyLevel: 3,
            question: '반응형 디자인 구현 시 고려해야 할 것은 무엇인가요?',
            options: ['화면 크기', '서버 위치', '데이터 암호화', '서버 로드', '배포 빈도'],
            answer: '화면 크기',
            explanation:
              '반응형 디자인은 다양한 화면 크기에 대응하여 최적의 사용자 경험을 제공하는 것이 목표입니다.',
            tags: ['기초이해'],
            documentId: 2,
            documentName: 'alopex_UI_1.1.2_개발가이드',
          },
          {
            id: 9,
            type: 'SAQ',
            difficultyLevel: 3,
            question: '사용자 경험(UX)을 개선하는 UI 설계 원칙 한 가지를 작성하세요.',
            options: null,
            answer: '명확한 피드백 제공',
            gradingCriteria: [
              {
                score: 0,
                criteria: '관련 없는 설명',
                example: 'UI는 예쁘게 만드는 것이 좋습니다.',
                note: '관련 없는 설명',
              },
              {
                score: 1,
                criteria: '추상적 UX 원칙',
                example: '사용자에게 좋은 경험을 줍니다.',
                note: '구체적인 설계 원칙 없음',
              },
              {
                score: 3,
                criteria: 'UX 원칙을 간단히 설명',
                example: '사용자에게 명확한 피드백을 제공해야 합니다.',
                note: '구체적이나 간략함',
              },
              {
                score: 5,
                criteria: 'UX 원칙과 적용 예시까지 설명',
                example:
                  '명확한 피드백 제공으로 사용자가 자신의 행동 결과를 즉시 알 수 있게 하여 오류를 줄입니다.',
                note: '정확하고 구체적인 설명',
              },
            ],
            explanation:
              '명확한 피드백 제공은 사용자가 인터랙션 결과를 쉽게 이해할 수 있도록 돕는 핵심 UX 설계 원칙입니다.',
            tags: ['이해력'],
            documentId: 2,
            documentName: 'alopex_UI_1.1.2_개발가이드',
          },
          {
            id: 10,
            type: 'SAQ',
            difficultyLevel: 3,
            question: '디자인 시스템을 구축할 때 필수 요소 두 가지를 작성하세요.',
            options: null,
            answer: '컴포넌트 재사용성, 접근성',
            gradingCriteria: [
              {
                score: 0,
                criteria: '관련 없는 설명',
                example: '디자인은 창의적이어야 합니다.',
                note: '관련 없는 설명',
              },
              {
                score: 1,
                criteria: '디자인 시스템 요소만 나열',
                example: '버튼과 텍스트입니다.',
                note: '핵심 요소 언급 없음',
              },
              {
                score: 3,
                criteria: '핵심 요소 중 한 가지 언급',
                example: '컴포넌트 재사용성이 중요합니다.',
                note: '불완전한 설명',
              },
              {
                score: 5,
                criteria: '핵심 요소 두 가지를 정확히 기술',
                example: '컴포넌트의 재사용성 확보와 웹 접근성 준수입니다.',
                note: '정확하고 구체적인 설명',
              },
            ],
            explanation:
              '컴포넌트 재사용성과 접근성은 디자인 시스템의 핵심 요소로, 효율적 개발과 사용자 다양성 대응에 필수적입니다.',
            tags: ['분석력'],
            documentId: 2,
            documentName: 'alopex_UI_1.1.2_개발가이드',
          },
        ],
      },
      {
        id: 3,
        name: '개발 Process 흐름도_sample',
        questions: [
          {
            id: 11,
            type: 'MCQ',
            difficultyLevel: 3,
            question: 'CI의 주요 목표는 무엇인가요?',
            options: ['자동화된 테스트', '디자인 일관성', '데이터 분석', '로컬 개발', '디버깅'],
            answer: '자동화된 테스트',
            explanation:
              'CI(Continuous Integration)는 개발 중 변경 사항을 자동으로 테스트하여 코드 품질을 유지하는 것이 주요 목표입니다.',
            tags: ['기초이해'],
            documentId: 3,
            documentName: '개발 Process 흐름도_sample',
          },
          {
            id: 12,
            type: 'MCQ',
            difficultyLevel: 3,
            question: 'CD 파이프라인에서 중요한 단계는 무엇인가요?',
            options: ['자동 배포', '화면 설계', 'DB 최적화', '코드 포맷팅', '로컬 테스트'],
            answer: '자동 배포',
            explanation:
              'CD(Continuous Delivery/Deployment)는 자동 배포를 통해 빠르고 안정적인 릴리스를 지원하는 것이 핵심 단계입니다.',
            tags: ['실무적용'],
            documentId: 3,
            documentName: '개발 Process 흐름도_sample',
          },
          {
            id: 13,
            type: 'MCQ',
            difficultyLevel: 3,
            question: 'Rollback은 언제 수행하나요?',
            options: [
              '서비스 오류 발생 시',
              '테스트 통과 시',
              '서버 증설 시',
              '코드 작성 시',
              'QA 완료 후',
            ],
            answer: '서비스 오류 발생 시',
            explanation:
              'Rollback은 배포 후 서비스 오류 발생 시 안정적인 상태로 복구하기 위해 수행됩니다.',
            tags: ['문제해결력'],
            documentId: 3,
            documentName: '개발 Process 흐름도_sample',
          },
          {
            id: 14,
            type: 'SAQ',
            difficultyLevel: 3,
            question: '효율적인 CI/CD 구축 시 필요한 필수 도구 한 가지를 작성하세요.',
            options: null,
            answer: 'Jenkins',
            gradingCriteria: [
              {
                score: 0,
                criteria: '관련 없는 설명',
                example: 'CI/CD는 편리합니다.',
                note: '관련 없는 설명',
              },
              {
                score: 1,
                criteria: '도구와 관련 없는 일반 설명',
                example: '자동화가 필요합니다.',
                note: '구체적인 도구 없음',
              },
              {
                score: 3,
                criteria: '도구 명칭만 언급',
                example: 'Jenkins를 사용합니다.',
                note: '구체적이나 간략함',
              },
              {
                score: 5,
                criteria: '도구 명칭과 역할 설명',
                example: 'Jenkins를 사용하여 자동 빌드 및 배포를 수행할 수 있습니다.',
                note: '정확하고 구체적인 설명',
              },
            ],
            explanation:
              'Jenkins는 CI/CD 프로세스를 자동화하여 소프트웨어의 지속적인 통합과 배포를 지원하는 오픈 소스 도구입니다.',
            tags: ['기초이해'],
            documentId: 3,
            documentName: '개발 Process 흐름도_sample',
          },
          {
            id: 15,
            type: 'SAQ',
            difficultyLevel: 3,
            question: '프로세스 흐름도를 설계할 때 중요한 원칙 한 가지를 작성하세요.',
            options: null,
            answer: '단순성 유지',
            gradingCriteria: [
              {
                score: 0,
                criteria: '관련 없는 설명',
                example: '흐름도는 그림입니다.',
                note: '관련 없는 설명',
              },
              {
                score: 1,
                criteria: '추상적 원칙만 언급',
                example: '좋게 만들어야 합니다.',
                note: '구체적인 원칙 없음',
              },
              {
                score: 3,
                criteria: '원칙만 간단히 언급',
                example: '단순성을 유지해야 합니다.',
                note: '구체적이나 간략함',
              },
              {
                score: 5,
                criteria: '원칙과 적용 이유까지 설명',
                example: '단순성 유지를 통해 흐름도의 가독성과 이해도를 높여야 합니다.',
                note: '정확하고 구체적인 설명',
              },
            ],
            explanation:
              '단순성 유지는 프로세스 흐름도의 가독성과 이해도를 높이기 위한 핵심 원칙입니다.',
            tags: ['이해력'],
            documentId: 3,
            documentName: '개발 Process 흐름도_sample',
          },
        ],
      },
    ]

    documents.value = fetchedData

    // 첫 번째 문서의 문제들을 questions에 할당하여 초기 표시
    if (documents.value.length > 0) {
      questions.value = documents.value[0].questions
      selectQuestion(0) // 첫 번째 문제 자동 선택
      expandedPanels.value = [documents.value[0].id] // 첫 번째 문서 패널이 기본으로 열리도록 설정
    }
  } catch (error) {
    console.error('문제 목록 불러오기 실패 (Mock):', error)
    questions.value = []
    documents.value = []
  } finally {
    isFetchingQuestions.value = false
  }
}

onMounted(() => {
  fetchDocumentsAndQuestions()
})

watch(
  () => props.testId,
  (newId) => {
    if (newId) {
      console.log('testId changed:', newId)
      fetchDocumentsAndQuestions()
    }
  },
  { immediate: true },
)

const moveToPreviousQuestion = () => {
  if (selectedQuestionIndex.value > 0) {
    selectQuestion(selectedQuestionIndex.value - 1)
  }
}

const moveToNextQuestion = () => {
  if (selectedQuestionIndex.value < questions.value.length - 1) {
    selectQuestion(selectedQuestionIndex.value + 1)
  }
}
</script>

<style scoped>
/* TestConfig.vue에서 가져온 공통 스타일 */
.force-white {
  color: white !important;
}

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
  background: #eef2f6; /* 섹션 배경색 변경 */
  border-radius: 12px;
  border: 1px solid #e0e0e0; /* 얇은 테두리 추가 */
  /* box-shadow 제거 */
}

/* 섹션 제목 스타일 */
.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 24px; /* v-card-text 패딩과 함께 통일성 확보 */
  font-family: inherit;
  display: flex;
  align-items: center;
  height: 32px; /* 고정 높이 */
}

/* 좌측 문제 목록 스크롤 가능 영역 */
.question-list-scrollable {
  /*
  * 부모 v-expansion-panel-text의 높이에서 v-expansion-panel-title 높이를 제외한
  * 영역을 채우도록 max-height를 조정합니다.
  * Vuetify v-expansion-panel-title의 기본 높이는 56px 입니다.
  */
  max-height: calc(100% - 56px);
  overflow-y: auto;
  padding-right: 8px; /* 스크롤바와 내용 겹치지 않게 패딩 추가 */
}

/* Expansion Panels 내 리스트 아이템 스타일 */
.question-list-panels .v-expansion-panel {
  margin-bottom: 0px !important; /* 각 문서 목록 간 간격 삭제 */
  border-radius: 8px !important;
  border: 1px solid #f0f0f0; /* 패널 테두리 추가 */
}

.question-list-panels .v-expansion-panel-title {
  height: 56px;
  min-height: 56px;
  font-weight: 500; /* 글자 두께 조정 */
}

.question-list-panels .v-list-item {
  border-bottom: 1px solid #f5f5f5; /* 더 연한 구분선 */
  border-radius: 8px;
  transition:
    background-color 0.2s ease,
    border-left 0.2s ease;
  margin-bottom: 4px;
  padding-left: 12px !important; /* 좌측 패딩 조정 */
}

.question-list-panels .v-list-item:last-child {
  border-bottom: none;
}

.question-list-panels .v-list-item:hover {
  background-color: #f9f9f9; /* 호버 시 더 밝은 배경색 */
}

.question-list-panels .v-list-item.v-list-item--active {
  background-color: #f5f5f5; /* 선택된 항목 배경색 */
  border-left: 4px solid #1976d2; /* 좌측에 파란색 하이라이트 */
  color: #191d5a; /* 선택된 항목 글자색 */
}

.question-list-panels .v-list-item.v-list-item--active h6,
.question-list-panels .v-list-item.v-list-item--active p {
  color: #191d5a !important; /* 선택된 항목 내부 글자색 */
}

/* 텍스트 필드, 텍스트 영역 등의 글꼴 크기 조정 */
.custom-textarea {
  border: 1px solid #e0e0e0; /* 테두리 추가 */
  border-radius: 8px;
  padding: 16px !important; /* 패딩 증가 */
  transition: border-color 0.2s ease;
  background-color: white !important; /* 배경색 흰색으로 변경 */
}

.custom-textarea :deep(textarea) {
  font-size: 0.95rem !important;
  background-color: transparent !important; /* 배경색 투명하게 */
  padding-top: 8px !important; /* 윗부분 잘림 해결 및 내부 textarea 패딩 조정 */
  padding-bottom: 8px !important; /* 하단 패딩도 조정 */
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.custom-textarea.v-textarea.v-input--plain-text :deep(.v-field__input) {
  padding-top: 8px !important; /* Vuetify 기본 패딩 조정 */
}

/* 하단 고정 버튼을 위한 스타일 (TestConfig.vue와 통일) */
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

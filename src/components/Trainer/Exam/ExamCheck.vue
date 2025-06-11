<template>
  <v-container class="trainer-container">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">테스트 생성</h2>
          <p class="text-body-2 text-medium-emphasis">Step 3 of 4 : AI가 만든 문제를 확인할 수 있습니다. 완료 후 다음 단계로 이동하세요.</p>

        </div>
        <v-progress-linear :model-value="65" height="10" color="primary" bg-color="primary" rounded></v-progress-linear>
      </v-col>
    </v-row>
    <v-row>
      <!-- 테스트 문항 목록 섹션 -->
      <v-col cols="12" sm="3">

        <v-card elevation="0" style="height:100%">
          <v-card-text>

            <!-- <div class="d-flex align-center"> -->
              <v-expansion-panels>
                <v-expansion-panel elevation="0">
                  <v-expansion-panel-title>
                    <h4 class="text-h8 mt-1">문서 목록</h4>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div>
                      <PerfectScrollbar>
                        <v-list lines="two" class="py-0">
                          <v-list-item v-for="(doc, i) in documents" :key="i" :value="doc" color="secondary"
                            rounded="sm" density="compact" @click="selectDocument(doc)">
                            <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                              {{ doc.name }}
                            </h6>
                          </v-list-item>
                        </v-list>
                      </PerfectScrollbar>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel elevation="0">
                <v-expansion-panel-title>
                  <h4 class="text-h8 mt-1">문항 목록</h4>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div>
                    <PerfectScrollbar style="height: 260px;">
                      <v-list lines="two" class="py-0">
                        <v-list-item v-for="(item, i) in testItems" :key="i" :value="item" color="secondary" rounded="sm" density="compact"
                          @click="selectQuestion(i)">
                          <div class="d-flex align-center w-100">
                            <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                              Q{{ String(item.id).padStart(2, '0' ) }} ({{ item.type === 'MCQ' ? '객관식' : '주관식' }})
                            </h6>
                          </div>
                        </v-list-item>
                      </v-list>
                    </PerfectScrollbar>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
              </v-expansion-panels>
            <!-- </div> -->
            
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 문제 및 정답/풀이 섹션 -->
      <v-col cols="12" sm="9">
        <v-card elevation="0" style="height:220px">
          <v-card-text>
            <div class="d-flex align-center">
              <h4 class="text-h8 mt-1"> Q{{ String(testItems[selectedQuestionIndex]?.id).padStart(2, '0') }}</h4> &nbsp&nbsp&nbsp
              <h4 class="text-h8 mt-1" style="color:grey">{{ selectedDocument.name }} | {{ selectedDocument.tag }} | {{ difficultyStars }}</h4>
              <v-spacer></v-spacer>
              <v-btn v-if="!isEditing" icon variant="flat" size="x-small" class="ml-2" color="primary" @click="toggleEditMode">
                <v-icon style="color:white">mdi-pencil</v-icon>
              </v-btn>
              <div v-else class="d-flex align-center">
                <v-btn variant="flat" size="small" class="ml-2" color="grey" @click="cancelEdit">취소</v-btn>
                <v-btn variant="flat" size="small" class="ml-2" color="success" @click="saveChanges">저장</v-btn>
              </div>
            </div>
            <v-textarea
              v-model="currentQuestionAndOptions"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              rows="6"
              auto-grow
              hide-details
              class="ml-2 custom-textarea"
            ></v-textarea>
          </v-card-text>
          </v-card>

        <div class="d-flex align-end mb-4" style="height:1%"></div>
        <v-card elevation="0" style="height:230px">
          <v-card-text>
            <div class="d-flex align-center">
              <h4 class="text-h8 mt-1">정답 및 채점기준</h4>
            </div>
            <v-textarea
              v-model="currentAnswerAndExplanation"
              :readonly="!isEditing"
              :variant="isEditing ? 'outlined' : 'plain'"
              rows="6"
              auto-grow
              hide-details
              class="ml-2 custom-textarea"
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 하단 버튼 섹션 -->
    <v-row style="position: absolute; top: 570px;width: 100%;">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <v-btn variant="flat" color="gray" class="mr-2 force-white" @click="prevStep">← 이전단계</v-btn>
        <div class="d-flex align-center mr-2" style="gap: 8px;">
          <v-btn 
            variant="flat" 
            color="gray" 
            class="force-white"
            :disabled="selectedQuestionIndex === 0"
            @click="moveToPreviousQuestion"
          >
            이전문제
          </v-btn>
          <v-btn 
            variant="flat" 
            color="gray" 
            class="force-white"
            :disabled="selectedQuestionIndex === testItems.length - 1"
            @click="moveToNextQuestion"
          >
            다음문제
          </v-btn>
          <v-btn variant="flat" color="primary" @click="nextStep">검토완료</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 저장되지 않은 변경사항 확인 모달 -->
    <Modal ref="unsavedChangesModal" title="저장되지 않은 변경사항" content="페이지를 벗어나면 저장되지 않은 변경사항이 유실됩니다. 계속하시겠습니까?"
      @confirm="handleConfirmLeave" @cancel="handleCancelLeave" />

  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';
import Modal from '@/components/ui/Modal.vue';
import axios from 'axios';

// Vue Router 인스턴스
const router = useRouter();

// 컴포넌트에서 발생시킬 이벤트 정의
const emit = defineEmits(['next-step', 'prev-step']);

function nextStep() {
  emit('next-step');
}

function prevStep() {
  emit('prev-step');
}

// 문서 목록 데이터
const documents = ref([]);

// 테스트 문항 데이터
const testItems = ref([]);
const allTestItems = ref([]); // 모든 문항을 저장할 새로운 변수 추가

// 초기 선택된 문제 설정
const selectedQuestionIndex = ref(0);
const currentAnswerAndExplanation = ref('');
const isEditing = ref(false);
const currentQuestionAndOptions = ref('');

// 선택된 문서 정보
const selectedDocument = ref({
  id: null, // 전체 문서를 구분하기 위한 id 추가
  name: '',
  tag: '',
  difficultyLevel: '',
});

// 난이도 숫자를 별표 문자열로 변환하는 computed 속성
const difficultyStars = computed(() => {
  const level = selectedDocument.value.difficultyLevel;
  if (typeof level === 'number' && level >= 1 && level <= 5) {
    return '⭐'.repeat(level);
  }
  return '';
});

const formatAnswerAndExplanation = (question) => {
  if (!question) return '';
  
  let formattedText = `[정답] ${question.answer}\n[해설] ${question.explanation || ''}`;
  
  if (question.type === 'SAQ' && question.gradingCriteria) {
    formattedText += '\n\n[채점기준]';
    question.gradingCriteria.forEach(criteria => {
      formattedText += `\n${criteria.score}점 | ${criteria.criteria} | 예시: ${criteria.example} | 비고: ${criteria.note}`;
    });
  }
  
  return formattedText;
};

// 문제 선택 핸들러
const selectQuestion = (index) => {
  selectedQuestionIndex.value = index;
  if (testItems.value.length > 0) {
    const question = testItems.value[index];
    currentQuestionAndOptions.value = question.question + '\n' + (question.options || []).map((option, idx) => `${idx + 1}. ${option}`).join('\n');
    currentAnswerAndExplanation.value = formatAnswerAndExplanation(question);
    
    const documentInfo = documents.value.find(doc => doc.id === question.documentId);
    if (documentInfo) {
      selectedDocument.value.name = documentInfo.name;
      selectedDocument.value.tag = question.tags.join(', ');
      selectedDocument.value.difficultyLevel = question.difficultyLevel;
    }
  } else {
    currentQuestionAndOptions.value = '';
    currentAnswerAndExplanation.value = '';
    selectedDocument.value = { id: null, name: '', tag: '', difficultyLevel: '' };
  }
};

// 편집 모드 토글
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

// 변경 사항 저장 (실제 백엔드 연동 필요)
const saveChanges = async () => {
  try {
    const questionId = testItems.value[selectedQuestionIndex.value].id;
    const documentId = testItems.value[selectedQuestionIndex.value].documentId;
    const question = testItems.value[selectedQuestionIndex.value];
    
    const lines = currentAnswerAndExplanation.value.split('\n');
    const updatedQuestion = {
      question: currentQuestionAndOptions.value.split('\n')[0],
      answer: lines.find(line => line.startsWith('[정답]'))?.replace('[정답]', '').trim() || '',
      explanation: lines.find(line => line.startsWith('[해설]'))?.replace('[해설]', '').trim() || '',
      options: currentQuestionAndOptions.value.split('\n').slice(1).map(option => option.substring(option.indexOf('.') + 2)),
    };

    if (question.type === 'SAQ') {
      const gradingCriteriaStart = lines.findIndex(line => line.trim() === '[채점기준]');
      if (gradingCriteriaStart !== -1) {
        const criteriaLines = lines.slice(gradingCriteriaStart + 1);
        const criteria = [];

        for (const line of criteriaLines) {
          if (line.trim() === '') continue;
          
          const match = line.match(/^(\d+)점 \| (.*?) \| 예시: (.*?) \| 비고: (.*)$/);
          if (match) {
            criteria.push({
              score: parseInt(match[1]),
              criteria: match[2].trim(),
              example: match[3].trim(),
              note: match[4].trim()
            });
          }
        }
        updatedQuestion.gradingCriteria = criteria;
      }
    }

    console.log(updatedQuestion);
    await axios.put(`/api/documents/${documentId}/questions/${questionId}`, updatedQuestion);
    console.log('변경 사항이 성공적으로 저장되었습니다.');
    isEditing.value = false;
  } catch (error) {
    console.error('변경 사항 저장 중 오류 발생:', error);
    alert('변경 사항 저장에 실패했습니다.');
  }
};

// 편집 취소
const cancelEdit = () => {
  // 원래 값으로 되돌리는 로직 (필요시 구현)
  // 예: fetchDocumentsAndQuestions() 다시 호출 또는 편집 전 값 저장
  isEditing.value = false;
};

// 문서 선택 핸들러
const selectDocument = (doc) => {
  if (doc.id === 'all') {
    // '전체 문서' 선택 시 모든 문제 표시
    testItems.value = allTestItems.value;
    selectedDocument.value = { id: 'all', name: '전체 문서', tag: '', difficultyLevel: '' };
  } else {
    // 특정 문서 선택 시 해당 문서의 문제만 필터링
    testItems.value = doc.questions;
    selectedDocument.value = doc;
  }

  if (testItems.value.length > 0) {
    selectQuestion(0); // 첫 번째 문제 선택
  } else {
    currentQuestionAndOptions.value = '';
    currentAnswerAndExplanation.value = '';
  }
};

// 백엔드에서 데이터를 받아오는 예시 함수 (실제 구현 필요)
const fetchDocumentsAndQuestions = async () => {
  // 실제 백엔드 API 호출 로직
  // 예시 데이터 (백엔드에서 받아올 데이터 구조를 가정)
  const fetchedData = [
  {
    id: 1,
    name: 'Aiper Front 개발환경 가이드',
    questions: [
      { id: 1, type: 'MCQ', difficultyLevel: 3, question: '프론트엔드 빌드 도구 중 하나는 무엇인가요?', options: ['Webpack', 'MySQL', 'Nginx', 'Photoshop', 'Figma'], answer: 1, gradingCriteria: null, explanation: 'Webpack은 프론트엔드 애플리케이션의 모듈을 번들링하고 최적화된 결과물을 생성하는 대표적인 빌드 도구입니다.', tags: ['기초이해'], documentId: 1 },
      { id: 2, type: 'MCQ', difficultyLevel: 3, question: '환경 변수를 설정할 때 일반적으로 사용하는 파일 확장자는 무엇인가요?', options: ['.json', '.xml', '.env', '.txt', '.md'], answer: 3, gradingCriteria: null, explanation: '.env 파일은 환경 변수 설정을 위해 널리 사용되며, 실행 시 애플리케이션 설정 정보를 안전하게 관리할 수 있습니다.', tags: ['실무적용'], documentId: 1 },
      { id: 3, type: 'MCQ', difficultyLevel: 3, question: '패키지 관리를 위한 대표적인 도구는 무엇인가요?', options: ['npm', 'Git', 'Jira', 'Slack', 'Confluence'], answer: 1, gradingCriteria: null, explanation: 'npm은 자바스크립트 패키지를 설치하고 관리하기 위한 대표적인 패키지 관리 도구입니다.', tags: ['기초이해'], documentId: 1 },
      { id: 4, type: 'SAQ', difficultyLevel: 3, question: '빌드 최적화를 위해 사용하는 기법 한 가지를 작성하세요.', options: null, answer: '코드 스플리팅', gradingCriteria: [ { score: 0, criteria: "관련 없는 설명", example: ".", note: "관련 없는 설명" }, { score: 1, criteria: "최적화에 대한 추상적 언급", example: "최적화가 필요하다", note: "구체적인 기법이 없음" }, { score: 3, criteria: "빌드 최적화 기법을 간단히 설명", example: "코드 압축", note: "구체적이나 간략함" }, { score: 5, criteria: "빌드 최적화 기법과 효과를 구체적으로 설명", example: "코드 스플리팅을 통해 초기 로딩 시간 단축", note: "정확하고 구체적인 설명" } ], explanation: '코드 스플리팅은 애플리케이션을 여러 청크로 나누어 초기 로딩 속도를 개선하는 최적화 기법입니다.', tags: ['문제해결력'], documentId: 1 },
      { id: 5, type: 'SAQ', difficultyLevel: 3, question: '개발 환경 구축 시 자주 발생하는 문제와 해결 방법을 작성하세요.', options: null, answer: '의존성 충돌 발생 시 패키지 재설치', gradingCriteria: [ { score: 0, criteria: "관련 없는 설명", example: ".", note: "관련 없는 설명" }, { score: 1, criteria: "문제만 언급", example: "충돌이 발생한다", note: "해결 방법 없음" }, { score: 3, criteria: "문제와 해결 방법을 간단히 언급", example: "충돌 시 패키지 재설치", note: "구체적이나 간략함" }, { score: 5, criteria: "문제 발생 상황과 구체적인 해결 방법 설명", example: "의존성 충돌 시 node_modules 삭제 후 재설치", note: "정확하고 구체적인 설명" } ], explanation: '패키지 의존성 충돌 시 기존 패키지를 삭제 후 재설치하면 버전 불일치를 해결할 수 있습니다.', tags: ['문제해결력'], documentId: 1 }
    ]
  },
  {
    id: 2,
    name: 'alopex_UI_1.1.2_개발가이드',
    questions: [
      { id: 6, type: 'MCQ', difficultyLevel: 3, question: '디자인 시스템의 주요 목적은 무엇인가요?', options: ['일관성 유지', '빠른 배포', '코드 리뷰', '성능 튜닝', '데이터 분석'], answer: 1, gradingCriteria: null, explanation: '디자인 시스템은 UI 요소의 일관성과 재사용성을 유지하기 위한 표준화된 시스템입니다.', tags: ['디자인이해'], documentId: 2 },
      { id: 7, type: 'MCQ', difficultyLevel: 3, question: 'UI 최적화 시 중요한 요소는 무엇인가요?', options: ['로딩 속도', '백엔드 언어', '테스트 커버리지', '코드 리뷰 빈도', '데이터베이스 종류'], answer: 1, gradingCriteria: null, explanation: 'UI 최적화는 사용자 경험 향상을 위해 빠른 로딩 속도를 유지하는 것이 중요합니다.', tags: ['실무적용'], documentId: 2 },
      { id: 8, type: 'MCQ', difficultyLevel: 3, question: '반응형 디자인 구현 시 고려해야 할 것은 무엇인가요?', options: ['화면 크기', '서버 위치', '데이터 암호화', '서버 로드', '배포 빈도'], answer: 1, gradingCriteria: null, explanation: '반응형 디자인은 다양한 화면 크기에 대응하여 최적의 사용자 경험을 제공하는 것이 목표입니다.', tags: ['기초이해'], documentId: 2 },
      { id: 9, type: 'SAQ', difficultyLevel: 3, question: '사용자 경험(UX)을 개선하는 UI 설계 원칙 한 가지를 작성하세요.', options: null, answer: '명확한 피드백 제공', gradingCriteria: [ { score: 0, criteria: "관련 없는 설명", example: ".", note: "관련 없는 설명" }, { score: 1, criteria: "추상적 UX 원칙", example: "좋게 만든다", note: "구체적인 설계 원칙 없음" }, { score: 3, criteria: "UX 원칙을 간단히 설명", example: "명확한 피드백 제공", note: "구체적이나 간략함" }, { score: 5, criteria: "UX 원칙과 적용 예시까지 설명", example: "명확한 피드백 제공으로 사용자 오류 감소", note: "정확하고 구체적인 설명" } ], explanation: '명확한 피드백 제공은 사용자가 인터랙션 결과를 쉽게 이해할 수 있도록 돕는 핵심 UX 설계 원칙입니다.', tags: ['이해력'], documentId: 2 },
      { id: 10, type: 'SAQ', difficultyLevel: 3, question: '디자인 시스템을 구축할 때 필수 요소 두 가지를 작성하세요.', options: null, answer: '컴포넌트 재사용성, 접근성', gradingCriteria: [ { score: 0, criteria: "관련 없는 설명", example: ".", note: "관련 없는 설명" }, { score: 1, criteria: "디자인 시스템 요소만 나열", example: "버튼", note: "핵심 요소 언급 없음" }, { score: 3, criteria: "핵심 요소 중 한 가지 언급", example: "재사용성", note: "불완전한 설명" }, { score: 5, criteria: "핵심 요소 두 가지를 정확히 기술", example: "컴포넌트 재사용성, 접근성", note: "정확하고 구체적인 설명" } ], explanation: '컴포넌트 재사용성과 접근성은 디자인 시스템의 핵심 요소로, 효율적 개발과 사용자 다양성 대응에 필수적입니다.', tags: ['분석력'], documentId: 2 }
    ]
  },
  {
    id: 3,
    name: '개발 Process 흐름도_sample',
    questions: [
      { id: 11, type: 'MCQ', difficultyLevel: 3, question: 'CI의 주요 목표는 무엇인가요?', options: ['자동화된 테스트', '디자인 일관성', '데이터 분석', '로컬 개발', '디버깅'], answer: 1, gradingCriteria: null, explanation: 'CI(Continuous Integration)는 개발 중 변경 사항을 자동으로 테스트하여 코드 품질을 유지하는 것이 주요 목표입니다.', tags: ['기초이해'], documentId: 3 },
      { id: 12, type: 'MCQ', difficultyLevel: 3, question: 'CD 파이프라인에서 중요한 단계는 무엇인가요?', options: ['자동 배포', '화면 설계', 'DB 최적화', '코드 포맷팅', '로컬 테스트'], answer: 1, gradingCriteria: null, explanation: 'CD(Continuous Delivery/Deployment)는 자동 배포를 통해 빠르고 안정적인 릴리스를 지원하는 것이 핵심 단계입니다.', tags: ['실무적용'], documentId: 3 },
      { id: 13, type: 'MCQ', difficultyLevel: 3, question: 'Rollback은 언제 수행하나요?', options: ['서비스 오류 발생 시', '테스트 통과 시', '서버 증설 시', '코드 작성 시', 'QA 완료 후'], answer: 1, gradingCriteria: null, explanation: 'Rollback은 배포 후 서비스 오류 발생 시 안정적인 상태로 복구하기 위해 수행됩니다.', tags: ['문제해결력'], documentId: 3 },
      { id: 14, type: 'SAQ', difficultyLevel: 3, question: '효율적인 CI/CD 구축 시 필요한 필수 도구 한 가지를 작성하세요.', options: null, answer: 'Jenkins', gradingCriteria: [ { score: 0, criteria: "관련 없는 설명", example: ".", note: "관련 없는 설명" }, { score: 1, criteria: "도구와 관련 없는 일반 설명", example: "자동화가 필요하다", note: "구체적인 도구 없음" }, { score: 3, criteria: "도구 명칭만 언급", example: "Jenkins", note: "구체적이나 간략함" }, { score: 5, criteria: "도구 명칭과 역할 설명", example: "Jenkins로 자동 빌드 및 배포 수행", note: "정확하고 구체적인 설명" } ], explanation: 'Jenkins는 CI/CD 프로세스를 자동화하여 소프트웨어의 지속적인 통합과 배포를 지원하는 오픈 소스 도구입니다.', tags: ['기초이해'], documentId: 3 },
      { id: 15, type: 'SAQ', difficultyLevel: 3, question: '프로세스 흐름도를 설계할 때 중요한 원칙 한 가지를 작성하세요.', options: null, answer: '단순성 유지', gradingCriteria: [ { score: 0, criteria: "관련 없는 설명", example: ".", note: "관련 없는 설명" }, { score: 1, criteria: "추상적 원칙만 언급", example: "좋게 만든다", note: "구체적인 원칙 없음" }, { score: 3, criteria: "원칙만 간단히 언급", example: "단순성 유지", note: "구체적이나 간략함" }, { score: 5, criteria: "원칙과 적용 이유까지 설명", example: "단순성 유지로 이해도 향상", note: "정확하고 구체적인 설명" } ], explanation: '단순성 유지는 프로세스 흐름도의 가독성과 이해도를 높이기 위한 핵심 원칙입니다.', tags: ['이해력'], documentId: 3 }
    ]
  }
];

  
  // 모든 문제를 하나의 배열로 합치기
  allTestItems.value = fetchedData.reduce((acc, doc) => acc.concat(doc.questions), []);

  // '전체 문서' 옵션 추가
  documents.value = [{ id: 'all', name: '전체 문서', questions: allTestItems.value }, ...fetchedData];

  if (documents.value.length > 0) {
    selectDocument(documents.value[0]); // 기본적으로 '전체 문서' 선택
  }
};

// 컴포넌트 마운트 시 데이터 로드
import { onMounted } from 'vue';
onMounted(() => {
  fetchDocumentsAndQuestions();
});

// 저장되지 않은 변경사항 관련 상태
const hasUnsavedChanges = ref(true);
const nextRoute = ref(null);
const unsavedChangesModal = ref(null);

// 페이지 이탈 방지 훅
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    nextRoute.value = to;
    unsavedChangesModal.value.openDialog();
    next(false);
  } else {
    next();
  }
});

// 모달 확인 버튼 핸들러
const handleConfirmLeave = () => {
  hasUnsavedChanges.value = false;
  if (nextRoute.value) {
    router.push(nextRoute.value);
  }
};

// 모달 취소 버튼 핸들러
const handleCancelLeave = () => {
  nextRoute.value = null;
};

// 문제 이동 함수 추가
const moveToPreviousQuestion = () => {
  if (selectedQuestionIndex.value > 0) {
    selectQuestion(selectedQuestionIndex.value - 1);
  }
};

const moveToNextQuestion = () => {
  if (selectedQuestionIndex.value < testItems.value.length - 1) {
    selectQuestion(selectedQuestionIndex.value + 1);
  }
};

</script>

<style scoped>
.force-white {
  color: white !important;
}
.custom-textarea :deep(textarea) {
  font-size: 0.8rem !important;
}

</style>
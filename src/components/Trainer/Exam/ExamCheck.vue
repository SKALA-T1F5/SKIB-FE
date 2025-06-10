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
                      <PerfectScrollbar style="height: 130px;">
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
                    <PerfectScrollbar style="height: 200px;">
                      <v-list lines="two" class="py-0">
                        <v-list-item v-for="(item, i) in testItems" :key="i" :value="item" color="secondary" rounded="sm" density="compact"
                          @click="selectQuestion(i)">
                          <div class="d-flex align-center w-100">
                            <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                              Q{{ String(item.id).padStart(2, '0' ) }} ({{ item.type }})
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
              <h4 class="text-h8 mt-1" style="color:grey">{{ selectedDocument.name }} | {{ selectedDocument.tag }} | {{ selectedDocument.difficultyLevel }}</h4>
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
          <v-btn variant="flat" color="gray" class="force-white">이전문제</v-btn>
          <v-btn variant="flat" color="gray" class="force-white">다음문제</v-btn>
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
import { ref } from 'vue';
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

// 초기 선택된 문제 설정
const selectedQuestionIndex = ref(0);
const currentAnswerAndExplanation = ref('');
const isEditing = ref(false);
const currentQuestionAndOptions = ref('');

// 선택된 문서 정보
const selectedDocument = ref({
  name: '',
  tag: '',
  difficultyLevel: '',
});

// 문제 선택 핸들러
const selectQuestion = (index) => {
  selectedQuestionIndex.value = index;
  const question = testItems.value[index];
  currentQuestionAndOptions.value = question.question + '\n' + (question.options || []).map((option, idx) => `${idx + 1}. ${option}`).join('\n');
  currentAnswerAndExplanation.value = `[정답] ${question.answer}\n[해설] ${question.explanation || ''}\n[채점기준] ${question.gradingCriteria || ''}`;
  selectedDocument.value.name = documents.value.find(doc => doc.id === question.documentId)?.name || '';
  selectedDocument.value.tag = question.tags.join(', ');
  selectedDocument.value.difficultyLevel = question.difficultyLevel;
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
    const updatedQuestion = {
      question: currentQuestionAndOptions.value.split('\n')[0],
      answer: currentAnswerAndExplanation.value.split('정답: ')[1]?.split('\n')[0].trim() || '',
      explanation: currentAnswerAndExplanation.value.split('설명: ')[1]?.split('\n')[0].trim() || '',
      gradingCriteria: currentAnswerAndExplanation.value.split('채점 기준: ')[1]?.split('\n')[0].trim() || '',
      options: currentQuestionAndOptions.value.split('\n').slice(1).map(option => option.substring(option.indexOf('.') + 2)),
    };
    console.log(updatedQuestion)
    // 백엔드 API 호출 (예시: PUT 요청)
    await axios.put(`/api/documents/${documentId}/questions/${questionId}`, updatedQuestion);
    console.log('변경 사항이 성공적으로 저장되었습니다.');
    isEditing.value = false;
    // 저장 후 데이터 새로고침 (선택 사항)
    // fetchDocumentsAndQuestions();
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
  // 선택된 문서에 해당하는 문제들만 필터링
  testItems.value = doc.questions;
  if (testItems.value.length > 0) {
    selectQuestion(0);
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
      name: '문서1',
      questions: [
        { id: 1, type: 'MCQ', difficultyLevel: 3, question: '문서1의 첫 번째 문제입니다.', options: ['보기 1번', '보기 2번', '보기 3번', '보기 4번', '보기 5번'], answer: '1번의 정답은 보기 1번', gradingCriteria: null, explanation: '설명1', tags: ['논리력'], documentId: 1 },
        { id: 2, type: 'SAQ', difficultyLevel: 4, question: '문서1의 두 번째 문제입니다.', options: null, answer: '2번 문제 주관식 정답', gradingCriteria: '체점 기준 입니다.', explanation: '설명2', tags: ['추리력'], documentId: 1 },
      ],
    },
    {
      id: 2,
      name: '문서2',
      questions: [
        { id: 3, type: 'MCQ', difficultyLevel: 5, question: '문서2의 첫 번째 문제입니다.', options: ['보기 1번', '보기 2번', '보기 3번', '보기 4번', '보기 5번'], answer: '3번 객관식의 정답은 보기 3번', gradingCriteria: null, explanation: '설명3', tags: ['분석력'], documentId: 2 },
      ],
    },
  ];
  documents.value = fetchedData;
  if (documents.value.length > 0) {
    selectDocument(documents.value[0]); // 첫 번째 문서 선택
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


</script>

<style scoped>
.force-white {
  color: white !important;
}
.custom-textarea :deep(textarea) {
  font-size: 0.8rem !important;
}

</style>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">문제 확인 및 수정</h2>
          <p class="text-body-2 text-medium-emphasis">보유한 문제를 확인하고 수정할 수 있습니다.</p>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <!-- 테스트 문항 목록 섹션 -->
      <v-col cols="12" sm="3">
        <v-card elevation="0" style="height:100% ">
          <v-card-text>
            <v-expansion-panels>
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title>
                  <h4 class="text-h8 mt-1">문서 목록</h4>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div>
                    <PerfectScrollbar style="height: 130px;">
                      <v-list lines="two" class="py-0">
                        <v-list-item v-for="(doc, i) in documents" :key="i" :value="doc" color="secondary" rounded="sm"  density="compact"
                          @click="selectDocument(doc)">
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
                        <v-list-item v-for="(item, i) in filteredTestItems" :key="i" :value="item" color="secondary" rounded="sm" density="compact"
                          @click="selectQuestion(i)">
                          <div class="d-flex align-center w-100">
                            <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                              {{ item.name }} ({{ item.type }})
                            </h6>
                          </div>
                        </v-list-item>
                      </v-list>
                    </PerfectScrollbar>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 문제 및 정답/풀이 섹션 -->
      <v-col cols="12" sm="9">
        <v-card elevation="0" style="height:200px">
          <v-card-text>
            <div class="d-flex align-center">
              <h4 class="text-h8 mt-1">{{ testItems[selectedQuestionIndex]?.name }}</h4> &nbsp&nbsp&nbsp
              <h4 class="text-h8 mt-1" style="color:grey">{{ selectedDocument.originalDocumentName }} | {{
                selectedDocument.tag }} | {{selectedDocument.difficulty }}</h4>
            </div>
            <v-textarea style="height:100px; font-size: 13.0rem;" 
              v-model="currentQuestion"
              :variant="isEditingQuestion ? 'outlined' : 'plain'"
              rows="5"
              auto-grow
              :readonly="!isEditingQuestion"
              class="mt-0 custom-textarea"
            ></v-textarea>
            <div class="d-flex justify-end mt-2">
              <v-btn v-if="!isEditingQuestion" small color="primary" @click="editQuestion">수정하기</v-btn>
              <template v-else>
                <v-btn small color="grey" elevation="0" class="mr-2" @click="cancelEditQuestion">수정 취소</v-btn>
                <v-btn small color="primary" elevation="0" @click="saveQuestion">수정완료</v-btn>
              </template>
            </div>
          </v-card-text>
        </v-card>
        <div class="d-flex align-end mb-4" style="height:1%"></div>
        <v-card elevation="0" style="height:200px">
          <v-card-text>
            <div class="d-flex align-center">
              <h4 class="text-h8 mt-1">정답 및 풀이</h4>
            </div>
            <v-textarea style="height:100px;"
              v-model="currentAnswer"
              :variant="isEditingAnswer ? 'outlined' : 'plain'"
              rows="5"
              auto-grow
              :readonly="!isEditingAnswer"
              class="mt-0 custom-textarea" 
            ></v-textarea>
            <div class="d-flex justify-end mt-2">
              <v-btn v-if="!isEditingAnswer" small color="primary" @click="editAnswer">수정하기</v-btn>
              <template v-else>
                <v-btn small color="grey" class="mr-2" @click="cancelEditAnswer">수정 취소</v-btn>
                <v-btn small color="primary" @click="saveAnswer">수정완료</v-btn>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 하단 버튼 섹션 -->
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <v-btn variant="flat" color="gray" class="mr-2 force-white" @click="prevStep">← 돌아가기</v-btn>
        <div>
          <v-btn variant="flat" color="gray" class="mr-2 force-white">이전문제</v-btn>
          <v-btn variant="flat" color="primary" class="mr-2 force-white">다음문제</v-btn>
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
const route = useRoute();

// 컴포넌트에서 발생시킬 이벤트 정의
const emit = defineEmits(['next-step', 'prev-step']);

// 테스트 문항 데이터
// TODO: 백엔드 API 연동: 실제 데이터로 교체 필요
const testItems = ref([]);
const documents = ref([]);
const selectedDocumentName = ref(route.params.documentName || null);

const filteredTestItems = computed(() => {
  if (!selectedDocumentName.value) {
    return testItems.value;
  }
  return testItems.value.filter(item => item.originalDocumentName === selectedDocumentName.value);
});

// 초기 선택된 문제 설정
const selectedQuestionIndex = ref(0);
const currentQuestion = ref('');
const currentAnswer = ref('');
const isEditingQuestion = ref(false);
const isEditingAnswer = ref(false);


// 문제 선택 핸들러
const selectQuestion = (index) => {
  selectedQuestionIndex.value = index;
  currentQuestion.value = testItems.value[index].question;
  currentAnswer.value = testItems.value[index].answer;
  isEditingQuestion.value = false;
  isEditingAnswer.value = false;
};

const editQuestion = () => {
  isEditingQuestion.value = true;
};

const saveQuestion = async () => {
  isEditingQuestion.value = false;
  // 여기에 수정된 내용을 저장하는 로직 추가 (예: API 호출)
  console.log('Question saved:', currentQuestion.value);
  // TODO: 백엔드 API 연동: 문제 내용 업데이트
  // 실제 백엔드 API 엔드포인트와 데이터 구조에 맞게 수정 필요
  try {
    // const response = await axios.put(`/api/problems/${testItems.value[selectedQuestionIndex.value].id}`, {
    //   question: currentQuestion.value
    // });
    // console.log('Question update successful:', response.data);
    testItems.value[selectedQuestionIndex.value].question = currentQuestion.value; // API 연동 전 임시 업데이트
  } catch (error) {
    console.error('Error saving question:', error);
    // TODO: 에러 발생 시 사용자에게 알림
  }
};

const cancelEditQuestion = () => {
  isEditingQuestion.value = false;
  // 변경사항 취소 로직 (원래 값으로 되돌리기 등)
  // 현재는 단순히 편집 모드만 종료
};

const editAnswer = () => {
  isEditingAnswer.value = true;
};

const saveAnswer = async () => {
  isEditingAnswer.value = false;
  // 여기에 수정된 내용을 저장하는 로직 추가 (예: API 호출)
  console.log('Answer saved:', currentAnswer.value);
  // TODO: 백엔드 API 연동: 정답 및 풀이 내용 업데이트
  // 실제 백엔드 API 엔드포인트와 데이터 구조에 맞게 수정 필요
  try {
    // const response = await axios.put(`/api/answers/${testItems.value[selectedQuestionIndex.value].id}`, {
    //   answer: currentAnswer.value
    // });
    // console.log('Answer update successful:', response.data);
    testItems.value[selectedQuestionIndex.value].answer = currentAnswer.value; // API 연동 전 임시 업데이트
  } catch (error) {
    console.error('Error saving answer:', error);
    // TODO: 에러 발생 시 사용자에게 알림
  }
};

const cancelEditAnswer = () => {
  isEditingAnswer.value = false;
  // 변경사항 취소 로직 (원래 값으로 되돌리기 등)
  // 현재는 단순히 편집 모드만 종료
};

// 테스트 문항 데이터 로드 함수
// TODO: 백엔드 API 연동: 실제 데이터 로드 로직으로 교체 필요
const fetchTestItems = async () => {
  try {
    // 예시 데이터 (백엔드에서 받아올 데이터 구조를 가정)
    const fetchedData = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Q${String(i + 1).padStart(2, '0')}`, // 문제 번호만 표시
      type: (i % 2 === 0) ? '객관식' : '주관식', // 객관식/주관식 예시
      selected: false,
      question: `이것은 Q${String(i + 1).padStart(2, '0')}의 문제입니다. (예시)`,
      answer: `이것은 Q${String(i + 1).padStart(2, '0')}의 정답 및 풀이입니다. (예시)`,
      originalDocumentName: `문서${Math.floor(i / 5) + 1}`, // 문서1, 문서2, 문서3, 문서4에 각각 5개씩 할당
    }));
    testItems.value = fetchedData;

    // 문서 목록 생성 (중복 제거)
    documents.value = [...new Set(fetchedData.map(item => item.originalDocumentName))].map(name => ({ name }));

    if (filteredTestItems.value.length > 0) {
      selectQuestion(0);
    }
  } catch (error) {
    console.error('Error fetching test items:', error);
  }
};

const selectDocument = (doc) => {
  selectedDocumentName.value = doc.name;
  if (filteredTestItems.value.length > 0) {
    selectQuestion(0);
  } else {
    selectedQuestionIndex.value = 0;
    currentQuestion.value = '';
    currentAnswer.value = '';
  }
};



// 컴포넌트 마운트 시 데이터 로드
import { onMounted } from 'vue';
onMounted(() => {
  fetchTestItems();
});

// 선택된 문서 정보
// TODO: 백엔드 API 연동: 실제 문서 정보로 교체 필요
const selectedDocument = ref({
  title: '',
  examTime: null,
  difficulty: '',
  passScore: null,
  retakeAllowed: false,
  originalDocumentName: '기본 문서명 AAA', // 예시 데이터
  tag: '논리력',
  difficulty: '⭐⭐⭐', // 예시 데이터
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

// 다음 단계로 이동 함수
function nextStep() {
  emit('next-step');
}

// 이전 단계로 이동 함수
function prevStep() {
  emit('prev-step');
}
</script>

<style scoped>
.force-white {
  color: white !important;
}
.custom-textarea {
  :deep(textarea) {
    font-size: 0.8rem !important;
  }
}

</style>
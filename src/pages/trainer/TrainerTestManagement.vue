<template>
  <AILoading :show="isLoading" />
  <v-container class="trainer-container">
    <template v-if="step === 0">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <h2 class="text-h5 font-weight-bold mr-2">테스트 관리</h2>
            <p class="text-body-2 text-medium-emphasis">관리 중인 테스트 목록을 확인합니다.</p>
          </div>
        </v-col>
      </v-row>

      <v-row :class="exams.length + 1 <= 4 ? 'd-flex flex-row flex-nowrap' : ''">
        <v-col v-for="exam in exams" :key="exam.id" cols="12" sm="6" md="4" lg="3" class="d-flex">
          <v-card elevation="0" class="mx-auto h-100 d-flex flex-column" max-width="344">
            <v-card-title>
              <div class="d-flex justify-space-between align-center w-100">
                <span class="text-h6">{{ exam.name }}</span>
                <v-icon size="15" color="primary" @click="copyLink(exam.id)"> mdi-link-variant</v-icon>
              </div>
            </v-card-title>

            <v-card-subtitle>
              난이도: {{ exam.difficulty }} | 제한 시간: {{ exam.timeLimit }}분
            </v-card-subtitle>
            <v-card-text class="flex-grow-1">
              <div>PASS 점수: {{ exam.passingScore }}점</div>
              <div>마지막 수정일: {{ exam.lastModified }}</div>
              <div>재응시 여부: {{ exam.retakeable ? '가능' : '불가능' }}</div>
              <br>
              <br>
              <v-card-text class="d-flex align-center gap-2 pa-0">
                <v-btn color="primary" style="width: 48%;" variant="outlined" prepend-icon="mdi-format-list-bulleted"
                  size="default" @click="router.push(`/exam/${exam.id}`)">
                  문제목록
                </v-btn>
                <v-spacer />
                <v-btn color="primary" style="width: 48%;" variant="outlined" prepend-icon="mdi-chart-line" size="default"
                  @click="handleExamDashboard(String(exam.id))">
                  응시현황
                </v-btn>
              </v-card-text>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3" class="d-flex">
          <v-card elevation="0" class="mx-auto h-100 d-flex flex-column align-center justify-center"
            style="border: 2px dashed #ccc; cursor: pointer;" @click="addExam">
            <div class="text-center">
              <v-icon size="48" color="grey-lighten-1">mdi-plus</v-icon>
              <div class="text-subtitle-1 text-grey-lighten-1 mt-2">새로운 시험 추가</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="step === 1">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <h2 class="text-h5 font-weight-bold mr-2"> 테스트 생성</h2>
            <p class="text-body-2 text-medium-emphasis">Step 1 of 4 : 생성하고자 하는 테스트에 대한 정보를 입력하고 다음 단계로 이동합니다.
            </p>
          </div>
          <v-progress-linear :model-value="25" height="10" color="primary" bg-color="primary" rounded></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <h1 class="text-primary text-center pb-3">
            어떤 테스트를 생성할까요?
          </h1>
          <v-card elevation="0">
            <v-card-text style="height: 200px;">
              <v-textarea v-model="examPrompt"
                placeholder="ex) 문서의 핵심 내용에 대한 이해도 확인을 목표로, 중간 난이도의 테스트를 생성하세요." variant="outlined" rows="4"
                auto-grow clearable hide-details class="h-100"></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <v-row>
              <v-col v-for="(prompt, index) in examplePrompts" :key="index" cols="12" sm="6" md="4">
                <v-card elevation="0" height="100%" class="pa-4 d-flex flex-column align-start cursor-pointer" outlined
                  @click="examPrompt = prompt">
                  <v-icon class="mr-4" size="19" style="margin-bottom: 6px; color: grey;">
                    mdi-lightbulb-on
                  </v-icon>
                  <div class="font-weight-medium text-medium-emphasis">
                    {{ prompt }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <v-row style="position: absolute; bottom: 16px; width: 100%;">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <v-btn variant="flat" color="gray" class="mr-2 force-white" @click="prevStep" :disabled="isLoading">← 이전단계</v-btn>
          <div class="d-flex align-center mr-2" style="gap: 8px;">
            <v-btn variant="flat" color="primary" @click="nextStep" :disabled="isLoading || !examPrompt.trim()">다음 단계</v-btn>
          </div>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="step === 2">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <h2 class="text-h5 font-weight-bold mr-2">테스트 생성</h2>

            <p class="text-body-2 text-medium-emphasis">Step 2 of 4 : 테스트를 구성할 문제와 조건을 선택하고 다음 단계로 이동하세요.</p>
          </div>
          <v-progress-linear :model-value="40" height="10" color="primary" bg-color="primary" rounded></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="8">
          <v-card elevation="0" height="25%">
            <v-card-text>
              <div class="d-flex align-center pb-2">
                <h4 class="text-h8 mt-1">Exam Goal</h4>
              </div>
              <p>{{ examGoal }}</p>
            </v-card-text>
          </v-card height="5%">
          <br>
          <v-card>
          </v-card>
          <v-card elevation="0" height="70%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">Document List</h4>
              </div>
              <v-data-table :headers="headers" :items="revenues" item-value="name" class="elevation-0" hide-default-footer
                disable-pagination>
                <template v-slot:item.selected="{ item }">
                  <v-checkbox v-model="item.selected" density="compact" hide-details color="grey"></v-checkbox>
                </template>
                <template v-slot:item.name="{ item }">
                  <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                    {{ item.name }}
                  </h6>
                </template>
                <template v-slot:item.keyword="{ item }">
                  <v-chip size="small" color="blue-grey" variant="tonal" rounded="lg">
                    {{ item.keyword }}
                  </v-chip>
                </template>
                <template v-slot:item.sqSet="{ item }">
                  <v-text-field v-model.number="item.sqSet" type="number" variant="outlined" density="compact"
                    hide-details style="width: 70px;"></v-text-field>
                </template>
                <template v-slot:item.mcSet="{ item }">
                  <v-text-field v-model.number="item.mcSet" type="number" variant="outlined" density="compact"
                    hide-details style="width: 70px;"></v-text-field>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card elevation="0" height="100%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">Exam Setting</h4>
              </div>
              <v-form class="mt-4">
                <v-text-field v-model="selectedDocument.title" label="테스트이름" variant="outlined"
                  rounded="lg"></v-text-field>
                <v-text-field v-model="selectedDocument.examTime" label="시험 시간 (분)" type="number" variant="outlined"
                  rounded="lg"></v-text-field>
                <v-select v-model="selectedDocument.difficulty" :items="['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']" label="난이도"
                  variant="outlined" rounded="lg"></v-select>
                <div class="d-flex align-center mb-4">
                  <v-text-field v-model.number="selectedDocument.passScore" label="PASS 기준 점수" type="number"
                    variant="outlined" rounded="lg" class="mr-2" style="width: 150px;"></v-text-field>
                  <v-select v-model="selectedDocument.retakeAllowed"
                    :items="[{ text: '재응시 허용', value: true }, { text: '재응시 불허', value: false }]" label="재응시 여부"
                    variant="outlined" rounded="lg" class="flex-grow-1" item-title="text"></v-select>
                </div>
                <div class="total-questions mt-4 mb-4" style="text-align: center;">
                  객관식:&nbsp;{{ totalMcqCount }}&nbsp;&nbsp;|&nbsp;&nbsp;주관식:&nbsp;{{ totalSaqCount
                  }}&nbsp;&nbsp;|&nbsp;&nbsp;Total:&nbsp;{{ totalMcqCount + totalSaqCount }}
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row style="position: absolute; bottom: 16px; width: 100%;">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <v-btn variant="flat" color="gray" class="mr-2 force-white" @click="prevStep" :disabled="isLoading">← 이전단계</v-btn>
          <div class="d-flex align-center mr-2" style="gap: 8px;">
            <v-btn variant="flat" color="primary" @click="nextStep" :disabled="isLoading">다음 단계</v-btn>
          </div>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import AILoading from '@/components/trainer/test/AiLoading.vue';
// import api from '@/config/axios'; // Springboot 연동 시 주석 해제

const router = useRouter();

// Step Management
const step = ref(0); // 0: Test Management, 1: Test Creation Step 1, 2: Test Creation Step 2
const isLoading = ref(false);

// Data for Test Management (Step 0) - 예시 데이터로 변경
const exams = ref([
  {
    id: 101,
    name: 'Vue.js 기초 테스트',
    difficulty: '⭐⭐⭐',
    timeLimit: 45,
    passingScore: 75,
    lastModified: '2024-06-20',
    retakeable: true,
    passCount: 10,
    totalApplicants: 15,
    averageScore: 82,
  },
  {
    id: 102,
    name: 'Spring Boot 심화 평가',
    difficulty: '⭐⭐⭐⭐',
    timeLimit: 60,
    passingScore: 80,
    lastModified: '2024-06-18',
    retakeable: false,
    passCount: 5,
    totalApplicants: 8,
    averageScore: 78,
  },
  {
    id: 103,
    name: '데이터베이스 설계 능력 시험',
    difficulty: '⭐⭐⭐⭐⭐',
    timeLimit: 90,
    passingScore: 85,
    lastModified: '2024-06-15',
    retakeable: true,
    passCount: 3,
    totalApplicants: 5,
    averageScore: 70,
  },
]);

// Data for Test Creation Step 1 (Step 1)
const examPrompt = ref('');
const testId = ref(null); // Newly created test ID
const examplePrompts = ref([
  "UI 컴포넌트 개발 원칙과 활용 방법에 대한 실무 중심의 객관식 시험을 출제해주세요.",
  "프론트엔드 개발 환경 구축에 대한 이해도를 평가하는 시험을 만들어주세요. (난이도 중간, 객관식)",
  "업무 프로세스 흐름과 단계별 책임 이해도를 평가하는 주관식 시험을 만들어주세요. (시험시간 30분)",
]);

// Data for Test Creation Step 2 (Step 2)
const headers = [
  { title: '문서명', key: 'name', sortable: false, width: '45%' },
  { title: 'Keyword', key: 'keyword', sortable: false, align: 'center', width: '35%' },
  { title: '객관식', key: 'mcSet', sortable: false, align: 'center', width: '10%' },
  { title: '주관식', key: 'sqSet', sortable: false, align: 'center', width: '10%' },
];
// 문서 목록 데이터 - 예시 데이터로 변경
const revenues = ref([
  { id: 201, name: 'Vue_Component_LifeCycle.pdf', keyword: 'Vue.js, LifeCycle', selected: true, mcSet: 3, sqSet: 2 },
  { id: 202, name: 'Spring_Security_Guide.docx', keyword: 'Spring, Security', selected: true, mcSet: 2, sqSet: 1 },
  { id: 203, name: 'JPA_Performance_Tuning.hwp', keyword: 'JPA, Performance', selected: false, mcSet: 0, sqSet: 0 },
  { id: 204, name: 'Database_Normalization.ppt', keyword: 'DB, Normalization', selected: true, mcSet: 4, sqSet: 1 },
]); // Document data
const examGoal = computed(() => examPrompt.value || '테스트 목표가 정의되지 않았습니다.');
const selectedDocument = ref({
  title: '',
  examTime: 30,
  difficulty: '⭐⭐⭐',
  passScore: 70,
  retakeAllowed: false,
  translationLanguage: '없음',
});

// Watch for changes in examPrompt to update selectedDocument.title
watch(examPrompt, (newPrompt) => {
  if (step.value === 1) { // Only update if still on step 1 (or before step 2 loads)
    selectedDocument.value.title = newPrompt || '새로운 테스트';
  }
});

// Computed properties for Step 2
const totalMcqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.selected ? (doc.mcSet || 0) : 0), 0);
});

const totalSaqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.selected ? (doc.sqSet || 0) : 0), 0);
});

// ***********************************************************************
// * General Navigation Functions
// ***********************************************************************
const addExam = () => {
  step.value = 1; // Go to Test Creation Step 1
  examPrompt.value = ''; // Reset prompt for new exam
  testId.value = null; // Reset testId
};

const nextStep = async () => {
  if (step.value === 0) { // From Test Management to Step 1
    addExam();
  } else if (step.value === 1) { // From Step 1 to Step 2 (Create Test API Call)
    // examPrompt가 비어있으면 다음 단계로 진행하지 않음
    if (!examPrompt.value.trim()) {
      alert('테스트 생성을 위한 프롬프트를 입력해주세요.');
      return;
    }

    isLoading.value = true;
    console.log("Step 1 -> Step 2 진행 중. API 호출 대신 UI 흐름 테스트.");

    // Spring Boot 연동 전이므로 API 호출 부분 주석 처리
    try {
      // const projectId = localStorage.getItem('projectId');
      const projectId = '901'; // 예시 프로젝트 ID 사용
      if (!projectId) {
        console.error('projectId가 로컬 스토리지에 없습니다. 다시 로그인해주세요.');
        alert('프로젝트 ID를 찾을 수 없습니다. 다시 시도해주세요.');
        return;
      }

      // const response = await api.post('/test/createTest', {
      //   testName: examPrompt.value,
      //   projectId: projectId,
      // });

      // // API 응답 대신 임시로 testId 생성
      // if (response.data.statusCode === 'OK') {
      //   const createdTestId = response.data.resultData?.testId;
      //   if (createdTestId) {
      //     testId.value = createdTestId;
      //     step.value = 2; // Move to Step 2
      //     await fetchRevenues(); // Fetch documents for Step 2
      //   } else {
      //     console.error('Test ID가 응답에 포함되어 있지 않습니다:', response.data);
      //     alert('시험 생성에 실패했습니다: Test ID 누락.');
      //   }
      // } else {
      //   console.error('시험 생성 실패:', response.data.statusCode, response.data.message);
      //   alert(`시험 생성에 실패했습니다: ${response.data.message || '알 수 없는 오류'}`);
      // }

      // API 호출 없이 임시 데이터로 다음 스텝 진행
      testId.value = Math.floor(Math.random() * 1000) + 1; // 임시 testId 생성
      selectedDocument.value.title = examPrompt.value || '새로운 테스트'; // Set default title for step 2
      step.value = 2; // Move to Step 2
      await fetchRevenues(); // Fetch documents for Step 2 (예시 데이터 로드)

    } catch (error) {
      console.error('시험 생성 중 오류 발생 (현재 API 호출 없음):', error);
      alert('시험 생성 중 오류가 발생했습니다. (현재 API 호출이 주석 처리되어 있습니다.)');
    } finally {
      isLoading.value = false;
    }
  } else if (step.value === 2) { // From Step 2 to next logical step (e.g., question generation or review)
    isLoading.value = true;
    console.log("Step 2 -> 다음 단계 진행 중. API 호출 대신 UI 흐름 테스트.");
    try {
      // Spring Boot 연동 전이므로 API 호출 부분 주석 처리

      // 1. Test 정보 업데이트
      // const updateTestResponse = await api.post('/test/updateTest', {
      //   testId: testId.value,
      //   testName: selectedDocument.value.title,
      //   limitedTime: selectedDocument.value.examTime,
      //   difficulty: selectedDocument.value.difficulty.length, // ⭐ 개수로 난이도 설정 (1~5)
      //   passingScore: selectedDocument.value.passScore,
      //   retakeable: selectedDocument.value.retakeAllowed,
      //   // translationLanguage는 백엔드 스키마에 없으면 제외
      // });

      // if (updateTestResponse.data.statusCode !== 'OK') {
      //   console.error('테스트 정보 업데이트 실패:', updateTestResponse.data.statusCode, updateTestResponse.data.message);
      //   alert('테스트 정보 업데이트에 실패했습니다.');
      //   return;
      // }

      // 2. 선택된 문서 기반으로 질문 추가
      const selectedDocs = revenues.value.filter(doc => doc.selected && (doc.mcSet > 0 || doc.sqSet > 0));
      if (selectedDocs.length === 0) {
        alert('문서를 선택하고 생성할 문제 수를 설정해주세요.');
        isLoading.value = false;
        return;
      }

      // for (const doc of selectedDocs) {
      //   if (doc.mcSet > 0) {
      //     await api.post('/question/addQuestionToTest', {
      //       testId: testId.value,
      //       documentId: doc.id,
      //       questionType: 'multiple_choice',
      //       count: doc.mcSet,
      //     });
      //   }
      //   if (doc.sqSet > 0) {
      //     await api.post('/question/addQuestionToTest', {
      //       testId: testId.value,
      //       documentId: doc.id,
      //       questionType: 'short_answer',
      //       count: doc.sqSet,
      //     });
      //   }
      // }
      // API 호출 없이 성공 메시지 출력 후 스텝 0으로 이동
      alert('시험 설정이 임시 저장되었습니다. (API 호출은 주석 처리됨)');
      step.value = 0; // Go back to test management after successful creation
      // await fetchExams(); // API 호출 주석 처리로 인해 실제 데이터 갱신은 안됨
    } catch (error) {
      console.error('시험 설정 저장 중 오류 발생 (현재 API 호출 없음):', error);
      alert('시험 설정 저장 중 오류가 발생했습니다. (현재 API 호출이 주석 처리되어 있습니다.)');
    } finally {
      isLoading.value = false;
    }
  }
};

const prevStep = () => {
  if (step.value === 1) {
    step.value = 0; // Go back to Test Management
  } else if (step.value === 2) {
    step.value = 1; // Go back to Step 1
  }
  // No prev step from 0
};

// ***********************************************************************
// * Functions for Test Management (Step 0) - 예시 데이터 사용으로 변경
// ***********************************************************************
const fetchExams = async () => {
  // Spring Boot 연동 전 UI/동작 확인을 위해 예시 데이터만 로드
  console.log('예시 시험 목록 로드됨:', exams.value);

  // try {
  //   const projectId = localStorage.getItem('projectId');
  //   if (!projectId) {
  //     console.warn('projectId가 로컬 스토리지에 없어 기본값 \'1\'을 사용합니다.');
  //     localStorage.setItem('projectId', '1');
  //   }

  //   // const response = await api.get('/test/getTests', {
  //   //   params: {
  //   //     projectId: projectId || '1'
  //   //   }
  //   // });

  //   // if (response.data.statusCode === 'OK') {
  //   //   const tests = response.data.resultData?.tests;
  //   //   if (Array.isArray(tests)) {
  //   //     exams.value = tests.map(project => ({
  //   //       id: project.testId,
  //   //       name: project.testName,
  //   //       difficulty: project.difficulty ? '⭐'.repeat(project.difficulty) : '미정',
  //   //       timeLimit: project.limitedTime,
  //   //       passingScore: project.passingScore,
  //   //       lastModified: new Date(project.createdAt).toLocaleDateString(),
  //   //       retakeable: project.retakeable,
  //   //       passCount: project.passCount || 0,
  //   //       totalApplicants: project.totalApplicants || 0,
  //   //       averageScore: project.averageScore || 0,
  //   //     }));
  //   //   } else {
  //   //     console.error('시험 목록 가져오기 실패: resultData.tests is not an array', tests);
  //   //     exams.value = [];
  //   //   }
  //   // } else {
  //   //   console.error('시험 목록 가져오기 실패: statusCode !== OK', response.data.statusCode);
  //   //   exams.value = [];
  //   // }
  // } catch (error) {
  //   console.error('시험 목록 가져오기 실패:', error);
  //   exams.value = [];
  // }
};

function copyLink(examId) {
  const url = `${window.location.origin}/exam/${examId}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('링크가 복사되었습니다!');
      })
      .catch(err => {
        console.error('복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('링크가 복사되었습니다!');
    } catch (err) {
      console.error('Fallback 복사 실패:', err);
      alert('링크 복사에 실패했습니다.');
    }
    document.body.removeChild(textArea);
  }
}

const handleExamDashboard = (examId) => {
  router.push(`/dashboard/exam/${examId}`);
};

// ***********************************************************************
// * Functions for Test Creation Step 2 (Step 2) - 예시 데이터 사용으로 변경
// ***********************************************************************
const fetchRevenues = async () => {
  // Spring Boot 연동 전 UI/동작 확인을 위해 예시 데이터만 로드
  console.log('예시 문서 목록 로드됨:', revenues.value);

  // try {
  //   const projectId = localStorage.getItem('projectId');
  //   if (!projectId) {
  //     console.error('projectId가 로컬 스토리지에 없습니다. 문서를 불러올 수 없습니다.');
  //     return [];
  //   }
  //   // const response = await api.get('/document/getAllDocument', {
  //   //   params: {
  //   //     projectId: projectId
  //   //   }
  //   // });
  //   // if (response.data.statusCode === 'OK' && Array.isArray(response.data.resultData?.documents)) {
  //   //   revenues.value = response.data.resultData.documents.map(doc => ({
  //   //     id: doc.documentId,
  //   //     name: doc.title,
  //   //     keyword: doc.keywords || '',
  //   //     selected: true, // Default to selected
  //   //     mcSet: 3, // Default multiple choice questions per document
  //   //     sqSet: 2, // Default short answer questions per document
  //   //   }));
  //   // } else {
  //   //   console.error('문서 목록 가져오기 실패:', response.data.statusCode, response.data.message);
  //   //   revenues.value = [];
  //   // }
  // } catch (error) {
  //   console.error('문서 목록 가져오기 실패:', error);
  //   revenues.value = [];
  // }
};

// ***********************************************************************
// * Lifecycle Hooks
// ***********************************************************************
onMounted(() => {
  fetchExams(); // Load existing exams when component mounts
});
</script>

<style scoped>
.force-white {
  color: white !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Common styles for cards/tables if needed */
.v-card {
  margin-bottom: 16px;
}

.table-like-content {
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.table-like-content .v-list-item {
  border-bottom: 1px solid #eeeeee;
}

.table-like-content .v-list-item:last-child {
  border-bottom: none;
}

.table-like-content .v-list-item > div {
  padding: 8px 0;
}

.table-like-content .v-list-item h6 {
  font-size: 0.875rem;
}

.table-like-content .v-text-field {
  font-size: 0.875rem;
}
</style>
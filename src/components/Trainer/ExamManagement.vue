<template>
  <v-container>
    <v-container fluid class="exam-management">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
              <h2 class="text-h5 font-weight-bold mr-2">테스트 생성</h2>
              <pre>  </pre>
              <p class="text-body-2 text-medium-emphasis">Step 1 of 3 : 테스트를 구성할 문제와 조건을 선택하고 다음 단계로 이동하세요.</p>
          </div>
          <v-progress-linear :model-value="33" height="10" color="primary" bg-color="primary"
          rounded></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <!-- 문서 목록 섹션 -->
        <v-col cols="12" sm="8">
          <v-card elevation="0" height="100%">
            <v-card-text>
              <!-- 문서 목록 헤더 -->
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">Document List</h4>
              </div>
              <!-- 문서 목록 테이블 헤더 및 스크롤 가능한 문서 목록 영역을 감싸는 div 추가 -->
              <div class="table-like-content">
                <div class="d-flex align-center justify-space-between w-20 mt-4 px-4">
                  <div class="text-body-2 font-weight-bold" style="width: 30px;">선택</div>
                  <div class="text-body-2 font-weight-bold" style="width: 100px;">문서명</div>
                  <div class="d-flex align-center" style="width: 360px; justify-content: space-between;">
                    <div class="text-body-2 font-weight-bold" style="width: 80px; text-align: center;">보유객관식</div>
                    <div class="text-body-2 font-weight-bold" style="width: 80px; text-align: center;">보유주관식</div>
                    <div class="text-body-2 font-weight-bold" style="width: 80px; text-align: center;">객관식</div>
                    <div class="text-body-2 font-weight-bold" style="width: 80px; text-align: center;">주관식</div>
                  </div>
                </div>
                <!-- 스크롤 가능한 문서 목록 영역 -->
                <div class="mt-4" style="height:100%">
                  <perfect-scrollbar style="height: 100%">
                    <v-list lines="two" class="py-0">
                      <!-- 각 문서 아이템 반복 -->
                      <v-list-item v-for="(revenue, i) in revenues" :key="i" :value="revenue" color="secondary"
                        rounded="sm">
                        <div class="d-flex align-center justify-space-between w-1">
                          <!-- 라디오 버튼 추가 -->
                          <v-checkbox v-model="revenue.selected" class="mr-2" density="compact" hide-details
                            style="width: 50px;" color="grey"></v-checkbox>
                          <!-- 문서명 -->
                          <div class="mr-4" style="width: 100px;">
                            <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                              {{ revenue.name }}
                            </h6>
                          </div>
                          <!-- 현재 문제수 표기 -->
                          <div class="d-flex align-center" style="width: 160px; justify-content: space-between;">
                            <h6 class="text-body-2 font-weight-bold" style="width: 80px; text-align: center;">{{
                              revenue.mcCount }}</h6>
                            <h6 class="text-body-2 font-weight-bold" style="width: 80px; text-align: center;">{{
                              revenue.sqCount }}</h6>
                          </div>
                          <!-- 주관식, 객관식 입력 필드 -->
                          <div class="d-flex align-center" style="width: 160px; justify-content: space-between;">
                            <v-text-field v-model.number="revenue.sqSet" type="number" variant="outlined"
                              density="compact" hide-details class="mr-2" style="width: 70px;"
                              :disabled="!revenue.selected"></v-text-field>
                            <v-text-field v-model.number="revenue.mcSet" type="number" variant="outlined"
                              density="compact" hide-details style="width: 70px;"
                              :disabled="!revenue.selected"></v-text-field>
                          </div>
                        </div>
                      </v-list-item>
                    </v-list>
                  </perfect-scrollbar>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 시험 설정 섹션 -->
        <v-col cols="12" sm="4">
          <v-card elevation="0" height="100%">
            <v-card-text>
              <!-- 시험 설정 헤더 -->
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">Exam Setting</h4>
              </div>
              <!-- 시험 설정 폼 -->
              <v-form class="mt-4">
                <v-text-field v-model="selectedDocument.title" label="테스트이름" variant="outlined"
                  rounded="lg"></v-text-field>
                <v-text-field v-model="selectedDocument.examTime" label="시험 시간 (분)" type="number" variant="outlined"
                  rounded="lg"></v-text-field>
                <v-select v-model="selectedDocument.difficulty" :items="['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']" label="난이도"
                  variant="outlined" rounded="lg"></v-select>
                <v-text-field v-model.number="selectedDocument.passScore" label="PASS 기준 점수" type="number"
                  variant="outlined" rounded="lg"></v-text-field>
                <!-- 재응시 여부 토글 버튼 -->
                <v-select v-model="selectedDocument.retakeAllowed"
                  :items="[{ text: '재응시 허용', value: true }, { text: '재응시 불허', value: false }]" label="재응시 여부"
                  variant="outlined" rounded="lg" class="mb-4" item-title="text"></v-select>
                <!-- 총 객관식/주관식 수 표시 -->
                <div class="total-questions mt-4 mb-4" style="text-align: center;">
                  객관식:&nbsp;{{ totalMcqCount }}&nbsp;&nbsp;|&nbsp;&nbsp;주관식:&nbsp;{{ totalSaqCount
                  }}&nbsp;&nbsp;|&nbsp;&nbsp;Total:&nbsp;{{ totalMcqCount + totalSaqCount }}
                </div>
                <v-btn color="primary" @click="saveSettings" block>다음 단계</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const emit = defineEmits(['next-step']);

// 문서 데이터 정의
const revenues = ref([
  {
    name: '문서1',
    mcCount: 20,
    sqCount: 10,
    mcSet: 0,
    sqSet: 0,
    selected: false
  },
  {
    name: '문서2',
    mcCount: 20,
    sqCount: 10,
    mcSet: 0,
    sqSet: 0,
    selected: false
  },
  {
    name: '문서3',
    mcCount: 20,
    sqCount: 10,
    mcSet: 0,
    sqSet: 0,
    selected: false
  },
  {
    name: '문서4',
    mcCount: 0,
    mcSet: 0,
    sqSet: 0,
    selected: false
  },
  {
    name: '문서5',
    mcCount: 0,
    mcSet: 0,
    sqSet: 0,
    selected: false
  },
  {
    name: '문서6',
    mcCount: 15,
    sqCount: 5,
    mcSet: 0,
    sqSet: 0,
    selected: false
  }
]);

// 선택된 문서 설정 데이터
const selectedDocument = ref({
  title: '',
  examTime: 60,
  difficulty: '⭐⭐⭐',
  passScore: 70, // 기본값 설정
  retakeAllowed: false // 기본값 설정
});

// 선택된 문서들을 추적하는 computed 속성
const selectedRevenues = computed(() => revenues.value.filter(doc => doc.selected));

// 선택된 문서 수 감시 및 제한 로직
watch(selectedRevenues, (newSelectedRevenues) => {
  if (newSelectedRevenues.length > 5) {
    // 5개를 초과하면 마지막으로 선택된 것을 해제
    const lastSelected = newSelectedRevenues[newSelectedRevenues.length - 1];
    lastSelected.selected = false;
    alert('최대 5개의 문서만 선택할 수 있습니다.');
  }
  // 선택되지 않은 문서의 mcSet과 sqSet을 0으로 설정
  revenues.value.forEach(doc => {
    if (!doc.selected) {
      doc.mcSet = 0;
      doc.sqSet = 0;
    }
  });
}, { deep: true });

// 총 객관식 문제 수 계산
const totalMcqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.sqSet || 0), 0);
});

// 총 주관식 문제 수 계산
const totalSaqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.mcSet || 0), 0);
});

// 설정 저장 함수
function saveSettings() {
  // 현재 라우트의 projectId를 가져옵니다.
  const projectId = route.params.projectId;
  // ExamGenerate.vue로 이동합니다.
  // router.push(`/project/${projectId}/exam-generate`);
  emit('next-step');
}
</script>

<style lang="scss" scoped>
.exam-management {
  padding: 20px;
}

.document-list-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.document-list-title {
  background-color: #e0e0e0;
  color: #424242;
  padding: 16px;
  font-weight: 600;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.document-list-text {
  padding: 16px;
  color: #616161;
}

.table-like-content {
  /* border: 1px solid #e0e0e0; */
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  /* background-color: #f9f9f9; */
}

.table-like-content .v-list-item {
  border-bottom: 1px solid #eeeeee;
}

.table-like-content .v-list-item:last-child {
  border-bottom: none;
}

.table-like-content .v-list-item>div {
  padding: 8px 0;
}

.table-like-content .v-list-item h6 {
  font-size: 0.875rem;
}

.table-like-content .v-text-field {
  font-size: 0.875rem;
}
</style>

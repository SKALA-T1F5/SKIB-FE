<template>
  <v-container class="d-flex flex-column" style="height: 650px;">
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
      <!-- 문서 목록 섹션 -->
      <v-col cols="12" sm="8">
        <v-card elevation="0" height="100%">
          <v-card-text>
            <!-- 문서 목록 헤더 -->
            <div class="d-flex align-center">
              <h4 class="text-h8 mt-1">Document List</h4>
            </div>
            <!-- 문서 목록 테이블 -->
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
              <template v-slot:item.mcCount="{ item }">
                <h6 class="text-body-2 font-weight-bold" style="text-align: center;">{{ item.mcCount }}</h6>
              </template>
              <template v-slot:item.sqCount="{ item }">
                <h6 class="text-body-2 font-weight-bold" style="text-align: center;">{{ item.sqCount }}</h6>
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
              <!-- <v-select v-model="selectedDocument.translationLanguage" :items="['없음', '영어', '베트남어']" label="외국어 번역"
                variant="outlined" rounded="lg"></v-select> -->
              <v-text-field v-model="selectedDocument.examTime" label="시험 시간 (분)" type="number" variant="outlined"
                rounded="lg"></v-text-field>
              <v-select v-model="selectedDocument.difficulty" :items="['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']" label="난이도"
                variant="outlined" rounded="lg"></v-select>
              <div class="d-flex align-center mb-4">
                <v-text-field v-model.number="selectedDocument.passScore" label="PASS 기준 점수" type="number"
                  variant="outlined" rounded="lg" class="mr-2" style="width: 150px;"></v-text-field>
                <!-- 재응시 여부 토글 버튼 -->
                <v-select v-model="selectedDocument.retakeAllowed"
                  :items="[{ text: '재응시 허용', value: true }, { text: '재응시 불허', value: false }]" label="재응시 여부"
                  variant="outlined" rounded="lg" class="flex-grow-1" item-title="text"></v-select>
              </div>
              <!-- 총 객관식/주관식 수 표시 -->
              <div class="total-questions mt-4 mb-4" style="text-align: center;">
                객관식:&nbsp;{{ totalMcqCount }}&nbsp;&nbsp;|&nbsp;&nbsp;주관식:&nbsp;{{ totalSaqCount
                }}&nbsp;&nbsp;|&nbsp;&nbsp;Total:&nbsp;{{ totalMcqCount + totalSaqCount }}
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-spacer />
    <!-- 하단 버튼 섹션 -->
    <v-row class="mt-auto">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <v-btn variant="flat" color="grey" class="mr-2 force-white" @click="prevStep">← 이전단계</v-btn>
        <div>
          <v-btn variant="flat" color="primary" @click="nextStep">다음 단계</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
// import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
// import 'vue3-perfect-scrollbar/style.css';

const headers = [

  { title: '문서명', key: 'name', sortable: false, width: '40%' },
  { title: '보유객관식', key: 'mcCount', sortable: false, align: 'center', width: '15%' },
  { title: '보유주관식', key: 'sqCount', sortable: false, align: 'center', width: '15%' },
  { title: '객관식', key: 'mcSet', sortable: false, align: 'center', width: '15%' },
  { title: '주관식', key: 'sqSet', sortable: false, align: 'center', width: '15%' },
];

const emit = defineEmits(['next-step', 'prev-step']);

// 다음 단계로 이동 함수
function nextStep() {
  emit('next-step');
}

// 이전 단계로 이동 함수
function prevStep() {
  emit('prev-step');
}

// 문서 데이터 정의
const revenues = ref([]);

// 백엔드에서 데이터를 가져오는 함수 (시뮬레이션)
const fetchRevenues = async () => {
  // 실제 백엔드 API 호출 로직이 들어갈 자리
  // 여기서는 더미 데이터를 반환합니다.
  return [
    { name: '문서1', mcCount: 25, sqCount: 12 },
    { name: '문서2', mcCount: 18, sqCount: 8 },
    { name: '문서3', mcCount: 30, sqCount: 15 },
  ];
};

onMounted(async () => {
  try {
    const fetchedData = await fetchRevenues();
    if (fetchedData && fetchedData.length > 0) {
      revenues.value = fetchedData.map(doc => ({
        ...doc,
        mcSet: doc.mcSet !== undefined ? doc.mcSet : 3, // 백엔드에서 mcSet이 오지 않으면 기본값 3
        sqSet: doc.sqSet !== undefined ? doc.sqSet : 2, // 백엔드에서 sqSet이 오지 않으면 기본값 2
      }));
    } else {
      // 백엔드 데이터가 없거나 실패 시 기본값 사용
      console.error('Failed to fetch revenues:', error);
      revenues.value = [
        {
          name: '에러문서1',
          mcCount: 20,
          sqCount: 10,
          mcSet: 3,
          sqSet: 2,
        },

      ];
    }
  } catch (error) {
    console.error('Failed to fetch revenues:', error);
    // 에러 발생 시 기본값 사용
    revenues.value = [
      {
        name: '에러문서2',
        mcCount: 20,
        sqCount: 10,
        mcSet: 3,
        sqSet: 2,
      },

    ];
  }
});

// 선택된 문서 설정 데이터
const selectedDocument = ref({
  title: '',
  examTime: 60,
  difficulty: '⭐⭐⭐',
  passScore: 70, // 기본값 설정
  retakeAllowed: false, // 기본값 설정
  translationLanguage: '없음', // 🎨 번역 언어 기본값 추가
});



// 총 객관식 문제 수 계산
const totalMcqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.sqSet || 0), 0);
});

// 총 주관식 문제 수 계산
const totalSaqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.mcSet || 0), 0);
});
</script>

<style lang="scss" scoped>
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
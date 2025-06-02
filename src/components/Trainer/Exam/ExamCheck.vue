<template>
  <v-container>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <h2 class="text-h5 font-weight-bold mr-2">테스트 생성</h2>
            <p class="text-body-2 text-medium-emphasis">Step 2 of 3 : AI가 만든 문제를 확인하고 재생성할 수 있습니다. 완료 후 테스트를 생성하세요.</p>
          </div>
          <v-progress-linear :model-value="66" height="10" color="primary" bg-color="primary"
            rounded></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <!-- 테스트 문항 목록 섹션 -->
        <v-col cols="12" sm="3">
          <v-card elevation="0" style="height:100%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">테스트 문항 목록</h4>
              </div>
              <div class="mt-4">
                <PerfectScrollbar style="height: 400px;">
                  <v-list lines="two" class="py-0">
                    <v-list-item v-for="(item, i) in testItems" :key="i" :value="item" color="secondary" rounded="sm">
                      <div class="d-flex align-center w-100">
                        <v-checkbox v-model="item.selected" class="mr-2" density="compact" hide-details
                          color="grey"></v-checkbox>
                        <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                          {{ item.name }}
                        </h6>
                      </div>
                    </v-list-item>
                  </v-list>
                </PerfectScrollbar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 문제 및 정답/풀이 섹션 -->
        <v-col cols="12" sm="9">
          <v-card elevation="0" style="height:50%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">문제</h4> &nbsp&nbsp&nbsp 
                <h4 class="text-h8 mt-1" style="color:grey">{{ selectedDocument.originalDocumentName }} | {{ selectedDocument.difficulty }}</h4>
              </div>
              <p class="mt-4">{{ currentQuestion }}</p>
            </v-card-text>
          </v-card>
          <div class="d-flex align-end mb-4" style="height:1%"></div>
          <v-card elevation="0" style="height:45.5%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">정답 및 풀이</h4>
              </div>
              <p class="mt-4">{{ currentAnswer }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 하단 버튼 섹션 -->
      <v-row class="mt-4">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <v-btn variant="flat" color="gray" class="mr-2 force-white" @click="prevStep">← 이전단계</v-btn>
          <div>
            <v-btn variant="flat" color="gray" class="mr-2 force-white">이전문제</v-btn>
            <v-btn variant="flat" color="gray" class="mr-2 force-white">다음문제</v-btn>
            <v-btn variant="flat" color="primary" @click="nextStep">다음 단계</v-btn>
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

// Vue Router 인스턴스
const router = useRouter();
const route = useRoute();

// 컴포넌트에서 발생시킬 이벤트 정의
const emit = defineEmits(['next-step', 'prev-step']);

// 테스트 문항 데이터
const testItems = ref([
  { name: '문제1 (객관식)', selected: true },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: true },
  { name: '문제1 (객관식)', selected: true },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
  { name: '문제1 (객관식)', selected: false },
]);

// 현재 문제 및 정답 데이터
const currentQuestion = ref('다음 중 AGS 인력이 ServiceFlow를 통해 직접 요청할 수 있는 사항으로 옳지 않은 것은 무엇인가요?');
const currentAnswer = ref('정답은 1번 입니다.');

// 선택된 문서 정보 (새로 추가)
const selectedDocument = ref({
  title: '',
  examTime: null,
  difficulty: '',
  passScore: null,
  retakeAllowed: false,
  originalDocumentName: '기본 문서', // 🎨 원본 문서명 추가
  difficulty: '⭐⭐⭐', // 🎨 난이도 추가
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
</style>
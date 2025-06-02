<template>
    <v-container>
  <v-container fluid class="exam-generate">
    <v-row>
      <v-col cols="12">
          <div class="d-flex align-end mb-4">
              <h2 class="text-h5 font-weight-bold mr-2">테스트 생성</h2>
              <pre>  </pre>
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
              <h4 class="text-h8 mt-1">문제</h4>
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
        <v-btn @click="goBack">← 이전단계</v-btn>
        <div>
          <v-btn class="mr-2">이전문제</v-btn>
          <v-btn class="mr-2">다음문제</v-btn>
          <v-btn color="primary">테스트 생성</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 저장되지 않은 변경사항 확인 모달 -->
    <Modal
      ref="unsavedChangesModal"
      title="저장되지 않은 변경사항"
      content="페이지를 벗어나면 저장되지 않은 변경사항이 유실됩니다. 계속하시겠습니까?"
      @confirm="handleConfirmLeave"
      @cancel="handleCancelLeave"
    />

  </v-container>
</v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'; // ✅ named import
import 'vue3-perfect-scrollbar/style.css'; // ✅ CSS 경로도 올바르게 수정됨
import Modal from '@/components/ui/Modal.vue'; // Modal 컴포넌트 임포트


const router = useRouter();
const route = useRoute();

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

const currentQuestion = ref('다음 중 AGS 인력이 ServiceFlow를 통해 직접 요청할 수 있는 사항으로 옳지 않은 것은 무엇인가요?');
const currentAnswer = ref('정답은 1번 입니다.');

// 저장되지 않은 변경사항이 있는지 여부를 나타내는 ref
const hasUnsavedChanges = ref(true);
// 모달 상태를 관리하는 ref
const showUnsavedChangesModal = ref(false);
// 다음 라우트 정보를 저장하는 ref
const nextRoute = ref(null);
// Modal 컴포넌트 인스턴스에 접근하기 위한 ref
const unsavedChangesModal = ref(null);

// 페이지를 떠나기 전에 실행되는 훅
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    // 저장되지 않은 변경사항이 있으면 모달을 띄웁니다.
    nextRoute.value = to;
    // showUnsavedChangesModal.value = true; // v-model 대신 ref를 사용하여 직접 제어
    unsavedChangesModal.value.openDialog(); // Modal 컴포넌트의 openDialog 메서드 호출
    // next(false)를 호출하여 페이지 전환을 취소합니다.
    next(false);
  } else {
    // 저장되지 않은 변경사항이 없으면 페이지 전환을 허용합니다.
    next();
  }
});

// 모달에서 '확인' 버튼 클릭 시 호출되는 함수
const handleConfirmLeave = () => {
  // 저장되지 않은 변경사항을 무시하고 페이지 전환을 진행합니다.
  hasUnsavedChanges.value = false; // 변경사항 없음을 표시
  if (nextRoute.value) {
    router.push(nextRoute.value);
  }
};

// 모달에서 '취소' 버튼 클릭 시 호출되는 함수
const handleCancelLeave = () => {
  // 페이지 전환을 취소하고 현재 페이지에 머무릅니다.
  // showUnsavedChangesModal.value = false; // 모달 닫기
  nextRoute.value = null;
};

function goBack() {
  // 이전 단계 버튼 클릭 시에도 onBeforeRouteLeave 훅이 실행됩니다.
  // router.push(`/project/${route.params.projectId}/exam`); // ExamManagement.vue 경로로 이동
  router.push(`/project/${route.params.projectId}/exam`);
}
</script>

<style scoped>
.exam-generate {
  padding: 20px;
}
</style>
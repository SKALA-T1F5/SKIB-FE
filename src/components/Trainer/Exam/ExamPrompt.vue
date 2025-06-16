<template>
  <AILoading :show="isLoading" />
  <v-container class="trainer-container">
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-end mb-4">
                    <h2 class="text-h5 font-weight-bold mr-2"> 테스트 생성</h2>
                    <p class="text-body-2 text-medium-emphasis">Step 1 of 4 : 생성하고자 하는 테스트에 대한 정보를 입력하고 다음 단계로 이동합니다.
                    </p>
                </div>
                <v-progress-linear :model-value="25" height="10" color="primary" bg-color="primary"
                    rounded></v-progress-linear>
            </v-col>
        </v-row>
        <v-row>

            <!-- 입력 -->
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

            <!-- 예시 -->
            <v-col cols="12">
                <div class="d-flex align-end mb-4">
                    <v-row>
                        <v-col v-for="(prompt, index) in examplePrompts" :key="index" cols="12" sm="6" md="4">
                            <v-card elevation="0" height="100%"
                                class="pa-4 d-flex flex-column align-start cursor-pointer" outlined
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

        <!-- 하단 버튼 섹션 -->
        <v-row style="position: absolute; top: 570px;width: 100%;">
            <v-col cols="12" class="d-flex justify-space-between align-center">
                <v-btn variant="flat" color="gray" class="mr-2 force-white" @click="prevStep">← 이전단계</v-btn>
                <div class="d-flex align-center mr-2" style="gap: 8px;">
                    <!-- <v-btn variant="flat" color="gray" class="force-white">이전문제</v-btn>
                    <v-btn variant="flat" color="gray" class="force-white">다음문제</v-btn> -->
                    <v-btn variant="flat" color="primary" @click="nextStep">다음 단계</v-btn>
                </div>
            </v-col>
        </v-row>

    </v-container>
  </template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AILoading from '@/components/ui/Loading.vue';

// 모든 이벤트를 명시적으로 선언
const emit = defineEmits(['next-step', 'prev-step','reset-step']);
// const emit = defineEmits({
//   'next-step': null,
//   'prev-step': null,
//   'reset-step': null
// });

const router = useRouter();
const isLoading = ref(false);

// 다음 단계로 이동 함수
async function nextStep() {
    isLoading.value = true;
    try {
        // 백엔드 API 호출 시뮬레이션 (실제 API 호출로 대체 필요)
        // 실제 API 호출 예시
        // await axios.post('/api/exam/generate', { prompt: examPrompt.value });
        await new Promise(resolve => setTimeout(resolve, 2000));
        emit('next-step');
    } finally {
        isLoading.value = false;
    }
}

// 이전 단계로 이동 함수
function prevStep() {
    emit('prev-step');
}

const examPrompt = ref('')

const examplePrompts = ref([
    "UI 컴포넌트 개발 원칙과 활용 방법에 대한 실무 중심의 객관식 시험을 출제해주세요.",
    "프론트엔드 개발 환경 구축에 대한 이해도를 평가하는 시험을 만들어주세요. (난이도 중간, 객관식)",
    "업무 프로세스 흐름과 단계별 책임 이해도를 평가하는 주관식 시험을 만들어주세요. (시험시간 30분)",
]);

</script>

<style lang="scss" scoped>
.force-white {
    color: white !important;
}

.cursor-pointer {
    cursor: pointer;
}
</style>
<template>
  <v-container class="d-flex flex-column" style="height: 650px;">
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
                            auto-grow clearable  hide-details class="h-100"></v-textarea>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['next-step']);

const router = useRouter();

// 다음 단계로 이동 함수
function nextStep() {
    emit('next-step');
}

// 이전 단계로 이동 함수
function prevStep() {
    emit('prev-step');
}

const examPrompt = ref('')

const examplePrompts = ref([
    "로마 제국의 역사에 관한 15문항의 객관식 시험을 만들어주세요.",
    "프로그래밍 입문에 대한 20문항의 참/거짓 시험을 만들어주세요.",
    "세계 지리에 관한 10문항의 주관식 시험을 만들어주세요."
])

</script>

<style lang="scss" scoped>
.force-white {
    color: white !important;
}

.cursor-pointer {
    cursor: pointer;
}
</style>
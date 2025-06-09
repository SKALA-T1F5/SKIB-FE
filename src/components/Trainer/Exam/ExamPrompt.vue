<template>
    <v-container>
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
            <v-col cols="12">
                <h2 class=" tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">What kind of
                    test do you want to create?</h2>
                <div class="d-flex align-end mb-4">
                    <v-card></v-card>
                    <v-textarea
                        placeholder="e.g. Create a multiple-choice test on the topic of 'Quantum Physics' with 10 questions."
                        variant="outlined" rows="4" auto-grow clearable class="mb-4"></v-textarea>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-end mb-4">
                    <v-row>
                        <v-col cols="12" sm="6" md="4">
                            <v-card class="pa-4 d-flex flex-column align-start" outlined>
                                <v-icon class="mb-2">mdi-pencil-ruler</v-icon>
                                <div class="font-weight-medium">Create a multiple-choice test on the topic of 'The
                                    History of Ancient Rome' with 15 questions.</div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-card class="pa-4 d-flex flex-column align-start" outlined>
                                <v-icon class="mb-2">mdi-pencil-ruler</v-icon>
                                <div class="font-weight-medium">Create a true/false test on the topic of 'Introduction
                                    to Programming' with 20 questions.</div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-card class="pa-4 d-flex flex-column align-start" outlined>
                                <v-icon class="mb-2">mdi-pencil-ruler</v-icon>
                                <div class="font-weight-medium">Create a short answer test on the topic of 'World
                                    Geography' with 10 questions.</div>
                            </v-card>
                        </v-col>
                    </v-row>


                </div>
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
</script>

<style lang="scss" scoped></style>
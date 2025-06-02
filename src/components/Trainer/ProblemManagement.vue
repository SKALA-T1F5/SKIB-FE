<template>
  <!-- 메인 컨테이너 시작 -->
  <v-container>

    <!-- 카드 컴포넌트 시작: 문서 목록을 포함하는 메인 카드 -->
    <v-card elevation="0">
      <v-card variant="outlined">
        <v-card-text>

          <!-- 문서 목록 헤더 시작 -->
          <div class="d-flex align-center">
            <h4 class="text-h4 mt-1">문서목록</h4>
          </div>
          <!-- 문서 목록 헤더 끝 -->

          <!-- 스크롤 가능한 문서 목록 영역 시작 -->
          <div class="mt-4">
            <perfect-scrollbar style="height: 270px;">
              <v-list lines="two" class="py-0">

                <!-- 각 문서 아이템 반복 시작 -->
                <v-list-item v-for="(revenue, i) in revenues" :key="i" :value="revenue" color="secondary" rounded="sm">


                  <div class="d-flex align-center justify-space-between w-100">
                    <!-- 문서명 -->
                    <div class="mr-4">
                      <h6 class="text-subtitle-1 text-medium-emphasis font-weight-bold">
                        {{ revenue.name }}
                      </h6>
                    </div>
                    
                    <!-- 현재 문제수 표기 -->
                    <div class="d-flex align-center mr-4">
                      <h6 class="text-subtitle-2 text-medium-emphasis mr-1">객관식:</h6>
                      <h6 class="text-subtitle-1 font-weight-bold">{{ revenue.problem_current_amount_choice }}</h6>
                      <h6 class="text-subtitle-2 text-medium-emphasis ml-4 mr-1">주관식:</h6>
                      <h6 class="text-subtitle-1 font-weight-bold">{{ revenue.problem_current_amount_subjective }}</h6>
                    </div>

                    <!-- 주관식, 객관식 입력 -->
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model.number="revenue.choice_amount"
                        label="객관식"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mr-2"
                        style="width: 80px;"
                      ></v-text-field>
                      <v-text-field
                        v-model.number="revenue.subjective_amount"
                        label="주관식"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="width: 80px;"
                      ></v-text-field>
                    </div>
                  </div>
                  <!-- 문서 내용 및 금액 표시 끝 -->
                </v-list-item>
                <!-- 각 문서 아이템 반복 끝 -->
              </v-list>
            </perfect-scrollbar>

          </div>
          <!-- 스크롤 가능한 문서 목록 영역 끝 -->
        </v-card-text>
      </v-card>
    </v-card>
    <!-- 카드 컴포넌트 끝 -->

    <!-- 하단 버튼 및 도움말 링크 영역 시작 -->
    <div class="d-sm-inline-flex align-center mt-2 mb-7 mb-sm-0 font-weight-bold">


    </div>
    <v-btn color="secondary" block class="mt-2" variant="flat" size="large" @click="validate()">문제생성</v-btn>

    <div class="mt-5 text-right">
      <v-divider />
      <v-btn variant="plain" to="/login1" class="mt-2 text-capitalize mr-n2">❓Help</v-btn>
    </div>
    <!-- 하단 버튼 및 도움말 링크 영역 끝 -->
  </v-container>
  <!-- 메인 컨테이너 끝 -->
</template>

<script setup>
import { ChevronUpIcon, ChevronDownIcon, DotsIcon, ChevronRightIcon } from 'vue-tabler-icons';
import { ref } from 'vue';

const revenues = ref([
  {
    name: '문서1',
    problem_current_amount_choice: 20,
    problem_current_amount_subjective: 10,
    subjective_amount: 0,
    choice_amount: 0
  },
  {
    name: '문서2',
    problem_current_amount_choice: 20,
    problem_current_amount_subjective: 10,
    subjective_amount: 0,
    choice_amount: 0
  },
  {
    name: '문서3',
    problem_current_amount_choice: 20,
    problem_current_amount_subjective: 10,
    subjective_amount: 0,
    choice_amount: 0
  },
  {
    name: '문서4',
    problem_current_amount_choice: 0,
    subjective_amount: 0,
    choice_amount: 0
  },
  {
    name: '문서5',
    problem_current_amount_choice: 0,
    subjective_amount: 0,
    choice_amount: 0
  }
]);

const validate = () => {
  // 문제 생성 로직
  console.log('문제 생성 버튼 클릭', revenues.value);
};
</script>

<style>
/* 여기에 스타일 추가 */
</style>
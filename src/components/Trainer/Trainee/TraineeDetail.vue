<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">훈련생 상세 정보</h2>
          <p class="text-body-2 text-medium-emphasis">{{ props.traineeName }} 훈련생의 상세 정보를 확인합니다.</p>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card elevation="0">
          <v-expansion-panels elevation="0">
            <v-expansion-panel>
              <v-expansion-panel-title>인적사항</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card-text>
                  <v-list dense>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">이름:</v-list-item-title>
                      <v-list-item-subtitle>{{ traineeDetail.name }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">이메일:</v-list-item-title>
                      <v-list-item-subtitle>{{ traineeDetail.email }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">상태:</v-list-item-title>
                      <v-list-item-subtitle>{{ traineeDetail.status }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">등록일:</v-list-item-title>
                      <v-list-item-subtitle>{{ traineeDetail.registeredDate }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">최근 로그인:</v-list-item-title>
                      <v-list-item-subtitle>{{ traineeDetail.lastLogin }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
        <div class="d-flex align-end mb-4" style="height:1%"></div>
        <v-card elevation="0">
          <v-expansion-panels elevation="0">

            <v-expansion-panel v-for="(test, index) in traineeDetail.tests" :key="index">
              <v-expansion-panel-title>{{ test.testName }}</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card-text>
                  <v-list dense>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">응시일:</v-list-item-title>
                      <v-list-item-subtitle>{{ test.date }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">점수:</v-list-item-title>
                      <v-list-item-subtitle>{{ test.score }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <TraineeDetailChart :scoreList="[80, 90, 85, 70, 90, 60, 100, 75, 85]" :targetScore="85" />
                </v-card-text>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel v-if="!traineeDetail.tests || traineeDetail.tests.length === 0">
              <v-expansion-panel-title>테스트 응시 내역</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card-text>
                  <v-list dense>
                    <v-list-item>
                      <v-list-item-subtitle>응시한 테스트가 없습니다.</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="goBack">목록으로 돌아가기</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TraineeDetailChart from '../../chart/TraineeDetailChart.vue';

const props = defineProps({
  traineeName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['go-back']);
const traineeDetail = ref({});

// 더미 데이터
const dummyTraineeData = {
  '김철수': { name: '김철수', email: 'kim.cs@example.com', status: '재학중', registeredDate: '2023-01-01', lastLogin: '2023-10-26', tests: [{ testName: '테스트 A', date: '2023-02-10', score: 85 }, { testName: '테스트 B', date: '2023-03-15', score: 92 }] },
  '이영희': { name: '이영희', email: 'lee.yh@example.com', status: '수료', registeredDate: '2022-05-10', lastLogin: '2023-09-15', tests: [{ testName: '테스트 C', date: '2022-06-20', score: 78 }] },
  '박민수': { name: '박민수', email: 'park.ms@example.com', status: '재학중', registeredDate: '2023-03-20', lastLogin: '2023-10-25', tests: [] },
  '최유리': { name: '최유리', email: 'choi.yr@example.com', status: '수료', registeredDate: '2022-11-11', lastLogin: '2023-08-01', tests: [{ testName: '테스트 D', date: '2023-01-05', score: 95 }] },
};

onMounted(() => {
  fetchTraineeDetail(props.traineeName);
});

function fetchTraineeDetail(name) {
  traineeDetail.value = dummyTraineeData[name] || {};
}

function goBack() {
  emit('go-back');
}
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>
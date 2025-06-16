<template>
  <v-container style="max-width: 1150px !important;">
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
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title>인적사항</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-list>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-account" color="primary"></v-icon>
                          </template>
                          <v-list-item-title>이름</v-list-item-title>
                          <v-list-item-subtitle>{{ traineeDetail.name }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-email" color="primary"></v-icon>
                          </template>
                          <v-list-item-title>이메일</v-list-item-title>
                          <v-list-item-subtitle>{{ traineeDetail.email }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-calendar" color="primary"></v-icon>
                          </template>
                          <v-list-item-title>등록일</v-list-item-title>
                          <v-list-item-subtitle>{{ traineeDetail.registeredDate }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-clock-outline" color="primary"></v-icon>
                          </template>
                          <v-list-item-title>최근 로그인</v-list-item-title>
                          <v-list-item-subtitle>{{ traineeDetail.lastLogin }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
        <div class="d-flex align-end mb-4" style="height:1%"></div>
        <v-card elevation="0">
          <v-expansion-panels elevation="0">
            <v-expansion-panel v-for="(test, index) in traineeDetail.tests" :key="index">
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <span class="mr-2">{{ test.testName }}</span>
                  <v-chip
                    size="small"
                    :color="getScoreColor(test.score)"
                    class="ml-2"
                  >
                    {{ test.score }}점
                  </v-chip>
                  <span class="ml-auto text-caption">{{ test.date }}</span>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="12">
                      <v-list>
                        <v-list-item>
                          <v-list-item-title>시험 일자</v-list-item-title>
                          <v-list-item-subtitle>{{ test.date }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>점수</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip
                              size="small"
                              :color="getScoreColor(test.score)"
                            >
                              {{ test.score }}점
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    </v-row>
                    <v-row>

                    <v-col cols="12" md="12">
                      <div class="text-subtitle-2 mb-2">전체 점수 분포</div>
                      <TraineeDetailChart
                        :score-list="test.allScores"
                        :target-score="test.targetScore"
                      />
                    </v-col>
                  </v-row>
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
        <v-btn color="primary" @click="handleGoBack">목록으로 돌아가기</v-btn>
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
  '김철수': { 
    name: '김철수', 
    email: 'kim.cs@example.com', 
    status: '재학중', 
    registeredDate: '2023-01-01', 
    lastLogin: '2023-10-26', 
    tests: [
      { 
        testName: '보안 기초 테스트', 
        date: '2023-02-10', 
        score: 85,
        allScores: [65, 70, 75, 80, 85, 85, 85, 90, 92, 95, 98],
        targetScore: 85
      }, 
      { 
        testName: '네트워크 보안 테스트', 
        date: '2023-03-15', 
        score: 92,
        allScores: [70, 75, 80, 82, 85, 88, 90, 92, 92, 95, 98],
        targetScore: 92
      }
    ] 
  },
  '이영희': { 
    name: '이영희', 
    email: 'lee.yh@example.com', 
    status: '수료', 
    registeredDate: '2022-05-10', 
    lastLogin: '2023-09-15', 
    tests: [
      { 
        testName: '시스템 보안 테스트', 
        date: '2022-06-20', 
        score: 78,
        allScores: [60, 65, 70, 75, 78, 80, 82, 85, 88, 90, 95],
        targetScore: 78
      }
    ] 
  },
  '박민수': { 
    name: '박민수', 
    email: 'park.ms@example.com', 
    status: '재학중', 
    registeredDate: '2023-03-20', 
    lastLogin: '2023-10-25', 
    tests: [] 
  },
  '최유리': { 
    name: '최유리', 
    email: 'choi.yr@example.com', 
    status: '수료', 
    registeredDate: '2022-11-11', 
    lastLogin: '2023-08-01', 
    tests: [
      { 
        testName: '암호화 테스트', 
        date: '2023-01-05', 
        score: 95,
        allScores: [75, 80, 85, 88, 90, 92, 95, 95, 98, 98, 100],
        targetScore: 95
      }
    ] 
  }
};

// 점수에 따른 색상 반환 함수
const getScoreColor = (score) => {
  if (score >= 90) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 60) return 'warning';
  return 'error';
};

onMounted(() => {
  fetchTraineeDetail(props.traineeName);
});

function fetchTraineeDetail(name) {
  traineeDetail.value = dummyTraineeData[name] || {};
}

function handleGoBack() {
  emit('go-back');
}
</script>

<style scoped>
.v-expansion-panel {
  border: 1px solid #e0e0e000;
  border-radius: 0px;
  margin-bottom: 0px;
}

.v-expansion-panel-title {
  font-size: 14px;
}

.v-expansion-panel-text {
  padding: 16px;
}

.v-list-item {
  padding: 8px 0;
}

.v-list-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.v-list-item-subtitle {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.87);
}
</style>
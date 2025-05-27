<template>
  <v-container fluid>
  <TabNavigation>
    <!-- 프로젝트 개요 카드 섹션 -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" elevation="2">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold primary--text">{{ documentCount }}</div>
            <div class="text-subtitle-1">문서</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" elevation="2">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold info--text">{{ testCount }}</div>
            <div class="text-subtitle-1">테스트</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" elevation="2">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold success--text">{{ traineeCount }}</div>
            <div class="text-subtitle-1">Trainee</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" elevation="2">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold error--text">{{ problemCount }}</div>
            <div class="text-subtitle-1">문제</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 프로젝트 통계 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>프로젝트 통계</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <div id="project-progress-chart" style="height: 300px;"></div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>진행 상태</v-card-title>
          <v-card-text>
            <v-progress-circular
              :rotate="-90"
              :size="200"
              :width="15"
              :value="progressValue"
              color="primary"
            >
              {{ progressValue }}%
            </v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 최근 활동 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>최근 활동</v-card-title>
          <v-card-text>
            <v-timeline dense>
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :color="activity.color"
                small
              >
                <template v-slot:opposite>
                  <span class="text-caption">{{ activity.time }}</span>
                </template>
                <div class="text-subtitle-2">{{ activity.title }}</div>
                <div class="text-caption">{{ activity.description }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </TabNavigation>
  </v-container>

</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Chart } from 'chart.js';
import TabNavigation from '../Layout/TabNavigation.vue';

export default {
  name: 'ProjectManagement',
  setup() {
    const route = useRoute();
    const projectId = route.params.id;

    // 프로젝트 데이터 초기화
    const documentCount = ref(0);
    const testCount = ref(0);
    const traineeCount = ref(0);
    const problemCount = ref(0);
    const progressValue = ref(0);
    const recentActivities = ref([]);

    // 프로젝트 데이터 로드 함수
    const loadProjectData = async () => {
      try {
        // 실제 API 호출로 대체해야 함
        // 임시 데이터
        documentCount.value = 240;
        testCount.value = 64;
        traineeCount.value = 20;
        problemCount.value = 156;
        progressValue.value = 75;

        recentActivities.value = [
          {
            id: 1,
            title: '새로운 문서 추가',
            description: '프로젝트 요구사항 문서가 추가되었습니다.',
            time: '10분 전',
            color: 'primary'
          },
          {
            id: 2,
            title: '테스트 완료',
            description: '단위 테스트 세트가 완료되었습니다.',
            time: '1시간 전',
            color: 'info'
          },
          {
            id: 3,
            title: '새로운 Trainee',
            description: '새로운 팀원이 프로젝트에 참여했습니다.',
            time: '2시간 전',
            color: 'success'
          }
        ];
      } catch (error) {
        console.error('프로젝트 데이터 로드 실패:', error);
      }
    };

    onMounted(async () => {
      await loadProjectData();
      
      const ctx = document.getElementById('project-progress-chart');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: [{
              label: '프로젝트 진행도',
              data: [65, 75, 70, 80, 85, 75],
              backgroundColor: '#1976D2'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
    });

    return {
      documentCount,
      testCount,
      traineeCount,
      problemCount,
      progressValue,
      recentActivities
    };
  }
};
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.v-progress-circular {
  margin: 1rem auto;
  display: block;
}
</style>
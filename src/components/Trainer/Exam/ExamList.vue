<template>
  <v-container class="trainer-container">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">시험 관리</h2>
          <p class="text-body-2 text-medium-emphasis">관리 중인 시험 목록을 확인합니다.</p>
        </div>
      </v-col>

    </v-row>

    <v-row :class="exams.length + 1 <= 4 ? 'd-flex flex-row flex-nowrap' : ''">
      <v-col v-for="exam in exams" :key="exam.id" cols="12" sm="6" md="4" lg="3" class="d-flex">

        <v-card elevation="0" class="mx-auto h-100 d-flex flex-column" max-width="344">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span class="text-h6">{{ exam.name }}</span>
              <v-icon size="15" color="primary" @click="copyLink">	mdi-link-variant</v-icon>
            </div>
          </v-card-title>

          <v-card-subtitle>
            난이도: {{ exam.difficulty }} | 제한 시간: {{ exam.timeLimit }}분
          </v-card-subtitle>
          <v-card-text class="flex-grow-1">
            <div>PASS 점수: {{ exam.passingScore }}점</div>
            <div>마지막 수정일: {{ exam.lastModified }}</div>
            <div>재응시 여부: {{ exam.retakeable ? '가능' : '불가능' }}</div>
            <br>
            <!-- <div>합격자 수: {{ exam.passCount }}/{{ exam.totalApplicants }}명</div>
            <div>평균 점수: {{ exam.averageScore }}점</div> -->
            <ExamStatsChart :exam="exam" />
            <br>
            <v-card-text class="d-flex align-center gap-2 pa-0">
              <v-btn color="primary" style="width: 48%;" variant="outlined" prepend-icon="mdi-format-list-bulleted"
                size="default" @click="router.push('/exam/1')">
                문제목록
              </v-btn>
              <v-spacer />
              <v-btn color="primary" style="width: 48%;" variant="outlined" prepend-icon="mdi-chart-line" size="default"
                @click="router.push('/exam/1')">
                응시현황
              </v-btn>
            </v-card-text>
          </v-card-text>


        </v-card>

      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3" class="d-flex">
        <v-card elevation="0" class="mx-auto h-100 d-flex flex-column align-center justify-center"
          style="border: 2px dashed #ccc; cursor: pointer;" @click="addExam">
          <div class="text-center">
            <v-icon size="48" color="grey-lighten-1">mdi-plus</v-icon>
            <div class="text-subtitle-1 text-grey-lighten-1 mt-2">새로운 시험 추가</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ExamStatsChart from '../../chart/ExamStatsChart.vue';

const emit = defineEmits(['next-step']);

const router = useRouter();

const addExam = () => {
  emit('next-step');
};

const props = defineProps({
  exams: Array
})

// 링크 복사 함수
function copyLink() {
  const url = `https://www.example.com/${exams.value.id}`

  // clipboard API 사용
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('링크가 복사되었습니다!');
      })
      .catch(err => {
        console.error('복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
  } else {
    // fallback: execCommand (구형 브라우저 대응)
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('링크가 복사되었습니다!');
    } catch (err) {
      console.error('Fallback 복사 실패:', err);
      alert('링크 복사에 실패했습니다.');
    }
    document.body.removeChild(textArea);
  }
}

const exams = ref([
  {
    id: 1,
    name: 'Vue.js 기초 테스트',
    difficulty: '하',
    timeLimit: 30,
    passingScore: 70,
    lastModified: '2023-10-26',
    retakeable: true,
    passCount: 15,
    totalApplicants: 20,
    averageScore: 75,
  },
  {
    id: 2,
    name: 'JavaScript 심화 테스트',
    difficulty: '중',
    timeLimit: 60,
    passingScore: 80,
    lastModified: '2023-10-25',
    retakeable: false,
    passCount: 2,
    totalApplicants: 10,
    averageScore: 45,
  },
  {
    id: 3,
    name: 'CSS 고급 레이아웃',
    difficulty: '상',
    timeLimit: 45,
    passingScore: 75,
    lastModified: '2023-10-24',
    retakeable: true,
    passCount: 12,
    totalApplicants: 15,
    averageScore: 78,
  },
  {
    id: 4,
    name: 'CSS 고급 레이아웃',
    difficulty: '상',
    timeLimit: 45,
    passingScore: 75,
    lastModified: '2023-10-24',
    retakeable: true,
    passCount: 12,
    totalApplicants: 15,
    averageScore: 78,
  },
]);
</script>

<style scoped>
.v-card {
  margin-bottom: 16px;
}
</style>
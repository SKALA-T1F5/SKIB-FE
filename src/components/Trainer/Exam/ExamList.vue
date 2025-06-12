<template>
  <v-container class="trainer-container">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">테스트 관리</h2>
          <p class="text-body-2 text-medium-emphasis">관리 중인 테스트 목록을 확인합니다.</p>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ExamStatsChart from '../../chart/ExamStatsChart.vue';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';


// 임의의 테스트용 JWT 토큰 하드코딩 ✅로그인 구현 시 삭제 필요✅
// const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0OTYxOTE4OSwiZXhwIjoxNzQ5NjIyNzg5fQ.U3vom7xAsdsEE3fVII3TRGKKhE_5HdXkG-Q6AAEXLbA';
// const projectId = 1;
// localStorage.setItem('token', token);
// localStorage.setItem('projectId', projectId);
// console.log('token:', token);
// console.log('projectId:', projectId);

const emit = defineEmits(['next-step']);

const router = useRouter();

const addExam = () => {
  emit('next-step');
};

const props = defineProps({
  exams: Array
})


// 시험 목록을 가져오는 함수
const fetchExams = async () => {
  try {
    // 로컬스토리지 값 가져오기
    const token = localStorage.getItem('token');
    const projectId = localStorage.getItem('projectId');

    const response = await axios.get(`${API_BASE_URL}/test/getTests`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      params: {
        projectId: projectId 
      }
    });

    if (response.data.statusCode === 'OK') {
      const tests = response.data.resultData?.tests;

      if (Array.isArray(tests)) {
        exams.value = tests.map(project => ({
          id: project.testId,
          name: project.name,
          difficulty: '미정', // 백엔드 응답에 난이도 정보가 없으므로 임시로 '미정'으로 설정
          timeLimit: project.limitedTime,
          passingScore: 0, // 백엔드 응답에 PASS 점수 정보가 없으므로 임시로 0으로 설정
          lastModified: new Date(project.createdAt).toLocaleDateString(),
          retakeable: false, // 백엔드 응답에 재응시 여부 정보가 없으므로 임시로 false로 설정
          passCount: 0,
          totalApplicants: 0,
          averageScore: 0,
        }));
      } else {
        console.error('시험 목록 가져오기 실패: resultData.tests is not an array', tests);
        exams.value = []; // fallback
      }
    } else {
      console.error('시험 목록 가져오기 실패: statusCode !== OK', response.data.statusCode);
      exams.value = []; // fallback
    }
  } catch (error) {
    console.error('시험 목록 가져오기 실패:', error);
    exams.value = []; // fallback
  }
};



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

const exams = ref([]); // 기존 더미 데이터 제거

onMounted(() => {
  fetchExams();
});

</script>

<style scoped>
.v-card {
  margin-bottom: 16px;
}
</style>
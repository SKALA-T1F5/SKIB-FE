<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">테스트 목록</h2>
        <v-btn color="primary" @click="addExam">테스트 추가</v-btn>
      </v-col>
      <v-col
        v-for="exam in exams"
        :key="exam.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mx-auto" max-width="344">
          <v-card-title class="text-h6">{{ exam.name }}</v-card-title>
          <v-card-subtitle>
            난이도: {{ exam.difficulty }} | 제한 시간: {{ exam.timeLimit }}분
          </v-card-subtitle>
          <v-card-text>
            <div>합격 점수: {{ exam.passingScore }}점</div>
            <div>마지막 수정일: {{ exam.lastModified }}</div>
            <div>재응시 여부: {{ exam.retakeable ? '가능' : '불가능' }}</div>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary">상세 보기</v-btn>
            <v-btn text color="secondary">수정</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['next-step']);

function addExam() {
  emit('next-step');
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
  },
  {
    id: 2,
    name: 'JavaScript 심화 테스트',
    difficulty: '중',
    timeLimit: 60,
    passingScore: 80,
    lastModified: '2023-10-25',
    retakeable: false,
  },
  {
    id: 3,
    name: 'CSS 고급 레이아웃',
    difficulty: '상',
    timeLimit: 45,
    passingScore: 75,
    lastModified: '2023-10-24',
    retakeable: true,
  },
]);
</script>

<style scoped>
.v-card {
  margin-bottom: 16px;
}
</style>
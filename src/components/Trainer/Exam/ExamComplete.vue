<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">테스트 생성</h2>
          <p class="text-body-2 text-medium-emphasis">Step 4 of 4 : 테스트가 생성이 완료되었습니다. 학습자에게 링크를 공유하고, 테스트 목록에서 현황을
            확인하세요. </p>
        </div>
        <v-progress-linear :model-value="100" height="10" color="primary" bg-color="primary"
          rounded></v-progress-linear>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card elevation="0" class="py-8" style="height: 400px;">
          <div class="d-flex align-center justify-center">
            <h1> 테스트 생성 완료!</h1>
          </div>
          <br>
          <v-row align="center" justify="center">
            <v-col cols="12" md="2"></v-col>

            <!-- 링크 표시 박스 -->
            <v-col cols="12" md="5" class="text-md-right mt-2 mt-md-0">
              <div class="d-flex align-center rounded-pill"
                style="background-color: #eef2f6; padding-left: 18px; padding-right: 1px; height: 40px;">
                <span class="font-weight-bold text-body-2 mr-2">https://www.testlink.com</span>
                <v-spacer />
                <v-btn icon variant="text" @click="copyLink">
                  <v-icon size="13">mdi-content-copy</v-icon>
                </v-btn>
              </div>
            </v-col>

            <!-- 테스트 목록 버튼 -->
            <v-col cols="12" md="3" class="text-md-left mt-2 mt-md-0">
              <v-btn color="primary" @click="goToList" height="40" style="border-radius: 9999px;">
                <v-icon start size="18">mdi-arrow-right</v-icon>
                테스트목록
              </v-btn>
            </v-col>
              <v-col cols="12" md="2"></v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'; // ✅ named import
import 'vue3-perfect-scrollbar/style.css'; // ✅ CSS 경로도 올바르게 수정됨
import Modal from '@/components/ui/Modal.vue'; // Modal 컴포넌트 임포트


const router = useRouter();
const route = useRoute();

const emit = defineEmits(['reset-step']);

function goToList() {
  emit('reset-step');
}

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

</script>

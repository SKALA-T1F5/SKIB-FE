<template>
  <v-container style="max-width: 1150px !important;">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">테스트 응시 현황</h2>
          <p class="text-body-2 text-medium-emphasis">{{  }} 훈련생들의 테스트 응시 결과를 확인하고, AI Report를 생성합니다.</p>
        </div>
      </v-col>
    </v-row>
    <v-row dense>
      <!-- 왼쪽: AI 테스트 결과 요약, 문항별 분석 -->
      <v-col cols="12" sm="9">
        <v-card elevation="0" style="height: 280px;">
          <v-card-title class="text-body-2" style="color: #757575;">AI 테스트 결과 요약</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <!-- 빈 영역 -->
          </v-card-text>
        </v-card>
        <v-card elevation="0" style="height: 300px; margin-top: 16px;">
          <v-card-title class="text-body-2" style="color: #757575;">문항별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <!-- 빈 영역 -->
          </v-card-text>
        </v-card>
      </v-col>
      <!-- 오른쪽: 평균 점수/합격자 수, 학습자별 분석, Tag별 분석 -->
      <v-col cols="12" sm="3">
        <v-card elevation="0" style="height: 180px;">
          <v-card-title class="text-body-2" style="color: #757575;">평균 점수 / 합격자 수</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <!-- 빈 영역 -->
          </v-card-text>
        </v-card>
        <v-card elevation="0" style="height: 220px; margin-top: 16px;">
          <v-card-title class="text-body-2" style="color: #757575;">학습자별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <!-- 빈 영역 -->
          </v-card-text>
        </v-card>
        <v-card elevation="0" style="height: 220px; margin-top: 16px;">
          <v-card-title class="text-body-2" style="color: #757575;">Tag별 분석</v-card-title>
          <v-divider color="secondary" class="custom-divider"></v-divider>
          <v-card-text>
            <!-- 빈 영역 -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// 내용 없음 (구조만)
</script>

<script>
// export default {
//   components: {
//     apexchart: VueApexCharts
//   }
// }
</script>

<style scoped>
.custom-divider {
  height: 3px !important;
  border-radius: 2px;
}
</style>
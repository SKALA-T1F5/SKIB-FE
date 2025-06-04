<template>
    <div class="chart-container">
      <div class="stat-item">
        <div>합격자수</div>
        <!-- <div class="stat-label">합격자수 : {{ exam.passCount }}/{{ exam.totalApplicants }}명</div> -->
        <v-progress-linear
          :model-value="passRate"
          color="primary"
          height="20"
          rounded
        >
          <template v-slot:default="{ value }">
            <p class="text-white">{{ exam.passCount }} / {{ exam.totalApplicants }}명</p>
          </template>
        </v-progress-linear>
      </div>
      <div class="stat-item mt-4">
        <div>평균 점수</div>
        <!-- <div class="stat-label">평균 점수 : {{ exam.averageScore }}점</div> -->

        <v-progress-linear
          :model-value="exam.averageScore"
          color="primary"
          height="20"
          rounded
        >
          <template v-slot:default="{ value }">
            <p class="text-white">{{ Math.ceil(value) }}점</p>
          </template>
        </v-progress-linear>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  // import ApexCharts from 'vue3-apexcharts'
  // defineExpose({ ApexCharts })
  
  // defineOptions({
  // components: {
  //   apexchart: ApexCharts,
  // }
  // })

  const props = defineProps({
    exam: {
      type: Object,
      required: true
    }
  })
  
  const passRate = computed(() => {
    if (props.exam.totalApplicants === 0) return 0;
    return (props.exam.passCount / props.exam.totalApplicants) * 100;
  });
  </script>
  
  <style scoped>
  .chart-container {
    padding: 0px;
  }
  
  .stat-item {
    margin-bottom: 16px;
  }
  
  .stat-label {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .v-progress-linear {
    border-radius: 10px; /* 둥근 모서리 */
    overflow: hidden; /* 내부 진행바도 둥글게 */
  }
  
  .v-progress-linear__determinate {
    border-radius: 10px; /* 내부 진행바 둥근 모서리 */
  }
  </style>
  
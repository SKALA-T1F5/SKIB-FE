<template>
    <div class="step-progress">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step"
        :class="{
          active: index === currentStep,
          completed: index < currentStep
        }"
      >
        <div class="circle">
          <span v-if="index < currentStep">✔</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
  
        <!-- 연결 선 (마지막 원에는 없음) -->
        <div v-if="index < steps.length - 1" class="line"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    steps: { type: Array, default: () => ['1', '2', '3'] },
    currentStep: { type: Number, default: 1 } // 0부터 시작
  });
  </script>
  
  <style scoped>
  .step-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .step {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: white;
    border: 2px solid #1976d2;
    color: #1976d2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    z-index: 1;
  }
  
  .step.active .circle {
    background-color: #1976d2;
    color: white;
  }
  
  .step.completed .circle {
    background-color: white;
    color: #1976d2;
    border-color: #1976d2;
  }
  
  .line {
    width: 40px;
    height: 2px;
    background-color: #1976d2;
    margin-left: 8px;
    margin-right: 8px;
  }
  </style>
  
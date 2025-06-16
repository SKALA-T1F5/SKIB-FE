<template>
    <v-container fluid class="exam-management">
      <keep-alive>
        <component 
          :is="currentComponent" 
          @next-step="handleNextStep" 
          @prev-step="handlePrevStep" 
          @reset-step="handleResetStep" 
          @exam-dashboard="handleExamDashboard"
        />
      </keep-alive>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ExamList from './Exam/ExamList.vue';
import ExamPrompt from './Exam/ExamPrompt.vue';
import ExamSetting from './Exam/ExamSetting.vue';
import ExamCheck from './Exam/ExamCheck.vue';
import ExamComplete from './Exam/ExamComplete.vue';
import ExamDashboard from './Exam/ExamDashboard.vue';


const router = useRouter();
const route = useRoute();

const emit = defineEmits(['next-step', 'prev-step', 'exam-dashboard']);

const currentStep = ref(0);

const components = [

  {
    name: 'ExamList',
    component: ExamList,
  },
  {
    name: 'ExamPrompt',
    component: ExamPrompt,
  },
  {
    name: 'ExamSetting',
    component: ExamSetting,
  },
  {
    name: 'ExamCheck',
    component: ExamCheck,
  },
  {
    name: 'ExamComplete',
    component: ExamComplete,
  },
  {
    name: 'ExamDashboard',
    component: ExamDashboard,
  },
];

const currentComponent = computed(() => components[currentStep.value].component);

function handleNextStep() {
  if (currentStep.value < components.length - 1) {
    currentStep.value++;
  }
}

function handlePrevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function handleResetStep() {
  currentStep.value = 0;
}

function handleExamDashboard() {
  currentStep.value = 5;
}

</script>

<style lang="scss" scoped>
.exam-management {
  padding: 20px;
}
</style>

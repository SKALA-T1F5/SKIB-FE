<template>
  <v-container>
    <v-container fluid class="problem-management">
      <keep-alive>
        <component :is="currentComponent" @next-step="handleNextStep" @prev-step="handlePrevStep" @reset-step="handleResetStep" />
      </keep-alive>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProblemCheck from './Problem/ProblemCheck.vue';
import ProblemComplete from './Problem/ProblemComplete.vue';
import ProblemGenerate from './Problem/ProblemGenerate.vue';


const router = useRouter();
const route = useRoute();

const emit = defineEmits(['next-step', 'prev-step']);

const currentStep = ref(0);

const components = [
  {
    name: 'ProblemGenerate',
    component: ProblemGenerate,
  },
  {
    name: 'ProblemCheck',
    component: ProblemCheck,
  },
  {
    name: 'ProblemComplete',
    component: ProblemComplete,
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
</script>

<style lang="scss" scoped>
.problem-management {
  padding: 20px;
}
</style>
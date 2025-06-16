<template>

    <v-container fluid class="problem-management">
      <keep-alive>
        <component :is="currentComponent" @next-step="handleNextStep" @prev-step="handlePrevStep" @reset-step="handleResetStep" @go-to-problem-list="handleGoToProblemList" @go-to-problem-check="handleGoToProblemCheck" @go-to-problem-generate="handleGoToProblemGenerate" />
      </keep-alive>
    </v-container>

</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProblemCheck from './Problem/ProblemCheck.vue';
import ProblemComplete from './Problem/ProblemComplete.vue';
import ProblemDocument from './Problem/ProblemDocument.vue';
import ProblemGenerate from './Problem/ProblemGenerate.vue';
import ProblemList from './Problem/ProblemList.vue';



const router = useRouter();
const route = useRoute();

const emit = defineEmits(['next-step', 'prev-step']);

function handleGoToProblemList(documentName) {
  const problemListIndex = components.findIndex(comp => comp.name === 'ProblemList');
  if (problemListIndex !== -1) {
    currentStep.value = problemListIndex;
    router.push({ name: 'ProblemList', params: { projectId: route.params.projectId, documentName: documentName } });
  }
}

function handleGoToProblemCheck() {
  const problemCheckIndex = components.findIndex(comp => comp.name === 'ProblemCheck');
  if (problemCheckIndex !== -1) {
    currentStep.value = problemCheckIndex;
  }
}

function handleGoToProblemGenerate() {
  const problemGenerateIndex = components.findIndex(comp => comp.name === 'ProblemGenerate');
  if (problemGenerateIndex !== -1) {
    currentStep.value = problemGenerateIndex;
  }
}

const currentStep = ref(0); // ProblemDocument가 첫 화면이 되도록 0으로 설정

const components = [
  {
    name: 'ProblemDocument',
    component: ProblemDocument,
  },
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
  {
    name: 'ProblemList',
    component: ProblemList,
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
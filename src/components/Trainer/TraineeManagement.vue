<template>
  <v-container style="max-width: 1150px !important;">
        <keep-alive>
          <component :is="currentComponent" @go-to-trainee-detail="handleGoToTraineeDetail"
            @add-trainee="handleAddTrainee" @go-back="handleGoBackToList" :traineeName="selectedTraineeName" />
        </keep-alive>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import TraineeList from './Trainee/TraineeList.vue';
import TraineeDetail from './Trainee/TraineeDetail.vue';
import PerfectScrollbar from 'perfect-scrollbar';

const router = useRouter();
const route = useRoute();

const currentStep = ref(0); // TraineeList가 첫 화면이 되도록 0으로 설정

const components = [
  {
    name: 'TraineeList',
    component: TraineeList,
  },
  {
    name: 'TraineeDetail',
    component: TraineeDetail,
  },
];

const currentComponent = computed(() => components[currentStep.value].component);

const selectedTraineeName = ref('');

function handleGoToTraineeDetail(traineeName) {
  selectedTraineeName.value = traineeName;
  const traineeDetailIndex = components.findIndex(comp => comp.name === 'TraineeDetail');
  if (traineeDetailIndex !== -1) {
    currentStep.value = traineeDetailIndex;
  }
}

function handleAddTrainee() {
  // 훈련생 추가 로직 (필요하다면 새로운 컴포넌트로 이동)
  console.log('훈련생 추가');
}

function handleGoBackToList() {
  const traineeListIndex = components.findIndex(comp => comp.name === 'TraineeList');
  if (traineeListIndex !== -1) {
    currentStep.value = traineeListIndex;
    router.push({ name: 'TraineeList' });
  }
}

</script>

<style lang="scss" scoped>
.trainee-management {
  padding: 20px;
}
</style>

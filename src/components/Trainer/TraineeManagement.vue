<template>
  <v-card class="rounded-md mt-5" color="lightsecondary" variant="elevated">
    <!-- 카드 헤더 -->
    <v-card-text class="d-flex align-center">
      <h4 class="text-h4 mt-1">TraineeList</h4>
      <v-spacer />
      <v-btn icon color="primary" variant="text" size="small">
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-text>

    <!-- 차트 영역 -->
    <div class="pa-5">
      <div class="text-subtitle-1">Step 1 of 3</div>
      <v-progress-linear
        :model-value="33"
        height="10"
        color="light-green-accent-4"
        bg-color="grey-lighten-1"
        rounded
      ></v-progress-linear>
    </div>

    <!-- 리스트 -->
    <v-btn @click="openModal">모달 열기</v-btn>
    <Modal
      ref="modalRef"
      title="모달 제목입니다."
      content="모달 내용입니다. 확인 또는 취소를 선택해주세요."
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import ApexChart from 'vue3-apexcharts';
import Modal from '@/components/ui/Modal.vue';

const modalRef = ref(null);

const openModal = () => {
  if (modalRef.value) {
    modalRef.value.openDialog();
  }
};

const handleConfirm = () => {
  console.log('확인 버튼이 클릭되었습니다.');
  // 여기에 확인 동작 로직을 추가합니다.
};

const handleCancel = () => {
  console.log('취소 버튼이 클릭되었습니다.');
  // 여기에 취소 동작 로직을 추가합니다.
};

const stockList = [
  { name: 'Bajaj Finery', profit: 10, price: '145.58' },
  { name: 'TTML', profit: -10, price: '6.368' },
  { name: 'Reliance', profit: 10, price: '458.63' },
  { name: 'Stolon', profit: -10, price: '5.631' }
]

const series = [
  {
    name: 'Series 1',
    data: [10, 15, 8, 20, 16, 10, 18]
  }
]

const chartOptions = {
  chart: { type: 'area', sparkline: { enabled: true } },
  stroke: { curve: 'smooth' },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.5,
      stops: [0, 90, 100]
    }
  },
  colors: ['#5e35b1'],
  tooltip: { enabled: false }
}
</script>

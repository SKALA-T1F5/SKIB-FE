<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">문제 관리</h2>

          <p class="text-body-2 text-medium-emphasis">문서별 보유 문제 수를 확인하고, 문제를 추가 생성합니다.</p>
        </div>

      </v-col>
    </v-row>
    <v-row>
      <!-- 문서 목록 섹션 -->
      <v-col cols="12">
        <v-card elevation="0" height="100%">
          <v-card-text>
            <!-- 문서 목록 테이블 -->
            <v-data-table :headers="headers" :items="revenues" item-value="name" class="elevation-1" density="compact"
              hide-default-footer>
              <template v-slot:item.no="{ index }">
                <div class="text-body-2 text-center">{{ index + 1 }}</div>
              </template>
              <template v-slot:item.name="{ item }">
                <div class="text-body-2 font-weight-bold">{{ item.name }}</div>
              </template>
              <template v-slot:item.mcCount="{ item }">
                <div class="text-body-2 text-center">{{ item.mcCount }}</div>
              </template>
              <template v-slot:item.sqCount="{ item }">
                <div class="text-body-2 text-center">{{ item.sqCount }}</div>
              </template>


              <template v-slot:item.mcSet="{ item }">
                <div class="d-flex align-center" style="justify-content: space-between;">
                  <v-text-field v-model.number="item.mcSet" type="number" variant="outlined" density="compact"
                    hide-details class="mr-2" style="width: 70px;" :disabled="!item.selected"></v-text-field>
                </div>
              </template>
              <template v-slot:item.sqSet="{ item }">
                <div class="d-flex align-center" style="justify-content: space-between;">
                  <v-text-field v-model.number="item.sqSet" type="number" variant="outlined" density="compact"
                    hide-details style="width: 70px;" :disabled="!item.selected"></v-text-field>
                </div>
              </template>
              <template v-slot:item.action="{ item }">
                <v-btn icon size="small" elevation="0" @click="goToProblemList(item)">
                  <v-icon color="primary" >mdi-arrow-right-circle</v-icon>
                </v-btn>
              </template>

            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="goToProblemCheck">+ 문제 추가 생성</v-btn>
      </v-col>
    </v-row>
  </v-container>

</template>

<script setup>
import { ref, defineEmits } from 'vue';

// 테이블 헤더 정의
const headers = [
  { title: 'No', key: 'no', sortable: false, width: '5%' },
  { title: '문서명', key: 'name', sortable: false, width: '35%' },
  { title: '보유 객관식', key: 'mcCount', sortable: false, align: 'center', width: '13%' },
  { title: '보유 주관식', key: 'sqCount', sortable: false, align: 'center', width: '13%' },
  { title: '객관식', key: 'mcSet', sortable: false, align: 'center', width: '12%' },
  { title: '주관식', key: 'sqSet', sortable: false, align: 'center', width: '12%' },
  { title: '세부', key: 'action', sortable: false, align: 'center', width: '10%' },
];

// 문서 데이터 정의
const revenues = ref([
  {
    name: '문서1',
    mcCount: 20,
    sqCount: 10,
    mcSet: 0,
    sqSet: 0,
  },
  {
    name: '문서2',
    mcCount: 20,
    sqCount: 10,
    mcSet: 0,
    sqSet: 0,
  },
  {
    name: '문서3',
    mcCount: 20,
    sqCount: 10,
    mcSet: 0,
    sqSet: 0,
  },
  {
    name: '문서4',
    mcCount: 0,
    mcSet: 0,
    sqSet: 0,
  },
  {
    name: '문서5',
    mcCount: 0,
    mcSet: 0,
    sqSet: 0,
  },
  {
    name: '문서6',
    mcCount: 15,
    sqCount: 5,
    mcSet: 0,
    sqSet: 0,
  }
]);




import { useRouter } from 'vue-router';
const router = useRouter();

const emit = defineEmits(['go-to-problem-list', 'go-to-problem-check']);

function goToProblemList(item) {
  console.log('ProblemList로 이동:', item.name);
  emit('go-to-problem-list', item.name);
}

function goToProblemCheck() {
  emit('go-to-problem-check');
}
</script>

<style lang="scss" scoped>
.elevation-1 {
  box-shadow: none !important;
}

.v-data-table {
  .v-data-table-header {
    th {
      font-size: 0.875rem !important;
      font-weight: bold !important;
      color: rgba(0, 0, 0, 0.87) !important; // Adjust color if needed
    }
  }

  .v-data-table__td {
    vertical-align: middle !important;
    padding: 32px !important;
    /* 행 높이를 2배로 조정 🚀 */
  }

  .v-data-table__tr {
    border-bottom: 1px solid black !important;
    /* 행 사이 가로줄 색상 검은색으로 변경 ⚫ */
  }
}
</style>
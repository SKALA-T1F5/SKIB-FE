<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-4">
          <h2 class="text-h5 font-weight-bold mr-2">문제 생성</h2>

          <p class="text-body-2 text-medium-emphasis">Step 1 of 3 : 생성할 문제 수를 입력하고, 다음 단계로 이동하세요.</p>
          
        </div>
        <v-progress-linear :model-value="33" height="10" color="primary" bg-color="primary" rounded></v-progress-linear>
      </v-col>
    </v-row>
    <v-row>
      <!-- 문서 목록 섹션 -->
      <v-col cols="9">
        <v-card elevation="0" height="100%">
          <v-card-text>
            <v-data-table :headers="headers1" :items="revenues" item-value="name" class="elevation-1" density="compact"
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
              <template v-slot:item.action="{ item }">
                <v-btn icon size="small" elevation="0" @click="goToProblemList(item)">
                  <v-icon color="primary">mdi-arrow-right-circle</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card elevation="0" height="100%">
          <v-card-text>
            <v-data-table :headers="headers2" :items="revenues" item-value="name"
              class="elevation-1 custom-cell-padding" density="compact" hide-default-footer>
              <template v-slot:item.mcSet="{ item }">
                <div class="d-flex align-center" style="justify-content: space-between;">
                  <v-text-field v-model.number="item.mcSet" type="number" variant="outlined" density="compact"
                    hide-details class="mr-2" style="width: 70px;"></v-text-field>
                </div>
              </template>
              <template v-slot:item.sqSet="{ item }">
                <div class="d-flex align-center" style="justify-content: space-between;">
                  <v-text-field v-model.number="item.sqSet" type="number" variant="outlined" density="compact"
                    hide-details style="width: 70px;"></v-text-field>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-col cols="12" class="d-flex justify-end">
      <v-btn color="primary" @click="goToProblemCheck">다음 단계</v-btn>
    </v-col>

  </v-container>

</template>

<script setup>
import { ref, defineEmits } from 'vue';

// 테이블 헤더 정의
const headers1 = [
  { title: 'No', key: 'no', sortable: false, width: '5%' },
  { title: '문서명', key: 'name', sortable: false, width: '35%' },
  { title: '보유 객관식', key: 'mcCount', sortable: false, align: 'center', width: '13%' },
  { title: '보유 주관식', key: 'sqCount', sortable: false, align: 'center', width: '13%' },
  { title: '세부', key: 'action', sortable: false, align: 'center', width: '10%' },
];

const headers2 = [
  { title: '객관식', key: 'mcSet', sortable: false, align: 'center', width: '12%' },
  { title: '주관식', key: 'sqSet', sortable: false, align: 'center', width: '12%' },
];

// 문서 데이터 정의
const revenues = ref([
  {
    name: '문서1',
    mcCount: 20,
    sqCount: 10,
    mcSet: 5,
    sqSet: 2,
  },
  {
    name: '문서2',
    mcCount: 20,
    sqCount: 10,
    mcSet: 5,
    sqSet: 2,
  },
  {
    name: '문서3',
    mcCount: 20,
    sqCount: 10,
    mcSet: 5,
    sqSet: 2,
  },
  {
    name: '문서4',
    mcCount: 0,
    mcSet: 5,
    sqSet: 2,
  },
  {
    name: '문서5',
    mcCount: 0,
    mcSet: 5,
    sqSet: 2,
  },
  {
    name: '문서6',
    mcCount: 15,
    sqCount: 5,
    mcSet: 5,
    sqSet: 2,
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
  console.log('생성할 문제 수:', revenues.value.map(item => ({ name: item.name, mcSet: item.mcSet, sqSet: item.sqSet })));
  // TODO: 여기에 백엔드로 데이터를 전송하는 로직 추가
  emit('go-to-problem-check');
  // ProblemCheck.vue로 이동하는 로직은 ProblemManagement.vue에서 처리됩니다.
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
      color: rgba(0, 0, 0, 0.87) !important;
    }
  }

  .v-data-table__td {
    vertical-align: middle !important;
    // padding은 여기선 제거 (아래에서 따로 커스텀으로 지정)
  }

  .v-data-table__tr {
    border-bottom: 1px solid black !important;
  }
}

.custom-cell-padding :deep(td.v-data-table__td),
.custom-cell-padding :deep(th.v-data-table__th) {
  padding: 1px 1px !important;
}
</style>

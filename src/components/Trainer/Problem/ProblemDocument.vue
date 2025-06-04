<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <h2 class="text-h5 font-weight-bold mr-2">문제 관리</h2>
  
            <p class="text-body-2 text-medium-emphasis">문서별 보유 문제 수를 확인합니다.</p>
          </div>
  
        </v-col>
      </v-row>
      <v-row>
        <!-- 문서 목록 섹션 -->
        <v-col cols="`12`">
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
                <template v-slot:item.modifiedDate="{ item }">
                  <div class="text-body-2 text-center">{{ item.modifiedDate }}</div>
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

      </v-row>
      <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="goToProblemGenerate">+ 문제 추가 생성</v-btn>
      </v-col>
    </v-row>
    </v-container>
  
  </template>
  
  <script setup>
  import { ref, defineEmits } from 'vue';
  
  // 테이블 헤더 정의
  const headers1 = [
    { title: 'No', key: 'no', sortable: false, width: '5%' },
    { title: '문서명', key: 'name', sortable: false, width: '25%' },
    { title: '수정일자', key: 'modifiedDate', sortable: false, align: 'center', width: '15%' },
    { title: '보유 객관식', key: 'mcCount', sortable: false, align: 'center', width: '13%' },
    { title: '보유 주관식', key: 'sqCount', sortable: false, align: 'center', width: '13%' },
    { title: '세부', key: 'action', sortable: false, align: 'center', width: '10%' },
  ];
  
  
  // 문서 데이터 정의
  const revenues = ref([
    {
      name: '문서1',
      modifiedDate: '2023-01-15',
      mcCount: 20,
      sqCount: 10,
      mcSet: 0,
      sqSet: 0,
    },
    {
      name: '문서2',
      modifiedDate: '2023-02-20',
      mcCount: 20,
      sqCount: 10,
      mcSet: 0,
      sqSet: 0,
    },
    {
      name: '문서3',
      modifiedDate: '2023-03-10',
      mcCount: 20,
      sqCount: 10,
      mcSet: 0,
      sqSet: 0,
    },
    {
      name: '문서4',
      modifiedDate: '2023-04-01',
      mcCount: 0,
      mcSet: 0,
      sqSet: 0,
    },
    {
      name: '문서5',
      modifiedDate: '2023-05-05',
      mcCount: 0,
      mcSet: 0,
      sqSet: 0,
    },
    {
      name: '문서6',
      modifiedDate: '2023-06-25',
      mcCount: 15,
      sqCount: 5,
      mcSet: 0,
      sqSet: 0,
    }
  ]);
  
  
  
  
  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  const emit = defineEmits(['go-to-problem-list', 'go-to-problem-check', 'go-to-problem-generate']);

  function goToProblemList(item) {
    console.log('ProblemList로 이동:', item.name);
    emit('go-to-problem-list', item.name);
  }

  function goToProblemCheck() {
    console.log('문제 추가 생성 버튼 클릭');
    emit('go-to-problem-check');
  }

  function goToProblemGenerate() {
    console.log('ProblemGenerate로 이동');
    emit('go-to-problem-generate');
  }
  function nextStep() {
    emit('next-step');
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
  
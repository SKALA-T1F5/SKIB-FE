<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <h2 class="text-h5 font-weight-bold mr-2">훈련생 관리</h2>
  
            <p class="text-body-2 text-medium-emphasis">훈련생 목록을 확인합니다.</p>
          </div>
  
        </v-col>
      </v-row>
      <v-row>
        <!-- 훈련생 목록 섹션 -->
        <v-col cols="`12`">
          <v-card elevation="0" height="100%">
            <v-card-text>
              <v-data-table :headers="headers" :items="trainees" item-value="name" class="elevation-1" density="compact"
                hide-default-footer>
                <template v-slot:item.no="{ index }">
                  <div class="text-body-2 text-center">{{ index + 1 }}</div>
                </template>
                <template v-slot:item.name="{ item }">
                  <div class="text-body-2 font-weight-bold">{{ item.name }}</div>
                </template>
                <template v-slot:item.email="{ item }">
                  <div class="text-body-2 text-center">{{ item.email }}</div>
                </template>

                <template v-slot:item.action="{ item }">
                  <v-btn icon size="small" elevation="0" @click="goToTraineeDetail(item)">
                    <v-icon color="primary">mdi-arrow-right-circle</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>

      </v-row>

    </v-container>
  
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // 테이블 헤더 정의
  const headers = [
    { title: 'No', key: 'no', sortable: false, width: '5%' },
    { title: '이름', key: 'name', sortable: false, width: '25%' },
    { title: '이메일', key: 'email', sortable: false, align: 'center', width: '20%' },
    { title: '부서명', key: 'department', sortable: false, align: 'center', width: '20%' },
    { title: '응시시험수', key: 'takenExams', sortable: false, align: 'center', width: '15%' },
    { title: '합격', key: 'passedExams', sortable: false, align: 'center', width: '10%' },
    { title: '불합격', key: 'failedExams', sortable: false, align: 'center', width: '10%' },
    { title: '세부', key: 'action', sortable: false, align: 'center', width: '10%' },
  ];
  
  
  // 훈련생 데이터 정의 (더미 데이터)
  const trainees = ref([
    {
      name: '김철수',
      email: 'kim.cs@example.com',
      department: '개발팀',
      takenExams: 5,
      passedExams: 3,
      failedExams: 2,
    },
    {
      name: '이영희',
      email: 'lee.yh@example.com',
      department: '영업팀',
      takenExams: 7,
      passedExams: 6,
      failedExams: 1,
    },
    {
      name: '박민수',
      email: 'park.ms@example.com',
      department: '마케팅팀',
      takenExams: 3,
      passedExams: 1,
      failedExams: 2,
    },
    {
      name: '최유리',
      email: 'choi.yr@example.com',
      department: '인사팀',
      takenExams: 10,
      passedExams: 9,
      failedExams: 1,
    },
  ]);
  
  const emit = defineEmits(['go-to-trainee-detail']);

  function goToTraineeDetail(item) {
    console.log('TraineeDetail로 이동:', item.name);
    emit('go-to-trainee-detail', item.name);
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
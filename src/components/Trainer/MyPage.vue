<template>
  <v-container fluid class="my-page">
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-card class="profile-card">
          <v-card-title class="profile-card-title">
            <div class="text-h6">프로필 정보</div>
          </v-card-title>
          <v-card-text class="profile-card-text">
            <p><strong>이름:</strong> 홍길동</p>
            <p><strong>이메일:</strong> hong@example.com</p>
            <p><strong>역할:</strong> 트레이너</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="8">
        <v-card class="activity-card">
          <v-card-title class="activity-card-title">
            <div class="text-h6">최근 활동</div>
          </v-card-title>
          <v-card-text class="activity-card-text">
            <v-timeline dense>
              <v-timeline-item
                v-for="activity in activities"
                :key="activity.id"
                :color="activity.color"
                small
              >
                <template v-slot:opposite>
                  <span class="text-caption">{{ activity.time }}</span>
                </template>
                <div class="text-subtitle-2">{{ activity.title }}</div>
                <div class="text-caption">{{ activity.description }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const activities = ref([
  {
    id: 1,
    title: '새로운 문서 추가',
    description: '프로젝트 요구사항 문서가 추가되었습니다.',
    time: '10분 전',
    color: 'primary'
  },
  {
    id: 2,
    title: '테스트 완료',
    description: '단위 테스트 세트가 완료되었습니다.',
    time: '1시간 전',
    color: 'info'
  },
  {
    id: 3,
    title: '새로운 Trainee',
    description: '새로운 팀원이 프로젝트에 참여했습니다.',
    time: '2시간 전',
    color: 'success'
  }
]);
</script>

<style scoped>
.my-page {
  padding: 20px;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.profile-card-title {
  background-color: #e0e0e0;
  color: #424242;
  padding: 16px;
  font-weight: 600;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.profile-card-text {
  padding: 16px;
  color: #616161;
}

.activity-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.activity-card-title {
  background-color: #e0e0e0;
  color: #424242;
  padding: 16px;
  font-weight: 600;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.activity-card-text {
  padding: 16px;
  color: #616161;
}
</style>
  
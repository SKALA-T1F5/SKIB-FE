<template>
  <MainLayout>
    <template #content>
      <v-container fluid>
        <!-- 프로젝트명 상단 배치 -->
        <div class="project-detail-header">
          <h2>{{ projectName }}</h2>
        </div>
        <v-tabs v-model="activeTab" background-color="white" color="primary" grow>
          <v-tab v-for="(tab, idx) in tabLabels" :key="idx" :value="idx">
            {{ tab }}
          </v-tab>
        </v-tabs>
        <v-window v-model="activeTab" class="mt-4">
          <v-window-item :value="0">
            <div class="project-detail-content">
              <router-view v-if="activeTab === 0" />
            </div>
          </v-window-item>
          <v-window-item :value="1">
            <router-link :to="`/trainer/project/${projectId}/document`" />
            <div class="project-detail-content">
              <router-view v-if="activeTab === 1" />
            </div>
          </v-window-item>
          <v-window-item :value="2">
            <router-link :to="`/trainer/project/${projectId}/learner`" />
            <div class="project-detail-content">
              <router-view v-if="activeTab === 2" />
            </div>
          </v-window-item>
        </v-window>
      </v-container>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId
const projectName = ref('프로젝트명 불러오는 로직 필요')

const tabLabels = ['문서 관리', '테스트 관리', '훈련생 관리']
const tabRoutes = [
  `/trainer/project/${projectId}/document`,
  `/trainer/project/${projectId}/test`,
  `/trainer/project/${projectId}/learner`
]

const activeTab = ref(tabRoutes.findIndex(r => route.path.startsWith(r)))
if (activeTab.value === -1) activeTab.value = 0

watch(activeTab, (val) => {
  router.push(tabRoutes[val])
})

onMounted(() => {
  // 프로젝트명 불러오는 API 호출 등
})
</script>

<style scoped>
.project-detail-header {
  margin-bottom: 20px;
}
.project-detail-content {
  margin-top: 24px;
}

/* Vuetify 탭 선택 색상 커스텀 */
:deep(.v-tab--selected) {
  color: #191d5a !important;
}
:deep(.v-tabs .v-tab--selected) {
  border-bottom: 2px solid #191d5a !important;
}
</style>
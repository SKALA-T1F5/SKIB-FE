<template>
  <!-- 사이드 네비게이션 드로어 설정 -->
  <v-navigation-drawer
    app
    v-model="drawer"
    :mini-variant="mini"
    @update:mini-variant="mini = $event"
    :width="250"
    :mini-variant-width="60"
    class="sidebar-navigation"
  >
    <!-- 프로젝트 목록 -->
    <v-list nav dense class="mt-2">
      <v-subheader v-if="!mini" class="text-caption text-uppercase">Projects</v-subheader>
      <v-list-item-group>
        <v-list-item v-for="project in projects" :key="project.id" link class="mb-1" @click="goToProjectManagement(project.id)">
          <v-list-item-content v-if="!mini">
            <v-list-item-title>{{ project.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <!-- 하단 프로필 영역 -->
    <template v-slot:append>
      <div class="profile-container" :class="{ 'mini-profile': mini }">
        <div v-if="!mini" class="profile-info ml-2">
          <div class="profile-name">Nicola</div>
          <div class="profile-role text-caption">Mobile Web Design</div>
        </div>
        <v-spacer></v-spacer>
        <v-btn v-if="!mini" icon small>
        </v-btn>
      </div>
      <!-- 토글 버튼 -->
      <div class="toggle-container">
        <v-btn icon small @click="toggleDrawer" class="toggle-btn">
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 드로어 상태 및 미니 상태 설정
const drawer = ref(true)
const mini = ref(false)

// 프로젝트 목록
const projects = ref([
  { id: 1, name: 'Project A' },
  { id: 2, name: 'Project B' },
  { id: 3, name: 'Project C' }
])

// 드로어 토글 함수
function toggleDrawer() {
  mini.value = !mini.value
}

// 프로젝트 관리 페이지로 이동하는 함수
function goToProjectManagement(projectId) {
  router.push(`/project-management/${projectId}`)
}
</script>

<style scoped>
/* 사이드바 기본 스타일 */
.sidebar-navigation {
  background-color: #1a1f2c;
  color: #fff;
  border-right: none;
}

/* 리스트 스타일 */
.v-list {
  background-color: transparent;
  padding: 0 8px;
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 2px;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.v-subheader {
  color: #6c7a93;
  font-size: 0.75rem;
  height: 32px;
  padding: 0 16px;
}

.v-list-item-title {
  color: #e0e0e0;
  font-size: 0.875rem;
}

/* 프로필 영역 스타일 */
.profile-container {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #242a38;
  border-radius: 8px;
  margin: 8px;
}

.mini-profile {
  justify-content: center;
  padding: 12px 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
}

.profile-role {
  color: #9aa5b9;
  font-size: 0.75rem;
}

/* 토글 버튼 스타일 */
.toggle-container {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.toggle-btn {
  background-color: #2196f3;
  color: white;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  margin-right: 8px;
}

/* 구분선 스타일 */
.v-divider {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>

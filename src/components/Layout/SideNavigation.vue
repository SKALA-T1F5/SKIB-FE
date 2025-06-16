<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="sidebar-header">
      <span class="sidebar-title">Trainer</span>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <span v-if="collapsed" class="material-icons">chevron_right</span>
        <span v-else class="material-icons">chevron_left</span>
      </button>
    </div>
    <hr class="divider" />
    <ul v-if="!collapsed" class="project-list">
      <li
        v-for="(project, idx) in projects"
        :key="project"
        :class="{ active: idx === selected }"
        @click="goToProject(idx)"
      >
        {{ project }}
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const projects = ['Project A', 'Project B', 'Project C'] // 임시 데이터
const selected = ref(1)
const collapsed = ref(false)
const router = useRouter()
function goToProject(idx) {
  selected.value = idx
  router.push(`/trainer/project/${idx+1}`)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 230px;
  background: #eef2f6;
  /* border-right: 1px solid #e0e0e0; */
  transition: width 0.2s;
  z-index: 900;
  padding-top: 24px;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.sidebar.collapsed {
  width: 55px;
  align-items: flex-start;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 20px 10px;
}
.sidebar-title {
  font-weight: bold;
  font-size: 18px;
  color: #222;
  letter-spacing: 0.5px;
  padding-left: 10px;
}
.collapse-btn {
  background: #fff;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #888;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  max-width: 32px;
  max-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  transition: background 0.2s;
}
.collapse-btn:hover {
  background: #f0f0f0;
}
.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0 16px 12px 16px;
  height: 0;
}
.project-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.project-list li {
  padding: 10px 18px;
  cursor: pointer;
  color: #444;
  border-radius: 21px;
  margin: 0 8px;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.project-list li.active, .project-list li:hover {
  background: #191D5A;
  color: #fff;
}
.sidebar.collapsed .sidebar-title,
.sidebar.collapsed .divider,
.sidebar.collapsed .project-list {
  display: none !important;
}
.sidebar.collapsed .collapse-btn {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="sidebar-header">
      <span class="sidebar-title">Trainer</span>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <span v-if="collapsed">▶</span>
        <span v-else>◀</span>
      </button>
    </div>
    <ul class="project-list">
      <li
        v-for="(project, idx) in projects"
        :key="project"
        :class="{ active: idx === selected }"
        @click="select(idx)"
      >
        <span v-if="!collapsed">{{ project }}</span>
        <span v-else>{{ project[0] }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
const projects = ['project A', 'project B', 'project C']
const selected = ref(1)
const collapsed = ref(false)
function select(idx) { selected.value = idx }
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 60px; /* 헤더 높이만큼 */
  left: 0;
  bottom: 0;
  width: 180px;
  background: #f4f6fa;
  border-right: 1px solid #e0e0e0;
  transition: width 0.2s;
  z-index: 900;
  padding-top: 16px;
}
.sidebar.collapsed { width: 56px; }
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px 12px 16px;
}
.sidebar-title { font-weight: bold; font-size: 16px; }
.collapse-btn {
  background: none; border: none; cursor: pointer; font-size: 18px; color: #888;
}
.project-list { list-style: none; padding: 0; margin: 0; }
.project-list li {
  padding: 8px 16px;
  cursor: pointer;
  color: #444;
  border-radius: 6px;
  margin: 2px 8px;
  transition: background 0.15s;
}
.project-list li.active, .project-list li:hover {
  background: #191D5A;
  color: #fff;
}
.sidebar.collapsed .sidebar-title { display: none; }
.sidebar.collapsed .project-list li { text-align: center; padding: 8px 0; }
</style>
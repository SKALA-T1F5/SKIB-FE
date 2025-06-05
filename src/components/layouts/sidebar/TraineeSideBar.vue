<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 검색 영역 -->
      <div class="search-container">
        <svg-icon type="mdi" :path="mdiMagnify" class="search-icon" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="검색할 내용을 입력하세요..."
          class="search-input"
        />
        <svg-icon type="mdi" :path="mdiRefresh" class="refresh-icon" @click="resetFilters" />
      </div>

      <hr class="divider" />

      <!-- 응시 여부 -->
      <div class="filter-section">
        <div class="filter-title">응시 여부</div>
        <label><input type="checkbox" v-model="statusFilters.done" /> 응시 완료</label>
        <label><input type="checkbox" v-model="statusFilters.retry" /> 재응시</label>
        <label><input type="checkbox" v-model="statusFilters.not" /> 미응시</label>
      </div>

      <!-- 결과 -->
      <div class="filter-section">
        <div class="filter-title">결과</div>
        <label><input type="checkbox" v-model="resultFilters.pass" /> PASS</label>
        <label><input type="checkbox" v-model="resultFilters.fail" /> FAIL</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiMagnify, mdiRefresh } from '@mdi/js'

const searchQuery = ref('')
const statusFilters = ref({
  done: false,
  retry: false,
  not: false,
})

const resultFilters = ref({
  pass: false,
  fail: false,
})

const resetFilters = () => {
  searchQuery.value = ''
  statusFilters.value = { done: false, retry: false, not: false }
  resultFilters.value = { pass: false, fail: false }
}
</script>

<style scoped>
.sidebar {
  width: 180px;
  height: calc(100% - 60px);
  background-color: #1e2251;
  color: white;
  padding: 16px;
  border-top-right-radius: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 140px;
  min-height: calc(100vh - 60px);
}

.sidebar-content {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto;
  flex: 1;
  width: 100%;
  font-size: 13px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: #888;
  height: 18px;
}

.refresh-icon {
  position: absolute;
  right: 8px;
  color: #ccc;
  height: 18px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.refresh-icon:hover {
  transform: rotate(180deg);
  color: white;
}

.search-input {
  width: 100%;
  padding: 6px 28px 6px 28px;
  border-radius: 4px;
  border: none;
  outline: none;
  font-size: 13px;
}

.divider {
  border: 0;
  border-top: 1px solid #aaa;
  margin: 10px 0;
}

.filter-section {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-title {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}
</style>

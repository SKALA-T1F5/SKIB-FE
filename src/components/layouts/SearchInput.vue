<template>
  <div class="search-container">
    <SvgIcon type="mdi" :path="mdiMagnify" class="search-icon" />
    <input
      type="text"
      :value="searchQuery"
      @input="$emit('update:searchQuery', $event.target.value)"
      :placeholder="placeholderText"
      class="search-input"
    />
    <SvgIcon type="mdi" :path="mdiRefresh" class="refresh-icon" @click="$emit('reset-filters')" />
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiMagnify, mdiRefresh } from '@mdi/js'

defineProps({
  searchQuery: {
    type: String,
    default: '', // searchQuery의 기본값 설정
  },
  placeholderText: {
    type: String,
    default: '검색어를 입력하세요...', // placeholderText의 기본값 설정
  },
})

defineEmits(['update:searchQuery', 'reset-filters'])
</script>

<style scoped>
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%; /* 부모 슬롯에 꽉 차도록 */
  height: 32px; /* 고정 높이 */
  border-radius: 4px;
  background-color: #ffffff;
  box-sizing: border-box;
  max-width: 240px; /* 요청하신 가로 크기 제한 */
}

.search-icon {
  position: absolute;
  width: 16px;
  height: 16px;
  left: 8px;
  color: #888;
  z-index: 2;
}

.refresh-icon {
  position: absolute;
  width: 16px;
  height: 16px;
  right: 8px;
  color: #ccc;
  cursor: pointer;
  transition: transform 0.3s ease;
  z-index: 2;
}

.refresh-icon:hover {
  transform: rotate(180deg);
  color: rgb(153, 153, 153);
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 5px 30px 5px 30px;
  border: none;
  outline: none;
  font-size: 13px;
  background-color: transparent;
  box-sizing: border-box;
}
</style>

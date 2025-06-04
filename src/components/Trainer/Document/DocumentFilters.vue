<template>
  <v-row class="mb-4" align="center" justify="space-between">
    <!-- 검색 -->
    <v-col cols="12" md="4">
      <v-text-field
        :model-value="searchQuery"
        @update:model-value="updateSearchQuery"
        label="문서 검색"
        append-inner-icon="mdi-magnify"
        dense
        hide-details
        variant="outlined"
      />
    </v-col>

    <!-- 파일유형 필터 -->
    <v-col cols="12" md="3">
      <v-select
        :model-value="filterType"
        @update:model-value="updateFilterType"
        label="파일 유형"
        :items="fileTypes"
        dense
        hide-details
        variant="outlined"
      />
    </v-col>

    <!-- 보기모드 전환 -->
    <v-col cols="12" md="3">
      <v-btn-toggle
        :model-value="viewMode"
        @update:model-value="updateViewMode"
        density="compact"
        class="ml-auto"
      >
        <v-btn value="grid" icon><v-icon>mdi-view-grid</v-icon></v-btn>
        <v-btn value="list" icon><v-icon>mdi-format-list-bulleted</v-icon></v-btn>
      </v-btn-toggle>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  searchQuery: String,
  filterType: String,
  viewMode: String,
});

const emit = defineEmits(['update:searchQuery', 'update:filterType', 'update:viewMode']);

const fileTypes = [
  'PDF', 'DOC', 'DOCX', 'TXT', 'PNG', 'JPG'
];

const updateSearchQuery = (value) => {
  emit('update:searchQuery', value);
};

const updateFilterType = (value) => {
  emit('update:filterType', value);
};

const updateViewMode = (value) => {
  emit('update:viewMode', value);
};
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>
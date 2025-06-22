<template>
  <v-row class="filters-row" align="center" justify="space-between" no-gutters>
    <!-- 검색 -->
    <v-col cols="12" md="4">
      <v-text-field
        :model-value="searchQuery"
        @update:model-value="updateSearchQuery"
        label="문서 검색"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        hide-details
        variant="outlined"
        class="rounded-input"
      />
    </v-col>

    <!-- 파일유형 필터 -->
    <v-col cols="12" md="3">
      <v-select
        :model-value="filterType"
        @update:model-value="updateFilterType"
        label="파일 유형"
        :items="fileTypes"
        density="comfortable"
        hide-details
        variant="outlined"
        class="rounded-input"
        prepend-inner-icon="mdi-filter-variant"
        clearable
      />
    </v-col>

    <!-- 보기모드 전환 -->
    <v-col cols="12" md="3" class="d-flex justify-end">
      <v-btn-toggle
        :model-value="viewMode"
        @update:model-value="updateViewMode"
        density="comfortable"
        class="view-toggle"
        rounded
        color="primary"
      >
        <v-btn value="grid" icon :aria-label="'그리드 보기'">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
        <v-btn value="list" icon :aria-label="'리스트 보기'">
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-col>
  </v-row>
</template>

<script setup>
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
.filters-row {
  margin-bottom: 12px;
  gap: 8px;
}

.rounded-input :deep(.v-input__control) {
  border-radius: 8px !important;
}

.view-toggle {
  background: #f4f4f4;
  border-radius: 8px;
  box-shadow: none;
}
</style>
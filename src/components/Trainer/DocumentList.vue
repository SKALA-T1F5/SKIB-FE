<template>
  <v-row v-if="documents.length > 0" :class="viewMode === 'list' ? 'd-block' : ''">
    <v-col
      v-for="doc in documents"
      :key="doc.id"
      :cols="viewMode === 'grid' ? 12 : 12"
      :md="viewMode === 'grid' ? 6 : 12"
      :lg="viewMode === 'grid' ? 3 : 12"
    >
      <v-card class="h-100" @click="selectDocument(doc)" style="cursor: pointer;">
        <v-card-title class="text-truncate">{{ doc.originalName }}</v-card-title>
        <v-card-subtitle>{{ formatDate(doc.uploadDate) }} / {{ formatSize(doc.fileSize) }}</v-card-subtitle>
        <v-card-text>
          <v-chip variant="outlined" color="primary" size="small">{{ doc.fileType }}</v-chip>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <div v-else class="text-center py-8 text-grey">
    <div class="text-body-1">문서가 없습니다</div>
    <div class="text-caption">
      {{ noDocumentMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  documents: Array,
  viewMode: String,
  searchQuery: String,
  filterType: String,
});

const emit = defineEmits(['preview']);

const noDocumentMessage = computed(() => {
  return props.searchQuery || props.filterType
    ? '검색 조건에 맞는 문서를 찾을 수 없습니다.'
    : '첫 번째 문서를 업로드해보세요.';
});

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

function formatSize(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb > 1024
    ? (kb / 1024).toFixed(1) + ' MB'
    : kb.toFixed(0) + ' KB';
}

function selectDocument(doc) {
  emit('preview', doc);
}
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
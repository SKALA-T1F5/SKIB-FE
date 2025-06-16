<template>
  <v-row v-if="documents.length > 0">
    <v-col cols="12">
      <v-table>
        <thead>
          <tr>
            <th>파일 이름</th>
            <th>업로드 날짜</th>
            <th>파일 크기</th>
            <th>파일 유형</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" @click="selectDocument(doc)" style="cursor: pointer;">
            <td>{{ doc.originalName }}</td>
            <td>{{ formatDate(doc.uploadDate) }}</td>
            <td>{{ formatSize(doc.fileSize) }}</td>
            <td>{{ doc.fileType }}</td>
          </tr>
        </tbody>
      </v-table>
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
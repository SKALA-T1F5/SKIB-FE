<template>
  <v-row v-if="documents.length > 0">
    <v-col cols="12">
      <v-table class="doc-table">
        <thead>
          <tr>
            <th>
              <v-icon size="18" color="#191d5a" class="mr-1">mdi-file-document-outline</v-icon>
              파일 이름
            </th>
            <th>
              <v-icon size="18" color="#191d5a" class="mr-1">mdi-calendar</v-icon>
              업로드 날짜
            </th>
            <th>
              <v-icon size="18" color="#191d5a" class="mr-1">mdi-file-upload-outline</v-icon>
              파일 크기
            </th>
            <th>
              <v-icon size="18" color="#191d5a" class="mr-1">mdi-file-outline</v-icon>
              파일 유형
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="doc in documents"
            :key="doc.id"
            @click="selectDocument(doc)"
            class="doc-row"
          >
            <td class="text-truncate">
              <v-icon size="18" color="#888" class="mr-1">mdi-file</v-icon>
              {{ doc.originalName }}
            </td>
            <td>
              <v-icon size="16" color="#888" class="mr-1">mdi-calendar</v-icon>
              {{ formatDate(doc.uploadDate) }}
            </td>
            <td>
              <v-icon size="16" color="#888" class="mr-1">mdi-file-upload-outline</v-icon>
              {{ formatSize(doc.fileSize) }}
            </td>
            <td>
              <v-icon size="16" color="#888" class="mr-1">mdi-file-outline</v-icon>
              {{ doc.fileType }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>

  <div v-else class="text-center py-8 text-grey">
    <v-icon size="40" color="#bdbdbd" class="mb-2">mdi-folder-open</v-icon>
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
.doc-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  font-size: 15px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.doc-table th,
.doc-table td {
  padding: 12px 10px;
  vertical-align: middle;
}

.doc-table th {
  background: #f8f8f8;
  color: #191d5a;
  font-weight: bold;
  border-bottom: 1.5px solid #e0e0e0;
}

.doc-row {
  cursor: pointer;
  transition: background 0.15s;
}

.doc-row:hover {
  background: #f3f6fa;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
  display: inline-block;
  vertical-align: middle;
}
</style>
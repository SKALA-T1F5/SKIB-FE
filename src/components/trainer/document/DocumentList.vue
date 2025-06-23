<template>
  <v-row v-if="documents.length > 0">
    <v-col cols="12">
      <v-table class="doc-table">
        <thead>
          <tr>
            <th>
              <v-icon size="20" color="#191d5a" class="mr-2">mdi-file-document-outline</v-icon>
              파일 이름
            </th>
            <th>
              <v-icon size="20" color="#191d5a" class="mr-2">mdi-calendar</v-icon>
              업로드 날짜
            </th>
            <th>
              <v-icon size="20" color="#191d5a" class="mr-2">mdi-file-upload-outline</v-icon>
              파일 크기
            </th>
            <th>
              <v-icon size="20" color="#191d5a" class="mr-2">mdi-file-outline</v-icon>
              파일 유형
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" @click="selectDocument(doc)" class="doc-row">
            <td class="text-truncate">
              <v-icon size="20" color="#888" class="mr-2">
                {{ getFileIcon(doc.fileType) }}
              </v-icon>
              {{ doc.originalName }}
            </td>
            <td>
              <v-icon size="18" color="#888" class="mr-1">mdi-calendar-check-outline</v-icon>
              {{ formatDate(doc.uploadDate) }}
            </td>
            <td>
              <v-icon size="18" color="#888" class="mr-1">mdi-harddisk</v-icon>
              {{ formatSize(doc.fileSize) }}
            </td>
            <td>
              <v-icon size="18" color="#888" class="mr-1">mdi-file-find-outline</v-icon>
              {{ doc.fileType }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>

  <div v-else class="text-center py-8 text-grey">
    <v-icon size="60" color="#bdbdbd" class="mb-4">mdi-folder-open</v-icon>
    <div class="text-h6 mb-2">문서가 없습니다</div>
    <div class="text-body-1">
      {{ noDocumentMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  documents: Array,
  viewMode: String,
  searchQuery: String,
  filterType: String,
})

const emit = defineEmits(['preview'])

const noDocumentMessage = computed(() => {
  return props.searchQuery || props.filterType
    ? '검색 조건에 맞는 문서를 찾을 수 없습니다.'
    : '첫 번째 문서를 업로드해보세요.'
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR') // 한국 날짜 형식으로 변경
}

function formatSize(bytes) {
  if (bytes === 0) return '0 KB'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 파일 타입에 따른 아이콘 반환 함수 추가
function getFileIcon(fileType) {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return 'mdi-file-pdf-box'
    case 'doc':
    case 'docx':
      return 'mdi-file-word-box'
    case 'txt':
      return 'mdi-file-document-outline'
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'mdi-file-image'
    case 'xls':
    case 'xlsx':
      return 'mdi-file-excel-box'
    case 'ppt':
    case 'pptx':
      return 'mdi-file-powerpoint-box'
    default:
      return 'mdi-file-outline'
  }
}

function selectDocument(doc) {
  emit('preview', doc)
}
</script>

<style scoped>
.doc-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  font-size: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.doc-table th,
.doc-table td {
  padding: 12px 16px; /* 좌우 패딩 증가 */
  vertical-align: middle;
}

.doc-table th {
  background: #f8f8f8;
  color: #191d5a;
  font-weight: bold;
  border-bottom: 1.5px solid #e0e0e0;
  text-align: left; /* 헤더 텍스트 왼쪽 정렬 */
}

.doc-table td {
  color: #444; /* 본문 텍스트 색상 조정 */
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
  max-width: 380px; /* 파일 이름 길이에 따라 적절히 조절 */
  display: flex; /* 아이콘과 텍스트 정렬을 위해 flex 사용 */
  align-items: center;
}

/* 문서 없음 메시지 스타일 개선 */
.text-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px; /* 최소 높이 설정 */
}
</style>

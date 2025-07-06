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
            <th>
              <v-icon size="20" color="#191d5a" class="mr-2">mdi-information-outline</v-icon>
              상태
            </th>
            <th class="text-center">
              <v-icon size="20" color="#191d5a">mdi-trash-can-outline</v-icon>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" class="doc-row">
            <td class="text-truncate" @click="selectDocument(doc)">
              {{ doc.originalName }}
            </td>
            <td @click="selectDocument(doc)">
              {{ formatDate(doc.uploadDate) }}
            </td>
            <td @click="selectDocument(doc)">
              {{ formatSize(doc.fileSize) }}
            </td>
            <td @click="selectDocument(doc)">
              {{ doc.fileType }}
            </td>
            <td>
              <v-chip :color="getStatusColor(doc.status)" density="compact">
                {{ doc.status }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-icon
                size="20"
                color=""
                @click.stop="confirmDelete(doc.id)"
                class="delete-icon"
                >mdi-delete</v-icon
              >
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
  searchQuery: String,
})

const emit = defineEmits(['preview', 'delete-document'])

const noDocumentMessage = computed(() => {
  return props.searchQuery
    ? '검색 조건에 맞는 문서를 찾을 수 없습니다.'
    : '첫 번째 문서를 업로드해보세요.'
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR')
}

function formatSize(bytes) {
  if (bytes === 0) return '0 KB'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(fileType) {
  if (fileType.toLowerCase() === 'pdf') {
    return 'mdi-file-pdf-box'
  }
  return 'mdi-file-outline'
}

function getStatusColor(status) {
  switch (status) {
    case '최종 업로드 완료': // 최종 완료 상태는 별도로 강조
      return 'green-darken-2' // 'success'보다 더 진한 녹색으로 변경
    case '문서 전처리 대기 중':
      return 'grey'
    case '문서 전처리 시작':
    case '문서 파싱 중':
    case '문서 분석 중':
    case '문서 저장 중':
      return 'info'
    case '문서 요약 중':
      return 'warning'
    case '실패':
      return 'error'
    case '문서 상태 확인 중':
      return 'grey'
    default:
      return 'grey'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case '최종 업로드 완료': // 최종 완료 상태는 별도 아이콘 사용
      return 'mdi-check-all' // 이중 체크 아이콘으로 변경
    case '문서 전처리 대기 중':
      return 'mdi-clock-outline'
    case '문서 전처리 시작':
    case '문서 파싱 중':
    case '문서 분석 중':
    case '문서 저장 중':
      return 'mdi-cog-outline'
    case '문서 요약 중':
      return 'mdi-timer-sand'
    case '실패':
      return 'mdi-alert-circle'
    case '문서 상태 확인 중':
      return 'mdi-information-outline'
    default:
      return 'mdi-information-outline'
  }
}

function selectDocument(doc) {
  emit('preview', doc)
}

function confirmDelete(documentId) {
  emit('delete-document', documentId)
}
</script>

<style scoped>
.doc-table {
  width: 100%;
  border-collapse: collapse;
}

.doc-table th {
  font-size: 0.9rem;
  color: #191d5a;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
}

.doc-table th:first-child {
  border-top-left-radius: 8px;
}

.doc-table th:last-child {
  border-top-right-radius: 8px;
  text-align: center;
}

.doc-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.875rem;
  color: #555;
  cursor: pointer;
}

.doc-table tbody tr:hover {
  background-color: #f5f5f5;
}

.doc-table tbody tr:last-child td {
  border-bottom: none;
}

.text-truncate {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-icon {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.delete-icon:hover {
  opacity: 1;
}

.v-chip {
  height: 24px; /* 칩 높이 조정 */
  font-size: 0.75rem; /* 칩 폰트 크기 조정 */
}
</style>

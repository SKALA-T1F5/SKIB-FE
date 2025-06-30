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
            <th class="text-center">
              <v-icon size="20" color="#191d5a">mdi-trash-can-outline</v-icon>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" class="doc-row">
            <td class="text-truncate" @click="selectDocument(doc)">
              <v-icon size="20" color="#888" class="mr-2">
                {{ getFileIcon(doc.fileType) }}
              </v-icon>
              {{ doc.originalName }}
            </td>
            <td @click="selectDocument(doc)">
              <v-icon size="18" color="#888" class="mr-1">mdi-calendar-check-outline</v-icon>
              {{ formatDate(doc.uploadDate) }}
            </td>
            <td @click="selectDocument(doc)">
              <v-icon size="18" color="#888" class="mr-1">mdi-harddisk</v-icon>
              {{ formatSize(doc.fileSize) }}
            </td>
            <td @click="selectDocument(doc)">
              <v-icon size="18" color="#888" class="mr-1">mdi-file-find-outline</v-icon>
              {{ doc.fileType }}
            </td>
            <td class="text-center">
              <v-icon
                size="20"
                color="#e57373"
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

// 'preview'와 'delete-document' 이벤트를 정의합니다.
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

function selectDocument(doc) {
  emit('preview', doc)
}

// 삭제 확인 및 이벤트 발생 함수 추가
function confirmDelete(documentId) {
  emit('delete-document', documentId)
}
</script>

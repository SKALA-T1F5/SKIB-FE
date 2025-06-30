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
            <td>
              <v-chip :color="getStatusColor(doc.status)" density="compact">
                <v-icon start :icon="getStatusIcon(doc.status)"></v-icon>
                {{ doc.status }}
              </v-chip>
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
import { computed, onMounted, onBeforeUnmount } from 'vue' // onMounted, onBeforeUnmount 임포트
import SockJS from 'sockjs-client' // SockJS 임포트
import Stomp from 'stompjs' // Stomp 임포트

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

// WebSocket 관련 데이터 및 메서드 추가
let stompClient = null

const connectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    return
  }

  const socket = new SockJS('https://skib-backend.skala25a.project.skala-ai.com/ws')
  stompClient = Stomp.over(socket)
  stompClient.debug = null // 디버그 메시지 비활성화

  stompClient.connect(
    {},
    (frame) => {
      console.log('📡 DocumentList WebSocket 연결 성공:', frame)
      // Spring Boot가 보내는 /topic/summary 토픽 구독
      stompClient.subscribe('/topic/summary', handleSummaryNotification)
    },
    (error) => {
      console.error('❌ DocumentList WebSocket 연결 실패:', error)
      // 연결 실패 시 재연결 시도 (선택 사항)
      // setTimeout(() => connectWebSocket(), 5000);
    },
  )
}

const handleSummaryNotification = (message) => {
  try {
    const notification = JSON.parse(message.body)
    console.log('📥 DocumentList에서 수신된 문서 처리 알림:', notification)

    const targetDocumentId = notification.documentId
    const targetDocument = props.documents.find((doc) => doc.id === targetDocumentId)

    if (targetDocument) {
      // 알림 메시지에 따라 상태 업데이트
      if (notification.message.includes('업로드 완료')) {
        targetDocument.status = '업로드 완료'
      } else if (notification.message.includes('전처리 중')) {
        targetDocument.status = '전처리 중'
      } else if (notification.message.includes('요약 중')) {
        targetDocument.status = '요약 중'
      } else if (notification.message.includes('요약이 완료되었습니다.')) {
        targetDocument.status = '요약 완료'
      } else if (notification.message.includes('실패')) {
        targetDocument.status = '실패'
      }
      // console.log(`DocumentList: 문서 ID: ${targetDocumentId} 상태 업데이트: ${targetDocument.status}`)
    }
  } catch (e) {
    console.error('❌ DocumentList 문서 처리 알림 파싱 오류:', e)
  }
}

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
    case '업로드 완료':
    case '요약 완료':
      return 'success'
    case '업로드 중':
    case '전처리 중':
      return 'info'
    case '요약 중':
      return 'warning'
    case '실패':
      return 'error'
    default:
      return 'grey'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case '업로드 완료':
    case '요약 완료':
      return 'mdi-check-circle'
    case '업로드 중':
      return 'mdi-upload'
    case '전처리 중':
      return 'mdi-cog-outline'
    case '요약 중':
      return 'mdi-timer-sand'
    case '실패':
      return 'mdi-alert-circle'
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

// 컴포넌트 마운트 시 WebSocket 연결
onMounted(() => {
  connectWebSocket()
})

// 컴포넌트 언마운트 시 WebSocket 연결 해제
onBeforeUnmount(() => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('📡 DocumentList WebSocket 연결 해제됨.')
    })
  }
})
</script>

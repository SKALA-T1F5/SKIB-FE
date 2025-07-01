<template>
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">문서 관리</h2>
      <p class="section-subtitle">관리 중인 문서 목록을 확인하고 새로 업로드 합니다.</p>
    </div>

    <section class="upload-section section-bg">
      <h4 class="section-title">문서 업로드</h4>
      <DocumentUpload :projectId="projectId" @files-uploaded="fetchDocuments" />
    </section>

    <section class="list-section section-bg">
      <div class="list-header">
        <h4 class="section-title">문서 목록</h4>
      </div>
      <div class="filters-wrapper">
        <DocumentFilters v-model:search-query="searchQuery" />
      </div>
      <DocumentList
        :documents="filteredDocuments"
        view-mode="list"
        :search-query="searchQuery"
        @preview="preview"
        @delete-document="deleteDocument"
      />
      <div class="list-footer">
        <span class="total-count">총 {{ filteredDocuments.length }}개 문서</span>
      </div>
    </section>

    <DocumentPreviewDialog v-model="previewDialog" :selected-document="selectedDocument" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DocumentUpload from '@/components/trainer/document/DocumentUpload.vue'
import DocumentFilters from '@/components/trainer/document/DocumentFilters.vue'
import DocumentList from '@/components/trainer/document/DocumentList.vue'
import DocumentPreviewDialog from '@/components/trainer/document/DocumentPreviewDialog.vue'
import api from '@/config/axios'

const documents = ref([])
const searchQuery = ref('')

const previewDialog = ref(false)
const selectedDocument = ref(null)

const projectId = ref(1) // 예시: 실제 프로젝트 ID로 변경 필요

let statusUpdateInterval = null // 상태 업데이트 인터벌 ID

// Define functions early and consistently
const fetchDocuments = async () => {
  try {
    const response = await api.get(`/documents`, {
      params: {
        projectId: projectId.value,
      },
    })
    if (response.data.statusCode === 'OK') {
      documents.value = response.data.resultData.documents.map((doc) => ({
        id: doc.documentId,
        originalName: doc.name,
        fileType: doc.extension ? doc.extension.toUpperCase() : 'UNKNOWN',
        uploadDate: doc.createdAt ? doc.createdAt.split('T')[0] : '',
        fileSize: doc.fileSize,
        status: doc.status || '알 수 없음', // 초기 상태 설정
      }))
    } else {
      console.error('문서 목록 조회 실패:', response.data.resultMsg)
      documents.value = []
    }
  } catch (error) {
    console.error('문서 목록을 가져오는 중 오류 발생:', error)
    documents.value = []
  }
}

const fetchDocumentStatus = async (documentId) => {
  try {
    const response = await api.get(`/document/status`, {
      params: {
        documentId: documentId,
      },
    })
    if (response.data.statusCode === 'OK' && response.data.resultData) {
      const updatedStatus = response.data.resultData.status // API 응답에서 상태 값 추출
      // documents 배열에서 해당 문서 찾아 상태 업데이트
      const docIndex = documents.value.findIndex((doc) => doc.id === documentId)
      if (docIndex !== -1) {
        documents.value[docIndex].status = updatedStatus
      }
    } else {
      console.error(`문서 ID ${documentId}의 상태 조회 실패:`, response.data.resultMsg)
    }
  } catch (error) {
    console.error(`문서 ID ${documentId}의 상태를 가져오는 중 오류 발생:`, error)
  }
}

const startStatusUpdate = () => {
  // 기존 인터벌이 있으면 클리어
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
  }
  // 5초마다 모든 문서의 상태 업데이트
  statusUpdateInterval = setInterval(() => {
    documents.value.forEach((doc) => {
      // '요약 완료' 또는 '실패' 상태가 아닌 문서만 업데이트
      if (doc.status !== '요약 완료' && doc.status !== '실패') {
        fetchDocumentStatus(doc.id)
      }
    })
  }, 5000)
}

const deleteDocument = async (documentId) => {
  if (!confirm('정말로 이 문서를 삭제하시겠습니까?')) {
    return
  }
  try {
    const response = await api.delete(`/document/delete`, {
      params: {
        documentId: documentId,
      },
    })

    if (response.data.statusCode === 'OK') {
      alert('문서가 성공적으로 삭제되었습니다.')
      fetchDocuments() // 문서 목록 새로고침
    } else {
      console.error('문서 삭제 실패:', response.data.resultMsg)
      alert(`문서 삭제 실패: ${response.data.resultMsg}`)
    }
  } catch (error) {
    console.error('문서 삭제 중 오류 발생:', error)
    alert('문서 삭제 중 오류가 발생했습니다.')
  }
}

const preview = (doc) => {
  selectedDocument.value = doc
  previewDialog.value = true
}

// Lifecycle hooks
onMounted(() => {
  fetchDocuments()
  startStatusUpdate() // 컴포넌트 마운트 시 상태 업데이트 시작
})

onBeforeUnmount(() => {
  // 컴포넌트 언마운트 시 인터벌 정리
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
  }
})

const filteredDocuments = computed(() => {
  return documents.value.filter((doc) => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})
</script>

<style scoped>
/* 공통 컨테이너 스타일 */
.common-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 12px;
}

/* Common header styles (모든 관련 컴포넌트에 일관 적용) */
.header-section {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  margin-bottom: 24px;
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  color: #333;
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 0;
  white-space: nowrap;
  line-height: 1;
  padding-bottom: 2px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
}

.section-bg {
  background: #eef2f6;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px 24px 24px 24px;
  margin-bottom: 32px;
}

.upload-section {
  margin-bottom: 32px;
}

.list-section {
  padding: 24px;
}

.list-header {
  padding: 0;
}

.filters-wrapper {
  padding: 0;
}

.list-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 0 16px 0;
}

.total-count {
  color: #888;
  font-size: 0.95rem;
}
</style>

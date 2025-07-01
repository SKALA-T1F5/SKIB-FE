<template>
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">문서 관리</h2>
      <p class="section-subtitle">관리 중인 문서 목록을 확인하고 새로 업로드 합니다.</p>
    </div>

    <section class="upload-section section-bg">
      <h4 class="section-title">문서 업로드</h4>
      <DocumentUpload :projectId="projectId" @files-uploaded="handleFilesUploaded" />
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

const projectId = ref(1) // 기본값 설정. 로컬 스토리지에서 값을 불러올 예정.

// 각 문서의 상태 업데이트 인터벌을 관리하기 위한 맵
const documentStatusIntervals = ref(new Map())

// API 상태(enum) 값을 한글로 매핑하는 함수
const mapApiStatusToKorean = (status) => {
  switch (status) {
    case 'UPLOAD_COMPLETED':
      return '업로드 완료'
    case 'PREPROCESSING':
      return '전처리 중'
    case 'SUMMARIZING':
      return '요약 중'
    case 'SUMMARY_COMPLETED':
      return '요약 완료'
    case 'FAILED':
      return '실패'
    default:
      return '알 수 없음'
  }
}

// 문서 목록을 가져오는 함수. initialLoad는 초기 로드인지 여부를 구분합니다.
const fetchDocuments = async (initialLoad = true) => {
  try {
    const response = await api.get(`/documents`, {
      params: {
        projectId: projectId.value,
      },
    })
    if (response.data.statusCode === 'OK') {
      const fetchedDocs = response.data.resultData.documents.map((doc) => ({
        id: doc.documentId,
        originalName: doc.name,
        fileType: doc.extension ? doc.extension.toUpperCase() : 'UNKNOWN',
        uploadDate: doc.createdAt ? doc.createdAt.split('T')[0] : '',
        fileSize: doc.fileSize,
        status: mapApiStatusToKorean(doc.status),
      }))

      // 기존 문서 목록과 새로운 문서 목록을 비교하여 업데이트 및 상태 업데이트 시작
      fetchedDocs.forEach((fetchedDoc) => {
        const existingDocIndex = documents.value.findIndex((doc) => doc.id === fetchedDoc.id)

        if (existingDocIndex === -1) {
          // 새로 추가된 문서
          documents.value.push(fetchedDoc)
          // 새로 추가된 문서는 초기 로드이거나 업로드 후이거나 관계없이 상태 업데이트 시작
          if (fetchedDoc.status !== '요약 완료' && fetchedDoc.status !== '실패') {
            startStatusUpdateForDocument(fetchedDoc.id)
          }
        } else {
          // 기존 문서인 경우 상태만 업데이트
          documents.value[existingDocIndex].status = fetchedDoc.status
          // 기존 문서 중 상태가 완료되지 않은 경우에만 인터벌 시작/유지
          if (fetchedDoc.status === '요약 완료' || fetchedDoc.status === '실패') {
            stopStatusUpdateForDocument(fetchedDoc.id)
          } else {
            // 완료되지 않은 상태이고, 아직 인터벌이 시작되지 않았다면 시작
            if (!documentStatusIntervals.value.has(fetchedDoc.id)) {
              startStatusUpdateForDocument(fetchedDoc.id)
            }
          }
        }
      })

      // 서버에는 없지만 클라이언트 목록에는 남아있는 문서 제거 (삭제된 문서)
      documents.value = documents.value.filter((doc) =>
        fetchedDocs.some((fetchedDoc) => fetchedDoc.id === doc.id),
      )
    } else {
      console.error('문서 목록 조회 실패:', response.data.resultMsg)
      documents.value = []
    }
  } catch (error) {
    console.error('문서 목록을 가져오는 중 오류 발생:', error)
    documents.value = []
  }
}

// 특정 문서의 상태를 가져오는 함수
const fetchDocumentStatus = async (documentId) => {
  try {
    const response = await api.get(`/document/status`, {
      params: {
        documentId: documentId,
      },
    })
    if (response.data.statusCode === 'OK' && response.data.resultData) {
      const updatedStatus = mapApiStatusToKorean(response.data.resultData)

      const docIndex = documents.value.findIndex((doc) => doc.id === documentId)
      if (docIndex !== -1) {
        documents.value[docIndex].status = updatedStatus
        // 상태가 '요약 완료' 또는 '실패'이면 해당 문서의 인터벌 중지
        if (updatedStatus === '요약 완료' || updatedStatus === '실패') {
          stopStatusUpdateForDocument(documentId)
        }
      }
    } else {
      console.error(`문서 ID ${documentId}의 상태 조회 실패:`, response.data.resultMsg)
      // API 통신 실패 시에도 인터벌 중지
      stopStatusUpdateForDocument(documentId)
    }
  } catch (error) {
    console.error(`문서 ID ${documentId}의 상태를 가져오는 중 오류 발생:`, error)
    // 네트워크 오류 등 발생 시에도 인터벌 중지
    stopStatusUpdateForDocument(documentId)
  }
}

// 특정 문서에 대한 상태 업데이트를 시작하는 함수
const startStatusUpdateForDocument = (documentId) => {
  // 이미 인터벌이 실행 중이면 중복 실행 방지
  if (documentStatusIntervals.value.has(documentId)) {
    return
  }
  console.log(`문서 ID ${documentId} 상태 업데이트 시작.`)
  const intervalId = setInterval(() => {
    fetchDocumentStatus(documentId)
  }, 5000) // 5초 간격
  documentStatusIntervals.value.set(documentId, intervalId)
}

// 특정 문서에 대한 상태 업데이트를 중지하는 함수
const stopStatusUpdateForDocument = (documentId) => {
  if (documentStatusIntervals.value.has(documentId)) {
    console.log(`문서 ID ${documentId} 상태 업데이트 중지.`)
    clearInterval(documentStatusIntervals.value.get(documentId))
    documentStatusIntervals.value.delete(documentId)
  }
}

// 파일 업로드 완료 시 호출되는 핸들러
const handleFilesUploaded = () => {
  fetchDocuments(false) // 새로 업로드된 경우 (초기 로드가 아님)
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
      stopStatusUpdateForDocument(documentId) // 삭제된 문서의 상태 업데이트 중지
      // 목록에서 해당 문서 제거
      documents.value = documents.value.filter((doc) => doc.id !== documentId)
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
  // 로컬 스토리지에서 projectId 가져오기
  const storedProjectId = localStorage.getItem('projectId')
  if (storedProjectId) {
    projectId.value = parseInt(storedProjectId) // 문자열을 숫자로 변환
  } else {
    console.warn("로컬 스토리지에 'projectId'가 없습니다. 기본값 1을 사용합니다.")
  }

  fetchDocuments(true) // 컴포넌트 마운트 시 초기 로드로 간주하여 모든 문서 상태를 가져옴
})

onBeforeUnmount(() => {
  // 컴포넌트 언마운트 시 모든 인터벌 정리
  documentStatusIntervals.value.forEach((intervalId) => clearInterval(intervalId))
  documentStatusIntervals.value.clear()
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

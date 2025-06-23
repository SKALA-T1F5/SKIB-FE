<template>
  <div class="document-management-container">
    <div class="header-section">
      <h2 class="title">
        <span class="title-main">문서 관리</span>
        <span class="subtitle">관리 중인 문서 목록을 확인하고 새로 업로드 합니다.</span>
      </h2>
    </div>

    <section class="upload-section section-bg">
      <h4 class="section-title">문서 업로드</h4>
      <DocumentUpload @files-uploaded="fetchDocuments" />
    </section>

    <section class="list-section section-bg">
      <div class="list-header">
        <h4 class="section-title">문서 목록</h4>
      </div>
      <div class="filters-wrapper">
        <DocumentFilters
          v-model:search-query="searchQuery"
          v-model:filter-type="filterType"
          v-model:view-mode="viewMode"
        />
      </div>
      <DocumentList
        :documents="filteredDocuments"
        :view-mode="viewMode"
        :search-query="searchQuery"
        :filter-type="filterType"
        @preview="preview"
      />
      <div class="list-footer">
        <span class="total-count">총 {{ filteredDocuments.length }}개 문서</span>
      </div>
    </section>

    <DocumentPreviewDialog v-model="previewDialog" :selected-document="selectedDocument" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DocumentUpload from '@/components/trainer/document/DocumentUpload.vue'
import DocumentFilters from '@/components/trainer/document/DocumentFilters.vue'
import DocumentList from '@/components/trainer/document/DocumentList.vue'
import DocumentPreviewDialog from '@/components/trainer/document/DocumentPreviewDialog.vue'

// 문서 데이터 상태 관리
const documents = ref([])
const searchQuery = ref('')
const filterType = ref('')
const viewMode = ref('grid')

// 미리보기 다이얼로그 상태 관리
const previewDialog = ref(false)
const selectedDocument = ref(null)

// 문서 데이터 가져오는 함수 (실제 API 호출 로직으로 대체 필요)
const fetchDocuments = async () => {
  // 실제 API 연동 시 아래 예시 데이터 제거 및 API 호출로 대체
  documents.value = [
    {
      id: 1,
      originalName: 'Aiper Front 개발환경 가이드',
      fileType: 'PDF',
      uploadDate: '2023-12-01',
      fileSize: 124580,
    },
    {
      id: 2,
      originalName: 'alopex_UI_1.1.2_개발가이드',
      fileType: 'PDF',
      uploadDate: '2023-11-21',
      fileSize: 208470,
    },
    {
      id: 3,
      originalName: '개발 Process 흐름도_sample',
      fileType: 'PDF',
      uploadDate: '2025-05-30',
      fileSize: 45200,
    },
  ]
}

onMounted(() => {
  fetchDocuments()
})

const filteredDocuments = computed(() => {
  return documents.value.filter((doc) => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !filterType.value || doc.fileType === filterType.value
    return matchesSearch && matchesType
  })
})

function preview(doc) {
  selectedDocument.value = doc
  previewDialog.value = true
}
</script>

<style scoped>
.document-management-container {
  max-width: 1150px;
  margin: 0 auto;
  padding: 0 12px 32px 12px;
}

.header-section {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-end;
}

.title {
  font-size: 28px;
  font-weight: bold;
  display: flex;
  align-items: flex-end; /* 하단 정렬 */
  gap: 18px;
  margin: 0;
}

.title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 18px;
  white-space: nowrap;
  line-height: 1;
  padding-bottom: 2px; /* 미세하게 맞추고 싶으면 조정 */
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

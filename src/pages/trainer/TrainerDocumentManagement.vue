<template>
  <div class="common-container">
    <div class="header-section">
      <h2 class="section-title-main">문서 관리</h2>
      <p class="section-subtitle">관리 중인 문서 목록을 확인하고 새로 업로드 합니다.</p>
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

const documents = ref([])
const searchQuery = ref('')
const filterType = ref('')
const viewMode = ref('grid')

const previewDialog = ref(false)
const selectedDocument = ref(null)

const fetchDocuments = async () => {
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
/* 공통 컨테이너 스타일 */
.common-container {
  max-width: 100%; /* 모든 주요 콘텐츠 컨테이너의 최대 너비 */
  margin: 0 auto; /* 가운데 정렬 */
  padding: 24px 12px; /* 좌우 12px 패딩, 상하 24px 패딩 */
}

/* Common header styles (모든 관련 컴포넌트에 일관 적용) */
.header-section {
  display: flex;
  align-items: flex-end; /* 제목과 부제목의 하단 정렬 */
  gap: 18px; /* 제목과 부제목 사이 간격 */
  margin-bottom: 24px; /* 섹션 하단 여백 */
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1; /* 높이를 정확히 맞춤 */
  margin: 0;
  color: #333; /* 기본 색상 유지 */
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 0; /* gap으로 간격 제어 */
  white-space: nowrap;
  line-height: 1; /* 높이를 정확히 맞춤 */
  padding-bottom: 2px; /* 미세 조정 */
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

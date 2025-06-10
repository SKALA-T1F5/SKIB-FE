<template>
  <v-container>
  <v-container style="max-width: 1150px !important;">

    <v-row>
      <v-col cols="12">
        <div class="d-flex align-end mb-8">
          <h2 class="text-h5 font-weight-bold mr-2">문서 관리</h2>
          <p class="text-body-2 text-medium-emphasis">관리 중인 문서 목록을 확인하고 새로 업로드 합니다.</p>
        </div>
      </v-col>
    </v-row>

        <!-- 문서 업로드 카드 -->
        <v-card elevation="0" class="pa-0 ma-0">
          <v-card-text class="pa-0 ma-0">
            <!-- 문서 업로드 영역 -->
            <DocumentUpload @files-uploaded="fetchDocuments" />
          </v-card-text>
        </v-card>
        <br>

        <!-- 문서 목록 카드 -->
        <v-card elevation="0">
          <v-card-text class="pa-6 pb-0">
            <h4 class="text-h8 mt-1">문서 업로드</h4>
          </v-card-text>  
          <v-card-text>
            <!-- 필터 & 뷰 전환 영역 -->
            <!-- <DocumentFilters v-model:search-query="searchQuery" v-model:filter-type="filterType"
              v-model:view-mode="viewMode" /> -->

            <!-- 문서 리스트 -->
            <DocumentList :documents="filteredDocuments" :view-mode="viewMode" :search-query="searchQuery"
              :filter-type="filterType" @preview="preview" />
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="justify-end">
            <span class="text-caption text-grey mr-4">총 {{ filteredDocuments.length }}개 문서</span>
          </v-card-actions>
        </v-card>

        <!-- 미리보기 다이얼로그 -->
        <DocumentPreviewDialog v-model="previewDialog" :selected-document="selectedDocument" />
  </v-container>
</v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DocumentUpload from './Document/DocumentUpload.vue';
import DocumentFilters from './Document/DocumentFilters.vue';
import DocumentList from './Document/DocumentList.vue';
import DocumentPreviewDialog from './Document/DocumentPreviewDialog.vue';
import TabNavigation from '../Layout/TabNavigation.vue';
import ExamManagement from './ExamManagement.vue';

// 문서 데이터 상태 관리
const documents = ref([]);
const searchQuery = ref('');
const filterType = ref('');
const viewMode = ref('grid');

// 미리보기 다이얼로그 상태 관리
const previewDialog = ref(false);
const selectedDocument = ref(null);

// 문서 데이터 가져오는 함수 (실제 API 호출 로직으로 대체 필요)
const fetchDocuments = async () => {
  // 실제 API 호출 (프로젝트의 apiRequest 함수 또는 axios 등 사용)
  // try {
  //   const response = await apiRequest('GET', '/api/documents');
  //   documents.value = response.data;
  // } catch (error) {
  //   console.error('문서 목록 가져오기 실패:', error);
  //   // 실패 토스트 등 처리
  // }

  // 예시 데이터 (실제 API 연동 시 제거)
  documents.value = [
    { id: 1, originalName: '계약서_2023.pdf', fileType: 'PDF', uploadDate: '2023-12-01', fileSize: 124580 },
    { id: 2, originalName: '디자인시안.png', fileType: 'PNG', uploadDate: '2023-11-21', fileSize: 208470 },
    { id: 3, originalName: '제안서.docx', fileType: 'DOCX', uploadDate: '2023-11-15', fileSize: 45200 },
    { id: 4, originalName: '회의록_1차.txt', fileType: 'TXT', uploadDate: '2023-12-05', fileSize: 1500 },
    { id: 5, originalName: '프로젝트_계획.xlsx', fileType: 'XLSX', uploadDate: '2023-11-28', fileSize: 300000 },
  ];
};

// 컴포넌트 마운트 시 문서 데이터 로드
onMounted(() => {
  fetchDocuments();
});

// 필터링된 문서 목록 계산
const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = !filterType.value || doc.fileType === filterType.value;
    return matchesSearch && matchesType;
  });
});

// 미리보기 함수
function preview(doc) {
  selectedDocument.value = doc;
  previewDialog.value = true;
}

</script>

<style lang="scss" scoped>

.force-white {
  color: white !important;
}

.table-like-content {
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.table-like-content .v-list-item {
  border-bottom: 1px solid #eeeeee;
}

.table-like-content .v-list-item:last-child {
  border-bottom: none;
}

.table-like-content .v-list-item>div {
  padding: 8px 0;
}

.table-like-content .v-list-item h6 {
  font-size: 0.875rem;
}

.table-like-content .v-text-field {
  font-size: 0.875rem;
}
</style>

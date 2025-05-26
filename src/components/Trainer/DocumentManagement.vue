<template>
  <v-container>
    <v-card>
      <v-card-title>
        <div class="text-h6">문서 관리</div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- 필터 & 뷰 전환 영역 -->
        <v-row class="mb-4" align="center" justify="space-between">
          <!-- 검색 -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="문서 검색"
              append-inner-icon="mdi-magnify"
              dense
              hide-details
              variant="outlined"
            />
          </v-col>

          <!-- 파일유형 필터 -->
          <v-col cols="12" md="3">
            <v-select
              v-model="filterType"
              label="파일 유형"
              :items="fileTypes"
              dense
              hide-details
              variant="outlined"
            />
          </v-col>

          <!-- 보기모드 전환 -->
          <v-col cols="12" md="3">
            <v-btn-toggle
              v-model="viewMode"
              density="compact"
              class="ml-auto"
            >
              <v-btn value="grid" icon><v-icon>mdi-view-grid</v-icon></v-btn>
              <v-btn value="list" icon><v-icon>mdi-format-list-bulleted</v-icon></v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <!-- 문서 리스트 -->
        <v-row v-if="filteredDocuments.length > 0" :class="viewMode === 'list' ? 'd-block' : ''">
          <v-col
            v-for="doc in filteredDocuments"
            :key="doc.id"
            :cols="viewMode === 'grid' ? 12 : 12"
            :md="viewMode === 'grid' ? 6 : 12"
            :lg="viewMode === 'grid' ? 3 : 12"
          >
            <v-card class="h-100" @click="preview(doc)" style="cursor: pointer;">
              <v-card-title class="text-truncate">{{ doc.originalName }}</v-card-title>
              <v-card-subtitle>{{ formatDate(doc.uploadDate) }} / {{ formatSize(doc.fileSize) }}</v-card-subtitle>
              <v-card-text>
                <v-chip variant="outlined" color="primary" size="small">{{ doc.fileType }}</v-chip>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <div v-else class="text-center py-8 text-grey">
          <div class="text-body-1">문서가 없습니다</div>
          <div class="text-caption">
            {{ searchQuery || filterType
              ? '검색 조건에 맞는 문서를 찾을 수 없습니다.'
              : '첫 번째 문서를 업로드해보세요.' }}
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="justify-end">
        <span class="text-caption text-grey mr-4">총 {{ filteredDocuments.length }}개 문서</span>
      </v-card-actions>
    </v-card>

    <!-- 미리보기 다이얼로그 -->
    <v-dialog v-model="previewDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ selectedDocument?.originalName }}
          <v-spacer></v-spacer>
          <v-btn icon @click="previewDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <p><strong>파일 유형:</strong> {{ selectedDocument?.fileType }}</p>
          <p><strong>업로드일:</strong> {{ formatDate(selectedDocument?.uploadDate) }}</p>
          <p><strong>파일 크기:</strong> {{ formatSize(selectedDocument?.fileSize) }}</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const documents = ref([
  { id: 1, originalName: '계약서_2023.pdf', fileType: 'PDF', uploadDate: '2023-12-01', fileSize: 124580 },
  { id: 2, originalName: '디자인시안.png', fileType: 'PNG', uploadDate: '2023-11-21', fileSize: 208470 },
  { id: 3, originalName: '제안서.docx', fileType: 'DOCX', uploadDate: '2023-11-15', fileSize: 45200 },
])

const searchQuery = ref('')
const filterType = ref('')
const viewMode = ref('grid')

const fileTypes = [
  'PDF', 'DOC', 'DOCX', 'TXT', 'PNG', 'JPG'
]

const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !filterType.value || doc.fileType === filterType.value
    return matchesSearch && matchesType
  })
})

const previewDialog = ref(false)
const selectedDocument = ref(null)

function preview(doc) {
  selectedDocument.value = doc
  previewDialog.value = true
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

function formatSize(bytes) {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  return kb > 1024
    ? (kb / 1024).toFixed(1) + ' MB'
    : kb.toFixed(0) + ' KB'
}
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


</style>

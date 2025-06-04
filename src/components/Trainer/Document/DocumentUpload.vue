<template>
  <v-card class="mb-8" flat outlined>
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h2 class="text-xl font-weight-semibold text-grey-darken-3">문서 업로드</h2>
        <v-btn
          class="primary"
          @click="triggerFileInput"
          :disabled="isUploading"
        >
          <v-icon left>mdi-plus</v-icon>
          파일 선택
        </v-btn>
        <input
          type="file"
          ref="fileInputRef"
          multiple
          :accept="allowedFileTypes.join(',')"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>

      <div
        class="drop-zone text-center transition-colors"
        :class="{ 'drop-zone-active': isDragActive }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div class="d-flex flex-column align-center space-y-4">
          <div class="upload-icon-wrapper rounded-circle d-flex align-center justify-center">
            <v-icon color="white" size="large">mdi-cloud-upload</v-icon>
          </div>
          <div>
            <p class="text-body-1 font-weight-medium text-grey-darken-3">
              파일을 여기로 드래그하거나 클릭하여 업로드
            </p>
            <p class="text-caption text-grey mt-2">
              PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG 파일을 지원합니다 (최대 50MB)
            </p>
          </div>
        </div>
      </div>

      <v-progress-linear
        v-if="isUploading"
        :model-value="uploadProgress"
        color="primary"
        height="10"
        rounded
        class="mt-6"
      >
        <template v-slot:default="{ value }">
          <strong>{{ Math.round(value) }}%</strong>
        </template>
      </v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

// useToast는 프로젝트에 맞게 구현 또는 Vuetify 스낵바/토스트 사용
// apiRequest는 프로젝트의 API 호출 함수 사용
// useQueryClient, useMutation은 @tanstack/vue-query 또는 유사 라이브러리 사용 또는 직접 구현

const emit = defineEmits(['files-uploaded']);

const uploadProgress = ref(0);
const isUploading = ref(false);
const isDragActive = ref(false);
const fileInputRef = ref(null);

const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
];
const maxFileSize = 50 * 1024 * 1024; // 50MB

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFiles = (files) => {
  if (files.length === 0) return;

  const validFiles = Array.from(files).filter(file => {
    const isValidType = allowedFileTypes.includes(file.type);
    const isValidSize = file.size <= maxFileSize;
    if (!isValidType) {
      console.error(`지원하지 않는 파일 형식입니다: ${file.name}`);
      // toast({ title: "업로드 실패", description: `지원하지 않는 파일 형식입니다: ${file.name}`, variant: "destructive" });
    }
    if (!isValidSize) {
       console.error(`파일 크기가 너무 큽니다: ${file.name}`);
      // toast({ title: "업로드 실패", description: `파일 크기가 너무 큽니다: ${file.name}`, variant: "destructive" });
    }
    return isValidType && isValidSize;
  });

  if (validFiles.length > 0) {
    uploadFiles(validFiles);
  }
};

const handleFileSelect = (event) => {
  handleFiles(event.target.files);
  event.target.value = '';
};

const handleDragOver = () => {
  isDragActive.value = true;
};

const handleDragLeave = () => {
  isDragActive.value = false;
};

const handleDrop = (event) => {
  isDragActive.value = false;
  handleFiles(event.dataTransfer.files);
};

const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  isUploading.value = true;
  uploadProgress.value = 0;

  const progressInterval = setInterval(() => {
    uploadProgress.value = Math.min(uploadProgress.value + Math.random() * 15, 90);
  }, 200);

  try {
    // 실제 API 호출 (프로젝트의 apiRequest 함수 또는 axios 등 사용)
    // const response = await apiRequest('POST', '/api/documents/upload', formData);
    // 예시 응답
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    const responseData = { message: `${files.length}개 파일 업로드 성공` }; // Simulate success response

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    console.log('업로드 완료:', responseData.message);
    // toast({ title: "업로드 완료", description: responseData.message });

    // 업로드 완료 후 상위 컴포넌트에 알림
    emit('files-uploaded');

    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
    }, 500);

  } catch (error) {
    clearInterval(progressInterval);
    isUploading.value = false;
    uploadProgress.value = 0;

    console.error('업로드 실패:', error);
    // toast({ title: "업로드 실패", description: error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.", variant: "destructive" });
  }
};

</script>

<style scoped>
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #464646; /* primary color 예시 */
}

.drop-zone-active {
  border-color: #ff9800; /* primary color 예시 */
  background-color: #fff3e0; /* orange-50 예시 */
}

.upload-icon-wrapper {
  width: 64px;
  height: 64px;
  background-color: #525252; /* orange-100 예시 */
}
</style>
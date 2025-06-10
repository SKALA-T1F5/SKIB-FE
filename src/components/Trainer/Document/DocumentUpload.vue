<template>
  <v-card elevation="0" height="250px">
    <v-card-text class="pa-6">
      <h4 class="text-h8 mt-1">문서 업로드</h4>
      <div class="d-flex align-center justify-space-between mb-6">
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
        @click="triggerFileInput"
      >
        <div class="d-flex flex-column align-center space-y-4">
            <v-icon color="primary" size="large">mdi-cloud-upload</v-icon>
            <p class="text-caption text-grey mt-2">
              파일을 여기로 드래그하거나 클릭하여 업로드 (최대 50MB PDF)
            </p>
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
      </v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
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
  border-color: #a7a7c9; /* primary color 예시 */
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
<template>
  <v-card elevation="0" class="upload-card">
    <v-card-text class="pa-0">
      <div class="upload-box-outer">
        <div
          class="drop-zone text-center transition-colors"
          :class="{ 'drop-zone-active': isDragActive }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            type="file"
            ref="fileInputRef"
            multiple
            :accept="allowedFileTypes.join(',')"
            @change="handleFileSelect"
            style="display: none"
          />
          <div class="d-flex flex-column align-center space-y-4">
            <!-- 아이콘 추가 (SVG 사용, mdi 미사용) -->
            <span class="upload-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="24" fill="#e0e0e0"/>
                <path d="M24 33V15M24 15L17 22M24 15L31 22" stroke="#191d5a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <p class="text-caption text-grey mt-2">
              파일을 여기로 드래그하거나 클릭하여 업로드 (최대 50MB PDF)
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
    }
    if (!isValidSize) {
      console.error(`파일 크기가 너무 큽니다: ${file.name}`);
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
  }
};
</script>

<style scoped>
.upload-card {
  width: 100%;
  background: transparent;
}

.v-card-text.pa-0 {
  padding: 0 !important;
}

.upload-box-outer {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.drop-zone:hover {
  border-color: #a7a7c9;
}

.drop-zone-active {
  border-color: #ff9800;
  background-color: #fff3e0;
}

.upload-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}
</style>
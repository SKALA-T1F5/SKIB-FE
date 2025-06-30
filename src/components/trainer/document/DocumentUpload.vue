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
            <v-icon size="48" color="#191d5a" class="mb-2">mdi-cloud-upload-outline</v-icon>
            <p class="text-body-2 text-grey-darken-1 mt-2">
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
        class="mt-4"
      >
      </v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/config/axios' // axios 추가

const emit = defineEmits(['files-uploaded'])

const props = defineProps({
  // projectId props 추가
  projectId: {
    type: Number,
    required: true,
  },
})

const uploadProgress = ref(0)
const isUploading = ref(false)
const isDragActive = ref(false)
const fileInputRef = ref(null)

// PDF만 허용하도록 변경
const allowedFileTypes = ['application/pdf']
const maxFileSize = 50 * 1024 * 1024 // 50MB

const triggerFileInput = () => {
  fileInputRef.value.click()
}

const handleFiles = (files) => {
  if (files.length === 0) return

  const validFiles = Array.from(files).filter((file) => {
    const isValidType = allowedFileTypes.includes(file.type)
    const isValidSize = file.size <= maxFileSize
    if (!isValidType) {
      console.error(`지원하지 않는 파일 형식입니다: ${file.name}`)
    }
    if (!isValidSize) {
      console.error(`파일 크기가 너무 큽니다: ${file.name}`)
    }
    return isValidType && isValidSize
  })

  if (validFiles.length > 0) {
    uploadFiles(validFiles)
  }
}

const handleFileSelect = (event) => {
  handleFiles(event.target.files)
  event.target.value = ''
}

const handleDragOver = () => {
  isDragActive.value = true
}

const handleDragLeave = () => {
  isDragActive.value = false
}

const handleDrop = (event) => {
  isDragActive.value = false
  handleFiles(event.dataTransfer.files)
}

const uploadFiles = async (files) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('file', file) // Spring Boot의 @RequestParam("file")과 매칭
  })

  isUploading.value = true
  uploadProgress.value = 0

  const progressInterval = setInterval(() => {
    uploadProgress.value = Math.min(uploadProgress.value + Math.random() * 15, 90)
  }, 200)

  try {
    const response = await axios.post(`/document`, formData, {
      params: {
        projectId: props.projectId, // props로 받은 projectId 사용
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        // 실제 업로드 진행률 업데이트 (선택 사항)
        if (progressEvent.lengthComputable) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      },
    })

    if (response.data.statusCode === 'OK') {
      clearInterval(progressInterval)
      uploadProgress.value = 100

      console.log('업로드 완료:', response.data.resultMsg)

      emit('files-uploaded')

      setTimeout(() => {
        isUploading.value = false
        uploadProgress.value = 0
      }, 500)
    } else {
      clearInterval(progressInterval)
      isUploading.value = false
      uploadProgress.value = 0
      console.error('파일 업로드 실패:', response.data.resultMsg)
    }
  } catch (error) {
    clearInterval(progressInterval)
    isUploading.value = false
    uploadProgress.value = 0
    console.error('업로드 실패:', error)
  }
}
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

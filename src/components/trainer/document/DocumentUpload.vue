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
      <div v-if="uploadStatus" class="upload-status-message mt-4">
        <v-icon :color="statusIconColor" class="mr-2">{{ statusIcon }}</v-icon>
        <span :class="statusTextColor">{{ uploadStatus }}</span>
      </div>
      <div v-if="uploadError" class="text-center mt-2 text-error">
        ❌ 업로드 실패: {{ uploadError }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from '@/config/axios' // axios 추가

const emit = defineEmits(['files-uploaded'])

const props = defineProps({
  projectId: {
    type: Number,
    required: true,
  },
})

const uploadStatus = ref(null) // 업로드 상태 메시지 (예: "업로드 중...", "업로드 완료!")
const uploadError = ref(null) // 업로드 오류 메시지
const isDragActive = ref(false)
const fileInputRef = ref(null)

const allowedFileTypes = ['application/pdf']
const maxFileSize = 50 * 1024 * 1024 // 50MB

// 상태 메시지에 따라 아이콘과 색상 변경
const statusIcon = computed(() => {
  if (uploadStatus.value && uploadStatus.value.includes('완료')) {
    return 'mdi-check-circle'
  } else if (uploadStatus.value && uploadStatus.value.includes('업로드 중')) {
    return 'mdi-upload'
  } else if (uploadStatus.value && uploadStatus.value.includes('전처리 대기 중')) {
    return 'mdi-cog-outline'
  }
  return 'mdi-information-outline' // 기본 아이콘
})

const statusIconColor = computed(() => {
  if (uploadStatus.value && uploadStatus.value.includes('완료')) {
    return 'success'
  } else if (uploadStatus.value && uploadStatus.value.includes('업로드 중')) {
    return 'info'
  } else if (uploadStatus.value && uploadStatus.value.includes('전처리 대기 중')) {
    return 'warning'
  }
  return 'grey'
})

const statusTextColor = computed(() => {
  if (uploadStatus.value && uploadStatus.value.includes('완료')) {
    return 'text-success'
  } else if (uploadStatus.value && uploadStatus.value.includes('업로드 중')) {
    return 'text-info'
  } else if (uploadStatus.value && uploadStatus.value.includes('전처리 대기 중')) {
    return 'text-warning'
  }
  return 'text-grey-darken-1'
})

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
      uploadError.value = `${file.name}: 지원하지 않는 파일 형식입니다.`
    }
    if (!isValidSize) {
      console.error(`파일 크기가 너무 큽니다: ${file.name}`)
      uploadError.value = `${file.name}: 파일 크기가 너무 큽니다 (최대 50MB).`
    }
    return isValidType && isValidSize
  })

  if (validFiles.length > 0) {
    uploadFiles(validFiles)
    uploadError.value = null // 새 업로드 시작 시 오류 메시지 초기화
  } else if (files.length > 0) {
    uploadStatus.value = null // 유효하지 않은 파일만 있을 경우 상태 초기화
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
    formData.append('file', file)
  })

  uploadStatus.value = '📤 업로드 중...'
  uploadError.value = null

  try {
    const response = await axios.post(`/document`, formData, {
      params: {
        projectId: props.projectId,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // onUploadProgress 제거 (Progress Bar가 필요 없으므로)
    })

    if (response.data.statusCode === 'OK') {
      uploadStatus.value = '✅ 업로드 완료! (서버 전처리 대기 중...)'
      console.log('업로드 완료:', response.data.resultMsg)
      emit('files-uploaded') // 문서 목록 새로고침을 위해 이벤트 발생

      setTimeout(() => {
        uploadStatus.value = null // 일정 시간 후 메시지 사라지게
      }, 5000) // 5초 후 메시지 사라짐
    } else {
      uploadStatus.value = null
      uploadError.value = response.data.resultMsg || '알 수 없는 업로드 실패'
      console.error('파일 업로드 실패:', response.data.resultMsg)
    }
  } catch (error) {
    uploadStatus.value = null
    uploadError.value = error.response?.data?.resultMsg || error.message || '네트워크 오류 발생'
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

.upload-status-message {
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.text-success {
  color: #4caf50;
}
.text-info {
  color: #2196f3;
}
.text-warning {
  color: #ffc107;
}
.text-error {
  color: #f44336;
}
</style>

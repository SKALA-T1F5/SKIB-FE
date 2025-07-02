<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>테스트 추가</h3>
          <button class="close-button" @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <p class="body-description">테스트 초대 링크를 입력하세요.</p>
          <input
            type="text"
            v-model="linkInput"
            placeholder="초대 링크를 입력하세요."
            class="invitation-input"
            :class="{ 'input-error': invitationLinkError }"
          />
          <p v-if="invitationLinkError" class="error-message">
            <span class="error-icon"></span> {{ invitationLinkError }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-button primary" @click="handleAddTest">응시</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/config/axios' // axios 인스턴스 임포트 (기존 코드에 있다고 가정)

const props = defineProps({
  isVisible: Boolean,
  invitationLinkError: String, // 에러 메시지를 표시하기 위해 부모로부터 받음
})

const emit = defineEmits(['close', 'addTest']) // 'addTest' 이벤트를 통해 부모에게 유효성 검사 결과 전달

const linkInput = ref('')
const router = useRouter()

// 모달이 열릴 때마다 링크 입력값 초기화
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      linkInput.value = ''
    }
  },
)

// 링크에서 testId와 linkToken을 추출하는 함수 (백엔드 요청에는 필요 없지만, 이동 시 필요)
const extractTestParams = (url) => {
  const regex = /\/trainee\/test\/([^/]+)\/([^/]+)$/
  const match = url.match(regex)
  if (match && match.length === 3) {
    return {
      testId: match[1],
      linkToken: match[2],
    }
  }
  return null
}

const handleAddTest = async () => {
  if (!linkInput.value) {
    // 링크가 비어있으면 에러를 부모 컴포넌트에 알립니다.
    emit('addTest', { isValid: false, message: '초대 링크를 입력해주세요.' })
    return
  }

  // 백엔드 URL에서 testId와 linkToken을 파싱 (라우터 이동 시 사용)
  const params = extractTestParams(linkInput.value)

  if (!params) {
    // 링크 형식이 맞지 않으면 백엔드 요청 전에 에러 처리
    emit('addTest', { isValid: false, message: '유효하지 않은 초대 링크 형식입니다.' })
    return
  }

  try {
    // 백엔드로 POST 요청을 보내 유효성 검사 (실제 API 엔드포인트에 맞게 수정 필요)
    // 초대 링크 자체가 body에 들어가거나, 파싱된 testId와 linkToken을 보낼 수 있습니다.
    // 여기서는 testId와 linkToken을 보내는 것으로 가정합니다.
    const response = await api.post('/trainee/test/verify-invitation', {
      testId: params.testId,
      linkToken: params.linkToken,
    })

    if (response.data.statusCode === 'OK' && response.data.resultData.isValid) {
      // 백엔드로부터 유효하다는 응답을 받으면 해당 링크로 이동
      router.push(linkInput.value)
      emit('close') // 이동 후 모달 닫기
    } else {
      // 백엔드로부터 유효하지 않다는 응답을 받으면 에러 메시지 표시
      // response.data.resultMsg를 사용하여 백엔드 에러 메시지를 표시할 수 있습니다.
      const errorMessage = response.data.resultMsg || '유효하지 않은 초대 링크입니다.'
      emit('addTest', { isValid: false, message: errorMessage })
    }
  } catch (error) {
    console.error('초대 링크 유효성 검사 중 오류 발생:', error)
    // 네트워크 오류, 서버 오류 등 예외 발생 시 에러 메시지 표시
    emit('addTest', {
      isValid: false,
      message: '링크 검사 중 오류가 발생했습니다. 다시 시도해주세요.',
    })
  }
}
</script>

<style scoped>
/* (이전과 동일한 스타일 코드) */
/* --- Modal (팝업) 스타일 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15em;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.4em;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #666;
}

.body-description {
  margin-bottom: 8px;
  color: #555;
  font-size: 0.9em;
}

.invitation-input {
  width: calc(100% - 20px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.2s;
}

.invitation-input:focus {
  border-color: #007bff;
}

.invitation-input.input-error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.8em;
  margin-top: 3px;
  display: flex;
  align-items: center;
}

.error-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #f44336;
  color: white;
  text-align: center;
  line-height: 14px;
  font-size: 10px;
  margin-right: 4px;
}
.error-icon::before {
  content: '!';
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #eee;
  margin-top: 8px;
}

.modal-button {
  background-color: #e0e0e0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 15px;
  cursor: pointer;
  font-size: 0.95em;
  transition: background-color 0.2s;
}

.modal-button.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.modal-button:hover {
  background-color: #0056b3;
}
</style>

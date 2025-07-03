<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ $t('addTest') }}</h3>
          <button class="close-button" @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <p class="body-description">{{ $t('addTestDesc') }}</p>
          <div class="input-group">
            <label for="invite-link" class="input-label">{{ $t('inviteLink') }}</label>
            <input
              id="invite-link"
              type="text"
              v-model="linkInput"
              placeholder="예: http://localhost:5173/trainee/test/123/abc"
              class="invitation-input"
              :class="{ 'input-error': invitationLinkError }"
            />
            <p v-if="invitationLinkError" class="error-message">
              <span class="error-icon"></span> {{ invitationLinkError }}
            </p>
          </div>

          <div class="input-group">
            <label for="language-select" class="input-label">{{ $t('selectLanguage') }}</label>
            <div class="select-wrapper">
              <select id="language-select" v-model="selectedLang" class="language-select">
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>
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
const selectedLang = ref('ko') // 기본 언어는 한국어로 설정
const router = useRouter()

// 임시 userId. 실제 프로젝트에서는 로그인된 사용자 정보를 가져와야 합니다.
// 예: Vuex store, Pinia store, Local Storage 또는 인증 모듈에서 가져오기
const getUserId = () => {
  // 실제 userId를 가져오는 로직 (예시: localStorage에서 가져오기)
  return localStorage.getItem('userId') || 'mockUserId123' // 또는 실제 로그인된 사용자 ID
}

// 모달이 열릴 때마다 입력값 초기화
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      linkInput.value = ''
      selectedLang.value = 'ko' // 모달 열릴 때마다 언어도 기본값으로 초기화
    }
  },
)

// 전체 초대 링크에서 linkToken만 추출하는 함수
const extractLinkToken = (url) => {
  // http://localhost:5173/trainee/test/:testId/:linkToken
  const regex = /\/trainee\/test\/[^/]+\/([^/]+)$/
  const match = url.match(regex)
  if (match && match.length === 2) {
    return match[1] // 두 번째 캡처 그룹이 linkToken
  }
  return null
}

// 라우터 이동을 위해 testId까지 추출하는 함수 (API 요청에 직접 사용되진 않지만, 이동 시 필요할 경우)
const extractTestIdAndToken = (url) => {
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
    emit('addTest', { isValid: false, message: '초대 링크를 입력해주세요.' })
    return
  }

  const tokenToRegister = extractLinkToken(linkInput.value)
  if (!tokenToRegister) {
    emit('addTest', {
      isValid: false,
      message: '유효하지 않은 초대 링크 형식입니다. 정확한 링크를 입력해주세요.',
    })
    return
  }

  const userId = getUserId()
  if (!userId) {
    emit('addTest', {
      isValid: false,
      message: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
    })
    return
  }

  try {
    const response = await api.post('/test/invite/register', null, {
      params: {
        token: tokenToRegister, // 추출한 초대 토큰
        userId: userId, // 현재 로그인된 사용자 ID
        lang: selectedLang.value, // 선택된 언어
      },
    })

    console.log('API 응답:', response.data)

    // API 응답 구조에 따라 성공 여부 판단 로직 수정
    // 여기서는 `statusCode: 'OK'`를 성공 기준으로 가정합니다.
    if (response.data.statusCode === 'OK') {
      // API 응답에서 이동할 URL이나 필요한 정보를 직접 받지 않으므로,
      // 입력된 링크 그대로 혹은 필요한 정보를 조합하여 라우터를 이동합니다.
      // 만약 API 응답에 testId 등 추가 정보가 있다면, 그걸 활용할 수 있습니다.
      // 현재는 입력된 전체 링크로 이동한다고 가정합니다.
      const testParamsForRoute = extractTestIdAndToken(linkInput.value)
      if (testParamsForRoute) {
        // 예를 들어, /trainee/test/:testId/:linkToken 으로 라우트 이동
        router.push(`/trainee/test/${testParamsForRoute.testId}/${testParamsForRoute.linkToken}`)
      } else {
        // 링크에서 testId와 token 추출에 실패했으나 API는 성공한 경우 (예외 상황)
        console.warn(
          'API는 성공했으나 라우트 이동을 위한 testId와 token 추출에 실패했습니다. 기본 링크로 이동합니다.',
        )
        router.push('/trainee/dashboard') // 또는 적절한 기본 경로
      }
      emit('close') // 모달 닫기
    } else {
      const errorMessage = response.data.resultMsg || '초대 등록에 실패했습니다.'
      emit('addTest', { isValid: false, message: errorMessage })
    }
  } catch (error) {
    console.error('초대 등록 API 호출 중 오류 발생:', error)
    if (error.response && error.response.data && error.response.data.resultMsg) {
      emit('addTest', { isValid: false, message: error.response.data.resultMsg })
    } else {
      emit('addTest', {
        isValid: false,
        message: '서버 통신 오류가 발생했습니다. 다시 시도해주세요.',
      })
    }
  }
}
</script>

<style scoped>
/* 기존 스타일 유지 */
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
  gap: 15px; /* input-group 간 간격 조절 */
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

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px; /* body 내 요소 간 간격 */
}

.body-description {
  margin-bottom: 0; /* 내부 gap으로 대체 */
  color: #555;
  font-size: 0.9em;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px; /* label과 input 사이 간격 */
}

.input-label {
  font-size: 0.9em;
  color: #333;
  font-weight: 600;
}

/* 드롭다운 화살표를 위한 래퍼 추가 */
.select-wrapper {
  position: relative;
  width: 100%;
}

.invitation-input,
.language-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  appearance: none; /* 기본 드롭다운 화살표 숨김 */
  -webkit-appearance: none;
  -moz-appearance: none;
}

.invitation-input:focus,
.language-select:focus {
  border-color: #007bff;
}

.invitation-input.input-error {
  border-color: #f44336;
}

/* 커스텀 드롭다운 화살표 스타일 */
.select-arrow {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #666; /* 아래 방향 화살표 모양 */
  pointer-events: none; /* 화살표 클릭 시 select 활성화 방지 */
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

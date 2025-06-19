<template>
  <div class="my-page-container">
    <Header />

    <div class="content-area">
      <main class="main-content">
        <h2 class="page-title">마이페이지</h2>

        <div class="user-info-section">
          <div class="info-item">
            <label class="info-label">이메일</label>
            <input type="email" v-model="user.email" readonly class="info-input" />
          </div>

          <div class="info-item">
            <label class="info-label">이름</label>
            <input type="text" v-model="user.name" class="info-input editable-input" />
          </div>

          <div class="info-item">
            <label class="info-label">소속</label>
            <input type="text" v-model="user.affiliation" readonly class="info-input" />
          </div>

          <div class="info-item">
            <label class="info-label">비밀번호 변경 (선택)</label>
            <input
              type="password"
              v-model="newPassword"
              placeholder="새 비밀번호를 입력해주세요."
              class="password-input"
            />
          </div>

          <div class="button-group">
            <button @click="handleConfirm" class="confirm-button">확인</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/config/axios'
import Header from '@/components/layouts/Header.vue'
import Footer from '@/components/layouts/Footer.vue'

const router = useRouter()

// 로컬 스토리지에서 사용자 역할과 ID를 가져옵니다.
const role = (localStorage.getItem('role') || '').toLowerCase() // role을 소문자화
const userId = localStorage.getItem('userId')

// 사용자 정보를 저장할 반응형 객체
const user = ref({
  email: '',
  name: '',
  affiliation: '', // department 값을 여기에 할당할 예정
})

// 컴포넌트 로드 시점의 원본 사용자 이름을 저장 (변경 여부 확인용)
let originalUserName = ''

// 새로운 비밀번호를 저장할 반응형 변수
const newPassword = ref('')

/**
 * 사용자 정보를 API에서 불러옵니다.
 */
const fetchUserInfo = async () => {
  if (!userId) {
    alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.')
    router.push('/login')
    return
  }
  if (!role) {
    alert('사용자 역할을 찾을 수 없습니다. 다시 로그인해 주세요.')
    router.push('/login')
    return
  }

  try {
    const apiUrl = `/user/${role}`
    const response = await axios.get(apiUrl, {
      params: { userId: userId },
    })
    const data = response.data.resultData
    user.value = {
      email: data.email,
      name: data.name,
      affiliation: data.department, // API 응답의 department 필드를 affiliation(소속)으로 매핑
    }
    // 사용자 정보를 불러온 후 원본 이름 저장
    originalUserName = data.name
  } catch (error) {
    console.error('사용자 정보를 불러오는 데 실패했습니다:', error)
    alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해 주세요.')
  }
}

/**
 * '확인' 버튼 클릭 시 실행되는 함수입니다.
 * 이름 및 비밀번호 변경 요청을 보내거나, 변경사항이 없으면 메인 페이지로 이동합니다.
 */
const handleConfirm = async () => {
  if (!userId) {
    alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.')
    router.push('/login')
    return
  }

  // 이름이 변경되었는지, 새 비밀번호가 입력되었는지 확인
  const isNameChanged = user.value.name !== originalUserName
  const isPasswordEntered = newPassword.value.trim() !== ''

  if (!isNameChanged && !isPasswordEntered) {
    // 변경사항이 없으면 바로 메인 페이지로 이동
    console.log('변경사항 없음. 메인 페이지로 이동합니다.')
    router.push(`/${role}/main`)
    return
  }

  try {
    const updatePayload = {
      userId: userId,
      name: user.value.name,
    }

    if (isPasswordEntered) {
      updatePayload.password = newPassword.value.trim()
    }

    await axios.put(`/user/${userId}`, updatePayload)

    alert('정보가 성공적으로 변경되었습니다.')
    // 업데이트 후 사용자 정보를 다시 불러와 화면을 최신 상태로 유지
    await fetchUserInfo()
    // 성공적으로 변경되었으면 메인 페이지로 이동
    router.push(`/${role}/main`)
  } catch (error) {
    console.error('정보 변경 실패:', error)
    alert('정보 변경 중 오류가 발생했습니다. 다시 시도해 주세요.')
  }
}

// 컴포넌트가 마운트되면 사용자 정보를 불러옵니다.
onMounted(fetchUserInfo)
</script>

<style scoped>
.my-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 전체 화면 높이를 채우도록 설정 */
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1; /* 남은 공간을 채우도록 설정 */
  overflow: hidden; /* 내용이 넘칠 경우 스크롤 숨김 */
}

.main-content {
  flex: 1; /* 메인 콘텐츠가 남은 공간을 채우도록 설정 */
  padding: 24px;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 표시 */
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가운데 정렬 */
  justify-content: center; /* 세로 가운데 정렬 (필요시) */
}

.page-title {
  font-size: 2rem; /* 2xl */
  font-weight: 700; /* bold */
  margin-bottom: 1.5rem; /* mb-6 */
  text-align: center;
  color: #333;
}

.user-info-section {
  width: 100%;
  max-width: 40rem; /* max-w-xl */
  padding: 2rem;
  background-color: #f9fafb; /* Light gray background */
  border-radius: 0.5rem; /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */

  /* Flexbox를 사용하여 내부 요소 간 간격 제어 */
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 모든 하위 요소 간의 기본 간격을 설정 (tailwind의 gap-6과 유사) */
}

.info-item {
  /* gap 속성을 user-info-section에 설정했으므로, 개별 margin-bottom은 제거하거나 초기화 */
  margin-bottom: 0; /* 기존 margin-bottom을 초기화 */
}

.info-label {
  display: block;
  color: #4a5568; /* gray-700 */
  font-weight: 500; /* medium */
  margin-bottom: 0.5rem; /* 라벨과 인풋 사이 간격 조정 */
}

.info-input,
.password-input {
  width: 100%;
  border: 1px solid #cbd5e0; /* border-gray-300 */
  padding: 0.75rem 1rem; /* px-4 py-2 */
  border-radius: 0.25rem; /* rounded */
}

.info-input {
  background-color: #edf2f7; /* bg-gray-100 */
  cursor: not-allowed; /* Indicate it's not editable */
}

.editable-input {
  background-color: #ffffff; /* editable input can have white background */
  cursor: text; /* Indicate it's editable */
}

.button-group {
  text-align: center;
  margin-top: 0; /* user-info-section의 gap으로 간격이 이미 주어지므로 초기화 */
}

.confirm-button {
  background-color: #2563eb; /* bg-blue-600 */
  color: white;
  padding: 0.625rem 1.5rem; /* px-6 py-2 */
  border-radius: 0.25rem; /* rounded */
  transition: background-color 0.2s ease-in-out;
}

.confirm-button:hover {
  background-color: #1d4ed8; /* hover:bg-blue-700 */
}
</style>

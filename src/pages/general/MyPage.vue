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
            <input type="text" v-model="user.name" readonly class="info-input" />
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
const role = (localStorage.getItem('role') || '').toLowerCase()
const userId = localStorage.getItem('userId')

// 사용자 정보 API 엔드포인트 설정
const apiUrl = `/user/${role}`

// 사용자 정보를 저장할 반응형 객체
const user = ref({
  email: '',
  name: '',
  affiliation: '',
})

// 새로운 비밀번호를 저장할 반응형 변수
const newPassword = ref('')

/**
 * 사용자 정보를 API에서 불러옵니다.
 */
const fetchUserInfo = async () => {
  try {
    const response = await axios.get(apiUrl, {
      params: { userId }, // userId를 쿼리 파라미터로 전달
    })
    const data = response.data
    user.value = {
      email: data.email,
      name: data.name,
      affiliation: data.affiliation,
    }
  } catch (error) {
    console.error('사용자 정보를 불러오는 데 실패했습니다:', error)
    alert('사용자 정보를 불러오는 데 실패했습니다. 다시 시도해 주세요.')
  }
}

/**
 * '확인' 버튼 클릭 시 실행되는 함수입니다.
 * 비밀번호 변경이 필요하면 변경 요청을 보내고, 메인 페이지로 이동합니다.
 */
const handleConfirm = async () => {
  // 새 비밀번호가 입력되었다면 비밀번호 변경 요청을 보냅니다.
  if (newPassword.value.trim()) {
    try {
      await axios.put(
        `${apiUrl}/password`,
        {
          password: newPassword.value,
        },
        {
          params: { userId }, // userId를 쿼리 파라미터로 전달
        },
      )
      alert('비밀번호가 성공적으로 변경되었습니다.')
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해 주세요.')
      return // 비밀번호 변경 실패 시 메인 페이지로 이동하지 않습니다.
    }
  }

  // 사용자 역할에 따라 해당 메인 페이지로 이동합니다.
  router.push(`/${role}/main`)
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
}

.info-item {
  margin-bottom: 1rem; /* Adjust as needed for spacing */
}

.info-label {
  display: block;
  color: #4a5568; /* gray-700 */
  font-weight: 500; /* medium */
  margin-bottom: 0.25rem; /* mb-1 */
}

.info-input {
  width: 100%;
  border: 1px solid #cbd5e0; /* border-gray-300 */
  padding: 0.75rem 1rem; /* px-4 py-2 */
  border-radius: 0.25rem; /* rounded */
  background-color: #edf2f7; /* bg-gray-100 */
  cursor: not-allowed; /* Indicate it's not editable */
}

.password-input {
  width: 100%;
  border: 1px solid #cbd5e0; /* border-gray-300 */
  padding: 0.75rem 1rem; /* px-4 py-2 */
  border-radius: 0.25rem; /* rounded */
}

.button-group {
  text-align: center;
  margin-top: 1.5rem; /* mt-6 */
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

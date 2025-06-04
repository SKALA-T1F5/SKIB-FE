<template>
  <div class="mypage-layout">
    <Header />

    <main class="mypage-container">
      <!-- 사용자 정보 -->
      <section class="user-info-box">
        <h2 class="section-title">사용자 정보</h2>
        <div class="info-row">
          <label>이름</label>
          <input type="text" v-model="user.name" disabled />
        </div>
        <div class="info-row">
          <label>이메일</label>
          <input type="email" v-model="user.email" disabled />
        </div>
        <div class="info-row">
          <label>소속</label>
          <input type="text" v-model="user.organization" disabled />
        </div>
      </section>

      <!-- 비밀번호 변경 -->
      <section class="password-box">
        <h2 class="section-title">비밀번호 변경</h2>
        <div class="info-row">
          <label>새 비밀번호</label>
          <input type="password" v-model="newPassword" />
        </div>
        <div class="info-row">
          <label>비밀번호 확인</label>
          <input type="password" v-model="confirmPassword" />
        </div>
        <button class="save-button" @click="updatePassword">저장</button>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const user = ref({ name: '', email: '', organization: '' })
const newPassword = ref('')
const confirmPassword = ref('')

onMounted(async () => {
  const res = await axios.get('/api/user/me')
  user.value = res.data
})

const updatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  try {
    await axios.post('/api/user/update-password', {
      password: newPassword.value,
    })
    alert('비밀번호가 변경되었습니다.')
  } catch (e) {
    alert('오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.mypage-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main.mypage-container {
  flex: 1;
  max-width: 800px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.user-info-box,
.password-box {
  background: #eef2f6;
  padding: 1.5rem;
  border-radius: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-row label {
  font-weight: bold;
}

.save-button {
  background-color: #1c2053;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 1rem;
  width: 100%;
}
</style>

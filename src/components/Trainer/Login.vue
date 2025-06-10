<template>
  <div class="login-layout">
    <!-- 좌측 안내 영역 -->
    <div class="login-info">
      <div class="logo-area">INSIGHT BRIDGE</div>
      <p class="welcome-text">AI 기반 문제 풀이 서비스에 오신 것을 환영합니다!</p>
    </div>

    <!-- 우측 로그인 폼 영역 -->
    <div class="login-form-box">
      <h2 class="form-title">로그인</h2>
      <form class="login-form" @submit.prevent="handleLogin">
        <label>
          아이디
          <input type="text" v-model="id" placeholder="아이디를 입력하세요" />
        </label>
        <label>
          비밀번호
          <input type="password" v-model="password" placeholder="비밀번호를 입력하세요" />
        </label>
        <button type="submit" class="login-button">로그인</button>
      </form>
      <div class="extra-options">
        <a href="#">회원가입</a>
        <a href="#">비밀번호 찾기</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import api from '../api/axios' // Axios 인스턴스
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const id = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await api.post('/auth/user/login', {
      email: id.value,
      password: password.value,
    })

    if (response.status === 200) {
      const token = response.data.resultData?.token
      if (!token) {
        alert('로그인 실패: 서버에서 토큰을 받지 못했습니다.')
        return
      }

      // JWT 토큰 저장
      localStorage.setItem('token', token)

      // 로그인 성공 후 Trainee 메인 페이지로 이동
      router.push('/trainee/main')
    } else {
      alert('로그인 실패: 서버 응답 오류')
    }
  } catch (error: any) {
    if (error.response) {
      console.error('서버 응답 오류:', error.response.status, error.response.data)
      alert(`로그인 실패 (${error.response.status}): ${error.response.data.message || '아이디/비밀번호 확인'}`)
    } else {
      console.error('요청 실패:', error)
      alert('로그인 요청 실패: 네트워크 또는 서버 연결 오류')
    }
  }
}
</script>

<style scoped>
.login-layout {
  display: grid;
  grid-template-columns: 50% 50%;
  height: 100vh;
  background: #eef2f6;
}

.login-info {
  background: #1c2053;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.logo-area {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 18px;
  text-align: center;
  max-width: 300px;
}

.login-form-box {
  background: white;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-form label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
  font-size: 14px;
}

.login-form input {
  margin-top: 0.5rem;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.login-button {
  background-color: #1c2053;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #2e3270;
}

.extra-options {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.extra-options a {
  color: #1c2053;
}
</style>
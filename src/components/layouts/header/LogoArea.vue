<template>
  <div class="logo-area" @click="goToMain">
    <img class="logo-image" :src="logoImage" alt="logo" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logoImage from '@/assets/header_logo.png'

const router = useRouter()

const goToMain = () => {
  // localStorage에서 사용자 role을 가져옵니다.
  // 실제 애플리케이션에서는 로그인 시점에 role을 localStorage에 저장해야 합니다.
  const userRole = localStorage.getItem('role') // 예: 'Trainer' 또는 'Trainee'

  if (userRole === 'TRAINER') {
    router.push('/trainer/main')
  } else if (userRole === 'TRAINEE') {
    router.push('/trainee/main')
  } else {
    // role이 없거나 예상치 못한 값일 경우 기본 경로로 이동 (예: 로그인 페이지 또는 홈페이지)
    console.warn('User role not found or invalid. Redirecting to default.')
    router.push('/login') // 또는 '/login' 등 적절한 기본 경로
  }
}
</script>

<style scoped>
.logo-area {
  display: flex;
  align-items: center;
  margin-left: -25px;
  margin-bottom: -10px;
}
.logo-image {
  height: 130px;
  object-fit: contain;
  cursor: pointer;
}
</style>

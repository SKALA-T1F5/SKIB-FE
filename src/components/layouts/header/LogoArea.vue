<template>
  <div class="logo-area" @click="goToMain">
    <img class="logo-image" :src="logoImage" alt="logo" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logoImage from '@/assets/logo_semi.png'

const router = useRouter()
const goToMain = () => {
  router.push('/trainee/main')
}
</script>

<style scoped>
.logo-area {
  display: flex;
  align-items: center;
}
.logo-image {
  height: 60px;
  object-fit: contain;
  cursor: pointer;
}
</style>
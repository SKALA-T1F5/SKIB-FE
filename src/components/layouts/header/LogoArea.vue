<template>
  <div class="logo-area" @click="goToMain">
    <img class="logo-image" :src="logoImage" alt="logo" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logoImage from '@/assets/images/header_logo.png'

const router = useRouter()
const goToMain = () => {
  router.push('/trainee/main')
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
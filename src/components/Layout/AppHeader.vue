<template>
  <header class="header">
    <div class="header-left">
      <img :src="logo" alt="skib" class="logo" />
    </div>
    <div class="header-right">
      <div class="lang-selector">
        <span class="globe-icon">🌐</span>
        <span>KOR</span>
      </div>
      <div class="user-profile" @click="toggleDropdown">
        <div class="user-avatar">
          <span class="user-icon">👤</span>
        </div>
        <div class="user-info">
          <span class="nickname">{{ userInfo.nickname }}</span>
          <span class="role">{{ userInfo.role }}</span>
        </div>
        <span class="dropdown-arrow">▼</span>
        <div v-if="showDropdown" class="dropdown-menu">
          <button class="logout-btn" @click.stop="logout">로그아웃</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/images/header_logo.png'

const router = useRouter()
const showDropdown = ref(false)

const userInfo = ref({
  nickname: localStorage.getItem('nickname') || '사용자',
  role: localStorage.getItem('role') || 'Trainer',
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('nickname')
  localStorage.removeItem('role')
  showDropdown.value = false
  router.push('/trainer/login')
}
</script>

<style scoped>
.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
}
.header-left .logo { height: 120px; }
.header-right { display: flex; align-items: center; gap: 16px; }
.lang-selector {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid #ddd; border-radius: 4px; padding: 4px 10px;
  font-size: 14px; cursor: pointer;
}
.user-profile { display: flex; align-items: center; gap: 8px; cursor: pointer; position: relative; }
.user-avatar { width: 32px; height: 32px; background: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.user-icon { color: #fff; font-size: 16px; }
.user-info { display: flex; flex-direction: column; align-items: flex-start; }
.nickname { font-size: 14px; font-weight: 500; color: #333; }
.role { font-size: 12px; color: #666; }
.dropdown-arrow { font-size: 10px; color: #666; }
.dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 8px 0;
  min-width: 120px;
  z-index: 2000;
}
.logout-btn {
  width: 100%;
  background: none;
  border: none;
  color: #d32f2f;
  font-weight: bold;
  font-size: 15px;
  padding: 10px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #f5f5f5;
}
</style>
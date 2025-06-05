<template>
  <div class="user-info" @click="toggleUserMenu">
    <svg-icon type="mdi" :path="mdiAccount" class="user-icon" />
    <div class="user-text">
      <span class="nickname">{{ name }}</span>
      <span class="role">{{ role }}</span>
    </div>
    <svg-icon type="mdi" :path="mdiMenuDown" class="user-menu" />
    <div v-if="showUserMenu" class="dropdown user-dropdown">
      <div @click="goToMyPage">마이페이지</div>
      <div @click="logout">로그아웃</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiMenuDown } from '@mdi/js'

const router = useRouter()
const showUserMenu = ref(false)

// ✅ 사용자 정보 가져오기
const name = ref('')
const role = ref('')

onMounted(() => {
  name.value = localStorage.getItem('name') || '사용자'
  role.value = localStorage.getItem('role') || ''
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goToMyPage = () => {
  router.push('/mypage')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('name')
  router.push('/login')
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  position: relative;
  padding: 3px 10px 5px 6px;
  transition: background-color 0.25s ease;
  margin-left: -12px;
  margin-top: 15px;
}

.user-info:hover {
  background-color: #d6d6d6;
}

.user-icon {
  height: 30px;
  width: 30px;
  color: #000;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  line-height: 1.1;
  margin-left: 1px;
}

.nickname {
  font-size: 12px;
  font-weight: 600;
  color: #000;
}

.role {
  font-size: 10px;
  color: #868686;
}

.user-menu {
  height: 16px;
  width: 16px;
  color: #000;
  margin-left: 2px;
}

.dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  padding: 4px 0;
  min-width: 100px;
  text-align: left;
}

.dropdown div {
  padding: 0.3rem 1rem;
  font-size: 12px;
  cursor: pointer;
}

.dropdown div:hover {
  background-color: #f5f5f5;
}
</style>

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

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiMenuDown } from '@mdi/js'

const props = defineProps({
  name: String,
  role: String,
})

const router = useRouter()
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goToMyPage = () => {
  router.push('/mypage')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  position: relative;
}
.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.nickname {
  font-size: 14px;
  color: #000;
}
.role {
  font-size: 12px;
  color: #868686;
  line-height: 1;
}
.user-icon {
  height: 40px;
  width: 40px;
}
.user-menu {
  height: 30px;
  width: 30px;
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
  min-width: 120px;
  text-align: left;
}
.dropdown div {
  padding: 0.6rem 1rem;
  font-size: 14px;
  cursor: pointer;
}
.dropdown div:hover {
  background-color: #f5f5f5;
}
</style>

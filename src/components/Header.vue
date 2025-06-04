<template>
  <header class="header">
    <div class="logo-area" @click="goToMain">
      <img class="logo-image" :src="logoImage" alt="logo" />
    </div>

    <div class="header-right">
      <!-- 🌐 언어 전환 버튼 -->
      <div class="language-switch" @click="toggleLangMenu">
        <div class="lang-button">
          <svg-icon type="mdi" :path="mdiWeb" class="lang-icon" />
          <span class="lang-text">{{ currentLang === 'ko' ? 'KOR' : 'ENG' }}</span>
        </div>
        <div v-if="showLangMenu" class="dropdown lang-dropdown">
          <div @click="selectLang('ko')">한국어</div>
          <div @click="selectLang('en')">English</div>
        </div>
      </div>

      <div class="vertical-divider"></div>

      <!-- 👤 사용자 정보 -->
      <div class="user-info" @click="toggleUserMenu">
        <svg-icon type="mdi" :path="mdiAccount" class="user-icon" />
        <div class="user-text">
          <span class="nickname">{{ name }}</span>
          <span class="role">{{ role }}</span>
        </div>
        <svg-icon type="mdi" :path="mdiMenuDown" class="user-menu" />
      </div>

      <!-- 🔽 사용자 드롭다운 메뉴 -->
      <div v-if="showUserMenu" class="dropdown user-dropdown">
        <div @click="goToMyPage">마이페이지</div>
        <div @click="logout">로그아웃</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '@/assets/logo_semi.png'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiWeb, mdiMenuDown } from '@mdi/js'

const props = defineProps({
  name: { type: String, default: '닉네임' },
  role: { type: String, default: 'Trainee' },
})

const router = useRouter()

const showUserMenu = ref(false)
const showLangMenu = ref(false)
const currentLang = ref('ko')

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showLangMenu.value = false
}

const toggleLangMenu = () => {
  showLangMenu.value = !showLangMenu.value
  showUserMenu.value = false
}

const selectLang = (lang) => {
  currentLang.value = lang
  showLangMenu.value = false
}

const goToMyPage = () => {
  router.push('/mypage')
}

const goToMain = () => {
  router.push('/trainee/main')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>

<style scoped>
.header {
  height: 80px;
  width: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 70px;
  object-fit: contain;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.language-switch {
  position: relative;
}

.language-switch .lang-button {
  background: #f0f0f0;
  border-radius: 30px;
  display: flex;
  align-items: center;
  padding: 8px 14px;
  cursor: pointer;
}

.lang-icon {
  height: 24px;
  margin-right: 6px;
}

.lang-text {
  font-family: 'Inter';
  font-weight: 700;
  font-size: 16px;
  color: #000;
}

.vertical-divider {
  width: 1px;
  height: 28px;
  background-color: #acacac;
}

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
  font-family: 'Inter';
  font-size: 14px;
  color: #000;
}

.role {
  font-family: 'Inter';
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

/* 공통 드롭다운 */
.dropdown {
  position: absolute;
  top: 70px;
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

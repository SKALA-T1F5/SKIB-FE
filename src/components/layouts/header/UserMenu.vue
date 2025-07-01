<template>
  <div class="user-info" @click="toggleUserMenu">
    <svg-icon type="mdi" :path="mdiAccount" class="user-icon" />
    <div class="user-text">
      <span class="nickname notranslate">{{ name }}</span>
      <span class="role">{{ roleText }}</span>
    </div>
    <svg-icon
      type="mdi"
      :path="isExamMode ? mdiLock : mdiMenuDown"
      :class="['user-menu', { 'locked-icon': isExamMode }]"
    />
    <div v-if="showUserMenu" class="dropdown user-dropdown">
      <div @click.stop="goToMyPage">{{ myPageText }}</div>
      <div @click.stop="logout">{{ logoutText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiMenuDown, mdiLock } from '@mdi/js'

const router = useRouter()
const showUserMenu = ref(false)
const isExamMode = ref(false)

const name = ref('')
const role = ref('')
const currentLang = ref('ko') // 현재 언어를 추적하기 위한 ref 추가

onMounted(() => {
  name.value = localStorage.getItem('name') || '사용자'
  role.value = localStorage.getItem('role') || ''

  // Google Translate 위젯이 설정한 언어를 가져와 currentLang에 반영
  const googleTranslateCookie = getCookie('googtrans')
  if (googleTranslateCookie) {
    const langMatch = googleTranslateCookie.match(/\/auto\/(ko|en|vi)/)
    if (langMatch && langMatch[1]) {
      currentLang.value = langMatch[1]
    }
  }

  // Google Translate 위젯의 언어 변경을 감지하기 위한 MutationObserver 추가
  const observer = new MutationObserver(() => {
    const combo = document.querySelector('.goog-te-combo')
    if (combo && combo.value !== currentLang.value) {
      currentLang.value = combo.value
    }
  })
  observer.observe(document.body, { subtree: true, childList: true })
})

// 쿠키에서 값을 가져오는 헬퍼 함수
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// 'role' 텍스트를 현재 언어에 따라 계산
const roleText = computed(() => {
  if (currentLang.value === 'ko') {
    if (role.value === 'TRAINER') return '트레이너'
    if (role.value === 'TRAINEE') return '훈련생'
    return role.value
  } else if (currentLang.value === 'en') {
    if (role.value === 'TRAINER') return 'Trainer'
    if (role.value === 'TRAINEE') return 'Trainee'
    return role.value
  } else if (currentLang.value === 'vi') {
    if (role.value === 'TRAINER') return 'Huấn luyện viên'
    if (role.value === 'TRAINEE') return 'Thực tập sinh'
    return role.value
  }
  return role.value
})

// '마이페이지' 텍스트를 현재 언어에 따라 계산
const myPageText = computed(() => {
  if (currentLang.value === 'ko') return '마이페이지'
  if (currentLang.value === 'en') return 'My Page'
  if (currentLang.value === 'vi') return 'Trang của tôi'
  return '마이페이지'
})

// '로그아웃' 텍스트를 현재 언어에 따라 계산
const logoutText = computed(() => {
  if (currentLang.value === 'ko') return '로그아웃'
  if (currentLang.value === 'en') return 'Logout'
  if (currentLang.value === 'vi') return 'Đăng xuất'
  return '로그아웃'
})

const toggleUserMenu = () => {
  if (!isExamMode.value) {
    showUserMenu.value = !showUserMenu.value
  }
}

const goToMyPage = () => {
  showUserMenu.value = false
  router.push('/mypage')
}

const logout = () => {
  showUserMenu.value = false
  localStorage.clear()
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
  transition: color 0.25s ease;
}

.user-menu.locked-icon {
  color: #868686;
  cursor: not-allowed;
}

.dropdown {
  position: absolute;
  top: 90%;
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

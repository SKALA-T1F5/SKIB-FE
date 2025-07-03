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
import { useI18n } from 'vue-i18n'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiMenuDown, mdiLock } from '@mdi/js'

const router = useRouter()
const { t, locale } = useI18n()

const showUserMenu = ref(false)
const isExamMode = ref(false)

const name = ref('')
const role = ref('')

onMounted(() => {
  name.value = localStorage.getItem('name') || '사용자'
  role.value = localStorage.getItem('role') || ''
})

const roleText = computed(() => {
  if (role.value === 'TRAINER') return t('userRoles.trainer')
  if (role.value === 'TRAINEE') return t('userRoles.trainee')
  return role.value
})

const myPageText = computed(() => t('userMenu.myPage'))
const logoutText = computed(() => t('userMenu.logout'))

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
  align-items: center; /* 다시 중앙 정렬로 복귀 */
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
  justify-content: flex-end; /* 이 부분을 추가하여 텍스트를 아래로 정렬 */
  align-items: flex-start;
  text-align: left;
  line-height: 1.1;
  margin-left: 1px;
  height: 28px; /* 아이콘과 동일한 높이로 설정하여 정렬 기준 제공 */
}

.nickname {
  font-size: 12px;
  font-weight: 600;
  color: #000;
  margin-bottom: auto; /* 닉네임을 상단으로 밀어 올림 */
}

.role {
  font-size: 10px;
  color: #868686;
}

.user-menu {
  height: 16px;
  width: 16px;
  color: #000;
  margin-left: auto;
  transition: color 0.25s ease;
}

.user-menu.locked-icon {
  color: #868686;
  cursor: not-allowed;
  margin-left:auto;
  justify-content: flex-end;
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

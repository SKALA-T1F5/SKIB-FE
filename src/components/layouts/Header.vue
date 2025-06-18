<template>
  <header class="header">
    <LogoArea />
    <div class="header-right">
      <LangSwitcher />
      <div class="vertical-divider"></div>
      <UserMenu :name="name" :role="role" />
    </div>
  </header>
</template>

<script setup>
import LogoArea from './header/LogoArea.vue'
import LangSwitcher from './header/LangSwitcher.vue'
import UserMenu from './header/UserMenu.vue'

// TypeScript의 interface 또는 type 정의 없이 JavaScript 객체로 props를 정의합니다.
const props = defineProps({
  name: { type: String, default: 'Nickname' },
  role: { type: String, default: 'Trainee' },
})
</script>

<style scoped>
/* 기존 header 스타일 그대로 유지 */
.header {
  height: 60px;
  width: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef2f6;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.vertical-divider {
  width: 1px;
  height: 28px;
  background-color: #acacac;
  margin-top: 15px;
}
</style>

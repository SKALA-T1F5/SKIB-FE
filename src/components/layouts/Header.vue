<template>
  <header class="header notranslate">
    <LogoArea />
    <div class="header-right">
      <LangSwitcher />
      <div class="vertical-divider"></div>
      <UserMenu style="width: 140px"/>
    </div>
  </header>
</template>

<script setup>
import LogoArea from './header/LogoArea.vue'
import LangSwitcher from './header/LangSwitcher.vue'
import UserMenu from './header/UserMenu.vue'

// name과 role은 UserMenu 컴포넌트 내부에서 localStorage에서 가져오므로 여기서는 필요 없습니다.
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

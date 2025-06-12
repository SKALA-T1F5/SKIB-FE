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
      <div class="user-profile">
        <div class="user-avatar">
          <span class="user-icon">👤</span>
        </div>
        <div class="user-info">
          <span class="nickname">Nickname</span>
          <span class="role">Trainer</span>
        </div>
        <span class="dropdown-arrow">▼</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/images/header_logo.png'
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
.user-profile { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.user-avatar { width: 32px; height: 32px; background: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.user-icon { color: #fff; font-size: 16px; }
.user-info { display: flex; flex-direction: column; align-items: flex-start; }
.nickname { font-size: 14px; font-weight: 500; color: #333; }
.role { font-size: 12px; color: #666; }
.dropdown-arrow { font-size: 10px; color: #666; }
</style>
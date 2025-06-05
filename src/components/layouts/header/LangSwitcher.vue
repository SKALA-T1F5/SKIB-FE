<template>
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
</template>

<script setup>
import { ref } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWeb } from '@mdi/js'

const currentLang = ref('ko')
const showLangMenu = ref(false)

const toggleLangMenu = () => {
  showLangMenu.value = !showLangMenu.value
}

const selectLang = (lang) => {
  currentLang.value = lang
  showLangMenu.value = false
}
</script>

<style scoped>
.language-switch {
  position: relative;
}
.lang-button {
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

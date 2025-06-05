<template>
  <div class="language-switch" @click="toggleLangMenu">
    <div class="lang-button" :class="{ active: showLangMenu }">
      <svg-icon type="mdi" :path="mdiWeb" class="lang-icon" />
      <span class="lang-text">{{ currentLang === 'ko' ? 'KOR' : 'ENG' }}</span>
    </div>
    <div v-if="showLangMenu" class="dropdown lang-dropdown">
      <div @click.stop="selectLang('ko')">한국어</div>
      <div @click.stop="selectLang('en')">English</div>
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}

.lang-button {
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 3px 10px 5px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.lang-button.active,
.lang-button:hover {
  background-color: #d6d6d6;
}

.lang-icon {
  height: 16px;
  margin-right: 4px;
  color: #000;
}

.lang-text {
  font-family: 'Inter';
  font-weight: 700;
  font-size: 12px;
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
  min-width: 75px;
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

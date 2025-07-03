<template>
  <div class="language-switch">
    <div
      class="lang-button"
      :class="{ active: showLangMenu }"
      @click="toggleLangMenu"
      :style="{ cursor: 'pointer' }"
    >
      <svg-icon type="mdi" :path="mdiWeb" class="lang-icon" />
      <span class="lang-text">{{ displayLangText }}</span>
    </div>

    <div v-if="showLangMenu" class="dropdown lang-dropdown">
      <div @click.stop="selectLang('ko')">한국어</div>
      <div @click.stop="selectLang('en')">English</div>
      <div @click.stop="selectLang('vi')">Tiếng Việt</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWeb } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const showLangMenu = ref(false)
const { locale } = useI18n()

const displayLangText = computed(() => {
  if (locale.value === 'ko') return 'KOR'
  if (locale.value === 'en') return 'ENG'
  if (locale.value === 'vi') return 'VIE'
  return 'KOR'
})

const toggleLangMenu = () => {
  showLangMenu.value = !showLangMenu.value
}

const selectLang = (lang) => {
  locale.value = lang
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
  width: 70px;
  height: 30px;
}

.lang-button.active,
.lang-button:hover {
  background-color: #d6d6d6;
}

.lang-icon {
  height: 16px;
  margin-right: 2px;
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
  min-width: 90px;
  text-align: center;
  white-space: nowrap;
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

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

    <div id="google_translate_element"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWeb } from '@mdi/js'

// --- 수정 시작 ---

// 현재 언어 상태를 관리합니다. 쿠키에서 초기값을 가져오도록 변경합니다.
const currentLang = ref(getLangFromCookie() || 'ko') // 쿠키에서 가져오거나 기본값 'ko'

// 쿠키에서 'googtrans' 값을 읽어 현재 언어를 파싱하는 함수
function getLangFromCookie() {
  const name = 'googtrans='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      const langPair = c.substring(name.length, c.length)
      // '/ko/en' 형식에서 'en' 부분만 추출
      const parts = langPair.split('/')
      if (parts.length === 3) {
        return parts[2] // 번역된 언어 코드 (예: 'en', 'vi', 'ko')
      }
    }
  }
  return '' // 쿠키를 찾지 못하거나 파싱 실패 시 빈 문자열 반환
}
// --- 수정 끝 ---

const showLangMenu = ref(false)
const googleTranslateInitialized = ref(false)
const pendingLang = ref(null)

let observer = null
let globalBarObserver = null
let triggerTimeout = null

// 현재 언어에 따라 버튼에 표시될 텍스트 계산
const displayLangText = computed(() => {
  if (currentLang.value === 'ko') return 'KOR'
  if (currentLang.value === 'en') return 'ENG'
  if (currentLang.value === 'vi') return 'VIE'
  return 'KOR' // 기본값
})

// Google Translate Bar 및 로딩 메시지를 숨기는 함수
const hideGoogleTranslateBar = () => {
  document.body.style.setProperty('top', '0px', 'important')
  document.body.style.setProperty('margin-top', '0px', 'important')
  document.body.style.setProperty('padding-top', '0px', 'important')
  document.documentElement.style.setProperty('top', '0px', 'important')
  document.documentElement.style.setProperty('margin-top', '0px', 'important')
  document.documentElement.style.setProperty('padding-top', '0px', 'important')

  const elementsToHide = [
    '.goog-te-banner-frame',
    'body > .skiptranslate:first-child',
    '.goog-tooltip',
    '.VIpgJd-ZVi9d0-LgbsSe',
    '.goog-gb-top',
    '.goog-toolbar',
    '#goog-gt-vt',
    '.goog-text-area',
    '.goog-close-button',
    '.goog-promo',
    '.goog-bubble-arrow',
    '.goog-bubble-arrow-border',
    '.goog-text-highlight',
    '.skiptranslate span.goog-text-highlight',
    '.skiptranslate > div:first-child[style*="top: 0px"][style*="left: 0px"][style*="width: 100%"][style*="height: 100%"]',
    '.goog-trans-section',
    '.goog-text-marker',
    '.goog-te-spinner-pos',
  ]

  elementsToHide.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (
        el.style.display !== 'none' ||
        el.style.visibility !== 'hidden' ||
        el.style.height !== '0px'
      ) {
        el.style.display = 'none'
        el.style.height = '0'
        el.style.overflow = 'hidden'
        el.style.visibility = 'hidden'
        el.style.setProperty('top', '0px', 'important')
        el.style.setProperty('margin', '0px', 'important')
        el.style.setProperty('padding', '0px', 'important')
      }
    })
  })

  document.querySelectorAll('body .skiptranslate').forEach((el) => {
    if (
      el.style.display !== 'none' ||
      el.style.visibility !== 'hidden' ||
      el.style.height !== '0px'
    ) {
      el.style.display = 'none'
      el.style.height = '0'
      el.style.overflow = 'hidden'
      el.style.visibility = 'hidden'
      el.style.setProperty('top', '0px', 'important')
      el.style.setProperty('margin', '0px', 'important')
      el.style.setProperty('padding', '0px', 'important')
    }
  })

  const googleElementDiv = document.getElementById('google_translate_element')
  if (googleElementDiv) {
    googleElementDiv.querySelectorAll('*').forEach((child) => {
      if (child.style.display !== 'none' && !child.classList.contains('goog-te-combo')) {
        child.style.display = 'none'
        child.style.height = '0'
        child.style.overflow = 'hidden'
        child.style.visibility = 'hidden'
      }
    })
  }
}

const loadGoogleTranslate = () => {
  if (document.getElementById('google-translate-script')) {
    return
  }

  const script = document.createElement('script')
  script.id = 'google-translate-script'
  script.type = 'text/javascript'
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  script.onerror = (e) => {
    console.error('Google Translate script failed to load:', e)
  }
  document.head.appendChild(script)

  window.googleTranslateElementInit = () => {
    setTimeout(() => {
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
        console.error(
          'window.google.translate.TranslateElement is not available after timeout. Retrying script load or initialization.',
        )
        return
      }
      try {
        new google.translate.TranslateElement(
          {
            pageLanguage: 'ko',
            includedLanguages: 'ko,en,vi',
            layout: google.translate.TranslateElement.InlineLayout.DROPDOWN,
            autoDisplay: false,
          },
          'google_translate_element',
        )

        const targetNode = document.getElementById('google_translate_element')
        if (targetNode) {
          observer = new MutationObserver((mutationsList, obs) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const combo = targetNode.querySelector('.goog-te-combo')
                if (combo) {
                  googleTranslateInitialized.value = true
                  obs.disconnect()
                  if (pendingLang.value) {
                    triggerGoogleTranslate(pendingLang.value)
                    pendingLang.value = null
                  } else {
                    // 페이지 로드 시 쿠키에서 읽어온 언어로 초기 번역을 시도합니다.
                    triggerGoogleTranslate(currentLang.value)
                  }
                  hideGoogleTranslateBar()
                  break
                }
              }
            }
          })
          observer.observe(targetNode, { childList: true, subtree: true })
        } else {
          console.error('#google_translate_element not found for MutationObserver.')
        }

        if (!globalBarObserver) {
          globalBarObserver = new MutationObserver(hideGoogleTranslateBar)
          globalBarObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
          })
        }
      } catch (e) {
        console.error('Failed to initialize Google Translate Element in try-catch block:', e)
      }
    }, 500)
  }
}

onMounted(() => {
  loadGoogleTranslate()
  setTimeout(hideGoogleTranslateBar, 200)

  // 페이지 로드 시 현재 쿠키 언어에 따라 currentLang을 업데이트하고 버튼 텍스트를 설정합니다.
  // 이 부분은 loadGoogleTranslate 내에서 초기 번역 트리거 전에 currentLang.value가 설정되므로 추가적인 작업이 필요 없습니다.
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (globalBarObserver) {
    globalBarObserver.disconnect()
  }
  if (triggerTimeout) {
    clearTimeout(triggerTimeout)
    triggerTimeout = null
  }
})

const toggleLangMenu = () => {
  showLangMenu.value = !showLangMenu.value
}

const triggerGoogleTranslate = (lang) => {
  if (
    window.google &&
    window.google.translate &&
    window.google.translate.TranslateElement &&
    document.querySelector('.goog-te-combo')
  ) {
    const frame = document.querySelector('.goog-te-combo')
    if (frame) {
      frame.value = lang
      frame.dispatchEvent(new Event('change', { bubbles: true }))

      setTimeout(hideGoogleTranslateBar, 50)
      setTimeout(hideGoogleTranslateBar, 200)
      setTimeout(hideGoogleTranslateBar, 500)

      if (triggerTimeout) {
        clearTimeout(triggerTimeout)
        triggerTimeout = null
      }
    } else {
      if (triggerTimeout) {
        clearTimeout(triggerTimeout)
      }
      triggerTimeout = setTimeout(() => triggerGoogleTranslate(lang), 100)
    }
  } else {
    if (triggerTimeout) {
      clearTimeout(triggerTimeout)
    }
    triggerTimeout = setTimeout(() => triggerGoogleTranslate(lang), 100)
  }
}

const selectLang = (lang) => {
  currentLang.value = lang // 언어 선택 시 currentLang 업데이트
  showLangMenu.value = false
  triggerGoogleTranslate(lang)
}
</script>

<style scoped>
/* #google_translate_element에 대한 스타일 */
#google_translate_element {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* 기존 스타일 유지 */
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
  text-align: center; /* 가운데 정렬로 변경 */
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

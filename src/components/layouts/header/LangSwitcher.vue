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

const currentLang = ref('ko')
const showLangMenu = ref(false)
const googleTranslateInitialized = ref(false)
const pendingLang = ref(null)
// const showLoadingPopup = ref(false); // 팝업 표시 여부 삭제

let observer = null
let globalBarObserver = null
let triggerTimeout = null
// let popupTimeout = null; // 팝업 타이머 삭제

// 현재 언어에 따라 버튼에 표시될 텍스트 계산
const displayLangText = computed(() => {
  if (currentLang.value === 'ko') return 'KOR'
  if (currentLang.value === 'en') return 'ENG'
  if (currentLang.value === 'vi') return 'VIE' // 베트남어 약자
  return 'KOR' // 기본값
})

// Google Translate Bar 및 로딩 메시지를 숨기는 함수
const hideGoogleTranslateBar = () => {
  // console.log('hideGoogleTranslateBar called'); // 로그 추가
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
      // console.log(`Attempting to hide: ${selector}`); // 로그 추가
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
        // console.log(`Hidden element: ${selector}`); // 로그 추가
      }
    })
  })

  document.querySelectorAll('body .skiptranslate').forEach((el) => {
    // console.log('Attempting to hide body .skiptranslate'); // 로그 추가
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
      // console.log('Hidden body .skiptranslate'); // 로그 추가
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
  // console.log('loadGoogleTranslate called'); // 로그 추가
  if (document.getElementById('google-translate-script')) {
    // console.log('Google Translate script already exists.'); // 로그 추가
    return
  }

  const script = document.createElement('script')
  script.id = 'google-translate-script'
  script.type = 'text/javascript'
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  script.onerror = (e) => {
    console.error('Google Translate script failed to load:', e) // 에러 로그 추가
    // 스크립트 로드 실패 시 사용자에게 메시지를 표시하는 등의 추가 처리를 할 수 있습니다.
  }
  document.head.appendChild(script)

  window.googleTranslateElementInit = () => {
    // console.log('googleTranslateElementInit callback fired.'); // 로그 추가
    // Google 객체가 완전히 준비될 때까지 조금 더 긴 지연 시간을 줍니다.
    setTimeout(() => {
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
        console.error(
          'window.google.translate.TranslateElement is not available after timeout. Retrying script load or initialization.',
        ) // 에러 로그 추가
        // 이 경우 스크립트 로드 또는 초기화를 다시 시도하거나 사용자에게 오류를 알릴 수 있습니다.
        // 현재는 콘솔 로그만 남기고 리턴합니다.
        return
      }
      try {
        // console.log('Attempting to create new google.translate.TranslateElement'); // 로그 추가
        new google.translate.TranslateElement(
          {
            pageLanguage: 'ko',
            includedLanguages: 'ko,en,vi', // 베트남어(vi) 추가
            layout: google.translate.TranslateElement.InlineLayout.DROPDOWN,
            autoDisplay: false,
          },
          'google_translate_element',
        )
        // console.log('google.translate.TranslateElement created successfully.'); // 로그 추가

        const targetNode = document.getElementById('google_translate_element')
        if (targetNode) {
          // console.log('#google_translate_element found. Setting up MutationObserver.'); // 로그 추가
          observer = new MutationObserver((mutationsList, obs) => {
            // console.log('MutationObserver callback fired.'); // 로그 추가
            for (const mutation of mutationsList) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const combo = targetNode.querySelector('.goog-te-combo')
                if (combo) {
                  // console.log('Google Translate combo box found via Observer!'); // 로그 추가
                  googleTranslateInitialized.value = true
                  obs.disconnect()
                  if (pendingLang.value) {
                    // console.log(`Triggering pending translation to: ${pendingLang.value}`); // 로그 추가
                    triggerGoogleTranslate(pendingLang.value)
                    pendingLang.value = null
                  } else {
                    // 초기 로드 시 현재 페이지 언어를 Google 번역 위젯에 설정
                    // (새로고침 시 한국어 유지)
                    // console.log(`Initial page load, ensuring translation to: ${currentLang.value}`); // 로그 추가
                    triggerGoogleTranslate(currentLang.value)
                  }
                  hideGoogleTranslateBar()
                  break
                } else {
                  // console.log('Mutation detected but combo box not found yet.'); // 로그 추가
                }
              }
            }
          })
          observer.observe(targetNode, { childList: true, subtree: true })
        } else {
          console.error('#google_translate_element not found for MutationObserver.') // 에러 로그 추가
        }

        if (!globalBarObserver) {
          // console.log('Setting up globalBarObserver on document.body.'); // 로그 추가
          globalBarObserver = new MutationObserver(hideGoogleTranslateBar)
          globalBarObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
          })
        }
      } catch (e) {
        console.error('Failed to initialize Google Translate Element in try-catch block:', e) // 에러 로그 추가
      }
    }, 500) // 지연 시간을 500ms로 증가 (기존 100ms)
  }
}

onMounted(() => {
  // console.log('LangSwitcher component mounted.'); // 로그 추가
  loadGoogleTranslate()
  setTimeout(hideGoogleTranslateBar, 200) // 초기 숨김 시도
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
  // console.log('toggleLangMenu called. Current showLangMenu:', showLangMenu.value); // 로그 추가
  showLangMenu.value = !showLangMenu.value
}

const triggerGoogleTranslate = (lang) => {
  if (
    window.google &&
    window.google.translate &&
    window.google.translate.TranslateElement &&
    document.querySelector('.goog-te-combo')
  ) {
    // console.log('Google Translate API and combo box are ready.'); // 로그 추가
    const frame = document.querySelector('.goog-te-combo')
    if (frame) {
      // console.log(`Setting combo box value to ${lang} and dispatching change event.`); // 로그 추가
      frame.value = lang
      frame.dispatchEvent(new Event('change', { bubbles: true }))

      // 번역이 트리거된 직후에 숨김 함수를 여러 번 호출하여 확실히 숨김
      setTimeout(hideGoogleTranslateBar, 50)
      setTimeout(hideGoogleTranslateBar, 200)
      setTimeout(hideGoogleTranslateBar, 500)

      if (triggerTimeout) {
        clearTimeout(triggerTimeout)
        triggerTimeout = null
      }
    } else {
      // frame이 null인 경우, 즉 .goog-te-combo를 찾지 못한 경우 재시도
      // console.warn('Google Translate combo box not found during direct trigger attempt. Retrying...'); // 경고 로그 추가
      if (triggerTimeout) {
        clearTimeout(triggerTimeout)
      }
      triggerTimeout = setTimeout(() => triggerGoogleTranslate(lang), 100)
    }
  } else {
    // API가 아직 준비되지 않은 경우 재시도
    // console.warn('Google Translate API or combo box not ready. Retrying in 100ms...'); // 경고 로그 추가
    if (triggerTimeout) {
      clearTimeout(triggerTimeout)
    }
    triggerTimeout = setTimeout(() => triggerGoogleTranslate(lang), 100)
  }
}

const selectLang = (lang) => {
  // console.log(`selectLang called for: ${lang}`); // 로그 추가
  currentLang.value = lang
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

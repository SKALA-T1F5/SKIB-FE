import { createI18n } from 'vue-i18n'

const messages = {
  ko: {
    greeting: '안녕하세요! 궁금한 점이 있으면 언제든 질문해 주세요 :)',
    submit: '제출',
    prev: '이전 문제',
    next: '다음 문제',
    exit: '나가기',
    welcome: '{userName} 매니저님, 반갑습니다!',
    // ...추가 번역
  },
  en: {
    greeting: 'Hello! Feel free to ask any questions :)',
    submit: 'Submit',
    prev: 'Previous',
    next: 'Next',
    exit: 'Exit',
    welcome: 'Welcome, Manager {userName}!',
    // ...more translations
  },
}

const i18n = createI18n({
  legacy: false, // Composition API 사용 시 false
  locale: 'ko', // 기본 언어
  fallbackLocale: 'en',
  messages,
})

export default i18n

import { createI18n } from 'vue-i18n'
import ko from './ko.json'
import en from './en.json'

const messages = {
  ko,
  en
}

const i18n = createI18n({
  legacy: false, // Composition API 사용 시 false
  locale: 'ko', // 기본 언어
  fallbackLocale: 'en',
  messages,
})

export default i18n

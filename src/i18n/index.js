import { createI18n } from 'vue-i18n'

const messages = {
  ko: {
    main_welcome: '{userName} 매니저님, 반갑습니다!',
    main_alert: '해당 조건에 일치하는 테스트가 없습니다.',
    main_addTest: '+ 테스트 추가',
    main_searchPlaceHolder: '테스트 이름을 검색하세요...',

    addTestDesc: '테스트 초대 링크를 입력하고 언어를 선택하세요.',
    inviteLink: '초대 링크',
    selectLanguage: '언어 선택',

  },
  en: {
    main_welcome: 'Welcome, Manager {userName}!',
    main_alert: 'No test exist.',
    main_addTest: '+ Add Test',


    addTestDesc: 'Enter the test invitation link and select a language.',
    inviteLink: 'Invitation Link',
    selectLanguage: 'Select Language',

  },
}

const i18n = createI18n({
  legacy: false, // Composition API 사용 시 false
  locale: 'ko', // 기본 언어
  fallbackLocale: 'en',
  messages,
})

export default i18n

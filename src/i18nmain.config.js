/* eslint-disable no-undef */
import i18n from 'i18next'
import backend from 'i18next-fs-backend'
import LanguageDetector from 'i18next-electron-language-detector'
import path from 'path'

i18n
  .use(LanguageDetector)
  .use(backend)
  .init({
    backend: {
      loadPath: path.join(__static, './locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__static, './locales/{{lng}}/{{ns}}.missing.json')
    },
    debug: false,
    namespace: 'translation',
    saveMissing: true,
    saveMissingTo: 'current',
    cleanCode: true,
    fallbackLng: 'en'
  })

export default i18n

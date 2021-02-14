import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import backend from 'i18next-electron-fs-backend'

i18n
  .use(LanguageDetector)
  .use(backend)
  .init({
    detection: {
      order: ['navigator']
    },
    initImmediate: false,
    backend: {
      loadPath: window.electron.localePath(),
      addPath: window.electron.localeMissingPath(),
      ipcRenderer: window.api.i18nextElectronBackend
    },
    debug: process.env.NODE_ENV !== 'production',
    namespace: 'translation',
    cleanCode: true,
    saveMissing: true,
    fallbackLng: 'en',
    saveMissingTo: 'current'
  })

window.api.i18nextElectronBackend.onLanguageChange((args) => {
  console.log(args)
  i18n.changeLanguage(args.lng, (error, t) => {
    if (error) {
      window.log.info(error)
    }
  })
})

export default i18n

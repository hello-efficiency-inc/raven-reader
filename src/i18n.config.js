import i18n from 'i18next'
import backend from 'i18next-electron-fs-backend'
i18n
  .use(backend)
  .init({
    backend: {
      loadPath: './src/locales/{{lng}}/{{ns}}.json',
      addPath: './src/locales/{{lng}}/{{ns}}.missing.json',
      ipcRenderer: window.api.i18nextElectronBackend
    },
    debug: true,
    saveMissing: true,
    fallbackLng: 'en',
    saveMissingTo: 'current',
    lng: window.electron.currentLocale()
  })

window.api.i18nextElectronBackend.onLanguageChange((args) => {
  i18n.changeLanguage(args.lng, (error, t) => {
    if (error) {
      window.log.info(error)
    }
  })
})

export default i18n

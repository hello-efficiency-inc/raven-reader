export default {
  methods: {
    toggleBodyClass (addClass, className) {
      const el = document.body
      if (addClass) {
        el.classList.add(className)
      } else {
        el.classList.remove(className)
      }
    },
    setTheme (themeValue) {
      switch (themeValue) {
        case 'night':
          this.toggleBodyClass(true, 'app-nightmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
          this.toggleBodyClass(false, 'app-darkmode')
          break
        case 'dark':
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
          this.toggleBodyClass(true, 'app-darkmode')
          break
        case 'sunset':
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(false, 'app-darkmode')
          this.toggleBodyClass(true, 'app-sunsetmode')
          break
        case 'system':
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(window.electronstore.getIsDarkMode('isDarkMode'), 'app-darkmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
          break
        case null:
          this.toggleBodyClass(false, 'app-nightmode')
          this.toggleBodyClass(false, 'app-darkmode')
          this.toggleBodyClass(false, 'app-sunsetmode')
      }
    }
  }
}

export default {
  methods: {
    cleanupContent (content) {
      const dom = new DOMParser()
      const doc = dom.parseFromString(content, 'text/html')
      doc.querySelectorAll('.enclosure').forEach(item => item.remove())
      doc.querySelectorAll('audio').forEach(item => item.remove())
      doc.querySelectorAll('a').forEach(item => item.classList.add('js-external-link'))
      if (this.$store.state.Setting.disableImages) {
        doc.querySelectorAll('img').forEach(item => {
          item.remove()
        })
      } else {
        doc.querySelectorAll('img').forEach(item => {
          item.classList.add('img-fluid')
        })
      }
      doc.querySelectorAll('iframe').forEach(item => {
        item.parentElement.classList.add('embed-responsive', 'embed-responsive-16by9')
      })
      if (doc.documentElement.textContent.trim().startsWith('Ads from Inoreader')) {
        doc.body.firstChild.remove()
      }
      return doc.documentElement.innerHTML
    }
  }
}

export default {
  methods: {
    cleanupContent (content) {
      const dom = new DOMParser()
      const doc = dom.parseFromString(content, 'text/html')
      const links = doc.querySelectorAll('a')
      const enclosures = doc.querySelectorAll('.enclosure')
      const iframes = doc.querySelectorAll('iframe')
      const img = doc.querySelectorAll('img')
      const audios = doc.querySelectorAll('audio')
      enclosures.forEach(item => item.remove())
      audios.forEach(item => item.remove())
      links.forEach(item => item.classList.add('js-external-link'))
      img.forEach(item => {
        item.classList.add('img-fluid')
      })
      iframes.forEach(item => {
        item.parentElement.classList.add('embed-responsive', 'embed-responsive-16by9')
      })
      if (doc.documentElement.textContent.trim().startsWith('Ads from Inoreader')) {
        doc.body.firstChild.remove()
      }
      return doc.documentElement.innerHTML
    }
  }
}

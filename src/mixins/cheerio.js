import cheerio from 'cheerio'

export default {
  methods: {
    cleanupContent (content) {
      const $ = cheerio.load(content)
      $('a').addClass('js-external-link')
      $('img').addClass('img-fluid')
      $('iframe')
        .parent()
        .addClass('embed-responsive embed-responsive-16by9')
      return $.text().trim() === '' ? null : $.html()
    }
  }
}

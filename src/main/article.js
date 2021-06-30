import Mercury from '@postlight/mercury-parser'
import cheerio from 'cheerio'
import fetch from 'node-fetch'

async function decodeFetchResponse (response, isHTML = false) {
  const CHARSET_RE = /charset=([^()<>@,;:\\"/[\]?.=\s]*)/i
  const buffer = await response.arrayBuffer()
  let ctype = response.headers.has('content-type') && response.headers.get('content-type')
  let charset = (ctype && CHARSET_RE.test(ctype)) ? CHARSET_RE.exec(ctype)[1] : undefined
  let content = (new TextDecoder(charset)).decode(buffer)
  const document = cheerio.load(content)
  if (typeof charset === typeof undefined) {
    charset = document.querySelector('meta[charset]') !== null ? document.querySelector('meta[charset]').getAttribute('charset').toLowerCase() : null
    if (!charset) {
      ctype = document.querySelector("meta[http-equiv='Content-Type']") !== null ? document.querySelector("meta[http-equiv='Content-Type']").getAttribute('content') : null
      charset = ctype && CHARSET_RE.test(ctype) && CHARSET_RE.exec(ctype)[1].toLowerCase()
    }
    if (charset && charset !== 'utf-8' && charset !== 'utf8') {
      content = (new TextDecoder(charset)).decode(buffer)
    }
  }
  return content
}

export async function parseArticle (url) {
  const res = await fetch(url)
  const content = await decodeFetchResponse(res)
  const result = await Mercury.parse(url, {
    html: content
  })
  return result
}

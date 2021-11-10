import Mercury from '@postlight/mercury-parser'

const domParser = new DOMParser()

async function decodeFetchResponse (response, isHTML = false) {
  const CHARSET_RE = /charset=([^()<>@,;:\\"/[\]?.=\s]*)/i
  const buffer = await response.arrayBuffer()
  let ctype = response.headers.has('content-type') && response.headers.get('content-type')
  let charset = (ctype && CHARSET_RE.test(ctype)) ? CHARSET_RE.exec(ctype)[1] : undefined
  let content = Buffer.from(buffer, charset);
  if (charset === undefined) {
    const dom = domParser.parseFromString(content, 'text/html')
    //console.log(dom);
    charset = dom.querySelector('meta[charset]')?.getAttribute('charset')?.toLowerCase()
    if (!charset) {
      ctype = dom.querySelector("meta[http-equiv='Content-Type']")?.getAttribute('content')
      charset = ctype && CHARSET_RE.test(ctype) && CHARSET_RE.exec(ctype)[1].toLowerCase()
    }
    if (charset && charset !== 'utf-8' && charset !== 'utf8') {
      content = Buffer.from(buffer, charset);
    }
  }
  return content
}

export async function parseArticle (url) {
  const res = await fetch(url)
  const content = await decodeFetchResponse(res)
  const result = await Mercury.parse(url, {
    html: Buffer.from(content, 'utf-8')
  })
  return result
}

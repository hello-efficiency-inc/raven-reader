import Mercury from '@postlight/mercury-parser'

export async function parseArticle (url) {
  const result = await Mercury.parse(url)
  return result
}

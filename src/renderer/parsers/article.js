// import axios from 'axios'
import got from 'got'
import { MERCURY_API_TOKEN } from '../config'

const apiUri = 'https://mercury.postlight.com/parser'

export async function parseArticle (url) {
  const result = await got(`${apiUri}?url=${url}`, {
    method: 'GET',
    retry: 0,
    json: true,
    throwHttpErrors: false,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': MERCURY_API_TOKEN
    }
  })
  return result
}

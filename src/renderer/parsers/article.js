import axios from 'axios'
import { MERCURY_API_TOKEN } from '../config'

const apiUri = 'https://mercury.postlight.com/parser'

export async function parseArticle (url) {
  const result = await axios.get(apiUri, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': MERCURY_API_TOKEN
    },
    params: {
      url: url
    }
  })
  return result
}

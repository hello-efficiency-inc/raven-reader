import { INOREADER_CLIENT_ID, INOREADER_CLIENT_SECRET } from '../config'
import qs from 'qs'
import axios from 'axios'

const INOREADER_AUTHORIZATION_URL = 'https://www.inoreader.com/oauth2/auth'
const INOREADER_TOKEN_URL = 'https://www.inoreader.com/oauth2/token'
const cryptObj = window.crypto

export default {
  guid () {
    const buf = new Uint16Array(8)
    cryptObj.getRandomValues(buf)
    function s4 (num) {
      let ret = num.toString(16)
      while (ret.length < 4) {
        ret = '0' + ret
      }
      return ret
    }
    return s4(buf[0]) + s4(buf[1]) + '-' + s4(buf[2]) + '-' + s4(buf[3]) + '-' + s4(buf[4]) + '-' + s4(buf[5]) + s4(buf[6]) + s4(buf[7])
  },
  buildAuthUrl (provider) {
    const authUrl = INOREADER_AUTHORIZATION_URL
    const urlParams = {
      response_type: 'code',
      redirect_uri: 'https://127.0.0.1/',
      client_id: INOREADER_CLIENT_ID,
      client_secret: INOREADER_CLIENT_SECRET,
      state: this.guid(),
      scope: 'read'
    }
    return `${authUrl}?${qs.stringify(urlParams)}`
  },
  async fetchToken (code) {
    const tokenUrl = INOREADER_TOKEN_URL
    const response = await axios.post(tokenUrl, qs.stringify({
      code,
      client_id: INOREADER_CLIENT_ID,
      client_secret: INOREADER_CLIENT_SECRET,
      redirect_uri: 'https://127.0.0.1/',
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  }
}

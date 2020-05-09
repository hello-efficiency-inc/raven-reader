import { POCKET_MAC_KEY, POCKET_WINDOWS_KEY, POCKET_LINUX_KEY } from '../config'
import qs from 'qs'
import os from 'os'

const POCKET_AUTHORIZATION_URL = 'https://getpocket.com/v3/oauth/request'
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
  buildPocketAuthUrl () {
    var consumerKey

    if (os.platform() === 'darwin') {
      consumerKey = POCKET_MAC_KEY
    }

    if (os.platform() === 'win32') {
      consumerKey = POCKET_WINDOWS_KEY
    }

    if (os.platform() === 'linux') {
      consumerKey = POCKET_LINUX_KEY
    }

    const authUrl = POCKET_AUTHORIZATION_URL
    const urlParams = {
      consumer_key: consumerKey,
      redirect_uri: 'https://127.0.0.1/',
      state: this.guid()
    }
    return `${authUrl}?${qs.stringify(urlParams)}`
  }
}

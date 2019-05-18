exports.app = null
exports.browser = null
exports.setApp = app => {
  this.app = app
  this.browser = app.client
}

exports.findElem = selector => this.browser.$(selector)
exports.findElems = selector => this.browser.$$(selector)

exports.hasClass = async (getElemFn, theClass) => {
  const classes = await getElemFn().getAttribute('class')
  return classes.includes(theClass)  
}

exports.click = async getElemFn => await getElemFn().click()

exports.isActive = getElemFn => this.hasClass(getElemFn, 'active')

exports.waitUntilActive = async (getElemFn, failSettingActiveAfter) => await this.browser.waitUntil(
  async () => Promise.resolve(await this.isActive(getElemFn)),  
  failSettingActiveAfter, 
  'Failed gettig active!'
)

exports.waitUntilNotActive = async (getElemFn, failSettingInactiveAfter) => await this.browser.waitUntil(
  async () => Promise.resolve(!await this.isActive(getElemFn)), 
  failSettingInactiveAfter,
  'Failed gettig not active!'
)

exports.waitUntilElemsAreLoaded = async (selector, failLoadingAfter) => await this.browser.waitUntil(
  async () => {
    const elems = await this.findElems(selector)
    return Promise.resolve(elems.length > 0)
  },
  failLoadingAfter,
  'Failed loading elements!'
)

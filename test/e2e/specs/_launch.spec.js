import utils from '../utils'

describe('General tests', function() {
  it('open exactly one window', function () {
    utils.waitUntilWindowLoaded().getWindowCount().should.eventually.equal(1)
  })
})

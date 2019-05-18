import utils from './utils'

describe('ROOT SUITE', function () {

  this.timeout(120000)

  before(async function(){    
    await utils.before()    
  })

  // Require specs to consume
  require('require-dir')('./specs')

  after(async function(){
    await utils.after()
  })  
})

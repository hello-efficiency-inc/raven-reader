'use strict'

// Set BABEL_ENV to use proper env config
process.env.BABEL_ENV = 'test'

// Enable use of ES6+ on required files
require('babel-register')({
  ignore: /node_modules/
})

// Attach Chai APIs to global scope
// According https://www.wintellect.com/end-end-testing-electron-apps-spectron/
// According to https://www.npmjs.com/package/chai-as-promised
const chai = require('chai');
global.expect = chai.expect
global.should = chai.should
global.assert = chai.assert
// NOTE!
// We are using chai-as-promised here (https://www.npmjs.com/package/chai-as-promised)!
// chai-as-promised extends/modifies the tested promises e.g. using should/expect Interface!
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

// Require the root spec to be able to make hooks before all suites and
// after all suites
require('./root-suite.spec.js')

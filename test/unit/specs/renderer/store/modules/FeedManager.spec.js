import FeedManager from '../../../../../../src/renderer/store/modules/FeedManager'

const chai = require('chai')
const spies = require('chai-spies')
const expect = chai.expect
chai.use(spies)

const mutations = FeedManager.mutations
const actions = FeedManager.actions
const getters = FeedManager.getters
const state = {
  activeFeedId: null,
  activeArticleId: null,
  isFeedIdValid: false,
  isArticleIdValid: false
}

describe('Feed Manager', function () {
  describe('mutations', function () {
    it('mutates feed id when setting active feed', function () {
      mutations.SET_ACTIVE_FEED_ID(state, 4)
      expect(state.activeFeedId).to.be.equal(4)
    })

    it('mutates article id when setting active article', function () {
      mutations.SET_ACTIVE_ARTICLE_ID(state, 5)
      expect(state.activeArticleId).to.be.equal(5)
    })
  })

  describe('getters', function () {
    it('gets active feed id', function () {
      state.activeFeedId = 8
      expect(getters.activeFeedId(state)).to.be.equal(8)
    })

    it('gets active article id', function () {
      state.activeArticleId = 9
      expect(getters.activeArticleId(state)).to.be.equal(9)
    })
  })

  describe('actions', function () {
    it('commits setting of active feed id', function () {
      const commit = chai.spy()
      actions.setActiveFeedId({ commit }, { id: 8 })
      expect(commit).to.have.been.called.with('SET_ACTIVE_FEED_ID', 8)
    })

    it('commits setting of active article id', function () {
      const commit = chai.spy()
      actions.setActiveArticleId({ commit }, { id: 5 })
      expect(commit).to.have.been.called.with('SET_ACTIVE_ARTICLE_ID', 5)
    })
  })
})

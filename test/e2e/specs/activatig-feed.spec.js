import utils from '../utils'
import { fail } from 'assert';

describe('Activating and deactivating feeds', function() {

  const { setApp, findElem, click, waitUntilActive, waitUntilNotActive, waitUntilElemsAreLoaded } = require('../actions')  

  // Maximum time. When it exceeded we assume a failure.
  const failLoadingFeedsAfter = 5000
  const failLoadingArticlesAfter = 30000
  const failSettingActiveAfter = 1000

  const getAFeed = () => findElem('[mark=feed]:nth-child(2)')
  const getAnotherFeed = () => findElem('[mark=feed]:nth-child(3)')
  const getAnArticle = () => findElem('[mark=article]:nth-child(2)')    
  const getAnotherArticle = () => findElem('[mark=article]:nth-child(3)')

  const waitUntilFeedsAreLoaded = () => waitUntilElemsAreLoaded('[mark=feed]', failLoadingFeedsAfter)
  const waitUntilArticlesAreLoaded = () => waitUntilElemsAreLoaded('[mark=article]', failLoadingArticlesAfter)  

  const getAllFeedsFeedMix = () => findElem('[mark=allFeeds]')
  const getRecentlyReadFeedMix = () => findElem('[mark=recentlyRead]')

  const testFeedMix = async feedMark => {
    const elem = () => findElem('[mark='+ feedMark +']')
    await click(elem)
    await waitUntilActive(elem)
    await waitUntilArticlesAreLoaded()

    const anArticle = getAnArticle
    await click(anArticle)
    await waitUntilActive(anArticle)
  }

  before(async function () {
    setApp(utils.app)    
    await waitUntilFeedsAreLoaded()
  })

  describe('testing feeds', function () {
        
    it('activates clicked feed', async function () {
      try{
        const aFeed = getAFeed
        await click(aFeed)
        await waitUntilActive(aFeed, failSettingActiveAfter)      
      } catch (e) {
        fail(e)
      }
    })
  
    it('activates clicked article', async function () {
      try{
        const aFeed = getAFeed
        await click(aFeed)
        await waitUntilArticlesAreLoaded()
        const anArticle = getAnArticle
        await click(anArticle)
        await waitUntilActive(anArticle)
      } catch (e) {
        fail(e)
      }
    })
  
    it('deactivates prev clicked feed', async function () {
      try{
        const feedOne = getAFeed
        const feedTwo = getAnotherFeed
    
        await click(feedOne)
        await waitUntilActive(feedOne)
    
        await click(feedTwo)
        await waitUntilActive(feedTwo)
        await waitUntilNotActive(feedOne)
      } catch (e) {
        fail(e)
      }
    })
  
    it('deactivates prev clicked article', async function () {
      try{
        const aFeed = getAFeed
        await click(aFeed)
        await waitUntilArticlesAreLoaded()
            
        const articleOne = getAnArticle
        const articleTwo = getAnotherArticle
        
        click(articleOne)
        await waitUntilActive(articleOne)
    
        click(articleTwo)
        await waitUntilActive(articleTwo)
        await waitUntilNotActive(articleOne)    
      } catch (e) {
        fail(e)
      }
    })
  })

  describe('testing feed mixes', function () {
    it('activates "All Feeds" and the articles inside', async function() {      
      try {
        await testFeedMix('allFeeds')
      } catch (e) {
        fail(e)
      }      
    })

    it('activates "Favourites" and the articles inside', async function() {
      try {
        await testFeedMix('favourites')
      } catch (e) {
        fail(e)
      }      
    })

    it('activates "Unread Articles"', async function() {
      try {
        const elem = () => findElem('[mark=unreadArticles]')
        await click(elem)
        await waitUntilActive(elem)
        await waitUntilArticlesAreLoaded()    
      } catch (e) {
        fail(e)
      }  
    })
  
    it('activates "Recently Read" and the articles inside', async function() {
      try {
        await testFeedMix('recentlyRead')
      } catch (e) {
        fail(e)
      }      
    })
  
    it('activates "Saved articles" and the articles inside', async function() {
      try {
        await testFeedMix('savedArticles')
      } catch (e) {
        fail(e)
      }      
    })
  
    it('deactivates prev clicked feed mix', async function () {
      try {
        const feedMixOne = getAllFeedsFeedMix
        const feedMixTwo = getRecentlyReadFeedMix
    
        await click(feedMixOne)
        await waitUntilActive(feedMixOne)
    
        await click(feedMixTwo)
        await waitUntilActive(feedMixTwo)
        await waitUntilNotActive(feedMixOne)
      } catch (e) {
        fail (e)
      }
    })
  })

})

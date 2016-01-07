import got from 'got'
import feed from './feed.js'
import service from './services.js'
import store from '../store.js'
import jetpack from 'fs-jetpack'
const app = require('remote').require('app')
const useDataDirStream = jetpack.cwd(app.getPath("userData") + '/streams/')
const randomstring = require("randomstring")

const {
  incrementCount,
  addArticles
} = store.actions


export default {
  refreshfeed(title){
    var self = this;
    return new Promise(function(resolve,reject){
      if(title === "All Articles"){
        service.fetchFeeds()
        .then(function(feeds){
          setTimeout(function(){
            self.processFeed(feeds)
            console.log("Added new articles");
            resolve("Done");
          },10000);
        });
      } else {
        service.fetchSpecific(title)
        .then(function(feeds){
          setTimeout(function(){
            self.processFeed(feeds)
            console.log("Added new articles");
            resolve("Done");
          },10000);
        });
      }
    });
  },
  processFeed(feeds){
    feeds.forEach(function(item,index){

      var favicon = item.favicon;
      var title = item.title;
      var count = item.count;

      // Fetch New Articles
      feed.fetchNewArticles(item.url)
      .then(function(data){
        var newArticles = data.articles

        // Get existing articles
        service.fetchArticles()
        .then(function(articles){
          var oldArticles = articles;

          //   Process each new article
          newArticles.forEach(function(newItem){
            if(_.where(oldArticles,{ title: newItem.title }).length == 0){
              console.log("Added " + newItem.title);
              var html_filename = randomstring.generate() + '.html';
              newItem.feed = title;
              newItem.file = html_filename;
              newItem.read = false;
              newItem.favicon = favicon;
              got.stream(newItem.link).pipe(useDataDirStream.createWriteStream(html_filename))
              // Add article
              addArticles(newItem)
              // Update count
              incrementCount(item.title)
              // Update Feed Count
              service.updateFeedCount(item._id,count++)
            } else {
              console.log("not added");
            }
          });
        });
      })
    });
  }
}

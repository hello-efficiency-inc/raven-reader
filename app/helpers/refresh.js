import got from 'got'
import feed from './feed.js'
import queue from './queue.js'
import service from './services.js'
import store from '../store.js'
import jetpack from 'fs-jetpack'
import online from 'is-online'
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
          var timeout = 1000 * feeds.length;
          setTimeout(function(){
            self.processFeed(feeds)
            console.log("Added new articles");
            resolve("Done");
          },timeout);
        });
      } else {
        service.fetchSpecific(title)
        .then(function(feeds){
          var timeout = 1000 * feeds.length;
          setTimeout(function(){
            self.processFeed(feeds)
            console.log("Added new articles");
            resolve("Done");
          },timeout);
        });
      }
    });
  },
  processFeed(feeds){
    feeds.forEach(function(item,index){

      var favicon = item.favicon;
      var title = item.title;
      var id = item._id;

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
              var html_filename = queue.queueTask('html',newItem.link)
              newItem.feed = title;
              newItem.feed_id = id;
              newItem.file = html_filename;
              newItem.read = false;
              newItem.favicon = favicon;
              // Add article
              addArticles(newItem)
              // Update count
              incrementCount(id)
            } else {
              console.log("not added");
            }
          });
        });
      })
    });
  }
}

const DB = require('../db.js')
var db = new DB(window.env)
var connect = db.init()
var article = connect.article
var tag = connect.tag
var feed = connect.feed

export default {

  addFeed(feed_data,callback){
    feed.insert(feed_data,function(err,docs){
      return callback(docs)
    })
  },
  addArticles(article_data,callback){
    article.insert(article_data,function(err,docs){
      return callback(docs)
    })
  },
  checkFeed(feed_name,callback){
    feed.count({ title: feed_name }, function (err, count) {
        return callback(count)
    });

  },
  fetchFeeds(){
    return new Promise((resolve,reject) => {
      feed.find({},function(err,docs){
        resolve(docs)
      })
    })
  },
  fetchArticles(){
    return new Promise((resolve,reject) => {
      article.find({}).sort({ feed: 1 }).exec(function(err,docs){
        resolve(docs)
      })
    })
  },
  fetchOne(id){
    return new Promise(function(resolve, reject) {
      article.findOne({_id: id},function(err,doc){
        return resolve(doc);
      })
    });
  },
  markRead(id){
    article.update({ _id: id },{ $set: { read: true } },function(err,num){

    })
  },
  markUnread(id){
    article.update({ _id: id },{ $set: { read: false } },function(err,num){

    })
  },
  updateFeedCount(id,count){
    feed.update({ _id: id },{ $set: { count: count } },function(err,num){

    })
  }

}

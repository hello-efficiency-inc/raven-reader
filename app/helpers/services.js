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
  fetchSpecific(title){
    return new Promise((resolve,reject) => {
      feed.find({title: title},function(err,docs){
        resolve(docs)
      })
    })
  },
  fetchArticles(){
    return new Promise((resolve,reject) => {
      article.find({}).sort({ pubDate: -1 }).exec(function(err,docs){
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
  fetchTags(){
    return new Promise((resolve,reject) => {
      tag.find({}).sort({ id : 1 }).exec(function(err,docs){
        resolve(docs)
      })
    });
  },
  addTag(value,callback){
    _.mixin({
      'findByValues': function(collection, property, values) {
        return _.filter(collection, function(item) {
          return _.contains(values, item[property]);
        });
      }
    });

    tag.find({},function(err,docs){

      // Tags already exists
      if(docs.length > 0){

        var current_text = _.pluck(docs,'text')
        var exists = _.findByValues(docs,"text",value)
        var result = _.remove(value, function(n) {
          return current_text.indexOf(n) < 0
        })

        //check rejected result
        if(result.length > 0){

          var tags = result.map(function(obj,index){
            var id = (_.last(_.sortBy(docs,'id')).id + index) + 1

            var newObj = {
              id : id,
              text : obj
            }
            return newObj
          })

          tag.insert(tags,function(err,newdocs){
            newdocs.forEach(function(item){
              exists.push(item)
            })
            return callback(exists)
          })

        } else {

          // Tag already exists

          tag.find({ text: { $in: value }}, function (err, docs) {
            return callback(docs)
          });

        }

      } else {

        //If there is no tags in database

        var value_tags = value.map(function(obj,index){
          var newObj = {
            id : index + 1,
            text : obj
          }
          return newObj
        })

        tag.insert(value_tags,function(err,docs){
          return callback(docs)
        })

      }

    })
  },
  updateTag(value,id){
    article.update({_id : id},{ $set: { tags : value} },function(err,num){

    })
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
  },
  deleteArticle(id){
    article.remove({ _id: id }, {}, function (err, numRemoved) {

    });
  },
  deleteFeed(title){
    feed.remove({ _id: title },{}, function(err, num){

    });
  },
  deleteTag(id){
    tag.remove({  _id: id },{}, function(err, num){

    });
  }
}

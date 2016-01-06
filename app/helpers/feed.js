import got from 'got'
import cheerio from 'cheerio'
import striptags from 'striptags'
import string from 'underscore.string'
import he from 'he'
import service from './services.js'
var urlUtil = require('url')
var iconv = require('iconv-lite')
var feedParser = require('feedParser')
var Stream = require('stream')
var moment = require('moment')

export default{

  feedParser(body){
    // Parse Feed
    var parseFeed = function(body){
      var meta;
      var articles = [];

      var s = new Stream();
      s.readable = true;

      s.pipe(new feedParser())
      .on('meta',function(m){
        meta = m;
      })
      .on('readable',function(){
        var stream = this;
        var item = stream.read();
        while(item){
          articles.push(item);
          item = stream.read();
        }
      })

      s.emit('data',body)
      s.emit('end')

      return {

        meta : {
          title: meta.title,
          description: meta.description,
          link: meta.link,
          favicon: meta.favicon,
          url: meta.xmlUrl
        },
        articles: articles.map(function(item){
          return {
            author : item.author,
            tags : null,
            source: item.source,
            title : he.decode(item.title),
            summary : string.prune(he.decode(striptags(item.summary)),120),
            guid : item.guid,
            link : item.origlink ? item.origlink : item.link,
            pubDate : moment(item.pubDate).format("MMMM Do YYYY")
          }
        })
      }
    }

    var normalizeEncoding = function(bodyBuf){

      var body = bodyBuf.toString();
      var encoding;

      var xmlDeclaration = body.match(/^<\?xml .*\?>/);
      if(xmlDeclaration) {
        var encodingDeclaration = xmlDeclaration[0].match(/encoding=("|').*?("|')/);
        if(encodingDeclaration){
          encoding = encodingDeclaration[0].substring(10,encodingDeclaration[0].length - 1);
        }
      }

      if(encoding && encoding.toLowerCase() !== 'utf-8'){
        try{
          body = iconv.decode(bodyBuf, encoding);
        } catch (err) {

        }
      }

      return body;
    }

    return new Promise((resolve,reject) => {
      resolve(parseFeed(normalizeEncoding(body)));
    })

  },
  fetchFeed(url){

    var self = this;

    // Find feed url inside html
    var findFeedUrlInHtml = function(body,url){
      var dom = cheerio.load(body);
      var href= dom('link[type="application/rss+xml"]').attr('href');
      if(!href){
        href = dom('link[type="application/atom+xml"]').attr('href');
      }
      if(href){
        if(!href.match(/^http/)){
          href = urlUtil.resolve(url,href);
        }
        return href;
      }
      return null;
    }

    if(!url.match(/^http/)){
      url = 'http://' + url;
    }

    console.log('Fetching ' + url);

    var promise = new Promise(function(resolve,reject){
      got(url,(error,body,response) => {
        if(!error){
          self.feedParser(body)
          .then(function(data){
            resolve(data)
          },function(err){
            var url = findFeedUrlInHtml(body,url)
            if(url !== null){
              got(url,(error,body,response) => {
                if(!error){
                  self.feedParser(body)
                  .then(function(data){
                    resolve(data)
                  });
                }
              });
            } else {
              console.log("NO FEED FOUND")
              resolve(null)
            }
          });
        }
      });
    });

    return promise;

  },
  fetchNewArticles(url){
    var self = this;
    var promise = new Promise(function(resolve,reject){
      got(url,(error,body,response) => {
        if(!error){
          self.feedParser(body)
          .then(function(data){
            resolve(data)
          });
        }
      })
    });

    return promise;
  }
}

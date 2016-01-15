import got from 'got'
import cheerio from 'cheerio'
import striptags from 'striptags'
import string from 'underscore.string'
import he from 'he'
import store from '../store.js'
import service from './services.js'
var urlUtil = require('url')
var iconv = require('iconv-lite')
var feedParser = require('feedParser')
var Stream = require('stream')
var moment = require('moment')

export default{

  feedParser(body,url){
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

      var checkTitle = meta.title.indexOf("|");

      return {

        meta : {
          title: checkTitle > -1 ? meta.title.substring(0,checkTitle != -1 ? checkTitle : meta.title.length) : meta.title,
          description: meta.description,
          link: meta.link,
          favicon: meta.favicon,
          url: meta.xmlUrl ? meta.xmlUrl : url
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
            pubDate : moment(item.pubDate).format("X")
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
      console.log(url);
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

    var blacklisted = [
      'http://readwrite.com',
      'http://www.readwrite.com',
    ];

    var checkUrl = _.includes(blacklisted, url);

      var promise = new Promise(function(resolve,reject){

        if(store.state.offline && !checkUrl){

          console.log('Fetching ' + url);

          got(url,(error,body,response) => {

            var link = url;

            if(!error){
              self.feedParser(body,url)
              .then(function(data){
                resolve(data)
              },function(err){
                var url = findFeedUrlInHtml(body,link);
                if(url !== null){
                  got(url,(error,body,response) => {
                    if(!error){
                      self.feedParser(body,url)
                      .then(function(data){
                        resolve(data)
                      });
                    }
                  });
                } else {
                  resolve(null)
                }
              });
            }
          });
        }
        else {
          reject("blacklisted");
        }

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

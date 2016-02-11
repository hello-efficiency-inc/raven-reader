import builder from 'xmlbuilder'
import service from './services.js'
var fs = require('fs');

export default {


  exportFeed(fileName){

    service.fetchFeeds().then(function(data){
      var root = builder.create('opml',{
        version: '1.0',
        encoding:'UTF-8'
      });

      root
      .ele('head')
      .ele('title','Your RSS Subscriptions')

      var body = root.ele('body')

      data.forEach(function(feeddata){
        var element = body.ele('outline');
        element.att('text',feeddata.title || '');
        element.att('type','rss');
        element.att('xmlUrl',feeddata.url);
      })

      fs.writeFile(fileName,root.end({ pretty: true }));
    })

  }

}

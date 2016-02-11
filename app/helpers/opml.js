import builder from 'xmlbuilder'
import service from './services.js'

export default {


  exportFeed(){

    var passFeedAttributes = fucntion(element,feed){
      element.att('text',feed.title || '');
      element.att('type','rss');
      element.att('xmlUrl',feed.url);
    }

    var root = builder.create('opml',(
      version: '1.0',
      encoding: 'UTF-8'
    ));

    root
    .ele('head')
    .ele('title','Your RSS Subscriptions');

    var body = root.ele('body');

    service.fetchFeeds().then(function(data){
      data.forEach(function(feeddata){
        passFeedAttributes(body.ele('outline'),feeddata)
      })
    });

    return root.end({ pretty: true });
  }
  
}

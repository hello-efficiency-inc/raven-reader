import cheerio from 'cheerio'
import got from 'got'
var request = require('xhr-request')
var urlUtil = require('url')
var imageType = require('image-type');
var bufferToArrayBuffer = require('buffer-to-arraybuffer');

export default {

  fetchIcon(url){

    var findFaviconHTML = function(url,body){
      var dom = cheerio.load(body);
      var href = dom('link[rel="icon"], link[rel="shortcut icon"], link[rel="Shortcut Icon"]').last().attr('href');
      if (href && !href.match(/^http/)) {
        // Is relative URL, so make it absolute.
        href = urlUtil.resolve(url, href);
      }
      return href;
    }

    var discoverImageType = function (buf) {
        if (buf.length < 5) {
            return null;
        }
        if (buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1) {
            return 'ico';
        }
        if (buf.slice(1, 4).toString() === 'PNG') {
            return 'png';
        }
        if (buf.slice(0, 3).toString() === 'GIF') {
            return 'gif';
        }
        return null;
    }

    console.log("Fetching favicon for " + url);

    var promise = new Promise(function(resolve,reject){
      got(url,{retries: 0},(error,body,response) => {
        if(!error){
          var faviconUrl = findFaviconHTML(url,body);
          if(faviconUrl){
            request(faviconUrl, {
              responseType: 'arraybuffer'
            }, function (err, data) {
              if (err) throw err
              var buf = new Buffer(new Uint8Array(data));
              var imageType = discoverImageType(buf);
              if(imageType){
                resolve({bytes: buf,format:imageType})
              }
            });
          } else {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      });
    });

    return promise;

  }

}

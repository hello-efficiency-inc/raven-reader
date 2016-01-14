import async from 'async'
import got from 'got'
import jetpack from 'fs-jetpack'
const app = require('remote').require('app')
const useDataDirFavicon = jetpack.cwd(app.getPath("userData") + '/favicons/')
const useDataDirStream = jetpack.cwd(app.getPath("userData") + '/streams/')
const randomstring = require("randomstring")

export default {

  queueTask(task,item){

    // Store html

    var html = async.cargo(function(tasks,callback){

      tasks.forEach(function(item){
         got.stream(item.link).pipe(useDataDirStream.createWriteStream(item.filename))
      })

      callback();

    },10);

    // Write favicon
    var favicon = async.queue(function(tasks,callback){
      useDataDirFavicon.writeAsync(tasks.path,tasks.bytes);
      callback();
    },2);

    switch(task){
      case 'favicon':
        var path = useDataDirFavicon.path(randomstring.generate() + '.' + item.format);
        favicon.push({path: path,bytes: item.bytes},function(err){
          console.log("favicon saved");
        });
        return path;
      break;
      case 'html':
        var html_filename = randomstring.generate() + '.html';
        html.push({link: item,filename: html_filename},function(err){
          console.log("htmlfile is processed");
        });
        return html_filename;
      break;
    }

  }

}

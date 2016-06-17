import async from 'async'
import got from 'got'
import jetpack from 'fs-jetpack'
import { remote } from 'electron'
import randomstring from 'randomstring'
const useDataDirFavicon = jetpack.cwd(remote.app.getPath('userData') + '/favicons/')
const useDataDirStream = jetpack.cwd(remote.app.getPath('userData') + '/streams/')

export default {
  queueTask (task, item) {
    // Store html
    let html = async.cargo((tasks, callback) => {
      tasks.forEach(item => {
        got.stream(item.link).pipe(useDataDirStream.createWriteStream(item.filename))
      })
      callback()
    }, 10)

    // Write Favicon
    let favicon = async.queue((tasks, callback) => {
      useDataDirFavicon.writeAsync(tasks.path, tasks.bytes)
      callback()
    }, 2)

    if (task === 'favicon') {
      let path = useDataDirFavicon.path(randomstring.generate() + '.' + item.format)
      favicon.push({path: path, bytes: item.bytes}, err => {
        if (err) {}
        console.log('favicon saved')
      })
      return path
    }

    if (task === 'html') {
      let htmlFilename = randomstring.generate() + '.html'
      html.push({link: item, filename: htmlFilename}, err => {
        if (err) {}
        console.log('htmlfile is processed')
      })
      return htmlFilename
    }
  }
}

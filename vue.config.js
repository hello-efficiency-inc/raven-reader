module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        productName: 'Raven Reader',
        appId: 'org.helloefficiency.ravenreader',
        afterSign: 'notarize.js',
        asarUnpack: [
          './node_modules/node-notifier/vendor/**'
        ],
        dmg: {
          sign: false,
          contents: [{
            x: 410,
            y: 150,
            type: 'link',
            path: '/Applications'
          },
          {
            x: 130,
            y: 150,
            type: 'file'
          }
          ]
        },
        mac: {
          darkModeSupport: true,
          publish: [{
            provider: 'spaces',
            name: 'ridereceiptspro',
            region: 'sfo2',
            path: '/ravenreader'
          }],
          hardenedRuntime: true,
          gatekeeperAssess: false,
          target: [
            'dmg'
          ],
          icon: 'build/icons/icon.icns'
        },
        win: {
          publish: [{
            provider: 'spaces',
            name: 'ridereceiptspro',
            region: 'sfo2',
            path: '/ravenreader'
          }],
          icon: 'build/icons/icon.ico',
          certificateFile: 'windows2020.pfx',
          certificatePassword: 'hello!@#$%^'
        },
        linux: {
          publish: [{
            provider: 'spaces',
            name: 'ridereceiptspro',
            region: 'sfo2',
            path: '/ravenreader'
          }],
          category: 'News',
          icon: 'build/icons'
        }
      }
    }
  }
}

module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        productName: 'Raven Reader',
        appId: 'org.helloefficiency.ravenreader',
        afterSign: 'electron-builder-notarize',
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
          publish: [
            {
              provider: 'spaces',
              name: 'ridereceiptspro',
              region: 'sfo2',
              path: '/ravenreader'
            },
            'github'
          ],
          hardenedRuntime: true,
          entitlements: './node_modules/electron-builder-notarize/entitlements.mac.inherit.plist',
          gatekeeperAssess: false,
          target: [
            'dmg'
          ],
          icon: 'build/icons/icon.icns'
        },
        win: {
          publish: [
            {
              provider: 'spaces',
              name: 'ridereceiptspro',
              region: 'sfo2',
              path: '/ravenreader'
            },
            'github'
          ],
          target: [
            'nsis',
            'portable'
          ],
          icon: 'build/icons/icon.ico'
        },
        nsis: {
          oneClick: false
        },
        portable: {
          artifactName: 'Raven-${version}_portable.${ext}'
        },
        linux: {
          publish: [
            {
              provider: 'spaces',
              name: 'ridereceiptspro',
              region: 'sfo2',
              path: '/ravenreader'
            },
            'github'
          ],
          category: 'News',
          icon: 'build/icons'
        }
      }
    }
  }
}

/* global __static */
const {
  TouchBar,
  BrowserWindow,
  nativeImage
} = require('electron')

const {
  TouchBarButton,
  TouchBarSpacer
} = TouchBar

// Add subscription
const addSubscription = new TouchBarButton({
  label: 'Add Subscription',
  click: () => {
    const currentWindow = BrowserWindow.getFocusedWindow()
    currentWindow.webContents.send('Add subscription')
  }
})

const offline = nativeImage.createFromPath(require('path').join(__static, '/wifi-off.png'))
const offlineApp = new TouchBarButton({
  icon: offline,
  click: () => {
    const currentWindow = BrowserWindow.getFocusedWindow()
    currentWindow.webContents.send('Save offline')
  }
})

// Favourite button
const star = nativeImage.createFromPath(require('path').join(__static, '/star.png'))
const favourite = new TouchBarButton({
  icon: star,
  click: () => {
    const currentWindow = BrowserWindow.getFocusedWindow()
    currentWindow.webContents.send('Toggle favourite')
  }
})

const left = nativeImage.createFromPath(require('path').join(__static, '/arrow-left.png'))
const previousArticle = new TouchBarButton({
  icon: left,
  click: () => {
    const currentWindow = BrowserWindow.getFocusedWindow()
    currentWindow.webContents.send('Previous item')
  }
})

const right = nativeImage.createFromPath(require('path').join(__static, '/arrow-right.png'))
const nextArticle = new TouchBarButton({
  icon: right,
  click: () => {
    const currentWindow = BrowserWindow.getFocusedWindow()
    currentWindow.webContents.send('Next item')
  }
})

export const touchBar = new TouchBar({
  items: [
    addSubscription,
    new TouchBarSpacer({
      size: 'small'
    }),
    offlineApp,
    new TouchBarSpacer({
      size: 'small'
    }),
    favourite,
    new TouchBarSpacer({
      size: 'small'
    }),
    previousArticle,
    new TouchBarSpacer({
      size: 'small'
    }),
    nextArticle
  ]
})

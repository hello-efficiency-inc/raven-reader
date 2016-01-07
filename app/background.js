// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width: 1300,
  height: 760
});



app.on('ready', function () {

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: 1024,
    minHeight: 600,
    width: mainWindowState.width,
    height: mainWindowState.height,
    resizable:false
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  if (env.name === 'test') {
    mainWindow.loadUrl('file://' + __dirname + '/spec.html');
  } else {
    mainWindow.loadUrl('file://' + __dirname + '/app.html');
  }

  if (env.name !== 'production') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  // open url in default browser
  mainWindow.webContents.on("will-navigate", function (event, url) {
    if(!url.startsWith("file://")) {
      event.preventDefault();
      require("shell").openExternal(url);
    }
  });

  var template = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    }
  ];
  var Menu = require("menu");
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('close', function () {
    mainWindowState.saveState(mainWindow);
  });
});

app.commandLine.appendSwitch('--disable-http-cache');
app.on('window-all-closed', function () {
  app.quit();
});

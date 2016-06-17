electron-boilerplate-vue
==============
Comprehensive boilerplate application for [Electron runtime](http://electron.atom.io) and [Vue.js](http://vuejs.org). This project is based on [vue-templates/webpack](https://github.com/vuejs-templates/webpack) and the awesome work by @szwacz on [electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

**This README is a work in progress.** This version is a large departure from the previous iteration. If you're looking for the old version, see [this branch](https://github.com/bradstewart/electron-boilerplate-vue/tree/legacy).

Scope of this project:

- Provide basic structure of the application so you can much easier grasp what should go where.
- Give you cross-platform development environment, which works the same way on OSX, Windows and Linux.
- Build scripts for the application using .vue components for production and development with Hot Module Reload.
- Package scripts to generate executable files (.app, .exe).
- Test scripts for both unit and end-to-end testing.
- Generate ready for distribution installers of your app for all supported operating systems.

Note: Installer generation is currently NOT implemented. Once electron-builder stablizes, I will add that to the project. 


# Quick start
The only development dependency of this project is [Node.js](https://nodejs.org). So just make sure you have it installed.
Then type few commands known to every Node developer...
```
git clone https://github.com/bradstewart/electron-boilerplate-vue.git
cd electron-boilerplate-vue
npm install
npm start
```
... and boom! You have running desktop application on your screen.

# Structure of the project

There are **two** `package.json` files:  

#### 1. For development
Sits on path: `electron-boilerplate-vue/package.json`. Here you declare dependencies for your development environment and build scripts. **This file is not distributed with real application!**

Also here you declare the version of Electron runtime you want to use:
```json
"devDependencies": {
  "electron-prebuilt": "^0.34.0"
}
```

#### 2. For your application
Sits on path: `electron-boilerplate-vue/app/package.json`. This is **real** manifest of your application. Declare your app dependencies here.

#### OMG, but seriously why there are two `package.json`?
1. Native npm modules (those written in C, not JavaScript) need to be compiled, and here we have two different compilation targets for them. Those used in application need to be compiled against electron runtime, and all `devDependencies` need to be compiled against your locally installed node.js. Thanks to having two files this is trivial.
2. When you package the app for distribution there is no need to add up to size of the app with your `devDependencies`. Here those are always not included (because reside outside the `app` directory).

### Project's folders

- `app` - code of your application goes here.
- `static` - static files which are not processed by webpack.
- `build` - build scripts, configuration files, and resources.
- `dist` - webpacked and runnable Electron app.
- `releases` - ready for distribution installers and executables.
- `test` - test configuration, runners, and specs.


# Development

#### Installation

```
npm install
```
It will also download Electron runtime, and install dependencies for second `package.json` file inside `app` folder.

#### Starting the app

```
npm start
```

#### Adding pure-js npm modules to your app

Remember to add your dependency to `app/package.json` file, so do:
```
cd app
npm install name_of_npm_module --save
```


# Making a release

**Note:** There are various icon and bitmap files in the `build/resources` directory. Those are used in installers and are intended to be replaced by your own graphics.

To make ready for distribution installer use command:
```
npm run release
```
This process uses [electron-packager](https://github.com/electron-userland/electron-packager). See their documentation on packaging for various operating systems. 


# License

The MIT License (MIT)

Copyright (c) 2015 Jakub Szwacz, 2016 Brad Stewart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

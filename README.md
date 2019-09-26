# Electron View Renderer

[![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)]()
[![npm](https://img.shields.io/npm/l/express.svg?style=flat-square)]()
[![node](https://img.shields.io/node/v/gh-badges.svg?style=flat-square)]()
[![electron](https://img.shields.io/badge/electron-v6.0.10-blue.svg?style=flat-square)]()

This package is intended to work with the electron framework for building
desktop apps. It allows developers to parse templates on the fly vs creating
static HTML files, or pre-rendering any templates.

In addition this package exposes a way to add additional renderer types beyond
the ones that are added by default.

Currently the following are added by default:

```
['ejs']
```

## Features

* Simplified view templating
* Custom view render engines
* Custom asset protocol

## Install

```
npm install --save electron electron-view-renderer
```

## Usage

This package accomplishes its goal by registering custom protocols. This means
that rather than listening to a protocol such as 'file://' or 'https://' it
listens to the specified protocol (default is "view"). This matters because it
allows us to do our template rendering without having to take over an existing
protocol such as "file://" and yet still be able to treat it as such.

ElectronViewRenderer can be instantiated at any time, even before app is ready,
but will ultimately wait for the app to be ready before registering new protocols.
The new protocols will then be available throughout the lifetime of the process.

```
// require ElectronViewRenderer
const ElectronViewRenderer = require('electron-view-renderer')

// instantiate ElectronViewRenderer with
const viewRenderer = new ElectronViewRenderer({
  viewPath: 'views',            // default 'views'
  viewProtcolName: 'view',      // default 'view'
  useAssets: true               // default false
  assetsPath: 'assets'          // default 'assets'
  assetsProtocolName: 'asset'   // default 'asset'
})

// use favorite renderer (currently preloaded with ejs, but more coming
// and custom renderers can be plugged in)
viewRenderer.use('ejs')

...

// when instantiating a browser window
const window = new BrowserWindow({
  backgroundColor: '#fff',
  center: true,
  height: 600,
  width: 600,
})

viewRenderer.load(window, 'index', {myLocalVar: "value"})
```
## Adding custom renderers

The best example given could be with how ejs is added internally. The main
requirement is that there is a rendererAction and that its callback is called
with the rendered HTML:

```
viewRenderer.add('ejs', {
  extension: '.ejs',
  viewPath: 'views',
  rendererAction: (filePath, viewData, callback) => {
    ejs.renderFile(filePath, viewData, {}, (error, html) => {
      if (error) {
        if (error.file) error.message += `\n\nERROR @(${error.file}:${error.line}:${error.column})`
        throw new Error(error)
      }

      callback(html)
    })
  }
})
```

## Example app

You can run a basic example by switching directory into `./example` and then running the following:

```
npm install
npm start
```

The example is broken down as follows, given a basic file structure:

```
project/
├── assets/
│   └── css/
│       └── main.css
├── views/
│   └── index.ejs
├── main.js
└── package.json
```

project/main.js:

```
const {app, BrowserWindow} = require('electron')
const ElectronViewRenderer = require('electron-view-renderer')
const path = require('path')
const pug = require('pug')

const viewRenderer = new ElectronViewRenderer({
  viewPath: 'views',
  viewProtcolName: 'view',
  useAssets: true,
  assetsPath: 'assets',
  assetsProtocolName: 'asset',
})

viewRenderer.use('ejs')

// Or register custom renderers:
//
// viewRenderer.add('pug', {
//   extension: '.pug',
//   viewPath: 'views',
//   rendererAction: (filePath, viewData, callback) => {
//     pug.renderFile(filePath, viewData, (error, html) => {
//       if (error) {
//         if (error.file) error.message += `\n\nERROR @(${error.file}:${error.line}:${error.column})`
//         throw new Error(error)
//       }
//
//       callback(html)
//     })
//   }
// })
//
// viewRenderer.use('pug')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // NOTE: instead of loading a url as the Quick Start example shows, we are
  //       going to use the viewRenderer helper
  const viewOptions = {name: "Bob"}
  viewRenderer.load(mainWindow, 'index', viewOptions)

  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => { mainWindow = null })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (mainWindow === null) createWindow() })
```

project/views/index.ejs:

```
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hello From <%= name %></title>
    <link href="asset://css/main.css" rel="stylesheet" type="text/css" />
  </head>
  <body>
    <h1>Hello From <%= name %>!</h1>
    We are using node <script>document.write(process.versions.node)</script>,
    Chrome <script>document.write(process.versions.chrome)</script>,
    and Electron <script>document.write(process.versions.electron)</script>.
  </body>
</html>
```

project/assets/css/main.css:

```
body {
  background-color: #bada55;
}
```

## Dependencies

NOTE: this package does not officialy support electron-prebuilt. Please see
https://stackoverflow.com/questions/41574586/what-is-the-difference-between-electron-and-electron-prebuilt

Package | Version
--- |:---:
[electron](https://www.npmjs.com/package/electron) | ^6.0.10
[ejs](https://www.npmjs.com/package/ejs) | ^2.7.1
[haml](https://www.npmjs.com/package/haml) | ^0.4.3
[pug](https://www.npmjs.com/package/pug) | ^2.0.4
[captains-log](https://www.npmjs.com/package/captains-log) | ^2.0.3

## Author

Dennis Baskin <dennis@dennisbaskin.com> http://github.com/dennisbaskin/electron-view-renderer

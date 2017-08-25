# Electron View Renderer

[![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)]()
[![npm](https://img.shields.io/npm/l/express.svg?style=flat-square)]()
[![node](https://img.shields.io/node/v/gh-badges.svg?style=flat-square)]()
[![node](https://img.shields.io/node/v/gh-badges.svg?style=flat-square)]()
[![electron](https://img.shields.io/badge/electron-v1.6.11-blue.svg?style=flat-square)]()

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
npm install --save electron-view-renderer
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

### Using the electron Quick Start Example

Given a basic file structure:

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
const url = require('url')

const viewRenderer = new ElectronViewRenderer({
  viewPath: 'views',
  viewProtcolName: 'view',
  useAssets: true,
  assetsPath: 'assets',
  assetsProtocolName: 'asset',
})

viewRenderer.use('ejs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // // and load the index.html of the app.
  // win.loadURL(url.format({
  //   pathname: path.join(__dirname, 'index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  // NOTE: instead of loadig a url as the Quick Start example shows, we are
  //       going to use the viewRenderer helper
  viewRenderer.load(win, 'index', {name: "Bob"})

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
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

Make sure electron command is available

```
npm install -g electron
```

Add the package.json

```
npm init
npm install --save electron electron-view-renderer
```

Run the example

```
electron .
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

## Dependencies

NOTE: this package does not officialy support electron-prebuilt. Please see
https://stackoverflow.com/questions/41574586/what-is-the-difference-between-electron-and-electron-prebuilt

Package | Version
--- |:---:
[electron](https://www.npmjs.com/package/electron) | 1.6.11
[ejs](https://www.npmjs.com/package/ejs) | 2.5.6
[haml](https://www.npmjs.com/package/haml) | 0.4.3
[pug](https://www.npmjs.com/package/pug) | 2.0.0-rc.2
[captains-log](https://www.npmjs.com/package/captains-log) | 1.0.2

## Author

Dennis Baskin <dennis@dennisbaskin.com> http://github.com/dennisbaskin/electron-view-renderer

# Electron View Renderer

## Basic usage

```
// at application initialization
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
requirement is that there is a rendererAction and that it's callback is called
with the rendered data:

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

// Modules to control application life and create native browser window
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

viewRenderer.add('pug', {
  extension: '.pug',
  viewPath: 'views',
  rendererAction: (filePath, viewData, callback) => {
    pug.renderFile(filePath, viewData, (error, html) => {
      if (error) {
        if (error.file) error.message += `\n\nERROR @(${error.file}:${error.line}:${error.column})`
        throw new Error(error)
      }

      callback(html)
    })
  }
})

viewRenderer.use('pug')

// viewRenderer.use('ejs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')

  viewRenderer.load(mainWindow, 'index', {name: "Bob"})

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

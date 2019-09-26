/**
 * ElectronViewRenderer module
 */
const {app, protocol} = require('electron')
const log = require('captains-log')()
const ejs = require('ejs')
const path = require('path')
const url = require('url')

const parseFilePath = (urlString) => {
  const parsedUrl = new URL(urlString)
  let fileName = parsedUrl.pathname

  if (process.platform === 'win32') fileName = fileName.substr(1)
  return fileName.replace(/(?:\s|%20)/g, ' ')
}

class ElectronViewRenderer {
  get renderers() { return this._renderers }
  get currentRenderer() { return this._currentRenderer }
  get viewPath() { return this._viewPath }
  get viewProtcolName() { return this._viewProtcolName }
  get useAssets() { return this._useAssets }
  get assetsPath() { return this._assetsPath }
  get assetsProtocolName() { return this._assetsProtocolName }

  /**
   * @constructor
   * @param {Object} [options] - object instance options
   * @param {string} [options.viewPath = 'views'] -
   *     The path to the view directory where your template files live.
   *     Example: './app/views' or 'views'
   * @param {string} [options.viewProtcolName = 'view'] -
   *     The name of the protocol used to capture the requested rendering
   *     Example: 'view:///index' (note the extra slash signifying no host)
   * @param {boolean} [options.useAssets = false] -
   *     This option add an additional listener for 'asset://' protocol
   *     Example 1: 'asset://css/main.css' (note that a host 'css' is added and
   *         will be added in the search path before the remainder of the path
   *         after the path set by options.assetsPath)
   *     Example 1: 'asset:///main.css' (note that a host is not added and
   *         the search path will be the path main.css after the path set
   *         by options.assetsPath)
   * @param {string} [options.assetsPath = 'assets'] - defines the location
   *     where the assets will be searched for
   * @param {string} [options.assetsProtocolName = 'asset'] -
   *     The name of the protocol used to capture the requested asset path
   *     and re point it to the path set by options.assetsPath. This is
   *     really usefull when your assets are not in the same directory as your
   *     view files
   *     Example: 'asset://css/main.css' or 'asset://js/index.js'
   */
  constructor({
    viewPath = 'views',
    viewProtcolName = 'view',
    useAssets = false,
    assetsPath = 'assets',
    assetsProtocolName = 'asset'
  } = {}) {
    this._renderers = {}
    this._currentRenderer = {}
    this._views = {}

    this._viewProtcolName = viewProtcolName
    this._useAssets = useAssets
    this._assetsPath = assetsPath
    this._assetsProtocolName = assetsProtocolName
    this._viewPath = viewPath

    this._populateDefaultRenderers()
  }

 /**
  * Allows user to define a template renderer.
  *
  * @param {string} name - required, name of renderer. Example: 'ejs'
  * @param {Object} data - required
  * @param {string} data.extension -
  * @callback data.rendererAction - required, used to define how the processed
  *     file should be processed based on the filePath and viewData parameters.
  *     The callback parameter must be called, and expects the rendered HTML
  *     output after parsing.
  * @param {string} filePath - The path and file name to requested template file
  * @param {Object} viewData - Additional view data in case it is supported by renderer
  * @param {function} callback - required callback to be called with the rendered HTML
  */
  add(name, {extension = null, rendererAction}) {
    if (!name) throw new Error('Renderer name required')

    const data = {
      extension: extension,
      rendererAction: rendererAction,
      name: name,
    }

    this._renderers[name] = data
  }

  load(browserWindow, view, viewData, {query = {}} = {}) {
    this._views[view] = {
      viewData: viewData
    }

    query._view = view

    return browserWindow.loadURL(url.format({
      pathname: view,
      protocol: 'view:',
      query: query,
      slashes: true,
    }))
  }

  renderTemplate({fileName, viewName}) {
    return new Promise((resolve, reject) => {
      const renderer = this.currentRenderer
      const extension = renderer.extension || `.${renderer.name}`
      const filePath = path.join(this.viewPath, `${fileName}${extension}`)
      const viewData = this._views[viewName].viewData

      renderer.rendererAction(filePath, viewData, (renderedHTML) => {
        resolve({
          mimeType: 'text/html',
          data: new Buffer(renderedHTML),
        })
      })
    })
  }

  setupViewProtocol() {
    protocol.registerBufferProtocol(this.viewProtcolName, (request, callback) => {
      const queryStringParams = new URL(request.url).searchParams
      const viewName = queryStringParams.get('_view')
      const fileName = parseFilePath(request.url)
      const hasFileAndViewName = viewName && fileName

      if (!hasFileAndViewName) return callback()

      this.renderTemplate({fileName, viewName}).then(callback).catch(log.error)
    }, (error) => { if (error) log.error('Failed to register view protocol') })
  }


  setupAssetsProtocol() {
    protocol.registerFileProtocol(this.assetsProtocolName, (request, callback) => {
      const hostName = url.parse(request.url).hostname
      const fileName = parseFilePath(request.url)
      const filePath = path.join(this.assetsPath, hostName, fileName)

      callback({path: filePath})
    }, (error) => { if (error) log.error('Failed to register asset protocol') })
  }

  use(name) {
    this._currentRenderer = this.renderers[name]

    app.on('ready', () => {
      this.setupViewProtocol()
      if (this.useAssets) this.setupAssetsProtocol()
    })
  }

  _populateEJSRenderer() {
    this.add('ejs', {
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
  }

  _populateHAMLRenderer() {
    // TODO: add HAML Renderer
  }

  _populatePugRenderer() {
    // TODO: add Pug Renderer
  }

  _populateDefaultRenderers() {
    this._populateEJSRenderer()
    this._populateHAMLRenderer()
    this._populatePugRenderer()
  }
}

module.exports = ElectronViewRenderer

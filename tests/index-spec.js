const expect = require('chai').expect
const path = require('path')

const ElectronViewRenderer = require('../index')

describe('ElectronViewRenderer', function() {
  describe('any instance', function() {
    const electronViewRenderer = new ElectronViewRenderer()

    it('contains the correct properties', function() {
      expect(electronViewRenderer).to.have.property('renderers')
      expect(electronViewRenderer).to.have.property('currentRenderer')
      expect(electronViewRenderer).to.have.property('viewPath')
      expect(electronViewRenderer).to.have.property('viewProtcolName')
      expect(electronViewRenderer).to.have.property('useAssets')
      expect(electronViewRenderer).to.have.property('assetsPath')
      expect(electronViewRenderer).to.have.property('assetsProtocolName')
    })
  })

  describe('instance with default options', function() {
    const electronViewRenderer = new ElectronViewRenderer()

    it('contains the correct properties and values', function() {
      expect(electronViewRenderer.renderers).to.be.an('object')
        .that.has.property('ejs')
        .that.includes({name: 'ejs'})

      expect(electronViewRenderer.currentRenderer).to.be.an('object')
          .that.is.empty

      expect(electronViewRenderer.viewPath).to.be.a('string')
        .that.equals('views')

      expect(electronViewRenderer.viewProtcolName).to.be.a('string')
        .that.equals('view')

      expect(electronViewRenderer.useAssets).to.be.a('boolean')
        .that.is.false

      expect(electronViewRenderer.assetsPath).to.be.a('string')
        .that.equals('assets')

      expect(electronViewRenderer.assetsProtocolName).to.be.a('string')
        .that.equals('asset')
    })
  })

  describe('currentRenderer property', function() {
    // pending untill I can figure out how to get electron APIS to work in
    // a test process (outside of electron)
    const electronViewRenderer = new ElectronViewRenderer()

    it('is initially empty')
    // it('is initially empty', function() {
    //   expect(electronViewRenderer.currentRenderer).to.be.an('object')
    //     .that.is.empty
    // })

    it('is set to the correct renderer when a renderer is specified')
    // it('is set to the correct renderer when a renderer is specified', function() {
    //   electronViewRenderer.use('ejs')

    //   expect(electronViewRenderer.currentRenderer).to.be.an('object')
    //     .that.includes({name: 'ejs'})
    // })
  })

  describe('instance with custom options', function() {
    const options = {
      viewPath: '../app/views',
      viewProtcolName: 'my-app-view',
      useAssets: true,
      assetsPath: '../public/assets',
      assetsProtocolName: 'my-app-asset',
    }
    const electronViewRenderer = new ElectronViewRenderer(options)

    it('contains the correct properties and values', function() {
      expect(electronViewRenderer.renderers).to.be.an('object')
        .that.has.property('ejs')
        .that.includes({name: 'ejs'})

      expect(electronViewRenderer.viewPath).to.be.a('string')
        .that.equals(options.viewPath)

      expect(electronViewRenderer.viewProtcolName).to.be.a('string')
        .that.equals(options.viewProtcolName)

      expect(electronViewRenderer.useAssets).to.be.a('boolean')
        .that.equals(options.useAssets)

      expect(electronViewRenderer.assetsPath).to.be.a('string')
        .that.equals(options.assetsPath)

      expect(electronViewRenderer.assetsProtocolName).to.be.a('string')
        .that.equals(options.assetsProtocolName)
    })
  })
})

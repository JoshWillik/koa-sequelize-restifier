var inflection = require( 'inflection' )
function Restifier( options ){
  this.routes = {}
}

Restifier.prototype = {
  restify: function( app, model ){
    var single = model.name.toLowerCase()
    var plural = inflection.pluralize( single )

    var singleUrl = '/' + single + '/:id'
    var pluralUrl = '/' + plural + '/:id'

    app.get( '/' + plural, _makeGetAll( model ) )

    var createOne = _makeCreateOne( model )
    app.post( '/' + single, createOne )
    app.post( '/' + plural, createOne )

    var getOne = _makeGetOne( model )
    app.get( singleUrl, getOne )
    app.get( pluralUrl, getOne )

    var patchOne = _makePatchOne( model )
    app.patch( singleUrl, patchOne )
    app.patch( pluralUrl, patchOne )

    var deleteOne = _makeDeleteOne( model )
    app.delete( singleUrl, deleteOne )
    app.delete( pluralUrl, deleteOne )


    this.routes[ plural + '_url' ] = '/' + plural
  },
  getRegisteredRoutes: function(){
    return this.routes
  }
}

function _makeGetAll( model ){
  return function*(){
    var records = yield model.findAll()
    this.body = {
      meta: {
        count: records.length
      },
      data: records
    }
  }
}

function _makeGetOne( model ){
  return function*(){
    var record = yield model.find( req.params.id )
    this.body = {
      meta: {},
      data: record
    }
  }
}

function _makeCreateOne( model ){
  return function*( req, res ){
    var values = req.body
    var record = yield model.create( values )
    this.status = 201
    this.body = {
      meta: {},
      data: record
    }
  }
}

function _makePatchOne( model ){
  return function*( req, res ){
    var values = req.body
    var record = yield model.find( req.params.id )
    var updated = yield record.updateAttributes( values )
    this.body = {
      meta: {},
      data: updated
    }
  }
}

function _makeDeleteOne( model ){
  return function*( req, res ){
    var record = yield model.find( req.params.id )
    yield record.destroy()
    this.body = {
      meta: {},
      data: record
    }
  }
}

module.exports = Restifier

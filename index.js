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
    try {
      var records = yield model.findAll()
      records = records || []
      this.body = {
        meta: {
          count: records.length,
          status: 'ok'
        },
        data: records
      }
    } catch( e ){
      this.status = 500
      this.body = {
        meta: {
          status: 'error',
          message: e.message
        }
      }
    }
  }
}

function _makeGetOne( model ){
  return function*(){
    try {
      var record = yield model.find( this.params.id )
      if( !record ){
        record = {}
        this.status = 404
      }
      this.body = {
        meta: {
          status: 'ok'
        },
        data: record
      }
    } catch( e ){
      this.status = 500
      this.body = {
        meta: {
          status: 'error',
          error: 'Could not fetch record'
        }
      }
    }
  }
}

function _makeCreateOne( model ){
  return function*(){
    var values = this.request.body
    if( !values ){
      this.status = 400
      this.body = {
        status: 'error',
        message: 'Request is empty'
      }
      return
    }
    var record = yield model.create( values )
    this.status = 201
    this.body = {
      meta: {
        status: 'ok'
      },
      data: record
    }
  }
}

function _makePatchOne( model ){
  return function*(){
    var values = this.request.body
    if( !values ){
      this.status = 400
      this.body = {
        meta: {
          status: 'error',
          error: 'Request is empty'
        }
      }
      return
    }

    var id = this.params.id
    var record = yield model.find( id )
    if( !record ){
      this.status = 404
      this.body = {
        status: 'error',
        error: 'Record ' + id + ' not found'
      }
    }
    var updated = yield record.updateAttributes( values )
    this.body = {
      meta: {
        status: 'ok'
      },
      data: updated
    }
  }
}

function _makeDeleteOne( model ){
  return function*(){
    var id = this.params.id
    try {
      var record = yield model.find( id )
      if( !record ){
        this.status = 404
        this.body = {
          meta: {
            status: 'error',
            error: 'Record ' + id + ' not found'
          }
        }
      }
      yield record.destroy()
      this.body = {
        meta: {
          status: 'ok'
        },
        data: record
      }
    } catch( e ){
      this.status = 500
      this.body = {
        meta: {
          status: 'error',
          error: e.message
        }
      }
    }
  }
}

module.exports = Restifier

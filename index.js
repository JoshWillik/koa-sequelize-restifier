function valid( value ){
  return typeof value === 'function'
}

function Restifier( options ){
  this.options = options || {}
  this.routes = {}
}

Restifier.prototype = {
  restify: function( app, model, options ){
    options = options || {}

    var plural = model.options.name.plural.toLowerCase()
    var url = {
      all: '/' + plural,
      one: '/' + plural + '/:id'
    }

    var customArgs = [ model ]

    var getAll = valid( options.getAll )?
      options.getAll.apply( this, customArgs ):
      _makeGetAll( model )
    app.get( url.all, getAll )

    var create = valid( options.create )?
      options.create.apply( this, customArgs ):
     _makeCreate( model )
    app.post( url.all, create )

    var getOne = valid( options.get )?
      options.get.apply( this, customArgs ):
      _makeGetOne( model )
    app.get( url.one, url.one, getOne )

    var patchOne = valid( options.patch )?
      options.patch.apply( this, customArgs ):
      _makePatchOne( model )
    app.patch( url.one, patchOne )

    var deleteOne = valid( options.delete )?
      options.delete( this, customArgs ):
      _makeDeleteOne( model )
    app.delete( url.one, deleteOne )

    this.registerResourceUrl( plural + '_url', '/' + plural )
  },
  getRegisteredRoutes: function(){
    return this.routes
  },
  registerResourceUrl: function( name, url ){
    this.routes[ name ] = url
  }
}

function _makeGetAll( model ){
  return function*(){
    var offset = this.query.offset || 0
    var limit = this.query.count || 20
    try {
      var records = yield model.findAll({
        offset: offset,
        limit: limit
      })
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
      var id = this.params.id
      var record = yield model.find( id )
      if( !record ){
        this.status = 404
        this.body = {
          meta: {
            status: 'error',
            error: 'Record ' + id + ' not found'
          }
        }
        return
      }
      this.body = {
        meta: {
          status: 'ok'
        },
        data: record
      }
    } catch( e ){
      this.status = 400
      this.body = {
        meta: {
          status: 'error',
          error: e.message
        }
      }
      return
    }
  }
}

function _makeCreate( model ){
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
    try {
      var record = yield model.create( values )
      this.status = 201
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
      this.error = e
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
      this.error = e
    }
  }
}

module.exports = Restifier

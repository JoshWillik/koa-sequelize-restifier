# Koa/Sequelize Restifier

## Installation
```
$ npm install koa-sequelize-restifier
```

## Usage
### Simple restification
```js
var Restifier = require( 'koa-sequelize-restifier' )
var app = require( 'koa' )()
var router = require( 'koa-router' )()

var Job = require( './models/Job' ) //Your Sequelize model
var restifier = new Restifier()

restifier.restify( router, Job )
// Maps the following urls
//   GET   /jobs
//   GET   /jobs/:id
//   POST   /jobs
//   PATCH  /jobs/:id
//   DELETE /jobs/:id

app.use( router.routes() )

app.listen( 8888, function(){
  console.log( 'App is listening' )
})
```

*This module is provided as is, without warranty. If you open a Github issue, I may consider your request.*

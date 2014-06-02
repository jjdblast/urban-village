var express = require('express'),
    app = express()

var port = process.env.PORT || 5000

var baseRouter = express.Router();
baseRouter.use('/', express.static('./build'))

app.use('/', baseRouter)
    .listen(port)
console.log('Server in '+ process.env.NODE_ENV +' mode, listening on port:' + port)

var template = require('lc-template')
var app = template.app
// var express = template.express

template.setApp(app)
template.setTestSuit(app)
// template.setRedirects(app)

var port = process.env.PORT || 5000
app.listen(port, function() {
    console.log('Server in '+ process.env.NODE_ENV +' mode, listening on port:' + port)
})

var transform = require('./transform')
var ctrlMain = require('./ctrl_mainVis')

d3.json('data/aggregate.json', function(err,data){
    
    data = transform(data)

    ctrlMain.init(data)

        
})
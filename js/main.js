var transform = require('./transform')
var render_mainVis = require('./render_mainVis')

d3.json('data/aggregate.json', function(err,data){
    
    data = transform(data)
    console.log(data[0])

    var render0 = render_mainVis()
        .render(d3.selectAll('.vis0'), data)

        
})
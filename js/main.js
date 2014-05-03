
// d3.json('data/pop_urbArea.json', function(err,data){
//     data.shift()
//     var drawCities = DrawCities()
//         .render(d3.selectAll('body'), data)
// })

d3.json('data/aggregate.json', function(err,data){
    d = data
    console.log(d)
})

var base = require('./render_base')()

module.exports = function render_vis(){
    var main = {}
    main.render = function(sel, data) {

        return main
    }
    _.extend(main, render_base)
    return main
}
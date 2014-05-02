
// d3.json('data/pop_urbArea.json', function(err,data){
//     data.shift()
//     var drawCities = DrawCities()
//         .render(d3.selectAll('body'), data)
// })

d3.json('data/aggregate.json', function(err,data){
    d = data
    console.log(d)
})

function render_vis0(){

    var main = {}
    main.render = function(sel, data) {
        
        return main
    }
    return main
}

// d3.json('data/pop_urbArea.json', function(err,data){
//     data.shift()
//     var drawCities = DrawCities()
//         .render(d3.selectAll('body'), data)
// })

var transform = require('./transform')

d3.json('data/aggregate.json', function(err,data){
    
    data = transform(data)
    console.log(data[0])

    var render0 = render_vis0()
        .render(d3.selectAll('.vis0'), data)
})

var render_base = require('./render_base')()
// require('./cubehelix')

function render_vis0(){

    var renderCities = render_vis0_cities()

    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        this.svgBox({width: 1200, height: 800, top: 20, bottom: 20, left: 20, right:20})
        this.setSvg(sel)

        renderCities.gBox({
                width: this.width/2,
                height: this.height/4,
                top: 0,
                left: (this.width - (this.width/2))/2
            })
            .render(sel.select('g.citiesView'), data)

        return main
    }
    return main
}


//
function render_vis0_cities(){
    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        this.setG(sel)

        var acc = {
            x: function(d,i){return d.pop},
            y: function(d,i){return d.sumDegree},
            y2: function(d,i){return d.pop}
        }

        var x = d3.scale.log()
            .domain(d3.extent(data, acc.x))
            .range([0, this.width-10])
        var x2 = d3.scale.linear()
            .domain([0,1])
            .range([0, this.width])

        var y = d3.scale.log()
            .domain(d3.extent(data, acc.y))
            .range([this.height-10, 0])
        var y2 = d3.scale.linear()
            .domain([0,1])
            .range([this.height-10, 0])

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(10, ',.1s')
            .tickSize(6, 0)
            .orient('bottom')
        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4, ',.1s')
            // .tickValues([100,10000,1000000])
            .tickSize(6, 0)
            .orient('right')

        var line = d3.svg.line()
            .x(function(d,i){return x(d[0])})
            .y(function(d,i){return y(d[1])})

        // minPop = d3.min(data, acc.x)
        var xExt = d3.extent(data, acc.x)
        var yMin = d3.min(data.slice(0,5), acc.y)-00
        var yExt = [yMin, yMin*(Math.pow(xExt[1]/xExt[0],1.12))]
        var yExt2 = [yMin, yMin*(Math.pow(xExt[1]/xExt[0],1))]


        console.log((xExt[1]/xExt[0]))

        // draw
        var cities = sel.select('g.cities')
            .selectAll('circle').data(data)
        cities.enter().append('circle')
        cities
            .transition()
            .attr({
                cx: function(d,i){return x(acc.x(d))},
                cy: function(d,i){return y(acc.y(d))},
                r: 2
            })
        cities.exit().remove()

        sel.select('path.line1')
            .transition()
            .attr('d', line([[xExt[0], yExt[0]], [xExt[1], yExt[1]] ]))
            .style({
                fill: 'none',
                stroke: 'black'
            })
        sel.select('path.line2')
            .transition()
            .attr('d', line([[xExt[0], yExt2[0]], [xExt[1], yExt2[1]] ]))
            .style({
                fill: 'none',
                stroke: 'gray',
                'stroke-dashArray': '5,5'
            })

        // draw axis
        sel.select('g.x.axis')
            .attr('transform', 'translate(0,'+ this.height +')')
            .transition()
            .call(xAxis)
        sel.select('g.y.axis')
            .attr('transform', 'translate('+ this.width +',0)')
            .transition()
            .call(yAxis)


        return this
    }
    return main
}
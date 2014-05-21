var render_base = require('./render_base')()

    
var main = {}
_.extend(main, render_base)
main.render = function(sel, data) {

    var acc = {
        x: function(d,i){return d.pop},
        y: function(d,i){return d.sumDegree},
    }

    // minPop = d3.min(data, acc.x)
    var xExt = d3.extent(data, acc.x)
    xExt[0] = xExt[0] - 50
    // xExt[1] = xExt[1] + 50000
    var yMin = d3.min(data, acc.y) - 1000
    var yExt = [yMin, yMin*(Math.pow(xExt[1]/xExt[0],1.12))]
    var yExt2 = [yMin + 0, yMin*(Math.pow(xExt[1]/xExt[0],1)) + 0]

    var x = d3.scale.log()
        .domain(xExt)
        .range([0, this.width])

    var y = d3.scale.log()
        .domain(yExt2)
        .range([this.height, 0])

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(6, ',.1s')
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

    // draw
    var cities = sel.select('g.cities')
        .selectAll('circle').data(data)
    cities.enter().append('circle')
        .style({
            fill: 'steelblue',
            '-webkit-filter': 'drop-shadow( -5px -5px 5px #000 )'
        })
    cities
        .on('click', function(d){
            console.log(d)
        })
        .transition()
        .attr({
            cx: function(d,i){return x(acc.x(d))},
            cy: function(d,i){return y(acc.y(d))},
            r: 3
        })
    cities.exit().remove()

    sel.select('path.line1')
        .transition()
        .attr('d', line([[xExt[0], yExt[0]], [xExt[1], yExt[1]] ]))
        .style({
            fill: 'none',
            stroke: 'steelblue',
            'stroke-width': 2,
        })
    sel.select('path.line2')
        .transition()
        .attr('d', line([[xExt[0], yExt2[0]], [xExt[1], yExt2[1]] ]))
        .style({
            fill: 'none',
            stroke: 'black',
            'stroke-width': 2,
            // 'stroke-dashArray': '5,5'
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

    // background
    sel.select('rect.background')
        .attr({
            x:0, y:0,
            width: this.width,
            height: this.height
        })
        .style({
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2,
            // 'stroke-dashArray': '5,5'
        })
    sel.select('rect.background2')
        .attr({
            x:0, y:y(yExt[1]),
            width: this.width,
            height: - y(yExt[1]) - 0,
            fill: 'url(#diagonalHatch)',
            // transform: 'scale(-1,0)'
        })
        .style({
            stroke: 'steelblue',
            'stroke-width': 2,
            // 'stroke-dashArray': '5,5'
        })


    return this
}

module.exports = main
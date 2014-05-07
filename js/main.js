
// d3.json('data/pop_urbArea.json', function(err,data){
//     data.shift()
//     var drawCities = DrawCities()
//         .render(d3.selectAll('body'), data)
// })

var transform = require('./transform')

d3.json('data/aggregate.json', function(err,data){
    
    data = transform(data)
    console.log(data)

    var render0 = render_vis0()
        .render(d3.selectAll('.vis0'), data)
})

var render_base = require('./render_base')()
require('./cubehelix')

function render_vis0(){
    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        this.svgBox({width: 1200, height: 550, top: 20, bottom: 20, left: 20, right:20})
        this.setSvg(sel)

        var gutter = 60

        var acc = {

        }

        var maxDegree = d3.max(data, function(d,i){return d.maxDegree})

        var x = d3.scale.linear()
            .domain([0, d3.sum(data, function(d,i){return d.maxDegree})*2])
            .range([0, this.width - (data.length)*gutter])
        var maxGroupWidth = x(maxDegree*2)

        var rScale = d3.scale.log()
            .domain([1, maxDegree])
            .range([1, x(maxDegree)])
        var rScale2 = d3.scale.log()
            .domain([1, maxDegree])
            .range([x(maxDegree), 0])
        var rAxis = d3.svg.axis()
            .ticks(4, '.,1s')
            .scale(rScale2)
            .orient('left')

        var sAmount = d3.scale.cubehelix()
            .range([d3.hsl(60, .6, 1), d3.hsl(-180, .6, .5)])

        _.reduce(data, function(acc, d, i){
            d.x0 = acc
            return acc + x(d.maxDegree*2) + gutter
        }, gutter)

        var cityGroups = sel.select('g.main')
            .selectAll('.cityGroup').data(data)
        cityGroups.enter().append('g')
            .attr({
                transform: function(d,i){
                    return 'translate('+ d.x0 +','+ 0 +')'
                }
            })
            .classed('cityGroup', true)
        cityGroups.exit().remove()

        var circlesG = cityGroups.append('g')
            .classed('circles', true)
            .attr({
                transform: function(d,i){
                    return 'translate('+ x(d.maxDegree) +','+ maxGroupWidth/2 +')'
                }
            })
        var circles = circlesG
            .selectAll('circle').data(function(d,i){return d.contacts})
        circles.enter().append('circle')
        circles.exit().remove()
        circles
            .attr({
                cx: 0, cy:0,
                r: function(d,i){
                    return rScale(d.degree)
                }
            })
            .style({
                fill: 'none', 'stroke-width': 2,
                stroke: function(d,i){
                    return sAmount(d.normAmount)
                }
            })

        circlesG.append('circle')
            .attr({
                cx:0, cy:0,
                r: function(d,i){
                    console.log(d.meanDegree)
                    return rScale(d.meanDegree)
                }
            })
            .style({
                fill: 'none',
                stroke: 'black',
                'stroke-width': 3
            })

        sel.select('g.main')
            .append('g')
            .classed('axis', true)
            .attr({
                transform: 'translate(40,0)'
            })
            .call(rAxis)

        return main
    }
    return main
}
var render_base = require('./render_base')()

var o = {}

var coverageRadius = 15

// scales
var xAmount = d3.scale.linear()
    .domain([0, 15])
var xClust = d3.scale.linear()
    .domain([0,.5])
var pop = d3.scale.sqrt()
var y2 = d3.scale.log()

//axis
var xAmountAxis = d3.svg.axis()
    .scale(xAmount)
    .tickValues([15])
    .orient('bottom')
var xClustAxis = d3.svg.axis()
    .scale(xClust)
    .tickValues([.5])
    .orient('bottom')
var yAxis = d3.svg.axis()
    .ticks(6, '.,1s')
    .orient('left')

// draw functions
var areaAmount = d3.svg.area()
var areaClust = d3.svg.area()

// MAIN
var main = {}
_.extend(main, render_base)

main.render = function (sel, data, _o) {
    if (_o) _.extend(o, _o)

    // scales
    xAmount
        .range([0, this.width*.40])
    xClust
        .range([0, -this.width*.40])
    pop
        .domain([0, data.pop])
        .range([0, coverageRadius])
    y2
        .domain([1, data.maxDegree])
        .range([this.height, o.y(data.maxDegree)])

    yAxis.scale(y2)

    // draw functions
    areaAmount
        .y(function(d,i){return o.y(d.degree)})
        .x1(function(d,i){return 0})
        .x0(function(d,i){return xAmount((d.amount/data.amount)*100)})
    areaClust
        .y(function(d,i){return o.y(d.degree)})
        .x1(function(d,i){return xClust(d.avgClustCoeff)})
        .x0(function(d,i){return 0})

    // render
    sel.select('.wrap')
        .attr({
            transform: 'translate('+this.width/2+',0)'
        })
    sel.select('path.area')
        .attr({
            // transform: 'translate('+this.width/2+',0)',
            d: areaAmount(data.degrees)
        })
        .style({
            fill: 'url(#diagonalHatch)',
            stroke: 'steelblue'
        })
    sel.select('path.areaClust')
        .attr({
            // transform: 'translate('+this.width/2+',0)',
            d: areaClust(data.degrees)
        })
        .style({
            fill: 'url(#diagonalHatch2)',
            stroke: 'orange'
        })
        .on('click', function(d,i){
            console.log(d)
        })

    sel.select('g.coverage')
        .attr('transform', 'translate(0,'+(this.height+10+coverageRadius)+')')
    sel.select('circle.pop')
        .attr({
            cx:0, cy: 0,
            r: pop(data.pop)
        })
        .style({
            fill: 'none', stroke: 'gray'
        })
    sel.select('circle.amount')
        .attr({
            cx:0, cy: 0,
            r: pop(data.amount)
        })
        .style({
            fill: 'url(#diagonalHatch)',
            stroke: 'steelblue'
        })

    // Axis


    return this
}

main.renderHover = function (sel, data) {

    this.render(sel, data)

    sel.select('.yAxis')
        .attr('transform', 'translate(3,0)')
        .call(yAxis)

    return this
}

main.o = function (arg) {
    if (arguments.length == 0) return o
    _.extend(o, arg)
    return this
}

module.exports = main
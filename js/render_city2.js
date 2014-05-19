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
    .orient('right')

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
    sel.select('path.areaAmount')
        .attr({
            d: areaAmount(data.degrees)
        })
        .style({
            fill: 'url(#diagonalHatch)',
            stroke: 'steelblue'
        })
    sel.select('path.areaClust')
        .attr({
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

    if(o.hoverDegree > data.maxDegree) o.hoverDegree = data.maxDegree
    if(o.hoverDegree < 1) o.hoverDegree = 1

    this.render(sel, data)

    sel.select('.yAxis')
        .attr('transform', 'translate(-3,0)')
        .call(yAxis)

    var degreeTick = sel.select('g.degreeTick')
        .attr('transform', 'translate(0,'+ o.y(o.hoverDegree) +')')
    degreeTick.select('text')
        .attr({
            x: 6, dy: '.32em', 'text-anchor': 'start'
        })
        .style({
            'font-size': '11px', 'font-weight': '600'
        })
        .text(o.hoverDegree + ' contacts')
    degreeTick.select('.amount')
        .attr('d', function(){
            var d = _.find(data.degrees, function(d,i){return d.degree == o.hoverDegree})
            return 'M0,0 h' + xAmount((d.amount/data.amount)*100)
        })
        .style({
            stroke: 'steelblue'
        })
    degreeTick.select('.clust')
        .attr('d', function(){
            var d = _.find(data.degrees, function(d,i){return d.degree == o.hoverDegree})
            return 'M0,0 h' + xClust(d.avgClustCoeff)
        })
        .style({
            stroke: 'orange'
        })

    sel.select('.yAxis').selectAll('text')
        .transition()
        .ease('linear')
        .duration(100)
        .style({
            'fill-opacity': function(d,i){
                return Math.abs(o.y(d) - o.y(o.hoverDegree)) < 25 ? 0 : 1

            }
        })

    return this
}

main.o = function (arg) {
    if (arguments.length == 0) return o
    _.extend(o, arg)
    return this
}

module.exports = main
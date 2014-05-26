var render_base = require('./render_base')()

var o = {}

var coverageRadius = 10

// scales
var xAmount = d3.scale.linear()
    .domain([0, 20])
var xClust = d3.scale.linear()
    .domain([0,.5])
var pop = d3.scale.sqrt()
var y2 = d3.scale.log()

//axis
var xAmountAxis = d3.svg.axis()
    .scale(xAmount)
    .tickValues([20])
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
        .range([0, this.width*.35])
    xClust
        .range([0, -this.width*.35])
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
    // wrap translate makes the middle of the group x=0
    sel.select('.wrap')
        .attr({
            transform: 'translate('+this.width/2+',0)'
        })

    // the area for the amount of people
    sel.select('path.areaAmount')
        .attr({
            d: areaAmount(data.degrees)
        })
        .style({
            fill: 'url(#diagonalHatch)',
            stroke: 'steelblue'
        })
    // the area for the clustering
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

    // Axis
    var selAmountAxis = sel.select('.xAmountAxis')
        .attr('transform', 'translate(0,'+(this.height+7)+')')
        .call(xAmountAxis)
    selAmountAxis.selectAll('path, line')
        .style({
            stroke: 'steelblue',
            'stroke-width': 1
        })
    selAmountAxis.selectAll('text')
        .style('opacity', 0)
    var selClustAxis = sel.select('.xClustAxis')
        .attr('transform', 'translate(0,'+(this.height+7)+')')
    selClustAxis.call(xClustAxis)
        .selectAll('path, line')
        .style({
            stroke: 'orange',
            'stroke-width': 1
        })
    selClustAxis.selectAll('text')
        .style('opacity', 0)

    // hover behaviour

    // if (!o.hoverDegree) return 
    if(o.hoverDegree < 1) o.hoverDegree = 1
    var hoverDegreeData = _.find(data.degrees, function(d,i){return d.degree == o.hoverDegree})
    if (!hoverDegreeData) hoverDegreeData = {degree:o.hoverDegree, avgClustCoeff: 0, amount: 0}

    // # xAmountAxis
    var amountTick = sel.select('g.amountTick')
        .attr('transform', 'translate('+ xAmount((hoverDegreeData.amount/data.amount)*100) +','+ (this.height+7) +')')

    amountTick.select('text.percent')
        .text( d3.format('.0f')((hoverDegreeData.amount/data.amount)*100) +'%')
        .attr({
            y: 10, dy: '.71em',
            'text-anchor': function(d,i){
                return xAmount((hoverDegreeData.amount/data.amount)*100) > 8 ? 'middle' : 'start'
            }
        })
        .style({
            'font-size': '11px',
            'fill': 'steelblue'
        })
    amountTick.select('text.number')
        .text( d3.format(',.0f')(hoverDegreeData.amount) + '')
        .attr({
            y: '2em', dy: '.71em',
            'text-anchor': function(d,i){
                return xAmount((hoverDegreeData.amount/data.amount)*100) > 8 ? 'middle' : 'start'
            }
        })
        .style({
            'font-size': '11px',
            'fill': 'steelblue'
        })
    amountTick.select('path')
        .attr('d', 'M0,0 v6')
        .style({
            stroke: 'steelblue'
        })

    // # xClustAxis

    var clustTick = sel.select('g.clustTick')
        .attr('transform', 'translate('+ xClust(hoverDegreeData.avgClustCoeff) +','+ (this.height+7) +')')

    clustTick.select('text.number')
        .text( d3.format('.0f')(hoverDegreeData.avgClustCoeff*100)+'%' )
        .attr({
            y: 10, dy: '.71em',
            'text-anchor': function(d,i){
                return xClust(hoverDegreeData.avgClustCoeff) < -8 ? 'middle' : 'end'
            }
        })
        .style({
            'font-size': '11px',
            'fill': 'orange'
        })
    clustTick.select('path')
        .attr('d', 'M0,0 v6')
        .style({
            stroke: 'orange'
        })

    // yAxis degree tick
    var degreeTick = sel.select('g.degreeTick')
        .attr('transform', 'translate(0,'+ o.y(hoverDegreeData.degree) +')')
    degreeTick.select('path')
        .attr('d', 'M-3,0 h 6')
        .style({
            stroke: 'black'
        })
    degreeTick.select('circle.clust')
        .attr({
            cy: 0,
            cx: xClust(hoverDegreeData.avgClustCoeff),
            r: 2
        })
        .style({
            fill: 'orange'
        })
    degreeTick.select('circle.amount')
        .attr({
            cy: 0,
            cx: xAmount((hoverDegreeData.amount/data.amount)*100),
            r: 2
        })
        .style({
            fill: 'steelblue'
        })
    degreeTick.select('path.clust')
        .attr('d', 'M'+ xClust(hoverDegreeData.avgClustCoeff) + ',0 H0')
        .style({
            stroke: 'orange'
        })
    degreeTick.select('path.amount')
        .attr('d', 'M'+ xAmount((hoverDegreeData.amount/data.amount)*100) + ',0 H0')
        .style({
            stroke: 'steelblue'
        })


    return this
}

main.renderHover = function (sel, data) {

    // if (!data) return

    this.render(sel, data)

    // if(o.hoverDegree > data.maxDegree) o.hoverDegree = data.maxDegree
    // if (!o.hoverDegree) return 
    if(o.hoverDegree < 1) o.hoverDegree = 1
    var hoverDegreeData = _.find(data.degrees, function(d,i){return d.degree == o.hoverDegree})
    if (!hoverDegreeData) hoverDegreeData = {degree:o.hoverDegree, avgClustCoeff: 0, amount: 0}

    // the two coverage circles
    // var selCoverage = sel.select('g.coverage')
    //     .attr('transform', 'translate(0,'+(-30-coverageRadius)+')')
    // selCoverage.select('circle.pop')
    //     .attr({
    //         cx:0, cy: 0,
    //         r: pop(data.pop)
    //     })
    //     .style({
    //         fill: 'white', stroke: '#33a02c'
    //     })
    // selCoverage.select('circle.amount')
    //     .attr({
    //         cx:0, cy: 0,
    //         r: pop(data.amount)
    //     })
    //     .style({
    //         fill: 'url(#diagonalHatch)',
    //         stroke: 'steelblue'
    //     })

    // # yAxis

    // yAxis degree tick
    var degreeTick = sel.select('g.degreeTick')
        .attr('transform', 'translate(0,'+ o.y(o.hoverDegree) +')')
    degreeTick.select('text')
        .attr({
            x: 0, y: function () {
                return o.y(o.hoverDegree) < 20 ? 12 : -12
            },
            dy: '.32em', 'text-anchor': 'middle'
        })
        .style({
            'font-size': '11px', 'font-weight': '600'
        })
        .text(o.hoverDegree + ' contacts')
    degreeTick.select('path')
        .attr('d', 'M-3,0 h 6')
        .style({
            stroke: 'black'
        })
    degreeTick.select('circle.clust')
        .attr({
            cy: 0,
            cx: xClust(hoverDegreeData.avgClustCoeff),
            r: 2
        })
        .style({
            fill: 'orange'
        })
    degreeTick.select('circle.amount')
        .attr({
            cy: 0,
            cx: xAmount((hoverDegreeData.amount/data.amount)*100),
            r: 2
        })
        .style({
            fill: 'steelblue'
        })
    degreeTick.select('path.clust')
        .attr('d', 'M'+ xClust(hoverDegreeData.avgClustCoeff) + ',0 H0')
        .style({
            stroke: 'orange'
        })
    degreeTick.select('path.amount')
        .attr('d', 'M'+ xAmount((hoverDegreeData.amount/data.amount)*100) + ',0 H0')
        .style({
            stroke: 'steelblue'
        })


    // yAxis
    sel.select('.yAxis')
        .attr('transform', 'translate(-3,0)')
        .call(yAxis)

    // yAxis overlapping
    var degreeTickHeight = degreeTick.node().getBoundingClientRect().height
    sel.select('.yAxis').selectAll('.tick')
        .transition()
        .ease('linear')
        .duration(100)
        .style({
            'fill-opacity': function(d,i){
                return Math.abs(o.y(d) - o.y(o.hoverDegree)) < degreeTickHeight ? 0 : 1

            },
            'stroke-opacity': function(d,i){
                return Math.abs(o.y(d) - o.y(o.hoverDegree)) < degreeTickHeight ? 0 : 1

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
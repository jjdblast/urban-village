var render_base = require('./render_base')()
var renderCity = require('./render_city2')

var popNumberFormat = d3.format(',')

var main = {}
_.extend(main, render_base)

main.render = function(sel, data) {

    console.log('yo')

    var acc = {
        size: function(d,i){return d.pop},
        sMeanDegree: function(d,i){return y(d.meanDegree)}
    }
    data = _.sortBy(data, acc.size)

    var numberOfCities = 8
    var cityWidth = this.width / numberOfCities
    var coverageRadius = (50 - 10) / 2

    // scales

    var maxDegree = d3.max(data, function(d,i){return d.maxDegree})

    var x = d3.scale.log()
        .domain(d3.extent(data, acc.size))
        .range([cityWidth/2, this.width-cityWidth/2])
    var y = d3.scale.log()
        .domain([1, maxDegree])
        .range([this.height, 0])
    var pop = d3.scale.sqrt()
        .domain([0, d3.max(data, function(d,i){return d.pop})])
        .range([0, coverageRadius])
    var amount = d3.scale.sqrt()
        .domain([0, d3.max(data, function(d,i){return d.amount})])
        .range([0, coverageRadius])

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(6, ',.1s')
        .orient('top')

    // helpers

    var bisect = d3.bisector(function(d){return acc.size(d)}).right

    // draw objects

    var line = d3.svg.line()
        .x(function(d,i){return x(acc.size(d))})
        .y(acc.sMeanDegree)

    var area = d3.svg.area()
        .x(function(d,i){return x(acc.size(d))})
        .y1(function(d,i){return y(d.maxDegree)})
        .y0(function(d,i){return y(1)})

    renderCity
        .gBox({width: cityWidth, height: this.height})
        .o({y: y})

    // extra data transformation

    var xRange = x.range()
    var range = d3.range(xRange[0], xRange[1], (xRange[1]-xRange[0])/numberOfCities)
    var cityData = _.map(range, function(d,i){
        var index = bisect(data, x.invert(d))
        return data[index]
    })
    var hoverCity = data[0]

    // render

    sel.select('rect.hoverTarget')
        .attr({
            x:0, y:0, width: this.width, height: this.height
        })
        .style({
            opacity: 0,
        })
        .on('mousemove', function(d,i){
            renderCity.o({ hoverDegree: Math.round(y.invert(d3.mouse(this)[1])) })
            hoverCity = data[ bisect(data, x.invert(d3.mouse(this)[0])) ]
            renderCities()
        })

    var selXAxis = sel.select('.xAxis')
        .attr('transform', 'translate(0,-5)')
        .call(xAxis)
    selXAxis.selectAll('path, line')
        .style({ stroke: 'black', 'stroke-width': 1 })

    sel.select('path.meanDegree')
        .attr('d', line(data))
        .style({
            fill: 'none', stroke: 'white',
            'stroke-width': 2,
            'stroke-dashArray': '2,2'
        })

    sel.select('path.area')
        .attr('d', area(data))
        .style({
            fill: 'hsl(0,0%,92%)', stroke: 'none',
            'stroke-width': 1,
            'stroke-dashArray': '2,2'
        })

    var cityTicks = sel.select('.cityTicks')
        .selectAll('circle').data(data)
    cityTicks.enter().append('circle')
        .attr({
            cx: function(d,i){return x(acc.size(d))},
            cy: function(d,i){return y(d.meanDegree)},
            r: 1
        })
        .style({
            stroke: 'gray',
            fill: 'white',
            'stroke-width': 1
        })
    cityTicks.exit().remove()

    renderCities()
    function renderCities () {

        if (hoverCity) {
            var popTick = sel.select('g.popTick')
                .attr('transform', 'translate('+ x(acc.size(hoverCity)) +',-5)')
            popTick.select('text')
                .attr({
                    y: -9, 'text-anchor': 'middle'
                })
                .style({
                    'font-size': '11px', 'font-weight': '600'
                })
                .text( popNumberFormat(acc.size(hoverCity)) )
            popTick.select('path')
                .attr('d', 'M0,0 v-6')
                .style({
                    stroke: 'black'
                })
            var popTickLenght = popTick.select('text').node().getComputedTextLength()+6
            sel.select('.xAxis').selectAll('text')
                .transition()
                .ease('linear')
                .duration(100)
                .style({
                    'fill-opacity': function(d,i){
                        return Math.abs(x(d) - x(acc.size(hoverCity))) < popTickLenght ? 0 : 1

                    }
                })
        }

        var cities = sel.select('g.cities')
            .selectAll('.city').data(cityData, function(d,i){return d.pop})
        cities.enter().append(function () {
                return document.querySelector('#tpl-city g.city').cloneNode(true)
            })
            .attr('transform', function(d,i){
                return 'translate('+(x(acc.size(d))-cityWidth/2)+',0)'
            })

        cities
            .each(function(d,i){
                renderCity.render(d3.select(this), d)
            })
            .classed('hide', function(d,i){
                return Math.abs( x(acc.size(d)) - x(acc.size(hoverCity)) ) < cityWidth*.8
            })

        cities.exit().remove()

        if (d3.select('.hoverCity .wrap').empty()) {
            d3.select('.hoverCity').append(function(){
                return document.querySelector('#tpl-city g.wrap').cloneNode(true)
            })
        }

        d3.select('.hoverCity')
            .attr('transform', 'translate('+(x(acc.size(hoverCity))-cityWidth/2)+',0)')
        renderCity.renderHover(d3.select('.hoverCity'), hoverCity)

    }


    return this
}

module.exports = main
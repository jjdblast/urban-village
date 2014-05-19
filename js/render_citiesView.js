var render_base = require('./render_base')()
var renderCity = require('./render_city2')

var main = {}
_.extend(main, render_base)

main.render = function(sel, data) {

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
    // var yAxis = d3.svg.axis()
    //     .scale(y)
    //     .ticks(6, '.,0s')
    //     .orient('left')


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
    var initCityData = _.map(range, function(d,i){
        var index = bisect(data, x.invert(d))
        return data[index]
    })
    var cityData = initCityData
    var hoverCity = data[0]

    // render

    sel.on('mousemove', function(d,i){
        var index = bisect(data, x.invert(d3.mouse(this)[0]))
        var xPos = x(acc.size(data[index]))
        var overlay = _.filter(initCityData, function(d,i){
            var thisXPos = x(acc.size(d))
            return xPos > thisXPos && xPos <= thisXPos+cityWidth*.8 || xPos+cityWidth*.8 > thisXPos && xPos+cityWidth*.8 <= thisXPos+cityWidth*.8
        })
        _.each(initCityData, function(d,i){ d.hide = false})
        _.each(overlay, function(d,i){ d.hide = true})
        hoverCity = data[index]
        renderCities()
    })

    sel.select('.xAxis')
        .attr('transform', 'translate(0,-5)')
        .call(xAxis)
        .selectAll('path, line')
        .style({
            stroke: 'black',
            'stroke-width': 1
        })

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

        var cities = sel.selectAll('.city').data(cityData, function(d,i){return d.pop})
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
            .classed('hide', function(d,i){return d.hide})

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
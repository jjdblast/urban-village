(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var transform = require('./transform')
var render_mainVis = require('./render_mainVis')

d3.json('data/aggregate.json', function(err,data){
    
    data = transform(data)
    console.log(data[0])

    var render0 = render_mainVis()
        .render(d3.selectAll('.vis0'), data)

        
})
},{"./render_mainVis":6,"./transform":8}],2:[function(require,module,exports){

module.exports = function render_base(){

    var main = {width: 500, height: 500, left: 1, right: 1, top: 1, bottom: 1}

    main.render = function(sel, data) {

        return this
    }

    // receives d3 selection of a .wrp-vis (that must be always 100% width)
    // this method set the wrapper padding-bottom, 
    // the svg viewBox and the g.main translate
    // if it don't find a svg or g.main it creates one
    // OPTS
    // 'fullscreen' height for the container
    main.setSvg = function (sel, opts) {
        var fullWidth = this.width + this.left + this.right,
            fullHeight = this.height + this.top + this.bottom
        opts = opts ? opts : {}
        if (opts.fullscreen) {
            sel.style({height: '100%'})
        } else {
            sel.style({'padding-bottom': fullHeight/fullWidth*100 + '%'})
        }
        // svg
        var svg = sel.select('svg')
        if (svg.empty()) {
            svg = sel.append('svg')
        }
        svg.attr({
            // width: fullWidth, height: fullHeight
            viewBox: '0 0 '+fullWidth+' '+fullHeight,
            preserveAspectRatio: 'xMidYMid meet'
        })
        // g.main
        var g = svg.select('g.main')
        if (g.empty()) {
            g = svg.append('g').classed('main', true)
        }
        g.attr({
            transform: 'translate('+this.left+','+this.top+')'
        })
        return this
    }

    main.setG = function (sel) {
        sel.attr({
            transform: 'translate('+this.left+','+this.top+')'
        })
        return this
    }

    // functions for setting the box of the vis
    // receive an object with width, height, left, right, top, bottom
    main.svgBox = function (arg) {
        if (arguments.length==0) return this._getBox()
        this._setBox(arg)
        if (arg.width) this.width = arg.width - this.left - this.right
        if (arg.height) this.height = arg.height - this.top - this.bottom
        return this
    }
    main.gBox = function (arg) {
        if (arguments.length==0) return this._getBox()
        this._setBox(arg)
        return this
    }
    // helpers
    main._setBox = function (arg){
        if (_.has(arg, 'left')) this.left = arg.left
        if (_.has(arg, 'right')) this.right = arg.right
        if (_.has(arg, 'top')) this.top = arg.top
        if (_.has(arg, 'bottom')) this.bottom = arg.bottom
        if (_.has(arg, 'width')) this.width = arg.width
        if (_.has(arg, 'height')) this.height = arg.height
    }
    main._getBox = function (){
        return {width: this.width, height: this.height, left: this.left, right: this.right, top: this.top, bottom: this.bottom}
    }

    _.extend(main, {})

    return main
}

// base for new rendering modules
/*

var base = require('./render_base')()

module.exports = function render_vis(){
    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        return this
    }
    return main
}

*/
},{}],3:[function(require,module,exports){
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

    var x = d3.scale.log()
        .domain(d3.extent(data, acc.size))
        .range([cityWidth/2, this.width-cityWidth/2])
    var y = d3.scale.log()
        .domain([1, d3.max(data, function(d,i){return d.maxDegree})])
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
    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(6, '.,0s')
        .orient('left')

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
        .y(y)

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

    sel.select('.cityTicks')
        .selectAll('circle').data(data)
        .enter().append('circle')
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
            .transition()
            .duration(40)
            .ease('linear')
            .attr('transform', 'translate('+(x(acc.size(hoverCity))-cityWidth/2)+',0)')
        renderCity.renderHover(d3.select('.hoverCity'), hoverCity)

        var t = d3.select('.hoverCity').node()
        debugger

    }


    return this
}

module.exports = main
},{"./render_base":2,"./render_city2":5}],4:[function(require,module,exports){
var render_base = require('./render_base')()

module.exports = function render_vis(){

    var main = {}
    _.extend(main, render_base)

    main.render = function(sel, data) {

        this.setG(sel)

        var acc = {
            size: function(d,i){return d.amount}
        }

        data = _.sortBy(data, acc.size)

        var cityWidth = this.width / 8

        var xPop = d3.scale.log()
            .domain(d3.extent(data, acc.size))
            .range([cityWidth/2, this.width-cityWidth/2])
        var xPopAxis = d3.svg.axis()
            .scale(xPop)
            .ticks(6, ',.1s')
            .orient('top')

        var maxDegree = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){ return d.degree })
        })
        var maxAvgDegree = d3.max(data, function(d,i){ return d.meanDegree })
        var maxAmount = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){ return d.amount })
        })

        var r = d3.scale.log()
            .domain([1, maxAvgDegree])
            .range([0, cityWidth/2])

        var bottom = r(maxAvgDegree)
        var y = d3.scale.log()
            .domain([1, maxDegree])
            .range([this.height - bottom, this.height - bottom - r(maxDegree)])

        var x = d3.scale.linear()
            .domain([0, 15])
            .range([3, cityWidth/3])
        var xClust = d3.scale.linear()
            .domain([0,.5])
            .range([-3, -cityWidth/3])

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickValues([15])
            .orient('bottom')
        var xClustAxis = d3.svg.axis()
            .scale(xClust)
            .tickValues([.5])
            .orient('bottom')

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6, '.,0s')
            // .tickSize(-this.width+cityWidth, 0)
            .orient('left')

        var meanDegreeLine = d3.svg.line()
            .x(function(d,i){return xPop(acc.size(d))})
            .y(function(d,i){return y(d.meanDegree)})
        var maxDegreeLine = d3.svg.line()
            .x(function(d,i){return xPop(acc.size(d))})
            .y(function(d,i){return y(d.maxDegree)})

        var maxDegreeArea = d3.svg.area()
            .x(function(d,i){return xPop(acc.size(d))})
            .y1(function(d,i){return y(d.maxDegree)})
            .y0(function(d,i){return y(1)})
            // .interpolate('basis')

        var area = d3.svg.area()
            .y(function(d,i){return y(d.degree)})
            .x1(function(d,i){return 3})
            .x0(function(d,i){return x(d.amount)})
        var areaClust = d3.svg.area()
            .y(function(d,i){return y(d.degree)})
            .x1(function(d,i){return xClust(d.avgClustCoeff)})
            .x0(function(d,i){return -3})

        var arc = d3.svg.arc()

        bisect = d3.bisector(function(d,i){return d.pop}).right
        _data = data
        var xPopE = xPop.domain()
        var cityPops = d3.range(xPopE[0], xPopE[1], (xPopE[1]-xPopE[0])/5)
        cityPops.push(xPopE[1])
        console.log(cityPops)
        var cityPopsData = _.map(cityPops, function(d,i){
            return bisect(data, d)
        })
        console.log(cityPopsData)

        var cities = sel.selectAll('.city').data([data[0], data[21], data[83], data[120], _.last(data)])
        cities.enter().append(function () {
                return document.querySelector('#tpl-city g.city').cloneNode(true)
            })
        cities.each(function(d,i){
                renderCity(d3.select(this), d)
            })
        cities.exit().remove()

        function renderCity (sel, data) {
            // for city small multiple
            // x.domain([1, data.maxAmount])

            area.x0(function(d,i){return x((d.amount/data.amount)*100)})

            arc.innerRadius(r(data.meanDegree)+2.5)
                .outerRadius(r(data.meanDegree)-2.5)

            var contactsData = main.getContactsData(data.meanDegree, r(data.meanDegree))

            sel.attr('transform', 'translate('+ (xPop(acc.size(data))-cityWidth/2) +',0)')

            sel.select('.wrap')
                .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')

            sel.select('path.area')
                .attr({
                    transform: 'translate('+cityWidth/2+',0)',
                    d: area(data.degrees)
                })
                .style({
                    fill: 'url(#diagonalHatch)',
                    stroke: 'steelblue'
                })
            sel.select('path.areaClust')
                .attr({
                    transform: 'translate('+cityWidth/2+',0)',
                    d: areaClust(data.degrees)
                })
                .style({
                    fill: 'url(#diagonalHatch2)',
                    stroke: 'orange'
                })
                .on('click', function(d,i){
                    console.log(d)
                })

            sel.select('.contacts')
                .attr({
                    transform: 'translate('+cityWidth/2+','+ 580 +')' //+y(1)+')'
                })
            var connections = sel.select('.connections')
                .selectAll('path').data(contactsData.links)
            connections.enter().append('path') 
            connections.attr({
                    d: function(d,i){return d.path},
                })
                .style({
                    stroke: 'orange',
                    fill: 'none',
                    'stroke-width': 2.5
                })
            connections.exit().remove()

            var arcs = sel.select('g.arcs')
                .selectAll('path').data(contactsData.contacts)
            arcs.enter().append('path')
            arcs.attr({
                    d: arc
                })
                .style({
                    fill: 'gray'
                })
            arcs.exit().remove()

            // axis and background
            sel.select('.axis')
                .attr('transform', 'translate('+ (cityWidth/2+3) +',0)')
                .call(yAxis)
            sel.select('.xAxis')
                .attr('transform', 'translate('+ cityWidth/2 +','+(y(1)+10)+')')
                .call(xAxis)
                .selectAll('path, line')
                .style({
                    stroke: 'steelblue',
                    'stroke-width': 1
                })
            sel.select('.xClustAxis')
                .attr('transform', 'translate('+ cityWidth/2 +','+(y(1)+10)+')')
                .call(xClustAxis)
                .selectAll('path, line')
                .style({
                    stroke: 'orange',
                    'stroke-width': 1
                })



        }
        
 

        // city ticks
        sel.select('.cityTicks')
            .selectAll('circle').data(data)
            .enter().append('circle')
            .attr({
                cx: function(d,i){return xPop(acc.size(d))},
                cy: function(d,i){return y(d.meanDegree)},
                r: 1
            })
            .style({
                stroke: 'gray',
                fill: 'white',
                'stroke-width': 1
            })
            .attr('transform', 'translate(0,'+-(main.height - bottom - r(maxDegree))+')')


        // popAxis
        sel.select('.popAxis')
            .attr('transform', 'translate(0,'+-5+')')
            .call(xPopAxis)
            .selectAll('path, line')
            .style({
                stroke: 'black',
                'stroke-width': 1
            })
        // sel.select('.degreeAxis')
        //     .attr('transform', 'translate('+cityWidth/2+','+-(main.height - bottom - r(maxDegree))+')')
        //     .call(yAxis)
        //     .selectAll('path, line')
        //     .style({
        //         stroke: 'lightgray',
        //         'stroke-width': .5
        //     })

        sel.select('path.meanDegree')
            .attr('d', meanDegreeLine(data))
            .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')
            .style({
                fill: 'none', stroke: 'gray',
                'stroke-width': 1,
                'stroke-dashArray': '2,2'
            })
        sel.select('path.maxDegree')
            .attr('d', maxDegreeArea(data))
            .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')
            .style({
                fill: 'hsl(0,0%,92%)', stroke: 'none',
                'stroke-width': 1,
                'stroke-dashArray': '2,2'
            })

        return this
    }

    main.getContactsData = function(degree, radius) {
        var range = d3.range(degree)
        scale = d3.scale.ordinal()
            .domain(range)
            .rangeBands([0, 2*Math.PI], .2, .1)
        var contData = _.map(range, function(d,i){
            var startAngle = scale(d)
            return {
                startAngle: startAngle,
                endAngle: startAngle + scale.rangeBand(),
                id: i
            }
        })
        _.each(contData, function(cont,i){
            var ptsId = _.reject(range, function(d2){ return d2 == cont.id })
            ptsId = _.union(ptsId.slice(i), ptsId).reverse()
            var scale = d3.scale.ordinal()
                .domain(ptsId)//.reverse())
                .rangePoints([cont.startAngle, cont.endAngle], 1)
            cont.points = _.map(ptsId, function(d,i){
                return {
                    angle: scale(d),
                    id: d
                }
            })
        })
        var links = []
        _.each(contData, function(cont,i){
            _.each(cont.points, function(pt,i){
                if (!_.find(links, function(d,i){
                    return (d.fromId == cont.id && d.toId == pt.id) || (d.fromId == pt.id && d.toId == cont.id)
                })) {
                    links.push({
                        fromId: cont.id,
                        toId: pt.id,
                        from: pt.angle,
                        to: _.find(_.find(contData, function(d,i){return d.id == pt.id}).points, function(d,i){return d.id == cont.id}).angle,
                        random: Math.random(),
                        index: i
                    })
                }
            })
        })
        // var radius = r(degree)
        _.each(links, function(d,i){
            var halfPI = Math.PI/2
            d.path = 'M '+ radius*Math.cos(d.from - halfPI) +','+ radius*Math.sin(d.from - halfPI) + ' Q 0,0 '+ radius*Math.cos(d.to - halfPI) +','+ radius*Math.sin(d.to - halfPI)
        })

        return {
            links: links.slice(0,links.length*.25),
            contacts: contData
        }
    }

    return main
}
},{"./render_base":2}],5:[function(require,module,exports){
var render_base = require('./render_base')()

var coverageRadius = 15

// scales
var xAmount = d3.scale.linear()
    .domain([0, 15])
var xClust = d3.scale.linear()
    .domain([0,.5])
var pop = d3.scale.sqrt()
var y
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
    .scale(y)
    .ticks(6, '.,1s')
    .orient('left')

// draw functions
var areaAmount = d3.svg.area()
var areaClust = d3.svg.area()

// MAIN
var main = {}
_.extend(main, render_base)

main.render = function (sel, data) {

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
        .range([this.height, y(data.maxDegree)])

    yAxis.scale(y2)

    // draw functions
    areaAmount
        .y(function(d,i){return y(d.degree)})
        .x1(function(d,i){return 0})
        .x0(function(d,i){return xAmount((d.amount/data.amount)*100)})
    areaClust
        .y(function(d,i){return y(d.degree)})
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

main.y = function (arg) {
    if (arguments.length == 0) return y
    y = arg
    return this
}

module.exports = main
},{"./render_base":2}],6:[function(require,module,exports){
var render_base = require('./render_base')()
var render_sumContacts = require('./render_sumContacts')()
var render_city = require('./render_city')()
var render_citiesView = require('./render_citiesView')


module.exports = function render_vis0(){

    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        this.svgBox({width: 1100, height: 400, top: 40, bottom: 60, left: 20, right:20})
        this.setSvg(sel)

        render_sumContacts.gBox({
                width: this.height/2,
                height: this.height/2,
                top: 50,
                left: 20
            })
            // .render(sel.select('g.view-sumContacts'), data)

        render_city.gBox({
                width: this.width,
                height: this.height,
                top: 0,
                left: 0
            })
            // .render(sel.select('g.view-cities'), data)

        render_citiesView.gBox({
                width: this.width,
                height: this.height,
                top: 0,
                left: 0
            })
            .setG(sel.select('g.view-cities'))
            .render(sel.select('g.view-cities'), data)

        return main
    }
    return main
}
},{"./render_base":2,"./render_citiesView":3,"./render_city":4,"./render_sumContacts":7}],7:[function(require,module,exports){
var render_base = require('./render_base')()

module.exports = function render_vis0_cities(){
    
    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        this.setG(sel)

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
    return main
}
},{"./render_base":2}],8:[function(require,module,exports){
// transform

module.exports = function transform(data){

    _.each(data, function(d,i){
        d.degrees = _.filter(d.degrees, function(d,i){return d.amount>0})
        d.maxDegree = d3.max(d.degrees, function(d,i){return d.degree})
        d.sumDegree = d3.sum(d.degrees, function(d,i){return d.degree*d.amount}) / (d.amount/d.pop)
        d.maxAmount = d3.max(d.degrees, function(d,i){return d.amount})

        var totalContacts = d3.sum(d.degrees, function(d,i){return d.amount})
        var medianIndex = (totalContacts)/2

        // mean
        d.meanDegree = _.reduce(d.degrees, function(acc,d,i){
            return acc + d.amount*d.degree
        },0) / d.amount 

        d.meanCluster = _.reduce(d.degrees, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts

    })

    return _(data).filter(function (d,i) {
            return d.amount / d.pop > .1
        })
        // .reject(function(d,i){return d.meanDegree>14})
        .sortBy('pop')
        .value()

}
},{}]},{},[1])
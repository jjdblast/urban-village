(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

        this.svgBox({width: 1200, height: 550, top: 20, bottom: 20, left: 20, right:20})
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
            y: function(d,i){return d.sumDegree}
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
        var yMin = d3.min(data.slice(0,2), acc.y)-600
        var yExt = [yMin, yMin*(Math.pow(xExt[1]/xExt[0],1.12))]
        var yExt2 = [yMin, yMin*(Math.pow(xExt[1]/xExt[0],1))]


        console.log((xExt[1]/xExt[0]))

        // draw
        var cities = sel.select('g.cities')
            .selectAll('circle').data(data)
        cities.enter().append('circle')

        cities
            .attr({
                cx: function(d,i){return x(acc.x(d))},
                cy: function(d,i){return y(acc.y(d))},
                r: 2
            })

        sel.select('path.line1')
            .attr('d', line([[xExt[0], yExt[0]], [xExt[1], yExt[1]] ]))
            .style({
                fill: 'none',
                stroke: 'black'
            })
        sel.select('path.line2')
            .attr('d', line([[xExt[0], yExt2[0]], [xExt[1], yExt2[1]] ]))
            .style({
                fill: 'none',
                stroke: 'gray',
                'stroke-dashArray': '2,2'
            })

        // draw axis
        sel.select('g.x.axis')
            .attr('transform', 'translate(0,'+ this.height +')')
            .call(xAxis)
        sel.select('g.y.axis')
            .attr('transform', 'translate('+ this.width +',0)')
            .call(yAxis)


        return this
    }
    return main
}
},{"./render_base":2,"./transform":3}],2:[function(require,module,exports){

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
    }

    main.setG = function (sel) {
        sel.attr({
            transform: 'translate('+this.left+','+this.top+')'
        })
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
// transform

module.exports = function transform(data){

    _.each(data, function(d,i){

        // d.degrees = _.filter(d.degrees, function(d,i){return d.amount>1})
        d.maxDegree = d3.max(d.degrees, function(d,i){return d.degree})
        d.sumDegree = d3.sum(d.degrees, function(d,i){return d.degree*d.amount}) / (d.amount/d.pop)

        var totalContacts = d3.sum(d.degrees, function(d,i){return d.amount})
        var medianIndex = (totalContacts)/2

        // median
        // var ordered = _.sortBy(d.degrees, function(d,i){return d.amount})
        // _.reduce(ordered, function (acc, d, i) {
        //     d.from = acc
        //     d.to = acc + d.amount
        //     return d.to
        // }, 4)
        // var medianObj = _.find(ordered, function(d,i){
        //     return medianIndex > d.from && medianIndex <= d.to
        // })
        // d.medianDegree = medianObj.degree

        // mean
        d.meanDegree = _.reduce(d.degrees, function(acc,d,i){
            return acc + d.amount*d.degree
        },0) / d.amount 

        d.meanCluster = _.reduce(d.degrees, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts

    })

    return data
}
},{}]},{},[1])
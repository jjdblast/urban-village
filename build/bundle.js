(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var radians = Math.PI / 180;

  d3.scale.cubehelix = function() {
    return d3.scale.linear()
        .range([d3.hsl(300, .5, 0), d3.hsl(-240, .5, 1)])
        .interpolate(d3.interpolateCubehelix);
  };

  d3.interpolateCubehelix = d3_interpolateCubehelix(1);
  d3.interpolateCubehelix.gamma = d3_interpolateCubehelix;

  function d3_interpolateCubehelix(γ) {
    return function(a, b) {
      a = d3.hsl(a);
      b = d3.hsl(b);

      var ah = (a.h + 120) * radians,
          bh = (b.h + 120) * radians - ah,
          as = a.s,
          bs = b.s - as,
          al = a.l,
          bl = b.l - al;

      if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
      if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah;

      return function(t) {
        var h = ah + bh * t,
            l = Math.pow(al + bl * t, γ),
            a = (as + bs * t) * l * (1 - l);
        return "#"
            + hex(l + a * (-0.14861 * Math.cos(h) + 1.78277 * Math.sin(h)))
            + hex(l + a * (-0.29227 * Math.cos(h) - 0.90649 * Math.sin(h)))
            + hex(l + a * (+1.97294 * Math.cos(h)));
      };
    };
  }

  function hex(v) {
    var s = (v = v <= 0 ? 0 : v >= 1 ? 255 : v * 255 | 0).toString(16);
    return v < 0x10 ? "0" + s : s;
  }
})();
},{}],2:[function(require,module,exports){

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
},{"./cubehelix":1,"./render_base":3,"./transform":4}],3:[function(require,module,exports){

module.exports = function render_base(){

    var main = {width: 500, height: 500, left: 1, right: 1, top: 1, bottom: 1}

    main.render = function(sel, data) {

        return main
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
        return main
    }
    main.gBox = function (arg) {
        if (arguments.length==0) return this._getBox()
        this._setBox(arg)
        return main
    }
    // helpers
    main._setBox = function (arg){
        if (arg.left) this.left = arg.left
        if (arg.right) this.right = arg.right
        if (arg.top) this.top = arg.top
        if (arg.bottom) this.bottom = arg.bottom
        if (arg.width) this.width = arg.width
        if (arg.height) this.height = arg.height
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

        return main
    }
    return main
}

*/
},{}],4:[function(require,module,exports){
// transform

module.exports = function transform(data){

    _.each(data, function(d,i){
        // console.log(d3.max(d.contacts, function(d,i){return d.amount}))
        d.contacts = _.filter(d.contacts, function(d,i){return d.amount>1})
        d.maxDegree = d3.max(d.contacts, function(d,i){return d.degree})

        var totalContacts = d3.sum(d.contacts, function(d,i){return d.amount})
        var medianIndex = (totalContacts)/2
        var ordered = _.sortBy(d.contacts, function(d,i){return d.amount})
        _.reduce(ordered, function (acc, d, i) {
            d.from = acc
            d.to = acc + d.amount
            return d.to
        }, 4)
        var medianObj = _.find(ordered, function(d,i){
            return medianIndex > d.from && medianIndex <= d.to
        })

        d.meanDegree = _.reduce(d.contacts, function(acc,d,i){
            return acc + d.amount*d.degree
        },0) / totalContacts
        // console.log('mean', mean)

        console.log(medianObj, medianIndex, totalContacts)

        var meanCluster = _.reduce(d.contacts, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts
        console.log('meanCluster', meanCluster)

        var meanCluster = _.reduce(d.contacts, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts

        var s = d3.scale.log()
            .domain([1, d3.max(d.contacts, function(d,i){return d.amount})])
            .range([0,1])
        _.each(d.contacts, function(d2,i){
            d2.normAmount = s(d2.amount)
        })
    })

    return data
}
},{}]},{},[2])
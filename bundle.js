(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// d3.json('data/pop_urbArea.json', function(err,data){
//     data.shift()
//     var drawCities = DrawCities()
//         .render(d3.selectAll('body'), data)
// })

d3.json('data/aggregate.json', function(err,data){
    d = data
    console.log(d)
})

var base = require('./render_base')()

module.exports = function render_vis(){
    var main = {}
    main.render = function(sel, data) {

        return main
    }
    _.extend(main, render_base)
    return main
}
},{"./render_base":2}],2:[function(require,module,exports){

module.exports = function render_base(){

    var main = {width: 500, height: 500, left: 1, right: 1, top: 1, bottom: 1}

    main.render = function(sel, data) {

        return main
    }

    // receives d3 selection of a .visCtn (that must be always 100% width)
    // the container needs to be inside of a collumn
    // this method set the container padding-bottom, 
    // the svg viewBox and the g.main translate
    // if it don't find a svg or g.main it creates one
    // OPTS
    // 'fullscreen' height for the container
    main.setSvg = function (sel, opts) {
        // .visCtn
        var fullWidth = this.width + this.left + this.right,
            fullHeight = this.height + this.top + this.bottom
        sel.classed('visCtn', true)
        if (opts.fullscreen) {
            sel.style({height: '100%'})
        } else {
            sel.style({height: fullHeight/fullWidth + '%'})
        }
        // svg
        var svg = sel.select('svg')
        if (svg.empty()) {
            svg = sel.append('svg')
        }
        svg.attr({
            viewBox: '0 0 '+fullHeight+' '+fullWidth,
            preserveAspectRatio: 'xMidYMid meet'
        })
        // g.main
        var g = svg.select('g.main')
        if (g.empty()) {
            g = sel.append('g').classed('main', true)
        }
        g.attr({
            transform: 'translate('+this.left+','+this.top+')'
        })
    }

    setG = function (sel) {
        sel.attr({
            transform: 'translate('+this.left+','+this.top+')'
        })
    }

    main.setSvgBox = function (arg) {
        if (arguments.length==0) return getBox()
        setBox(arg)
        if (arg.width) this.width = arg.width - this.left - this.right
        if (arg.height) this.height = arg.height - this.top - this.bottom
        return main
    }
    main.setGBox = function (arg) {
        if (arguments.length==0) return getBox()
        setBox(arg)
        return main
    }
    function setBox (arg){
        if (arg.left) this.left = arg.left
        if (arg.right) this.right = arg.right
        if (arg.top) this.top = arg.top
        if (arg.bottom) this.bottom = arg.bottom
        if (arg.width) this.width = arg.width
        if (arg.height) this.height = arg.height
    }
    function getBox (arg){
        return {width: this.width, height: this.height, lef: this.left, right: this.right, top: this.top, bottom: this.bottom}
    }

    _.extend(main, {})

    return main
}

// base for new rendering modules
/*

var base = require('./render_base')()

module.exports = function render_vis(){
    var main = {}
    main.render = function(sel, data) {

        return main
    }
    _.extend(main, render_base)
    return main
}

*/
},{}]},{},[1])

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

var main = {}
_.extend(main, render_base)

main.render = function(sel, data) {

    return this
}

module.exports = main

*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

d3.json('data/pop_urbArea.json', function(err,data){
    data.shift()
    var drawCities = DrawCities()
        .render(d3.selectAll('body'), data)
})

function DrawCities(){

    var margin = {t:10,b:30,l:10,r:10},
        width = 1500 - margin.l - margin.r,
        height = 80 - margin.t - margin.b

    var main = {}
    main.render = function (sel, data) {
        var g = sel.append('svg')
            .attr({
                width: width + margin.l + margin.r,
                height: height + margin.t + margin.b
            })
            .append('g')
            .classed('main', true)
            .attr({transform: 'translate('+margin.l+','+margin.t+')'})

        var x = d3.scale.log()
            .domain(d3.extent(data))
            .range([0,width])
        var formatN = d3.format('.0f')
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(10)
            .tickFormat(function(d,i){
                var f = d3.formatPrefix(d)
                return formatN(f.scale(d))+' '+f.symbol
            })

        g.selectAll('path').data(data)
            .enter().append('path')
            .attr({
                d: function(d,i){return 'M'+x(d)+',0 v'+height}
            })
            .style({
                stroke: 'black'
            })
        g.append('g')
            .classed('axis', true)
            .attr({
                'transform': 'translate(0,'+height+')'
            })
            .call(xAxis)

        return main
    }
    return main
}
},{}]},{},[1])
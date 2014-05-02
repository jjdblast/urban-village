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

function render_vis0(){

    var main = {}
    main.render = function(sel, data) {
        
        return main
    }
    return main
}
},{}]},{},[1])
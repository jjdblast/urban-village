
var render_sumContacts = require('./render_sumContacts')
var citiesView = require('./render_citiesView')

var main = {}

main.init = function(data) {

    var selCitiesView = d3.select('.vis0')
    citiesView.svgBox({width: 1000, height: 350, top: 30, bottom: 40, left: 20, right:20})
        .setSvg(selCitiesView)
        .render(selCitiesView, data)

    render_sumContacts.svgBox({
            width: 300,
            height: 300,
            top: 40, bottom: 40, left: 5, right:60
        })
        .setSvg(d3.select('.vis1'))
        .render(d3.select('.vis1'), data)

    return main
}

module.exports = main

// render_sumContacts.gBox({
//         width: this.height/2,
//         height: this.height/2,
//         top: 50,
//         left: 20
//     })
    // .render(sel.select('g.view-sumContacts'), data)

// render_city.gBox({
//         width: this.width,
//         height: this.height,
//         top: 0,
//         left: 0
//     })
    // .render(sel.select('g.view-cities'), data)
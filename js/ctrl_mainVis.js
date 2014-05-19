
var render_sumContacts = require('./render_sumContacts')()
var render_citiesView = require('./render_citiesView')

var main = {}

main.init = function(data) {

    // this.svgBox({width: 1100, height: 400, top: 40, bottom: 60, left: 20, right:20})
    // this.setSvg(sel)

    var selCitiesView = d3.select('.vis0')
    render_citiesView.svgBox({width: 1100, height: 400, top: 40, bottom: 60, left: 20, right:20})
        .setSvg(selCitiesView)
        .render(selCitiesView, data)

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
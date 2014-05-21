
var render_sumContacts = require('./render_sumContacts')()
var citiesView = require('./render_citiesView')
var conPreview = require('./render_conPreview')

var main = {}

main.init = function(data) {

    // this.svgBox({width: 1100, height: 400, top: 40, bottom: 60, left: 20, right:20})
    // this.setSvg(sel)

    var selCitiesView = d3.select('.vis0')
    citiesView.svgBox({width: 800, height: 350, top: 60, bottom: 50, left: 20, right:20})
        .setSvg(selCitiesView)
        .render(selCitiesView, data)

    var selConPreview = d3.select('.view-conPreview')
    conPreview.svgBox({width: 400, height: 400, top: 40, bottom: 60, left: 20, right:20})
        .setSvg(selConPreview)
        // .render(selConPreview, data[20])

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
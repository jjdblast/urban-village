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
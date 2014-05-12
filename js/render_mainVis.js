var render_base = require('./render_base')()
var render_sumContacts = require('./render_sumContacts')()

module.exports = function render_vis0(){

    var main = {}
    _.extend(main, render_base)
    main.render = function(sel, data) {

        this.svgBox({width: 1200, height: 600, top: 20, bottom: 20, left: 20, right:20})
        this.setSvg(sel)

        render_sumContacts.gBox({
                width: this.height/2,
                height: this.height/2,
                top: 50,
                left: 20
            })
            .render(sel.select('g.citiesView'), data)

        return main
    }
    return main
}
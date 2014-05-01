
render_base = function(){
    var main = {
        margin: {t:10, b:10, l:10, r:10},
        setSize: function (sel) {
            var t = this
            var sel = sel ? sel : t.sel
            t.box = sel.node().getBoundingClientRect()
            t.width = t.box.width - t.margin.l - t.margin.r
            t.height = t.box.height - t.margin.t - t.margin.b
            return main
        },
        setSvg: function (sel) {
            var t = this
            var sel = sel ? sel : this.sel
            sel.select('svg')
                .attr({
                    width: this.box.width, height: this.box.height   
                })
                .select('g.main')
                .attr({
                    transform: 'translate('+this.margin.l+','+this.margin.t+')'
                })
            return main
        },
    }
    return main
}

module.exports = render_base
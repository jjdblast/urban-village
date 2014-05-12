var render_base = require('./render_base')()

module.exports = function render_vis(){

    var main = {}
    _.extend(main, render_base)

    main.render = function(sel, data) {

        this.setG(sel)

        var acc = {

        }

        var maxDegree = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){
                return d.degree
            })
        })
        var maxAvgDegree = d3.max(data, function(d,i){
            return d.meanDegree
        })
        console.log(maxDegree, maxAvgDegree)

        var y = d3.scale.log()
            .domain([1, maxDegree])
            .range([0, this.height])
        y.range([this.height-y(maxAvgDegree), 0])
        var r = y.copy()
            .range(_.clone(y.range()).reverse())

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6, '.,0s')
            .orient('left')

        sel.select('circle')
            .attr({
                cx: this.width/2,
                cy: y(1),
                r: r(data[10].meanDegree)
            })
            .style({
                fill: 'none',
                stroke: 'black'
            })

        sel.select('rect.background')
            .attr({x:0,y:0,width:this.width,height:this.height})
            .style({fill:'lightgray'})

        sel.select('.axis')
            .attr('transform', 'translate('+ this.width/2 +',0)')
            .call(yAxis)

        return this
    }

    return main
}
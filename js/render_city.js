var render_base = require('./render_base')()

module.exports = function render_vis(){

    var main = {}
    _.extend(main, render_base)

    main.render = function(sel, data) {

        this.setG(sel)

        var acc = {

        }

        var maxDegree = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){ return d.degree })
        })
        var maxAvgDegree = d3.max(data, function(d,i){ return d.meanDegree })
        var maxAmount = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){ return d.amount })
        })
        var maxAmount = d3.max(data[50].degrees, function(d,i){ return d.amount })

        var r = d3.scale.log()
            .domain([1, maxAvgDegree])
            .range([0, this.width/2])

        var bottom = r(maxAvgDegree)
        var y = d3.scale.log()
            .domain([1, maxDegree])
            .range([this.height - bottom, this.height - bottom - r(maxDegree)])

        var x = d3.scale.linear()
            .domain([1, maxAmount/2])
            .range([0, this.width/4])

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6, '.,0s')
            .orient('left')

        var area = d3.svg.area()
            .y(function(d,i){return y(d.degree)})
            .x1(function(d,i){return -x(d.amount/2)})
            .x0(function(d,i){return x(d.amount/2)})

        var matrix = [
          [0,  10, 10, 10],
          [ 10, 0, 10, 10],
          [ 10, 10, 0, 10],
          [ 10, 10, 10, 0]
        ]

        var chord = d3.layout.chord()
            .padding(.15)
            .matrix(matrix)

        var innerRadius = r(data[50].meanDegree) * 1
        var outerRadius = innerRadius * 1.15;

        sel.select('.wrap')
            .attr('transform', 'translate(0,'+ -(this.height - bottom - r(maxDegree))/2 +')')

        sel.select('circle')
            .attr({
                cx: this.width/2,
                cy: y(1),
                r: r(data[50].meanDegree)
            })
            .style({
                fill: 'none',
                stroke: 'black',
                'stroke-width': 2
            })

        sel.select('path.area')
            .attr({
                transform: 'translate('+this.width/2+',0)',
                d: area(data[50].degrees)
            })
            .style({
                fill: 'url(#diagonalHatch)'
            })

        sel.select('.connections')
            .attr({
                transform: 'translate('+this.width/2+','+y(1)+')'
            })

        sel.select('g.arcs')
            .selectAll('path').data(chord.groups)
            .enter().append('path')
            .style({
                fill: 'orange'
            })
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))

        console.log(chord.chords())

        sel.select('g.chords')
            .selectAll("path")
            .data(_.each(chord.chords(), function(d,i){
                d.source.startAngle += .1
                // d.source.endAngle -= .1
                // d.target.startAngle -= .1
                d.target.endAngle -= .1
            }).slice(0,4))
          .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius))
            .style({
                fill: 'orange',
                stroke: 'black'
            })


        // axis and background
        sel.select('.axis')
            .attr('transform', 'translate('+ this.width/2 +',0)')
            .call(yAxis)
        
        sel.select('rect.background')
            .attr({x:0,y:0,width:this.width,height:this.height})
            .style({stroke:'lightgray', fill:'none'})

        return this
    }

    return main
}
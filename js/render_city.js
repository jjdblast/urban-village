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

        var range = d3.range(10)
        scale = d3.scale.ordinal()
            .domain(range)
            .rangeBands([0, 2*Math.PI], .2, .1)
        var contData = _.map(range, function(d,i){
            var startAngle = scale(d)
            return {
                startAngle: startAngle,
                endAngle: startAngle + scale.rangeBand(),
                id: i
            }
        })
        _.each(contData, function(cont,i){
            var ptsId = _.reject(range, function(d2){ return d2 == cont.id })
            ptsId = _.union(ptsId.slice(i), ptsId).reverse()
            var scale = d3.scale.ordinal()
                .domain(ptsId)//.reverse())
                .rangePoints([cont.startAngle, cont.endAngle], 1)
            cont.points = _.map(ptsId, function(d,i){
                return {
                    angle: scale(d),
                    id: d
                }
            })
        })
        var links = []
        _.each(contData, function(cont,i){
            _.each(cont.points, function(pt,i){
                if (!_.find(links, function(d,i){
                    return (d.fromId == cont.id && d.toId == pt.id) || (d.fromId == pt.id && d.toId == cont.id)
                })) {
                    links.push({
                        fromId: cont.id,
                        toId: pt.id,
                        from: pt.angle,
                        to: _.find(_.find(contData, function(d,i){return d.id == pt.id}).points, function(d,i){return d.id == cont.id}).angle,
                        random: Math.random(),
                        index: i
                    })
                }
            })
        })
        var radius = r(data[50].meanDegree)
        _.each(links, function(d,i){
            var halfPI = Math.PI/2
            d.path = 'M '+ radius*Math.cos(d.from - halfPI) +','+ radius*Math.sin(d.from - halfPI) + ' Q 0,0 '+ radius*Math.cos(d.to - halfPI) +','+ radius*Math.sin(d.to - halfPI)
            d.path2 = [
                [radius, d.from], [0,0], [radius, d.to]
            ]
        })

        var arc = d3.svg.arc()
            .innerRadius(r(data[50].meanDegree)-5)
            .outerRadius(r(data[50].meanDegree))

        var radialLine = d3.svg.line.radial()
            .interpolate('bundle')
            .tension(.5)
            

        sel.select('.wrap')
            .attr('transform', 'translate(0,'+ -(this.height - bottom - r(maxDegree))/2 +')')

        // sel.select('circle')
        //     .attr({
        //         cx: this.width/2,
        //         cy: y(1),
        //         r: r(data[50].meanDegree)
        //     })
        //     .style({
        //         fill: 'none',
        //         stroke: 'black',
        //         'stroke-width': 2
        //     })

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
        d3.select('.chords')
            .selectAll('path').data(links.slice(0,links.length*.25))
            .enter().append('path') 
            .attr({
                d: function(d,i){return d.path},//radialLine(d.path2)}
            })
            .style({
                stroke: 'orange',
                fill: 'none',
                'stroke-width': 3
            })

        sel.select('g.arcs')
            .selectAll('path').data(contData)
            .enter().append('path')
            .attr({
                d: arc
            })
            .style({
                fill: 'gray'
            })

        // sel.select('g.chords')
        //     .selectAll("path")
        //     .data(_.each(chord.chords(), function(d,i){
        //         d.source.startAngle += .1
        //         // d.source.endAngle -= .1
        //         // d.target.startAngle -= .1
        //         d.target.endAngle -= .1
        //     }).slice(0,4))
        //   .enter().append("path")
        //     .attr("d", d3.svg.chord().radius(innerRadius))
        //     .style({
        //         fill: 'orange',
        //         stroke: 'black'
        //     })


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
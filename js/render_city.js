var render_base = require('./render_base')()

module.exports = function render_vis(){

    var main = {}
    _.extend(main, render_base)

    main.render = function(sel, data) {

        this.setG(sel)

        var acc = {
            size: function(d,i){return d.pop}
        }

        var cityWidth = this.width / 5

        var xPop = d3.scale.log()
            .domain(d3.extent(data, acc.size))
            .range([cityWidth/2, this.width-cityWidth/2])
        var xPopAxis = d3.svg.axis()
            .scale(xPop)
            .ticks(6, ',.1s')
            .orient('bottom')

        var maxDegree = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){ return d.degree })
        })
        var maxAvgDegree = d3.max(data, function(d,i){ return d.meanDegree })
        var maxAmount = d3.max(data, function(d,i){
            return d3.max(d.degrees, function(d,i){ return d.amount })
        })

        var r = d3.scale.log()
            .domain([1, maxAvgDegree])
            .range([0, cityWidth/2])

        var bottom = r(maxAvgDegree)
        var y = d3.scale.log()
            .domain([1, maxDegree])
            .range([this.height - bottom, this.height - bottom - r(maxDegree)])

        var x = d3.scale.log()
            .domain([1, maxAmount/2])
            .range([0, cityWidth/3])

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6, '.,0s')
            .tickSize(-this.width+40, 0)
            .orient('left')

        var meanDegreeLine = d3.svg.line()
            .x(function(d,i){return xPop(acc.size(d))})
            .y(function(d,i){return y(d.meanDegree)})

        var area = d3.svg.area()
            .y(function(d,i){return y(d.degree)})
            .x1(function(d,i){return -x(d.amount/2)})
            .x0(function(d,i){return x(d.amount/2)})

        var arc = d3.svg.arc()

        bisect = d3.bisector(function(d,i){return d.pop}).right
        _data = data
        var xPopE = xPop.domain()
        var cityPops = d3.range(xPopE[0], xPopE[1], (xPopE[1]-xPopE[0])/5)
        cityPops.push(xPopE[1])
        console.log(cityPops)
        var cityPopsData = _.map(cityPops, function(d,i){
            return bisect(data, d)
        })
        console.log(cityPopsData)

        var cities = sel.selectAll('.city').data([data[1], data[21], data[83], data[104], data[108]])
        cities.enter().append(function () {
                return document.querySelector('#tpl-city g.city').cloneNode(true)
            })
        cities.each(function(d,i){
                renderCity(d3.select(this), d)
            })
        cities.exit().remove()

        function renderCity (sel, data) {
            // for city small multiple
            arc.innerRadius(r(data.meanDegree)+2.5)
                .outerRadius(r(data.meanDegree)-2.5)

            var contactsData = main.getContactsData(data.meanDegree, r(data.meanDegree))

            sel.attr('transform', 'translate('+ (xPop(acc.size(data))-cityWidth/2) +',0)')

            sel.select('.wrap')
                // .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')

            sel.select('path.area')
                .attr({
                    transform: 'translate('+cityWidth/2+',0)',
                    d: area(data.degrees)
                })
                .style({
                    fill: 'url(#diagonalHatch)',
                })

            sel.select('.contacts')
                .attr({
                    transform: 'translate('+cityWidth/2+','+y(1)+')'
                })
            var connections = sel.select('.connections')
                .selectAll('path').data(contactsData.links)
            connections.enter().append('path') 
            connections.attr({
                    d: function(d,i){return d.path},
                })
                .style({
                    stroke: 'orange',
                    fill: 'none',
                    'stroke-width': 2.5
                })
            connections.exit().remove()

            var arcs = sel.select('g.arcs')
                .selectAll('path').data(contactsData.contacts)
            arcs.enter().append('path')
            arcs.attr({
                    d: arc
                })
                .style({
                    fill: 'gray'
                })
            arcs.exit().remove()

            // axis and background
            sel.select('.city .axis')
                .attr('transform', 'translate('+ cityWidth/2 +',0)')
                // .call(yAxis)
        }
        
 

        // city ticks
        // sel.select('.cityTicks')
        //     .selectAll('path').data(data)
        //     .enter().append('path')
        //     .attr({
        //         d: function(d,i){
        //             return 'M '+xPop(acc.size(d))+',0 l 0,-6'
        //         }
        //     })
        //     .style({
        //         stroke: 'gray',
        //         'stroke-width': 2
        //     })
        //     .attr('transform', 'translate(0,'+this.height+')')


        // popAxis
        sel.select('.popAxis')
            .attr('transform', 'translate(0,'+this.height+')')
            .call(xPopAxis)
            .selectAll('path, line')
            .style({
                stroke: 'gold'
            })
        sel.select('.degreeAxis')
            .attr('transform', 'translate(30,0)')
            .call(yAxis)
            .selectAll('path, line')
            .style({
                stroke: 'gold'
            })

        sel.select('path.meanDegree')
            .attr('d', meanDegreeLine(data))
            // .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')
            .style({
                fill: 'none', stroke: 'gray',
                'stroke-width': 2
            })

        return this
    }

    main.getContactsData = function(degree, radius) {
        var range = d3.range(degree)
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
        // var radius = r(degree)
        _.each(links, function(d,i){
            var halfPI = Math.PI/2
            d.path = 'M '+ radius*Math.cos(d.from - halfPI) +','+ radius*Math.sin(d.from - halfPI) + ' Q 0,0 '+ radius*Math.cos(d.to - halfPI) +','+ radius*Math.sin(d.to - halfPI)
        })

        return {
            links: links.slice(0,links.length*.25),
            contacts: contData
        }
    }

    return main
}
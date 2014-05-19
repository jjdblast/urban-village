var render_base = require('./render_base')()

module.exports = function render_vis(){

    var main = {}
    _.extend(main, render_base)

    main.render = function(sel, data) {

        this.setG(sel)

        var acc = {
            size: function(d,i){return d.amount}
        }

        data = _.sortBy(data, acc.size)

        var cityWidth = this.width / 8

        var xPop = d3.scale.log()
            .domain(d3.extent(data, acc.size))
            .range([cityWidth/2, this.width-cityWidth/2])
        var xPopAxis = d3.svg.axis()
            .scale(xPop)
            .ticks(6, ',.1s')
            .orient('top')

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

        var x = d3.scale.linear()
            .domain([0, 15])
            .range([3, cityWidth/3])
        var xClust = d3.scale.linear()
            .domain([0,.5])
            .range([-3, -cityWidth/3])

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickValues([15])
            .orient('bottom')
        var xClustAxis = d3.svg.axis()
            .scale(xClust)
            .tickValues([.5])
            .orient('bottom')

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6, '.,0s')
            // .tickSize(-this.width+cityWidth, 0)
            .orient('left')

        var meanDegreeLine = d3.svg.line()
            .x(function(d,i){return xPop(acc.size(d))})
            .y(function(d,i){return y(d.meanDegree)})
        var maxDegreeLine = d3.svg.line()
            .x(function(d,i){return xPop(acc.size(d))})
            .y(function(d,i){return y(d.maxDegree)})

        var maxDegreeArea = d3.svg.area()
            .x(function(d,i){return xPop(acc.size(d))})
            .y1(function(d,i){return y(d.maxDegree)})
            .y0(function(d,i){return y(1)})
            // .interpolate('basis')

        var area = d3.svg.area()
            .y(function(d,i){return y(d.degree)})
            .x1(function(d,i){return 3})
            .x0(function(d,i){return x(d.amount)})
        var areaClust = d3.svg.area()
            .y(function(d,i){return y(d.degree)})
            .x1(function(d,i){return xClust(d.avgClustCoeff)})
            .x0(function(d,i){return -3})

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

        var cities = sel.selectAll('.city').data([data[0], data[21], data[83], data[120], _.last(data)])
        cities.enter().append(function () {
                return document.querySelector('#tpl-city g.city').cloneNode(true)
            })
        cities.each(function(d,i){
                renderCity(d3.select(this), d)
            })
        cities.exit().remove()

        function renderCity (sel, data) {
            // for city small multiple
            // x.domain([1, data.maxAmount])

            area.x0(function(d,i){return x((d.amount/data.amount)*100)})

            arc.innerRadius(r(data.meanDegree)+2.5)
                .outerRadius(r(data.meanDegree)-2.5)

            var contactsData = main.getContactsData(data.meanDegree, r(data.meanDegree))

            sel.attr('transform', 'translate('+ (xPop(acc.size(data))-cityWidth/2) +',0)')

            sel.select('.wrap')
                .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')

            sel.select('path.area')
                .attr({
                    transform: 'translate('+cityWidth/2+',0)',
                    d: area(data.degrees)
                })
                .style({
                    fill: 'url(#diagonalHatch)',
                    stroke: 'steelblue'
                })
            sel.select('path.areaClust')
                .attr({
                    transform: 'translate('+cityWidth/2+',0)',
                    d: areaClust(data.degrees)
                })
                .style({
                    fill: 'url(#diagonalHatch2)',
                    stroke: 'orange'
                })
                .on('click', function(d,i){
                    console.log(d)
                })

            sel.select('.contacts')
                .attr({
                    transform: 'translate('+cityWidth/2+','+ 580 +')' //+y(1)+')'
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
            sel.select('.axis')
                .attr('transform', 'translate('+ (cityWidth/2+3) +',0)')
                .call(yAxis)
            sel.select('.xAxis')
                .attr('transform', 'translate('+ cityWidth/2 +','+(y(1)+10)+')')
                .call(xAxis)
                .selectAll('path, line')
                .style({
                    stroke: 'steelblue',
                    'stroke-width': 1
                })
            sel.select('.xClustAxis')
                .attr('transform', 'translate('+ cityWidth/2 +','+(y(1)+10)+')')
                .call(xClustAxis)
                .selectAll('path, line')
                .style({
                    stroke: 'orange',
                    'stroke-width': 1
                })



        }
        
 

        // city ticks
        sel.select('.cityTicks')
            .selectAll('circle').data(data)
            .enter().append('circle')
            .attr({
                cx: function(d,i){return xPop(acc.size(d))},
                cy: function(d,i){return y(d.meanDegree)},
                r: 1
            })
            .style({
                stroke: 'gray',
                fill: 'white',
                'stroke-width': 1
            })
            .attr('transform', 'translate(0,'+-(main.height - bottom - r(maxDegree))+')')


        // popAxis
        sel.select('.popAxis')
            .attr('transform', 'translate(0,'+-5+')')
            .call(xPopAxis)
            .selectAll('path, line')
            .style({
                stroke: 'black',
                'stroke-width': 1
            })
        // sel.select('.degreeAxis')
        //     .attr('transform', 'translate('+cityWidth/2+','+-(main.height - bottom - r(maxDegree))+')')
        //     .call(yAxis)
        //     .selectAll('path, line')
        //     .style({
        //         stroke: 'lightgray',
        //         'stroke-width': .5
        //     })

        sel.select('path.meanDegree')
            .attr('d', meanDegreeLine(data))
            .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')
            .style({
                fill: 'none', stroke: 'gray',
                'stroke-width': 1,
                'stroke-dashArray': '2,2'
            })
        sel.select('path.maxDegree')
            .attr('d', maxDegreeArea(data))
            .attr('transform', 'translate(0,'+ -(main.height - bottom - r(maxDegree)) +')')
            .style({
                fill: 'hsl(0,0%,92%)', stroke: 'none',
                'stroke-width': 1,
                'stroke-dashArray': '2,2'
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
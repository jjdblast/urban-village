var render_base = require('./render_base')()

var main = {}
_.extend(main, render_base)

main.render = function(sel, data) {

    var cityWidth = this.width

    var maxAvgDegree = d3.max(data, function(d,i){ return d.meanDegree })
    var r = d3.scale.log()
        .domain([1, 800])
        .range([0, this.width/2])

    var degree = 50

    var arc = d3.svg.arc()
        .innerRadius(r(100)+2.5)
        .outerRadius(r(100)-2.5)

    var contactsData = main.getContactsData(degree, r(degree))
    console.log(contactsData)
    // render

    sel.select('.contacts')
        .attr({
            transform: 'translate('+ this.width/2 +','+ this.width/2 +')' //+y(1)+')'
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
            'stroke-width': 1
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

    console.log('yo')

    return this
}

main.getContactsData = function(degree, radius) {

    var range = d3.range(degree)

    var scale = d3.scale.ordinal()
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

module.exports = main

d3.json('data/pop_urbArea.json', function(err,data){
    data.shift()
    var drawCities = DrawCities()
        .render(d3.selectAll('body'), data)
})

function DrawCities(){

    var margin = {t:10,b:30,l:10,r:30},
        width = 400 - margin.l - margin.r,
        height = 80 - margin.t - margin.b

    var main = {}
    main.render = function (sel, data) {
        var g = sel.append('svg')
            .attr({
                width: width + margin.l + margin.r,
                height: height + margin.t + margin.b
            })
            .append('g')
            .classed('main', true)
            .attr({transform: 'translate('+margin.l+','+margin.t+')'})

        var x = d3.scale.log()
            .domain(d3.extent(data))
            .range([0,width])
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(5, ',.1s')
            .tickSize(6, 0)

        var groupedData = _(data)
            .groupBy(function(d,i){
                return x(d) - (x(d)%(width/20))
            })
            .map(function(d,i){
                return {
                    x: +i,
                    amount: d.length
                }
            })
            .value()
        
        var y = d3.scale.linear()
            .domain([0, d3.max(groupedData, function(d,i){return d.amount})])
            .range([height, 0])
        var yAxis = d3.svg.axis()
            .ticks(3)
            .scale(y)
            .orient('right')

        var line = d3.svg.line()
            .x(function(d,i){ return d.x })
            .y(function(d,i){ return y(d.amount) })
            .interpolate('monotone')

        g.selectAll('path').data(data)
            .enter().append('path')
            .attr({
                d: function(d,i){return 'M'+x(d)+','+(height+5)+' v'+-5}
            })
            .style({
                stroke: 'steelBlue'
            })
        g.append('path')
            .attr({d: line(groupedData)})
            .style({
                stroke: 'black', fill: 'none'
            })
        g.append('g')
            .classed('axis', true)
            .attr({
                'transform': 'translate(0,'+(height+5)+')'
            })
            .call(xAxis)
        g.append('g')
            .classed('axis', true)
            .attr({
                'transform': 'translate('+width+',0)'
            })
            .call(yAxis)

        return main
    }
    _.extend(main, {})
    return main
}
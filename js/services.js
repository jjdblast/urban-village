
angular.module('services', [])

.factory('getMouse', function(){
    return function(e){
        var container = e.srcElement || e.target
        var svg = container.ownerSVGElement || container;
        if (svg.createSVGPoint) {
          var point = svg.createSVGPoint();
          point.x = e.clientX, point.y = e.clientY;
          point = point.matrixTransform(container.getScreenCTM().inverse());
          return [ point.x, point.y ]
          return
        }
        var rect = container.getBoundingClientRect();
        return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ]
    }
})

.factory('transform', function () {
    return function(data){
        _.each(data, function(d,i){
            d.degrees = _.filter(d.degrees, function(d,i){return d.amount>1})
            d.maxDegree = d3.max(d.degrees, function(d,i){return d.degree})
            d.sumDegree = d3.sum(d.degrees, function(d,i){return d.degree*d.amount}) / (d.amount/d.pop)
            d.maxAmount = d3.max(d.degrees, function(d,i){return d.amount})

            var totalContacts = d3.sum(d.degrees, function(d,i){return d.amount})
            var medianIndex = (totalContacts)/2

            // mean
            d.meanDegree = _.reduce(d.degrees, function(acc,d,i){
                return acc + d.amount*d.degree
            },0) / d.amount 

            d.meanCluster = _.reduce(d.degrees, function(acc,d,i){
                return acc + d.amount*d.avgClustCoeff
            },0) / totalContacts

            _.each(d.degrees, function (degree) {
                degree.amountPerc = degree.amount / d.amount * 100
                degree.clustPerc = degree.avgClustCoeff * 100
            })

        })

        return _(data).filter(function (d,i) {
                return d.amount / d.pop > .1
            })
            // .reject(function(d,i){return d.meanDegree>14})
            .sortBy('pop')
            .value()
    }
})
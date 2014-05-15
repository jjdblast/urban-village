// transform

module.exports = function transform(data){

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

    })

    return _(data).filter(function (d,i) {
            return d.amount / d.pop > .1
        })
        // .reject(function(d,i){return d.meanDegree>14})
        .sortBy('pop')
        .value()

}
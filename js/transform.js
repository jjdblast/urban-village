// transform

module.exports = function transform(data){

    _.each(data, function(d,i){

        // d.degrees = _.filter(d.degrees, function(d,i){return d.amount>1})
        d.maxDegree = d3.max(d.degrees, function(d,i){return d.degree})
        d.sumDegree = d3.sum(d.degrees, function(d,i){return d.degree*d.amount})// / (d.amount/d.pop)

        var totalContacts = d3.sum(d.degrees, function(d,i){return d.amount})
        var medianIndex = (totalContacts)/2

        // median
        // var ordered = _.sortBy(d.degrees, function(d,i){return d.amount})
        // _.reduce(ordered, function (acc, d, i) {
        //     d.from = acc
        //     d.to = acc + d.amount
        //     return d.to
        // }, 4)
        // var medianObj = _.find(ordered, function(d,i){
        //     return medianIndex > d.from && medianIndex <= d.to
        // })
        // d.medianDegree = medianObj.degree

        // mean
        d.meanDegree = _.reduce(d.degrees, function(acc,d,i){
            return acc + d.amount*d.degree
        },0) / d.amount 

        d.meanCluster = _.reduce(d.degrees, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts

    })

    return data
}
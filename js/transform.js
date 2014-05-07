// transform

module.exports = function transform(data){

    _.each(data, function(d,i){
        // console.log(d3.max(d.contacts, function(d,i){return d.amount}))
        d.contacts = _.filter(d.contacts, function(d,i){return d.amount>1})
        d.maxDegree = d3.max(d.contacts, function(d,i){return d.degree})

        var totalContacts = d3.sum(d.contacts, function(d,i){return d.amount})
        var medianIndex = (totalContacts)/2
        var ordered = _.sortBy(d.contacts, function(d,i){return d.amount})
        _.reduce(ordered, function (acc, d, i) {
            d.from = acc
            d.to = acc + d.amount
            return d.to
        }, 4)
        var medianObj = _.find(ordered, function(d,i){
            return medianIndex > d.from && medianIndex <= d.to
        })

        d.meanDegree = _.reduce(d.contacts, function(acc,d,i){
            return acc + d.amount*d.degree
        },0) / totalContacts
        // console.log('mean', mean)

        console.log(medianObj, medianIndex, totalContacts)

        var meanCluster = _.reduce(d.contacts, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts
        console.log('meanCluster', meanCluster)

        var meanCluster = _.reduce(d.contacts, function(acc,d,i){
            return acc + d.amount*d.avgClustCoeff
        },0) / totalContacts

        var s = d3.scale.log()
            .domain([1, d3.max(d.contacts, function(d,i){return d.amount})])
            .range([0,1])
        _.each(d.contacts, function(d2,i){
            d2.normAmount = s(d2.amount)
        })
    })

    return data
}
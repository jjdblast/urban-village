var MongoClient = require('mongodb').MongoClient
var _ = require('lodash')
var d3 = require('d3')
var fs = require('fs')

MongoClient.connect("mongodb://localhost/scaling", function(err, db) {

    // db.close()
    citiesPopulation(db)

})

function citiesPopulation(db) {
    db.collection('nodes').distinct('pop_urbArea', function(err,data){
        data = _.sortBy(data)
        fs.writeFileSync('data/pop_urbArea', JSON.stringify(data))
        console.log(data)
        db.close()
    })
}

function setLinearCityPosition(db){
    
    var data
    var x = d3.scale.linear()
        .range([0,100])

    db.collection('nodes').distinct('pop_urbArea', function(err,_data){
        data = _.sortBy(_data)
        x.domain(d3.extent(data))
    })
}

function aggregate(db) {
    db.collection('nodes')
    .aggregate([
        // group
    ], function(err,data){
        if (err) {
            console.log(err)
            db.close()
            return
        }
        db.close()
        _.each(data, function(d,i){
            var date = new Date(d.epoch_time * 1000)
            d.pos = [d.long, d.lat]
            d.date = new Date(2012, 4, 18, date.getHours(), date.getMinutes(), date.getSeconds())
            delete d._id
            delete d.long
            delete d.lat
        })
        console.log(data.length)
        console.log(data[0])
        fs.writeFileSync('data/telecom.json', JSON.stringify(data))
    })
}
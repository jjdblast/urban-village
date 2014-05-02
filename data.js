var MongoClient = require('mongodb').MongoClient
var _ = require('lodash')
var d3 = require('d3')
var fs = require('fs')

MongoClient.connect("mongodb://localhost/scaling", function(err, db) {
    console.log('connected do db')
    // db.close()
    // citiesPopulation(db)
    // setLinearCityPosition(db)
    aggregate(db)

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

    var popUrbData
    var x = d3.scale.log()
        .range([0,99.99999])

    db.collection('nodes').distinct('pop_urbArea', function(err,_data){
        console.log('got pop_urbArea array')
        popUrbData = _.filter(_data, function(d,i){return d>0})
        x.domain(d3.extent(popUrbData))
        update()
    })

    function update(){
        console.log('updating')
        var collection = 'nodes'
        console.time('update nodes')
        var count = 0
        var cursor = db.collection(collection).find()
        cursor.each(function(err,obj){
            count++
            if (count%100000 == 0) console.log(count)
            if (obj == null) {
                console.timeEnd('update nodes')
                db.close()
                return
            }
            if (obj.pop_urbArea>0) {
                obj.pos_urbArea = x(obj.pop_urbArea) 
                db.collection(collection).save(obj, function(err){
                })
            }
        })
    }
}

function aggregate(db) {
    db.collection('nodes')
    .aggregate([
        {
            $match: {pop_urbArea: {$gt:0}}
        },
        {$group: {
            _id: {
                popPos: {$subtract:['$pos_urbArea', {$mod:['$pos_urbArea',100/5]}] },
                degree: '$degree'
            },
            minPop: {$min: '$pop_urbArea'},
            maxPop: {$max: '$pop_urbArea'},
            avgClustCoeff: {$avg: '$clustCoeff'},
            amount: {$sum : 1},
        }},
        {$sort:{
            '_id.degree': 1,
        }},
        {$group: {
            _id: {
                popPos: '$_id.popPos'
            },
            minPop: {$min: '$minPop'},
            maxPop: {$max: '$maxPop'},
            amount: {$sum: '$amount'},
            contacts: {$push: {
                degree: '$_id.degree',
                avgClustCoeff: '$avgClustCoeff',
                amount: '$amount',
            }},
        }},
        {$project:{
            _id: 0,
            popPos: '$_id.popPos',
            minPop: 1, maxPop: 1, amount: 1, contacts: 1,
        }},
        {$sort:{
            popPos: 1,
        }},
    ], function(err,data){
        if (err) {
            console.log(err)
            db.close()
            return
        }
        db.close()
        data = _.sortBy(data, '_id')
        console.log(data.length)
        // console.log(data)
        fs.writeFileSync('data/aggregate.json', JSON.stringify(data))
    })
}
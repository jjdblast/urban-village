var gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    MongoClient = require('mongodb').MongoClient,
    _ = require('lodash'),
    fs = require('fs')

var db

//////////////
// data operations
//////////////
gulp.task('data:aggregate', ['open db'], function (done) {
    var data = eval(fs.readFileSync('server/aggregate.js', 'utf-8'))
    db.collection('nodes')
        .aggregate(data, function(err,data){
            // err
            if (err) { gulpUtil.log(err); gulp.start('close db'); done(); return; }
            // success
            var path = 'app/data/aggregate.json'
            fs.writeFileSync(path, JSON.stringify(data), 'utf-8')

            gulpUtil.log('data saved on: ' + path); gulp.start('close db'); done();
        }) 
})

gulp.task('data:joinNames', [], function () {
    var d3 = require('d3')

    var aggregate = eval(fs.readFileSync('app/data/aggregate.json', 'utf-8'))
    var citNames = d3.csv.parseRows(fs.readFileSync('material/data/citNames.csv', 'utf-8'), function(d,i){
        return +d[0]
    })
    var portugal = d3.csv.parse(fs.readFileSync('material/data/Portugal_Continental_ETRS89.txt', 'utf-8'))

    // console.log(aggregate[0])
    // console.log(citNames[0])
    // console.log(portugal[0])
    _.each(aggregate, function(city,i){
        var index = _.indexOf(citNames, city.pop)
        if (index >= 0) {
            city.name = portugal[index].V01187_DES
        } else {
            city.name = null
        }
    })
    fs.writeFileSync('app/data/aggregate2.json', JSON.stringify(aggregate), 'utf-8')
})

//////////////
// mongo db open close tasks
//////////////
gulp.task('open db', function (done) {
    if (db) { gulpUtil.log('db connection already open'); done(); return; }
    MongoClient.connect("mongodb://localhost/scaling", function(err, _db) {
        if (err) { gulpUtil.log('connection error'); gulpUtil.log(err); return; }
        db = _db; gulpUtil.log('db connection open'); done();
    })
})
gulp.task('close db', function (){
    if (!db) { gulpUtil.log('db connection already closed'); return; }
    db.close(); db = undefined; gulpUtil.log('db connection closed');
})
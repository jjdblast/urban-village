var express = require('express'),
    app = express(),
    through = require('through'),
    libsData = require('./app/js/libs'),
    _ = require('lodash')

var gulp = require('gulp'),
    exec = require('child_process').exec,
    fs = require('fs'),
    gulpUtil = require('gulp-util'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean')

//////////////
// common streams
/////////////
function index() {
    return gulp.src('app/html/index.jade')
        .pipe(jade({pretty: true}))
}
function bundle() {
    return gulp.src(['app/js/**/*.js', '!app/js/export/**/*.js'])
        .pipe(concat('bundle.js'))
}
function libs(type){
    return gulp.src(_.map(libsData, type))
        .pipe(concat('libs.js'))
}
function style(){
    return gulp.src('app/css/style.less')
        .pipe(less({paths: ['./app/css', './bower_components', './node_modules/lc-template/css']}))
        .pipe(autoprefixer())
}

//////////////
// server
/////////////
app.use('/data', express.static('./app/data'))
app.use('/img', express.static('./app/img'))
app.use('/build', express.static('./build'))
app.get('/', function (req, res) {
    index()
        .pipe(unwrap()).pipe(res)
    gulp.start('build')
})
app.get('/bundle.js', function (req, res) {
    bundle()
        .pipe(unwrap()).pipe(res.type('application/javascript'))
})
app.get('/libs.js', function (req, res) {
    libs('dev')
        .pipe(unwrap()).pipe(res.type('application/javascript'))
})
app.get('/style.css', function(req, res) {
    style()
        .pipe(unwrap()).pipe(res.type('text/css'))
})

//////////////
// tasks
//////////////
gulp.task('default', ['server', 'build'])

gulp.task('server', function(){
    app.listen(5000)
    gulpUtil.log('**Server started on localhost:5000**')
})

gulp.task('clean', function () {
    return gulp.src('build/', {read: false})
        .pipe(clean())
})

gulp.task('build', ['index', 'bundle', 'libs', 'style', 'img/', 'data/'])

gulp.task('index', function(){
    return index()
        .pipe(gulp.dest('build/'))
})

gulp.task('bundle', function(){
    return bundle()
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('build/'))
})

gulp.task('libs', function () {
    return libs('prod')
        .pipe(gulp.dest('build/'))
})

gulp.task('style', function(){
    return style()
        .pipe(gulp.dest('build/'))
})

gulp.task('img/', function() {
    return gulp.src('app/img/**/*')
        .pipe(gulp.dest('build/img'))
})

gulp.task('data/', function() {
    return gulp.src('app/data/**/*')
        .pipe(gulp.dest('build/data'))
})

// gulp.watch('js/**/*.js', function () {
//     console.log('update')
// })

/////////////////
// utilities
/////////////////

// accept stdin calls
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    data = (data + '').trim()
    if (data === 'subl' || data === 'edit' || data === 'e') { exec('subl .') }
    if (data === 'open' || data === 'o') { exec('osascript '+ __dirname +'/node_modules/lc-template/js/scr/reload.scpt') }
    if (data === 'exit' || data === 'quit' || data === 'q') { process.exit() }
    if (gulp.hasTask(data)) { gulp.start(data) } else { gulpUtil.log('**No task with this name**') }
})
// unwrap gulp stream
function unwrap () {
    var content
    function bufferContents(file) { content = file.contents }
    function endStream() { 
        this.emit('data', content); 
        this.emit('end')
    }
    return through(bufferContents, endStream);
}
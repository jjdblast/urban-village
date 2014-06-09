var express = require('express'),
    _ = require('lodash'),
    fs = require('fs'),
    exec = require('child_process').exec,
    karma = require('karma'),
    through = require('through')

var gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    minifyCss = require('gulp-minify-css'),
    header = require('gulp-header'),
    runSequence = require('run-sequence')

var devExpress = express(),
    karmaServer,
    libsData = JSON.parse(fs.readFileSync('./app/js/libs.json', 'utf-8'))

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
        .pipe(less({paths: ['./app/css', './bower_components', './material']}))
        .pipe(autoprefixer())
}

//////////////
// Dev router
/////////////
var devRouter = express.Router();
devRouter.use('/data', express.static('./app/data'))
devRouter.use('/img', express.static('./app/img'))
devRouter.use('/build', express.static('./build'))
devRouter.get('/', function (req, res) {
    index()
        .pipe(unwrap()).pipe(res)
})
devRouter.get('/bundle.js', function (req, res) {
    bundle()
        .pipe(unwrap()).pipe(res.type('application/javascript'))
})
devRouter.get('/libs.js', function (req, res) {
    libs('dev')
        .pipe(unwrap()).pipe(res.type('application/javascript'))
})
devRouter.get('/style.css', function(req, res) {
    style()
        .pipe(unwrap()).pipe(res.type('text/css'))
})

//////////////
// tasks
//////////////
gulp.task('default', ['server', 'test'])

gulp.task('server', function(){
    devExpress.use('/', devRouter)
        .listen(5000)
    gulpUtil.log('*Dev Server started on localhost:5000**')
})

gulp.task('build', function(callback) {
    runSequence('build-clean',
        ['index', 'bundle', 'libs', 'style', 'img/', 'data/'],
        callback)
})

gulp.task('build-clean', function () {
    return gulp.src('build/', {read: false})
        .pipe(clean())
})

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
    var banner = ['/**',
      ' * This code make use of:',
      ' * Angular.js, D3.js, lodash.js',
      ' */',
      ''].join('\n');
    return libs('prod')
        .pipe(header(banner))
        .pipe(gulp.dest('build/'))
})

gulp.task('style', function(){
    var banner = ['/**',
      ' * This code make use of:',
      ' * Normalize.css, LESS',
      ' */',
      ''].join('\n');
    return style()
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(header(banner))
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

//////////////
// KARMA unit test
//////////////
gulp.task('test', function () {
    if (karmaServer) {
        gulpUtil.log('Karma already running')
        return
    }
    karmaServer = require('karma').server;
    karmaServer.start({
        frameworks: ['jasmine'],
        files: _.flatten([
            _.map(libsData, 'prod'),
            'bower_components/angular-mocks/angular-mocks.js',
            'app/js/**/*.js',
            'app/test/**/*Spec.js'
        ]),
        exclude: [
            'app/js/export/**/*.js',
        ],
        reporters: ['progress', 'lcreport', 'beep'],
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false,
    }, function(exitCode) {
        gulpUtil.log('Karma has exited')
        process.exit(exitCode);
    })
})

/////////////////
// utilities
/////////////////

// accept stdin calls
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    data = (data + '').trim()
    if (data === 'subl' || data === 'edit' || data === 'e') { exec('server/scr/subl .') }
    if (data === 'open' || data === 'o') { exec('osascript ' + 'server/scr/reload.scpt') }
    // if (data === 'exit' || data === 'quit' || data === 'q') { process.exit(0) }
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
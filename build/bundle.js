(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

angular.module('directives', [])

.directive('getsize', function () {
    var link = function(scope, element, attrs, ngModel) {
        if(!ngModel) return 

        attrs.$observe('ngBindTemplate', function () {
            read()
        })

        read()

        function read() {
            var box = element[0].getBoundingClientRect()
            var size = [box.width, box.height]
            ngModel.$setViewValue(size)
        }
    }
    return {
        require: '?ngModel', // get a hold of NgModelController
        scope: true,
        link: link
    }
})

.directive('vbox', function(){
    function link (scope, element, attrs) {
        attrs.$observe('vbox', function () {
            writte()
        })

        writte()

        function writte() {
            element.attr('viewBox', attrs.vbox)
        }
    }
    return {
        link: link
    }
})
},{}],2:[function(require,module,exports){
require('./services')
require('./directives')

angular.module('app', ['services', 'directives', 'ngAnimate'])

.controller('mainCtrl', function ($scope, $http, getMouse, transform) {
    var s = $scope

    $scope.model = {}
    $scope.svgWidth = 1000
    $scope.svgHeight = 380
    $scope.margin = {t: 60, b:60, l:1, r:1}
    $scope.width = $scope.svgWidth - $scope.margin.l - $scope.margin.r
    $scope.height = $scope.svgHeight - $scope.margin.t - $scope.margin.b

    var acc = {
        size: function(d,i){return d.pop},
        sMeanDegree: function(d,i){return y(d.meanDegree)}
    }

    var numberOfCities = 8
    $scope.cityWidth = $scope.width/numberOfCities

    // scales

    $scope.x = d3.scale.log()
        .range([$scope.cityWidth*.40, $scope.width-$scope.cityWidth*.40])
    $scope.y = d3.scale.log()
        .range([$scope.height, 0])

    $scope.xAmount = d3.scale.linear()
        .domain([0, 20])
        .range([0, $scope.cityWidth*.33])
    $scope.xClust = d3.scale.linear()
        .domain([0,50])
        .range([0, -$scope.cityWidth*.33])

    // draw functions

    $scope.area = d3.svg.area()
        .x(function(d,i){return $scope.x(acc.size(d))})
        .y1(function(d,i){return $scope.y(d.maxDegree)})
        .y0(function(d,i){return $scope.y(1)})
    $scope.areaAmount = d3.svg.area()
        .y(function(d,i){return $scope.y(d.degree)})
        .x1(function(d,i){return 0})
        .x0(function(d,i){return $scope.xAmount(d.amountPerc)})
    $scope.areaClust = d3.svg.area()
        .y(function(d,i){return $scope.y(d.degree)})
        .x1(function(d,i){return $scope.xClust(d.clustPerc)})
        .x0(function(d,i){return 0})

    $scope.line = d3.svg.line()
        .x(function(d,i){return $scope.x(acc.size(d))})
        .y(function(d,i){return $scope.y(d.meanDegree)})

    var bisect = d3.bisector(function(d){return acc.size(d)}).right

    // view accessors

    $scope.wrpStyle = function(){
        return {'padding-bottom': $scope.svgHeight/$scope.svgWidth*100 + '%'}
    }

    // events and helpers
    _.extend(this, {
        mousemove: function(e){
            var mouse = $scope.mouse = getMouse(e)
            $scope.hoverDegree = Math.round( $scope.y.invert($scope.mouse[1]) )

            var y0 = $scope.x.invert($scope.mouse[0]),
                i = bisect($scope.data, y0, 1),
                d0 = $scope.data[i - 1],
                d1 = $scope.data[i],
                d = y0 - acc.size(d0) > acc.size(d1) - y0 ? d1 : d0;

            $scope.city = d
            // $scope.city = $scope.data[ bisect($scope.data, $scope.x.invert($scope.mouse[0])) ]
            $scope.hoverPop = $scope.city.pop

            $scope.city.hoverDegree = _.find($scope.city.degrees, function(d,i){ return d.degree == $scope.hoverDegree})

            _.each($scope.citiesData, function(d,i){
                d.hoverDegree = _.find(d.degrees, function(d,i){ return d.degree == $scope.hoverDegree})
            })
        },
        mouseleave: function () {
            $scope.mouse = [0,$scope.y(10)]

            $scope.hoverDegree = 10
            $scope.city = _.first($scope.data)
            $scope.hoverPop = $scope.city.pop
            $scope.city.hoverDegree = _.find($scope.city.degrees, function(d,i){ return d.degree == $scope.hoverDegree})

            _.each($scope.citiesData, function(d,i){
                d.hoverDegree = _.find(d.degrees, function(d,i){ return d.degree == $scope.hoverDegree})
            })
        },
        overlaping: function (elemPos, hoverPos, size) {
            if (!hoverPos) return true
            return Math.abs(elemPos - hoverPos) > size
        }
    })

    // get data

    $http.get('data/aggregate.json').success(function(data) {
        // transform data
        $scope.data = transform(data)
        console.log(data[0])
        console.log(data[0].degrees[0])

        $scope.mouse = [0,0]
        $scope.hoverDegree = 10
        $scope.city = _.first($scope.data)
        $scope.hoverPop = $scope.city.pop
        $scope.city.hoverDegree = _.find($scope.city.degrees, function(d,i){ return d.degree == $scope.hoverDegree})

        _.each($scope.citiesData, function(d,i){
            d.hoverDegree = _.find(d.degrees, function(d,i){ return d.degree == $scope.hoverDegree})
        })
        
        // scales domain
        $scope.x.domain(d3.extent($scope.data, acc.size))
        $scope.y.domain([1, d3.max($scope.data, function(d,i){return d.maxDegree})])

        // set citiesData
        var xRange = $scope.x.range()
        var range = d3.range(xRange[0], xRange[1], (xRange[1]-xRange[0])/numberOfCities)
        $scope.citiesData = _.map(range, function(d,i){
            var index = bisect($scope.data, $scope.x.invert(d))
            return $scope.data[index]
        })
        console.log($scope.citiesData)

        // pData
        $scope.pData = {}
        $scope.pData.xAxis = _.map($scope.x.ticks(10), function(d,i){
            return {
                value: d,
                text: $scope.x.tickFormat(10, ',.1s')(d)
            }
        })


    })

})
},{"./directives":1,"./services":3}],3:[function(require,module,exports){

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
},{}]},{},[2])
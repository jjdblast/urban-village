angular.module('app', ['services', 'directives', 'ngAnimate'])

.controller('mainCtrl', function ($scope, $http, transform) {

    $scope.wrpStyle = function(){
        return {'padding-bottom': this.svgHeight/this.svgWidth*100 + '%'}
    }

})

.controller('mainVisCtrl', function ($scope, dataPromise, getMouse) {
    var s = $scope

    $scope.model = {}
    $scope.svgWidth = 1000
    $scope.svgHeight = 380
    $scope.margin = {t: 60, b:55, l:1, r:1}
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
        .range([0, -$scope.cityWidth*.33])
    $scope.xClust = d3.scale.linear()
        .domain([0,50])
        .range([0, $scope.cityWidth*.33])

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
        // .x(function(d,i){return $scope.x(acc.size(d))})
        // .y(function(d,i){return $scope.y(d.meanDegree)})

    var bisect = d3.bisector(function(d){return acc.size(d)}).right

    // events and helpers
    _.extend(this, {
        mousemove: function(e){
            var mouse = $scope.mouse = getMouse(e)
            $scope.hoverDegree = Math.round( $scope.y.invert($scope.mouse[1]) )

            var y0 = $scope.x.invert($scope.mouse[0]),
                i = bisect($scope.data, y0, 1),
                d0 = $scope.data[i - 1],
                d1 = $scope.data[i],
                d

            if(_.isUndefined(d1)) { d = _.last($scope.data) }
            else { d = y0 - acc.size(d0) > acc.size(d1) - y0 ? d1 : d0; }

            // var d = y0 - acc.size(d0) > acc.size(d1) - y0 ? d1 : d0;

            $scope.city = d
            // $scope.city = $scope.data[ bisect($scope.data, $scope.x.invert($scope.mouse[0])) ]
            $scope.hoverPop = $scope.city.pop
            $scope.hoverName = $scope.city.name

            $scope.city.hoverDegree = _.find($scope.city.degrees, function(d,i){ return d.degree == $scope.hoverDegree})

            _.each($scope.citiesData, function(d,i){
                d.hoverDegree = _.find(d.degrees, function(d,i){ return d.degree == $scope.hoverDegree})
            })
        },
        mouseleave: function () {
            $scope.mouse = [0,$scope.y(10)]

            $scope.hoverDegree = 10
            $scope.city = _.last($scope.data)
            $scope.hoverPop = $scope.city.pop
            $scope.hoverName = $scope.city.name
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
    dataPromise.then(function(data){
        // console.log(data[0])
        data = _.cloneDeep(data)

        _.each(data, function(d,i){
            d.degrees = _.filter(d.degrees, function(d,i){return d.amount> 6 })
            d.maxDegree = d3.max(d.degrees, function(d,i){return d.degree})
            d.cumulativeDegree = d3.sum(d.degrees, function(d,i){return d.degree*d.amount})
            d.scaledCumulativeDegree = d.cumulativeDegree / (d.amount/d.pop)

            // mean
            d.meanDegree = _.reduce(d.degrees, function(acc,d,i){
                return acc + d.amount*d.degree
            },0) / d.amount 

            d.avgClustCoeff = _.reduce(d.degrees, function(acc,d,i){
                return acc + d.amount*d.avgClustCoeff
            },0) / d.amount 
            d.avgClustCoeff = d.avgClustCoeff * 100

            _.each(d.degrees, function (degree) {
                degree.amountPerc = degree.amount / d.amount * 100
                degree.clustPerc = degree.avgClustCoeff * 100
            })

        })

        data.splice(0,2)

        $scope.data = _(data).filter(function (d,i) {
                return d.amount / d.pop > 0.1
            })
            .sortBy('pop')
            .value()

        // $scope.data = data

        $scope.mouse = [0,0]
        $scope.hoverDegree = 10
        $scope.city = _.last($scope.data)
        $scope.hoverPop = $scope.city.pop
        $scope.hoverName = $scope.city.name
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

        // pData
        $scope.pData = {}
        $scope.pData.xAxis = _.map($scope.x.ticks(10), function(d,i){
            return {
                value: d,
                text: $scope.x.tickFormat(10, ',.1s')(d)
            }
        })

        $scope.meanLineData = calculateRegressionLineData()

    })

    function calculateRegressionLineData () {
        var regData = _.map($scope.data, function(d,i){
            return [Math.log(acc.size(d)), Math.log(d.meanDegree)]
            return [(acc.size(d)), (d.meanDegree)]
        })
        var regressionLine = ss.linear_regression()
            .data(regData)
        var regM = regressionLine.m()
        var regB = regressionLine.b()

        function regline(x){
            return Math.pow(x, regM) * Math.exp(regB)
            return regressionLine.m()*x + regressionLine.b()
        }

        var meanLineData = _.map($scope.x.domain(), function(d,i){
            return [$scope.x(d), $scope.y(regline(d))]
        })
        return meanLineData
    }

})

.controller('cumulativeCtrl', function ($scope, dataPromise) {

    $scope.model = {}
    $scope.svgWidth = 400
    $scope.svgHeight = 400
    $scope.margin = {t: 50, b:50, l:50, r:50}
    $scope.width = $scope.svgWidth - $scope.margin.l - $scope.margin.r
    $scope.height = $scope.svgHeight - $scope.margin.t - $scope.margin.b

    var acc = {
        size: function(d,i){return d.pop}
    }

    // scales
    $scope.x = d3.scale.log()
        .range([0, $scope.width])
    $scope.y = d3.scale.log()
        .range([$scope.height, 0])

    dataPromise.then(function(data){
        $scope.data = data

        $scope.x.domain(d3.extent($scope.data, acc.size))
        $scope.y.domain(d3.extent($scope.data, function(d,i){return d.scaledCumulativeDegree}))

        // pData
        $scope.pData = {}
        $scope.pData.xAxis = _.map($scope.x.ticks(5), function(d,i){
            return {
                value: d,
                text: $scope.x.tickFormat(5, ',.1s')(d)
            }
        })
        $scope.pData.yAxis = _.map($scope.y.ticks(5), function(d,i){
            return {
                value: d,
                text: $scope.y.tickFormat(5, ',.1s')(d)
            }
        })

        $scope.pData.line1 = {
            x0: $scope.x.domain()[0], y0: $scope.y.domain()[0],
            x1: $scope.x.domain()[1],
            y1: $scope.y.domain()[0] * ($scope.x.domain()[1] / $scope.x.domain()[0])
        }
        $scope.pData.line2 = {
            x0: $scope.x.domain()[0], y0: $scope.y.domain()[0],
            x1: $scope.x.domain()[1],
            y1: $scope.y.domain()[0] * Math.pow($scope.x.domain()[1] / $scope.x.domain()[0], 1.12)
        }

    })
})

.controller('coefCtrl', function ($scope, dataPromise) {

    $scope.model = {}
    $scope.svgWidth = 400
    $scope.svgHeight = 400
    $scope.margin = {t: 50, b:50, l:50, r:50}
    $scope.width = $scope.svgWidth - $scope.margin.l - $scope.margin.r
    $scope.height = $scope.svgHeight - $scope.margin.t - $scope.margin.b

    var acc = {
        size: function(d,i){return d.pop}
    }

    // scales
    $scope.x = d3.scale.log()
        .range([0, $scope.width])
    $scope.y = d3.scale.linear()
        .range([$scope.height, 0])

    $scope.line = d3.svg.line()

    dataPromise.then(function(data){
        $scope.data = data

        $scope.x.domain(d3.extent($scope.data, acc.size))
        $scope.y.domain([0,60])

        // pData
        $scope.pData = {}
        $scope.pData.xAxis = _.map($scope.x.ticks(5), function(d,i){
            return {
                value: d,
                text: $scope.x.tickFormat(5, ',.1s')(d)
            }
        })
        $scope.pData.yAxis = _.map([5,15,25,35,45,55], function(d,i){
            return {
                value: d,
                text: $scope.y.tickFormat(5, ',.0s')(d)+'%'
            }
        })

    })

    this.overlaping = function (elemPos, hoverPos, size) {
        if (!hoverPos) return true
        return Math.abs(elemPos - hoverPos) > size
    }
})

.controller('video', function ($scope) {
    $scope.video = false
    $scope.click = function(){
        $scope.video = !$scope.video
        var myVideo = document.getElementById("video1"); 
        if ($scope.video) 
            myVideo.play(); 
        else 
            myVideo.pause(); 
    }
})
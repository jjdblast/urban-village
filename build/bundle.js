angular.module("app",["services","directives","ngAnimate"]).controller("mainCtrl",function($scope){$scope.wrpStyle=function(){return{"padding-bottom":this.svgHeight/this.svgWidth*100+"%"}}}).controller("mainVisCtrl",function($scope,dataPromise,getMouse){function calculateRegressionLineData(){function regline(x){return Math.pow(x,regM)*Math.exp(regB)}var regData=_.map($scope.data,function(d){return[Math.log(acc.size(d)),Math.log(d.meanDegree)]}),regressionLine=ss.linear_regression().data(regData),regM=regressionLine.m(),regB=regressionLine.b(),meanLineData=_.map($scope.x.domain(),function(d){return[$scope.x(d),$scope.y(regline(d))]});return meanLineData}$scope.model={},$scope.svgWidth=1e3,$scope.svgHeight=380,$scope.margin={t:60,b:55,l:1,r:1},$scope.width=$scope.svgWidth-$scope.margin.l-$scope.margin.r,$scope.height=$scope.svgHeight-$scope.margin.t-$scope.margin.b;var acc={size:function(d){return d.pop},sMeanDegree:function(d){return y(d.meanDegree)}},numberOfCities=8;$scope.cityWidth=$scope.width/numberOfCities,$scope.x=d3.scale.log().range([.4*$scope.cityWidth,$scope.width-.4*$scope.cityWidth]),$scope.y=d3.scale.log().range([$scope.height,0]),$scope.xAmount=d3.scale.linear().domain([0,20]).range([0,.33*-$scope.cityWidth]),$scope.xClust=d3.scale.linear().domain([0,50]).range([0,.33*$scope.cityWidth]),$scope.area=d3.svg.area().x(function(d){return $scope.x(acc.size(d))}).y1(function(d){return $scope.y(d.maxDegree)}).y0(function(){return $scope.y(1)}),$scope.areaAmount=d3.svg.area().y(function(d){return $scope.y(d.degree)}).x1(function(){return 0}).x0(function(d){return $scope.xAmount(d.amountPerc)}),$scope.areaClust=d3.svg.area().y(function(d){return $scope.y(d.degree)}).x1(function(d){return $scope.xClust(d.clustPerc)}).x0(function(){return 0}),$scope.line=d3.svg.line();var bisect=d3.bisector(function(d){return acc.size(d)}).right;_.extend(this,{mousemove:function(e){$scope.mouse=getMouse(e);$scope.hoverDegree=Math.round($scope.y.invert($scope.mouse[1]));var d,y0=$scope.x.invert($scope.mouse[0]),i=bisect($scope.data,y0,1),d0=$scope.data[i-1],d1=$scope.data[i];d=_.isUndefined(d1)?_.last($scope.data):y0-acc.size(d0)>acc.size(d1)-y0?d1:d0,$scope.city=d,$scope.hoverPop=$scope.city.pop,$scope.city.hoverDegree=_.find($scope.city.degrees,function(d){return d.degree==$scope.hoverDegree}),_.each($scope.citiesData,function(d){d.hoverDegree=_.find(d.degrees,function(d){return d.degree==$scope.hoverDegree})})},mouseleave:function(){$scope.mouse=[0,$scope.y(10)],$scope.hoverDegree=10,$scope.city=_.first($scope.data),$scope.hoverPop=$scope.city.pop,$scope.city.hoverDegree=_.find($scope.city.degrees,function(d){return d.degree==$scope.hoverDegree}),_.each($scope.citiesData,function(d){d.hoverDegree=_.find(d.degrees,function(d){return d.degree==$scope.hoverDegree})})},overlaping:function(elemPos,hoverPos,size){return hoverPos?Math.abs(elemPos-hoverPos)>size:!0}}),dataPromise.then(function(data){$scope.data=data,$scope.mouse=[0,0],$scope.hoverDegree=10,$scope.city=_.first($scope.data),$scope.hoverPop=$scope.city.pop,$scope.city.hoverDegree=_.find($scope.city.degrees,function(d){return d.degree==$scope.hoverDegree}),_.each($scope.citiesData,function(d){d.hoverDegree=_.find(d.degrees,function(d){return d.degree==$scope.hoverDegree})}),$scope.x.domain(d3.extent($scope.data,acc.size)),$scope.y.domain([1,d3.max($scope.data,function(d){return d.maxDegree})]);var xRange=$scope.x.range(),range=d3.range(xRange[0],xRange[1],(xRange[1]-xRange[0])/numberOfCities);$scope.citiesData=_.map(range,function(d){var index=bisect($scope.data,$scope.x.invert(d));return $scope.data[index]}),$scope.pData={},$scope.pData.xAxis=_.map($scope.x.ticks(10),function(d){return{value:d,text:$scope.x.tickFormat(10,",.1s")(d)}}),$scope.meanLineData=calculateRegressionLineData()})}).controller("cumulativeCtrl",function($scope,dataPromise){$scope.model={},$scope.svgWidth=400,$scope.svgHeight=400,$scope.margin={t:50,b:50,l:50,r:50},$scope.width=$scope.svgWidth-$scope.margin.l-$scope.margin.r,$scope.height=$scope.svgHeight-$scope.margin.t-$scope.margin.b;var acc={size:function(d){return d.pop}};$scope.x=d3.scale.log().range([0,$scope.width]),$scope.y=d3.scale.log().range([$scope.height,0]),dataPromise.then(function(data){$scope.data=data,$scope.x.domain(d3.extent($scope.data,acc.size)),$scope.y.domain(d3.extent($scope.data,function(d){return d.scaledCumulativeDegree})),$scope.pData={},$scope.pData.xAxis=_.map($scope.x.ticks(5),function(d){return{value:d,text:$scope.x.tickFormat(5,",.1s")(d)}}),$scope.pData.yAxis=_.map($scope.y.ticks(5),function(d){return{value:d,text:$scope.y.tickFormat(5,",.1s")(d)}}),$scope.pData.line1={x0:$scope.x.domain()[0],y0:$scope.y.domain()[0],x1:$scope.x.domain()[1],y1:$scope.y.domain()[0]*($scope.x.domain()[1]/$scope.x.domain()[0])},$scope.pData.line2={x0:$scope.x.domain()[0],y0:$scope.y.domain()[0],x1:$scope.x.domain()[1],y1:$scope.y.domain()[0]*Math.pow($scope.x.domain()[1]/$scope.x.domain()[0],1.12)}})}).controller("coefCtrl",function($scope,dataPromise){$scope.model={},$scope.svgWidth=400,$scope.svgHeight=400,$scope.margin={t:50,b:50,l:50,r:50},$scope.width=$scope.svgWidth-$scope.margin.l-$scope.margin.r,$scope.height=$scope.svgHeight-$scope.margin.t-$scope.margin.b;var acc={size:function(d){return d.pop}};$scope.x=d3.scale.log().range([0,$scope.width]),$scope.y=d3.scale.linear().range([$scope.height,0]),$scope.line=d3.svg.line(),dataPromise.then(function(data){$scope.data=data,$scope.x.domain(d3.extent($scope.data,acc.size)),$scope.y.domain([0,60]),$scope.pData={},$scope.pData.xAxis=_.map($scope.x.ticks(5),function(d){return{value:d,text:$scope.x.tickFormat(5,",.1s")(d)}}),$scope.pData.yAxis=_.map([5,15,25,35,45,55],function(d){return{value:d,text:$scope.y.tickFormat(5,",.0s")(d)+"%"}})}),this.overlaping=function(elemPos,hoverPos,size){return hoverPos?Math.abs(elemPos-hoverPos)>size:!0}}),angular.module("directives",[]).directive("getsize",function(){var link=function(scope,element,attrs,ngModel){function read(){var box=element[0].getBoundingClientRect(),size=[box.width,box.height];ngModel.$setViewValue(size)}ngModel&&(attrs.$observe("ngBindTemplate",function(){read()}),read())};return{require:"?ngModel",scope:!0,link:link}}).directive("vbox",function(){function link(scope,element,attrs){function writte(){element.attr("viewBox",attrs.vbox)}attrs.$observe("vbox",function(){writte()}),writte()}return{link:link}}),angular.module("services",[]).factory("dataPromise",function($http,transform){return $http.get("data/aggregate.json").then(function(response){return transform(response.data)})}).factory("getMouse",function(){return function(e){var container=e.srcElement||e.target,svg=container.ownerSVGElement||container;if(svg.createSVGPoint){var point=svg.createSVGPoint();return point.x=e.clientX,point.y=e.clientY,point=point.matrixTransform(container.getScreenCTM().inverse()),[point.x,point.y]}var rect=container.getBoundingClientRect();return[e.clientX-rect.left-container.clientLeft,e.clientY-rect.top-container.clientTop]}}).factory("transform",function(){return function(data){return _.each(data,function(d){d.degrees=_.filter(d.degrees,function(d){return d.amount>15}),d.maxDegree=d3.max(d.degrees,function(d){return d.degree}),d.cumulativeDegree=d3.sum(d.degrees,function(d){return d.degree*d.amount}),d.scaledCumulativeDegree=d.cumulativeDegree/(d.amount/d.pop),d.meanDegree=_.reduce(d.degrees,function(acc,d){return acc+d.amount*d.degree},0)/d.amount,d.avgClustCoeff=_.reduce(d.degrees,function(acc,d){return acc+d.amount*d.avgClustCoeff},0)/d.amount,d.avgClustCoeff=100*d.avgClustCoeff,_.each(d.degrees,function(degree){degree.amountPerc=degree.amount/d.amount*100,degree.clustPerc=100*degree.avgClustCoeff})}),data.splice(0,2),_(data).filter(function(d){return d.amount/d.pop>.08}).sortBy("pop").value()}});
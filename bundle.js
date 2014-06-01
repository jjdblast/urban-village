angular.module("app",["services","directives","ngAnimate"]).controller("mainCtrl",function($scope,$http,getMouse,transform){$scope.model={},$scope.svgWidth=1e3,$scope.svgHeight=380,$scope.margin={t:60,b:60,l:1,r:1},$scope.width=$scope.svgWidth-$scope.margin.l-$scope.margin.r,$scope.height=$scope.svgHeight-$scope.margin.t-$scope.margin.b;var acc={size:function(d){return d.pop},sMeanDegree:function(d){return y(d.meanDegree)}},numberOfCities=8;$scope.cityWidth=$scope.width/numberOfCities,$scope.x=d3.scale.log().range([.4*$scope.cityWidth,$scope.width-.4*$scope.cityWidth]),$scope.y=d3.scale.log().range([$scope.height,0]),$scope.xAmount=d3.scale.linear().domain([0,20]).range([0,.33*$scope.cityWidth]),$scope.xClust=d3.scale.linear().domain([0,50]).range([0,.33*-$scope.cityWidth]),$scope.area=d3.svg.area().x(function(d){return $scope.x(acc.size(d))}).y1(function(d){return $scope.y(d.maxDegree)}).y0(function(){return $scope.y(1)}),$scope.areaAmount=d3.svg.area().y(function(d){return $scope.y(d.degree)}).x1(function(){return 0}).x0(function(d){return $scope.xAmount(d.amountPerc)}),$scope.areaClust=d3.svg.area().y(function(d){return $scope.y(d.degree)}).x1(function(d){return $scope.xClust(d.clustPerc)}).x0(function(){return 0}),$scope.line=d3.svg.line().x(function(d){return $scope.x(acc.size(d))}).y(function(d){return $scope.y(d.meanDegree)});var bisect=d3.bisector(function(d){return acc.size(d)}).right;$scope.wrpStyle=function(){return{"padding-bottom":$scope.svgHeight/$scope.svgWidth*100+"%"}},_.extend(this,{mousemove:function(e){$scope.mouse=getMouse(e);$scope.hoverDegree=Math.round($scope.y.invert($scope.mouse[1]));var y0=$scope.x.invert($scope.mouse[0]),i=bisect($scope.data,y0,1),d0=$scope.data[i-1],d1=$scope.data[i],d=y0-acc.size(d0)>acc.size(d1)-y0?d1:d0;$scope.city=d,$scope.hoverPop=$scope.city.pop,$scope.city.hoverDegree=_.find($scope.city.degrees,function(d){return d.degree==$scope.hoverDegree}),_.each($scope.citiesData,function(d){d.hoverDegree=_.find(d.degrees,function(d){return d.degree==$scope.hoverDegree})})},mouseleave:function(){$scope.mouse=[0,$scope.y(10)],$scope.hoverDegree=10,$scope.city=_.first($scope.data),$scope.hoverPop=$scope.city.pop,$scope.city.hoverDegree=_.find($scope.city.degrees,function(d){return d.degree==$scope.hoverDegree}),_.each($scope.citiesData,function(d){d.hoverDegree=_.find(d.degrees,function(d){return d.degree==$scope.hoverDegree})})},overlaping:function(elemPos,hoverPos,size){return hoverPos?Math.abs(elemPos-hoverPos)>size:!0}}),$http.get("data/aggregate.json").success(function(data){$scope.data=transform(data),console.log(data[0]),console.log(data[0].degrees[0]),$scope.mouse=[0,0],$scope.hoverDegree=10,$scope.city=_.first($scope.data),$scope.hoverPop=$scope.city.pop,$scope.city.hoverDegree=_.find($scope.city.degrees,function(d){return d.degree==$scope.hoverDegree}),_.each($scope.citiesData,function(d){d.hoverDegree=_.find(d.degrees,function(d){return d.degree==$scope.hoverDegree})}),$scope.x.domain(d3.extent($scope.data,acc.size)),$scope.y.domain([1,d3.max($scope.data,function(d){return d.maxDegree})]);var xRange=$scope.x.range(),range=d3.range(xRange[0],xRange[1],(xRange[1]-xRange[0])/numberOfCities);$scope.citiesData=_.map(range,function(d){var index=bisect($scope.data,$scope.x.invert(d));return $scope.data[index]}),$scope.pData={},$scope.pData.xAxis=_.map($scope.x.ticks(10),function(d){return{value:d,text:$scope.x.tickFormat(10,",.1s")(d)}})})}),angular.module("directives",[]).directive("getsize",function(){var link=function(scope,element,attrs,ngModel){function read(){var box=element[0].getBoundingClientRect(),size=[box.width,box.height];ngModel.$setViewValue(size)}ngModel&&(attrs.$observe("ngBindTemplate",function(){read()}),read())};return{require:"?ngModel",scope:!0,link:link}}).directive("vbox",function(){function link(scope,element,attrs){function writte(){element.attr("viewBox",attrs.vbox)}attrs.$observe("vbox",function(){writte()}),writte()}return{link:link}}),angular.module("services",[]).factory("getMouse",function(){return function(e){var container=e.srcElement||e.target,svg=container.ownerSVGElement||container;if(svg.createSVGPoint){var point=svg.createSVGPoint();return point.x=e.clientX,point.y=e.clientY,point=point.matrixTransform(container.getScreenCTM().inverse()),[point.x,point.y]}var rect=container.getBoundingClientRect();return[e.clientX-rect.left-container.clientLeft,e.clientY-rect.top-container.clientTop]}}).factory("transform",function(){return function(data){return _.each(data,function(d){d.degrees=_.filter(d.degrees,function(d){return d.amount>1}),d.maxDegree=d3.max(d.degrees,function(d){return d.degree}),d.meanDegree=_.reduce(d.degrees,function(acc,d){return acc+d.amount*d.degree},0)/d.amount,_.each(d.degrees,function(degree){degree.amountPerc=degree.amount/d.amount*100,degree.clustPerc=100*degree.avgClustCoeff})}),_(data).filter(function(d){return d.amount/d.pop>.1}).sortBy("pop").value()}});